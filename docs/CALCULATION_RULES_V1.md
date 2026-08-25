# Calculation Rules V1 — Question Structure & Scoring Reference

> This is a technical reference documenting how the quiz and scoring engine actually work, derived from the source code (not from design intent alone). For the personality-model design rationale and the original, dimension-by-dimension design notes, see `CONTEXT.md`. For the project's task/status log for this system, see `docs/plans/CALCULATION_RULES_V1.md` (a short, unrelated TODO tracker despite the identical filename — see the note at the end of this document).

## Overview

The quiz produces one `UserPersonalityProfile` (6 normalized dimension scores + 39 normalized trait scores) from 24 answered questions selected from a 36-question bank. That single profile is then run through two independent ranking functions:

- **Character Match** — ranks all character personality profiles by similarity to the user.
- **Vision Affinity** — ranks all 7 element personality profiles by how well the user's traits fit each element's weighted trait theme.

Neither ranking depends on the other's result. A user's top character match's in-game element has no bearing on their Vision Affinity ranking.

Source of truth: `src/engine/index.ts` (scoring/ranking), `src/data/quiz/questions.ts` (question bank), `src/hooks/useQuizProgress.ts` (ordering, persistence, resume), `src/data/personality/calculate-result.ts` (assembles the final `QuizResult`), `src/schemas/index.ts` (Zod validation constraints).

### Relevant file structure

Scoped to the files this document actually describes — for the whole-project layout see the "Data layout" section in `README.md`.

```text
src/
├── engine/
│   └── index.ts                        # buildUserPersonalityProfile, rankCharacterMatches, rankVisionAffinities
├── hooks/
│   └── useQuizProgress.ts              # seeding, shuffling, localStorage persistence/resume, complete()
├── data/
│   ├── quiz/
│   │   ├── questions.ts                # question(...)/answer(...) factories, the 36-question bank
│   │   └── index.ts
│   └── personality/
│       ├── calculate-result.ts         # calculateQuizResult, loadSharedQuizResult (final QuizResult assembly)
│       ├── element-profiles.ts         # loads + validates element-personalities.json
│       ├── element-personalities.json  # the 7 element trait-weight profiles
│       ├── traits.ts                   # trait catalog (39 traits)
│       ├── traits.json
│       ├── result-interpretations.ts   # resultTitleByDimension, visionInterpretations
│       ├── repository.ts               # character-personality data loader
│       └── character-personalities/
│           ├── _character-personalities.json
│           └── {character-id}.json     # × 125, one per character
├── schemas/
│   └── index.ts                        # Zod: scoredQuizQuestionSchema, validateElementProfiles, validateP0QuizData, ...
└── types/
    └── index.ts                        # ScoredQuizQuestion, UserPersonalityProfile, QuizProgressState, QuizResult, ...

scripts/
├── validate-data.mjs                   # pnpm validate:data — schema/count checks (run in `build`)
├── verify-engine.mjs                   # pnpm verify:engine — asserts engine invariants (order-independence, matching-trait fallback, ...)
└── simulate-balance.mjs                # pnpm simulate:balance — balance-tuning aid
```

---

## Question Structure & Quiz Mechanics

### Question bank shape

The bank contains 36 questions, with 6 authored questions for each of the 6 dimensions (`social`, `decision`, `lifestyle`, `adventure`, `responsibility`, `expression`). A quiz attempt shuffles each dimension's pool, selects `QUESTIONS_PER_DIMENSION` (currently 4), then shuffles the combined 24-question selection. Every question currently has exactly 4 answers (144 authored answers total), whose display order is also shuffled per attempt. The bank's total count is enforced by `validateP0QuizData`'s hard `.length(36)`; the validator also requires at least 4 questions per dimension, while the current 6-per-dimension and 4-answers-per-question authoring balance is verified from the dataset rather than fully enforced by those minimum constraints.

Runtime shape of one question (`ScoredQuizQuestion`, `src/types/index.ts`):

```ts
interface ScoredQuizQuestion {
  id: string;
  prompt: { th: string; en: string };
  answers: Array<{
    id: string;
    label: { th: string; en: string };
    scores: {
      dimensions: Partial<Record<DimensionId, number>>; // small integers, e.g. -3..3
      traits: Partial<Record<TraitId, number>>; // small decimals, e.g. 0.1..0.3
    };
  }>;
}
```

Questions are authored with two small factory helpers in `src/data/quiz/questions.ts` (`question(...)`, `answer(...)`) rather than hand-written object literals, so every question/answer has the same shape by construction. An answer's `dimensions` map is a set of small signed deltas (typically -3 to +3) toward one or two dimensions; its `traits` map is a set of small positive weights (typically 0.1–0.3) toward one to four traits. Not every dimension/trait needs to appear on every answer — omitted keys are simply not scored by that answer.

`QUESTION_VERSION` (`src/engine/index.ts`, currently `"2026-08-25-rpg-2"`) and `ALGORITHM_VERSION` (currently `"1.0.0"`) are stamped onto both in-progress quiz state and the final result. They exist purely for invalidation: if either constant changes, any saved progress or shared result computed under the old version is discarded rather than trusted (see Persistence below).

### Question and answer ordering (seeded, per session)

Question order and each question's answer order are **shuffled once per quiz attempt**, not fixed and not re-shuffled on every render. `useQuizProgress`'s `createInitialState()` draws a 32-bit random seed via `crypto.getRandomValues`, then uses a small deterministic PRNG (`seededRandom`, a mulberry32-style generator) seeded with that value to Fisher-Yates shuffle (`shuffle()`) the question-id order and, independently, each question's own answer-id order. The seed itself is persisted (see below), so resuming a quiz reproduces the exact same ordering rather than re-shuffling.

This means: the underlying `questions` array in `src/data/quiz/questions.ts` is authored in a fixed, dimension-grouped order, but that is never the order a user actually sees — presentation order is randomized per attempt and stable only within that attempt.

### Progress persistence and resume

State shape (`QuizProgressState`, `src/types/index.ts`):

```ts
interface QuizProgressState {
  version: 3;
  questionVersion: string;
  algorithmVersion: string;
  seed: number;
  questionOrder: string[]; // shuffled question ids
  answerOrder: Record<string, string[]>; // per-question shuffled answer ids
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> selected answerId
  startedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  completedAt: string | null;
}
```

Persisted to `localStorage` under the key `"teyvat-quiz-progress-v3"` on every state change (`useQuizProgress`'s effect). `readStoredState()` (`src/hooks/useQuizProgress.ts`) validates the stored blob before trusting it and discards it (returns `null`, causing a fresh `createInitialState()`) if **any** of the following hold:

- `version`, `questionVersion`, or `algorithmVersion` don't match the current constants.
- `seed` isn't a number, or `currentQuestionIndex` isn't a valid integer index into the question list.
- `questionOrder` doesn't contain exactly the current question-bank's ids (no more, no fewer, no duplicates) — guards against a stale question bank.
- Any question's `answerOrder` similarly doesn't exactly match that question's current answer ids.
- Any stored `answers[questionId]` references an answer id that doesn't actually exist on that question anymore.
- The quiz is **not yet completed** (`completedAt` is `null`) and the last update (`updatedAt`) is older than `QUIZ_IDLE_TIMEOUT_MS` (5 minutes) — an abandoned in-progress attempt older than 5 minutes is deleted from storage and the user starts fresh. A **completed** quiz's progress record has no such expiry.

`hasSavedQuizProgress()` is true only when a stored, valid, not-yet-completed record has at least one answered question — this is what drives the Landing Page's "Resume" vs. "Start" button state. `beginQuizFromNavigation()` clears any stored progress that is already `completedAt`-set when the user navigates back into the quiz from the nav bar, so starting a fresh quiz after having already seen a result doesn't resurrect the old answers.

### Completion detection

The quiz component itself decides "last question" by comparing `currentQuestionIndex` to `questionOrder.length - 1`; there's no separate "is this quiz completable" check beyond `selectedAnswers()` in `src/engine/index.ts`, which throws (`"Quiz answers are incomplete"`) if the answers map doesn't have exactly as many entries as there are questions, and throws (`"Invalid answer for <id>: <id|missing>"`) if any stored answer id no longer matches a real answer on that question. `complete()` (in `useQuizProgress`) simply stamps `completedAt`/`updatedAt` and persists — the actual score calculation happens afterward, in `calculateQuizResult`.

---

## Scoring Pipeline

### 1. Dimension score accumulation and normalization

For each of the 6 dimensions, `buildUserPersonalityProfile()` (`src/engine/index.ts`):

1. Sums that dimension's delta across the user's 24 selected answers (`raw`).
2. Computes the theoretical **minimum** possible raw sum for that dimension — the sum, over all 24 questions selected for that attempt, of each question's most-negative answer delta for that dimension (0 if a question doesn't score that dimension at all) — and likewise the theoretical **maximum**.
3. Linearly rescales `raw` from `[minimum, maximum]` to `[0, 100]`, clamps, and rounds to an integer: `round(clamp(((raw - minimum) / (maximum - minimum)) * 100, 0, 100))`.

This is a min-max normalization computed from the actual question bank's answer deltas, not a hardcoded fixed range — if a question's deltas are ever edited, the normalization range recalculates automatically from the new data (which is why `validate:data`/`verify:engine` exist as guard rails rather than the range being asserted anywhere). If a dimension's computed min equals its max (i.e. no question can move that dimension at all), `buildUserPersonalityProfile` throws rather than silently dividing by zero.

### 2. Trait score accumulation and normalization

For each of the 39 traits:

1. Sums the trait's weight across the user's 24 selected answers (`raw`).
2. Computes the theoretical **maximum** possible raw sum (sum of each question's largest single-answer weight for that trait, 0 if never scored).
3. Normalizes to `[0, 1]`: `raw / maximum`, clamped, rounded to 4 decimal places. If the theoretical maximum is 0 (no question ever scores this trait), the trait's score is simply `0`.

Unlike dimensions, traits are **not** min-max normalized against a negative floor — every answer's trait weight is non-negative in the current question bank, so the effective floor is naturally 0 and only the ceiling is computed.

The result of this step is the `UserPersonalityProfile`:

```ts
interface UserPersonalityProfile {
  dimensions: Record<DimensionId, number>; // 0–100 integers, 6 keys
  traits: Record<TraitId, number>; // 0–1 (4 decimal places), 39 keys
}
```

### 3. Character Match algorithm

`rankCharacterMatches(user, characters)` (`src/engine/index.ts`) computes, per character:

**Dimension similarity** — mean absolute-difference across all 6 dimensions, inverted to a similarity (1 = identical, 0 = maximally opposite on every dimension):

```
dimensionSimilarity = 1 − ( Σ |user.dimensions[d] − character.personality[d]| / 100 ) / 6
```

**Trait similarity** — a weighted average, over only the traits the character's profile actually defines (not all 39), of how close the user's normalized score on that trait is to the character's weight for it, weighted by the character's own weight for that trait (so a character's more-defining traits count more):

```
traitSimilarity = Σ [ (1 − |user.traits[t] − character.traits[t]|) × character.traits[t] ]  over the character's defined traits
                   ────────────────────────────────────────────────────────────────────────
                   Σ character.traits[t]  over the same traits
```

This raw trait similarity is then scaled by a **coverage factor** that softly penalizes characters with very few scored traits (a character with only 1–2 defined traits produces a less statistically meaningful similarity than one with 5+):

```
coverageFactor        = min(character's trait count / 5, 1)
adjustedTraitSimilarity = traitSimilarity × (0.85 + 0.15 × coverageFactor)
```

A character with ≥5 defined traits gets the full similarity; one with fewer is scaled down toward 85% of its raw similarity, proportional to how far short of 5 it falls.

**Combined score**, dimensions weighted more heavily than traits:

```
rawSimilarity = dimensionSimilarity × 0.7 + adjustedTraitSimilarity × 0.3
compatibility = round(clamp(rawSimilarity × 100, 0, 100))   // integer %, shown in the UI
```

This is a **weighted linear combination of an inverted mean-absolute-difference (dimensions) and a weight-weighted trait-overlap score (traits)** — not Euclidean distance and not cosine similarity, despite `docs/scope.md`/`CONTEXT.md` mentioning those as design-time candidate algorithms (see divergence note below).

**Matching-trait explanation** (what the UI shows as "why this character"): from the character's defined traits, keep only those where the user's score and the character's weight are both ≥0.5 _and_ their per-trait similarity `1 − |user.traits[t] − character.traits[t]|` is ≥0.75, sorted by that per-trait similarity (ties broken by the character's weight, then trait id), and take the top 3. If that filter produces nothing (e.g. a low-similarity match), it falls back to the single best-matching trait regardless of the 0.5/0.75 thresholds, so every returned match always has at least one "matching trait" to explain itself with — `verify-engine.mjs` explicitly asserts this (`matchingTraitIds.length > 0` for every character, every simulated answer set).

Results are sorted by `rawSimilarity` descending (the **full-precision** score, not the rounded percentage — two characters that round to the same displayed percentage are still ordered correctly), with dimension similarity, then trait similarity, then matching-trait count, then character id as tie-breakers. `calculateQuizResult` keeps only the top 4. The engine is deliberately order-independent — `verify-engine.mjs` asserts that reversing the input character array produces identical output order.

### 4. Vision Affinity algorithm

`rankVisionAffinities(user, elements)` (`src/engine/index.ts`) computes, per element, a straightforward weighted average of the user's normalized trait scores against that element's `personalityTheme.traits` weight map:

```
weightedAffinity = Σ [ user.traits[t] × element.traits[t] ]  over the element's weighted traits
                    ──────────────────────────────────────────────────────────────────
                    Σ element.traits[t]  over the same traits
```

The element's single **primary** trait (`personalityTheme.primary` — always the trait weighted `1.0` in that element's profile) then gets an extra boost on top of the weighted average, so an element's defining trait matters slightly more than the weighted-average formula alone would give it:

```
rawAffinity = weightedAffinity × (0.85 + user.traits[primaryTrait] × 0.15)
affinity    = round(clamp(rawAffinity × 100, 0, 100))   // integer %, shown in the UI
```

Unlike Character Match, this uses **only** the element's own weighted-trait profile — there is no reference to the user's matched character or that character's element anywhere in this function's signature or body, which is the concrete enforcement of "Character Match and Vision Affinity are independent systems" from `CONTEXT.md` §2.2.

If an element's total trait weight is 0 (a data error — should never happen given the schema and the fixed 7-profile dataset), the function throws rather than silently returning a meaningless ratio.

Results are sorted by `rawAffinity` descending, tie-broken by the primary trait's raw score, then element id. All 7 elements are always returned and ranked (unlike Character Match's top-4 slice) — the UI can show a full 7-way breakdown, not just a winner.

### 5. Final result assembly

`calculateQuizResult(answers)` (`src/data/personality/calculate-result.ts`) is the entry point the Quiz page calls once the last question is answered:

1. Build the profile (`buildUserPersonalityProfile`).
2. Load the full character-personality dataset and rank it; keep the top 4.
3. Rank all 7 elements.
4. Pick a result "title" from `resultTitleByDimension` keyed by the user's **dominant dimension** — the dimension whose score is furthest from the neutral midpoint of 50 in either direction (`Math.abs(score - 50)`, ties broken by dimension id). This title is a single fixed label per dominant dimension (e.g. `social` → "The Social Connector"); it is not personalized further.
5. For each of the top 4 character matches, resolve the character's factual data and artwork, build a 1–2 sentence localized `summary` from the up-to-3 matching-trait labels (or a generic fallback sentence if there were none), and assemble a `CharacterMatch`.
6. For each of the 7 vision matches, attach the fixed, hand-written `visionInterpretations[elementId]` summary text (falling back to a generic "fan-made interpretation" placeholder for an unrecognized element id, which should not occur with the fixed 7-element dataset).

Final shape returned to the UI (`QuizResult`, `src/types/index.ts`):

```ts
interface QuizResult {
  version: 1;
  questionVersion: string;
  algorithmVersion: string;
  profile: UserPersonalityProfile;
  characterMatches: CharacterMatch[]; // top 4, each with compatibility %, title, summary, up to 3 matching traits, artwork
  visionMatches: VisionMatch[]; // all 7, each with affinity %, fixed title/summary text
  completedAt: string; // ISO timestamp
}
```

A second entry point, `loadSharedQuizResult(params)`, reconstructs a **single-character, single-vision** `QuizResult` from a shared-link payload (character id, up to 3 trait ids, a compatibility %, a vision id, an affinity %) rather than from raw quiz answers — it re-derives the character's dominant-dimension title and trait labels the same way, but does not re-run the scoring engine, since the score was already computed once and encoded into the share link.

---

## Element Profiles (as they exist in `element-personalities.json`)

All 7 profiles match `CONTEXT.md`'s illustrative examples exactly (both the primary trait choice and every weight), and are enforced by `validateElementProfiles` (`src/schemas/index.ts`) to be exactly 7, have unique element ids, and have every `primary`/`secondary` trait actually present as a key in that same profile's `traits` weight map.

| Element | Primary trait         | Weighted traits (`traits` map)                                                 |
| ------- | --------------------- | ------------------------------------------------------------------------------ |
| Pyro    | `passion` (1.0)       | `enthusiasm` 0.7, `selfExpression` 0.8, `determination` 0.6, `optimism` 0.4    |
| Hydro   | `ideals` (1.0)        | `adaptability` 0.8, `responsibility` 0.7, `creativity` 0.6, `perseverance` 0.5 |
| Anemo   | `freedom` (1.0)       | `acceptance` 0.9, `sensitivity` 0.6, `selflessness` 0.7, `adaptability` 0.5    |
| Electro | `individuality` (1.0) | `determination` 0.8, `independence` 0.9, `confidence` 0.6, `nonconformity` 0.8 |
| Dendro  | `growth` (1.0)        | `curiosity` 0.9, `knowledge` 0.8, `learning` 0.9, `selfDevelopment` 0.7        |
| Cryo    | `innerConflict` (1.0) | `contradiction` 0.9, `identity` 0.8, `introspection` 0.7, `resilience` 0.6     |
| Geo     | `resolve` (1.0)       | `stability` 0.9, `perseverance` 0.8, `discipline` 0.7, `reliability` 0.8       |

Each profile also carries a `secondary` array (the same trait ids as the non-primary weights, in display order) used only for authoring/reference — the scoring formula in §4 above reads `traits` directly and does not consult `secondary`.

---

## Notes on Divergence from CONTEXT.md

- **CONTEXT.md §16 lists "Euclidean Distance / Weighted Euclidean Distance / Cosine Similarity / Hybrid Dimension + Trait Similarity" as _potential_ algorithms** for Character Matching, without committing to one. The implemented algorithm is none of the pure named forms: it's a custom hybrid — an inverted mean-absolute-difference for dimensions (closer to Manhattan/L1 distance than Euclidean/L2), combined with a trait-weight-weighted overlap score for traits (not a distance metric at all), blended 70/30, with an additional non-linear "coverage factor" penalty for characters with sparse trait data. This is consistent with CONTEXT.md's own framing of these as options to choose from rather than a spec to match exactly, and matches the "70% dimension / 30% trait" split already recorded as an implementation decision in `docs/plans/_plan_log.md`.
- **CONTEXT.md's dimension/trait JSON examples use plain 0–100 integers and 0.0–1.0 decimals without describing _how_ those get there from quiz answers.** The actual normalization (min-max over the real question bank's achievable range, computed at build/run time rather than assumed) is an implementation detail CONTEXT.md doesn't specify — documented here for the first time.
- No divergence was found in the element trait-weight data itself, the 6-dimension/39-trait catalog, the "Character Match and Vision Affinity must stay independent" rule, or the general two-stage (profile → matching) pipeline shape. The implemented question bank has since expanded from CONTEXT.md's initial 24-question target to 36 questions (6 per dimension).
