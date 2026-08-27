# UX Issue Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the five open UX issues (UX-01 through UX-05) documented in `docs/issue_logs.md`.

**Architecture:** Each task is an independent, self-contained bug fix touching one narrow flow (name persistence, quiz-completion history, character-detail back navigation, share-card canvas text, question-card CSS). Tasks have no dependencies on each other and can be done in any order, but are sequenced here by the priority `docs/issue_logs.md` already assigns (`## ลำดับแนะนำ`: UX-03/UX-04 first, then UX-01/UX-05, then UX-02). **This repo has no automated test framework** (confirmed: no `*.test.*` files, no vitest/jest config or dependency — see `teyvat-code-style` skill: "No test framework yet (deferred — don't add one unless asked)"). Every task therefore substitutes a manual browser verification step for the usual "write a failing test" step, plus `pnpm lint` and `pnpm build`, matching the verification method `docs/issue_logs.md` itself specifies (`## Verification ก่อนปิด issue`).

**Tech Stack:** Vite 6, React, TypeScript 5.9, React Router (HashRouter — URLs use `#/...`), plain global CSS (`src/styles/index.css`, not CSS Modules), Canvas 2D API (share card).

**Spec:** `docs/issue_logs.md` (each `UX-0N` section's `PRD / เกณฑ์ยอมรับ` is the acceptance criteria this plan implements; the doc's own `แนวทางแก้` per issue is the approach this plan follows).

## Global Constraints

- No test runner exists in this repo — do not add one. Verify with manual browser QA plus `pnpm lint` and `pnpm build`.
- All localStorage access goes through `src/lib/safe-storage.ts` (`safeGetItem`/`safeSetItem`/`safeRemoveItem`) — never call `localStorage` directly.
- Named exports only, no `export default`, anywhere in `src/`.
- `src/utils/` files are imported directly by path (no barrel) — do not add `player-profile.ts` or `share-result.ts` exports to `src/utils/index.ts`.
- Formatting authority is Prettier/ESLint, not manual style-matching: run `pnpm format` and read the diff (this checkout has CRLF line endings, so `pnpm format:check` false-positives on every file — trust `git diff` after `pnpm format`, not the check command).
- Test in both locales (`th` and `en`) and at desktop + mobile widths per `docs/issue_logs.md`'s own verification checklist, for any task touching rendered UI.

---

### Task 1: UX-03 — Redirect away from `/quiz` once the quiz is completed

**Files:**

- Modify: `src/pages/QuizPage.tsx:37-49`

**Interfaces:**

- Consumes: `state.completedAt` (`string | null`) — already returned by `useQuizProgress()` from `src/hooks/useQuizProgress.ts`, unchanged by this task.
- Produces: nothing new consumed by later tasks — this task is self-contained.

**Problem:** `MatchingPage` (`src/pages/MatchingPage.tsx:67`) navigates to `/result` with `replace: true`, so browser history after landing on Result is `[/, /quiz, /result]` — the `/matching` entry is gone but `/quiz` remains. `useQuizProgress().complete()` (`src/hooks/useQuizProgress.ts:199-206`) sets `completedAt` but never clears `answers`. `QuizPage`'s `hasProgress` gate (`src/pages/QuizPage.tsx:37-39`) only checks `Object.keys(state.answers).length > 0`, which stays `true` after completion — so pressing browser Back from `/result` remounts `QuizPage` on the fully-answered last question instead of redirecting away, letting the user re-run `finish` → `/matching` → `/result`.

- [ ] **Step 1: Add a completed-quiz redirect before the existing `hasProgress` check**

In `src/pages/QuizPage.tsx`, the current code at lines 37-49 is:

```tsx
const hasProgress =
  Object.keys(state.answers).length > 0 ||
  Boolean((location.state as { beginQuiz?: boolean } | null)?.beginQuiz);
useEffect(() => {
  questionHeadingRef.current?.focus({ preventScroll: true });
}, [current]);
useEffect(() => {
  if (state.questionOrder.length - current <= 2) {
    void import("../data/personality/character-personalities-bundle");
  }
}, [current, state.questionOrder.length]);
if (!hasProgress)
  return <Navigate to="/" replace state={{ requestName: true }} />;
```

Change the final two lines to add a completed-quiz check before the `hasProgress` check:

```tsx
const hasProgress =
  Object.keys(state.answers).length > 0 ||
  Boolean((location.state as { beginQuiz?: boolean } | null)?.beginQuiz);
useEffect(() => {
  questionHeadingRef.current?.focus({ preventScroll: true });
}, [current]);
useEffect(() => {
  if (state.questionOrder.length - current <= 2) {
    void import("../data/personality/character-personalities-bundle");
  }
}, [current, state.questionOrder.length]);
if (state.completedAt) return <Navigate to="/result" replace />;
if (!hasProgress)
  return <Navigate to="/" replace state={{ requestName: true }} />;
```

This works because `ResultPage` (`src/pages/ResultPage.tsx:44-48`) already falls back to `readQuizResult()` (`src/utils/quiz-result.ts:14-32`, the persisted result written by `MatchingPage`'s `saveQuizResult(result)` at `src/pages/MatchingPage.tsx:66`) whenever `location.state.result` is absent, so a plain `navigate("/result")` with no state still renders the same completed result.

- [ ] **Step 2: Verify by hand — completion + back button**

Run `pnpm dev`, open the app, and:

1. Complete the quiz all the way to `/result`.
2. Press the browser Back button. Confirm you land back on `/result` (not on the last quiz question), and that the URL bar shows `#/result`.
3. Press Back again. Confirm you land on `/` (Landing), not on `/quiz`.
4. Manually type/navigate to `#/quiz` directly in the address bar while a completed result exists. Confirm it redirects immediately to `/result`.

- [ ] **Step 3: Verify by hand — in-progress quiz is unaffected**

Still with `pnpm dev` running:

1. Start a new quiz attempt, answer 2-3 questions (do not finish).
2. Use the in-page "back" button (`src/pages/QuizPage.tsx:106-113`) to go to a previous question — confirm it still works normally (this only touches `state.completedAt`, which is `null` mid-quiz, so `hasProgress` logic is unchanged).
3. Use the browser Back button mid-quiz — confirm normal SPA back navigation still works and does not redirect to `/result`.

- [ ] **Step 4: Run lint and build**

```bash
pnpm lint
pnpm build
```

Both must exit 0 with no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/QuizPage.tsx
git commit -m "fix(quiz): redirect away from completed quiz on back navigation"
```

---

### Task 2: UX-04 — Character Detail back button returns to Result when opened from Result

**Files:**

- Modify: `src/pages/ResultPage.tsx:207-213`
- Modify: `src/pages/CharacterPage.tsx:1-3, 26-27, 89-92`

**Interfaces:**

- Consumes: React Router's `useLocation().state`, matching the existing pattern already used in this codebase (`src/pages/MatchingPage.tsx:67` writes `state: { result }`, `src/pages/ResultPage.tsx:44-48` reads it back).
- Produces: nothing consumed by other tasks — self-contained.

**Problem:** `ResultPage`'s "ดูตัวละคร" link (`src/pages/ResultPage.tsx:207-213`) is a plain `<Link to={...}>` with no `state`, so `CharacterPage` has no way to know it was opened from Result. `CharacterPage`'s back link (`src/pages/CharacterPage.tsx:89-92`) is hardcoded to `/characters`, so it always returns to the directory even when the user arrived from Result.

- [ ] **Step 1: Pass origin state from `ResultPage`'s character-details link**

In `src/pages/ResultPage.tsx`, the current code at lines 207-213 is:

```tsx
<Link
  className="button button--secondary"
  to={`/characters/${character.characterId}`}
>
  <BookOpen size={18} />
  {t(locale, "characterDetails")}
</Link>
```

Change it to:

```tsx
<Link
  className="button button--secondary"
  to={`/characters/${character.characterId}`}
  state={{ from: "result" }}
>
  <BookOpen size={18} />
  {t(locale, "characterDetails")}
</Link>
```

- [ ] **Step 2: Read the origin in `CharacterPage` and choose the back destination**

In `src/pages/CharacterPage.tsx`, line 3 currently is:

```tsx
import { Link, useParams } from "react-router-dom";
```

Change it to:

```tsx
import { Link, useLocation, useParams } from "react-router-dom";
```

Line 27 currently is:

```tsx
export function CharacterPage({ locale }: { locale: Locale }) {
  const { slug } = useParams();
```

Change it to:

```tsx
export function CharacterPage({ locale }: { locale: Locale }) {
  const { slug } = useParams();
  const location = useLocation();
  const cameFromResult =
    (location.state as { from?: string } | null)?.from === "result";
```

Lines 89-92 currently are:

```tsx
<Link className="back-link" to="/characters">
  <ArrowLeft size={17} />
  {t(locale, "back")}
</Link>
```

Change the `to` prop only:

```tsx
<Link className="back-link" to={cameFromResult ? "/result" : "/characters"}>
  <ArrowLeft size={17} />
  {t(locale, "back")}
</Link>
```

Leave the "unknown character" empty-state link at `src/pages/CharacterPage.tsx:73-75` (`to="/characters"`) unchanged — that branch renders when the character id itself is invalid, independent of navigation origin, and `docs/issue_logs.md`'s acceptance criteria only requires an origin-aware back button on the successful-load view.

- [ ] **Step 3: Verify by hand — both origins and the no-state fallback**

Run `pnpm dev`:

1. Complete a quiz to reach `/result`, click "ดูตัวละคร" (characterDetails), then click the back link on Character Detail. Confirm it returns to `/result` with the same result still showing.
2. From `/characters` (the directory), open any character, then click its back link. Confirm it returns to `/characters`.
3. From a Character Detail page reached via step 1, refresh the browser (full reload). Confirm the back link now goes to `/characters` (state is lost on a hard refresh, so the fallback applies) rather than throwing or looping.

- [ ] **Step 4: Run lint and build**

```bash
pnpm lint
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/ResultPage.tsx src/pages/CharacterPage.tsx
git commit -m "fix(character-detail): return to Result when opened from Result"
```

---

### Task 3: UX-01 — Name dialog opens empty on a new attempt

**Files:**

- Modify: `src/utils/player-profile.ts`
- Modify: `src/pages/LandingPage.tsx:23-25, 53, 59-63`

**Interfaces:**

- Consumes: `safeRemoveItem` from `src/lib/safe-storage.ts` (already used by `src/utils/quiz-result.ts` and `src/hooks/useQuizProgress.ts` for the same pattern).
- Produces: `clearPlayerName()` exported from `src/utils/player-profile.ts` — a new function future code can import directly (matches this repo's direct-import convention for `utils/`, no barrel).

**Problem:** `src/utils/player-profile.ts` only exports `readPlayerName`/`savePlayerName`; there is no way to clear the stored name. `LandingPage`'s name field (`src/pages/LandingPage.tsx:53`) initializes once via `useState(readPlayerName)`. Both "new attempt" flows — `ResultPage`'s tryAgain button (`src/pages/ResultPage.tsx:226-237`) and `QuizPage`'s confirmReset button (`src/pages/QuizPage.tsx:151-159`) — navigate to `/` with `state: { requestName: true }`, which `LandingPage` uses only to auto-open the name dialog (`src/pages/LandingPage.tsx:48-52`); nothing clears the previously saved name, so the dialog opens pre-filled with the old name instead of empty.

- [ ] **Step 1: Add `clearPlayerName()`**

The current full content of `src/utils/player-profile.ts` is:

```ts
import { safeGetItem, safeSetItem } from "../lib/safe-storage";

const PLAYER_NAME_KEY = "teyvat-player-name-v1";

export function readPlayerName() {
  return safeGetItem(PLAYER_NAME_KEY)?.trim() ?? "";
}

export function savePlayerName(name: string) {
  safeSetItem(PLAYER_NAME_KEY, name.trim().slice(0, 40));
}
```

Change it to:

```ts
import { safeGetItem, safeRemoveItem, safeSetItem } from "../lib/safe-storage";

const PLAYER_NAME_KEY = "teyvat-player-name-v1";

export function readPlayerName() {
  return safeGetItem(PLAYER_NAME_KEY)?.trim() ?? "";
}

export function savePlayerName(name: string) {
  safeSetItem(PLAYER_NAME_KEY, name.trim().slice(0, 40));
}

export function clearPlayerName() {
  safeRemoveItem(PLAYER_NAME_KEY);
}
```

- [ ] **Step 2: Clear the name and initialize the field empty when a new attempt is requested**

In `src/pages/LandingPage.tsx`, line 25 currently is:

```tsx
import { readPlayerName, savePlayerName } from "../utils/player-profile";
```

Change it to:

```tsx
import {
  clearPlayerName,
  readPlayerName,
  savePlayerName,
} from "../utils/player-profile";
```

Line 53 currently is:

```tsx
const [name, setName] = useState(readPlayerName);
```

Change it to:

```tsx
const [name, setName] = useState(() => (requestName ? "" : readPlayerName()));
```

Lines 59-63 currently are:

```tsx
useEffect(() => {
  if (requestName) {
    navigate(location.pathname, { replace: true, state: null });
  }
}, [location.pathname, navigate, requestName]);
```

Change the effect body to also clear the persisted name:

```tsx
useEffect(() => {
  if (requestName) {
    clearPlayerName();
    navigate(location.pathname, { replace: true, state: null });
  }
}, [location.pathname, navigate, requestName]);
```

This keeps the resume flow untouched: `startQuiz()` (`src/pages/LandingPage.tsx:93-99`) skips the name dialog entirely when `canResume` is true, so `requestName` is never set and neither `name` state nor stored name are cleared — the old name is preserved for a resumed attempt, per `docs/issue_logs.md`'s second acceptance criterion.

- [ ] **Step 3: Verify by hand**

Run `pnpm dev`:

1. Start a fresh quiz, enter a name (e.g. "Aether"), finish the quiz to reach `/result`.
2. Click "ทำแบบทดสอบใหม่" (tryAgain). Confirm the name dialog opens with the name field **empty**, not pre-filled with "Aether".
3. Enter a new name (e.g. "Lumine") and complete the quiz again. Confirm the new result flow works normally end-to-end.
4. Start a quiz, answer at least one question, then navigate back to `/` directly (not via a reset button — e.g. edit the URL to `#/`) and click the start/resume button. Confirm it resumes without showing the name dialog at all (since `canResume` is true), and that no name was cleared.
5. From the in-quiz reset dialog (`src/pages/QuizPage.tsx`'s "รีเซ็ต" flow), confirm reset and verify the name dialog also opens empty.

- [ ] **Step 4: Run lint and build**

```bash
pnpm lint
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/player-profile.ts src/pages/LandingPage.tsx
git commit -m "fix(landing): clear saved player name when starting a new attempt"
```

---

### Task 4: UX-05 — Share card character name no longer overflows

**Files:**

- Modify: `src/utils/share-result.ts`

**Interfaces:**

- Consumes: existing `truncateCanvasText(context, text, maximumWidth)` helper (`src/utils/share-result.ts:299-315`), unchanged.
- Produces: nothing consumed by other tasks — self-contained.

**Problem:** `downloadShareCard()` draws the character name with a fixed `92px` font and a bare `context.fillText(character.name, 555, 290)` (`src/utils/share-result.ts:169-171`) — no `measureText` check, no shrinking, no truncation. The name column runs from `x=555` to the divider line at `x=930` (`src/utils/share-result.ts:184-186`), a 375px budget. Long names like "Sangonomiya Kokomi" or "Yumemizuki Mizuki" overflow past the card edge at the fixed size.

- [ ] **Step 1: Add a name-fitting helper**

In `src/utils/share-result.ts`, the constants block at the top (lines 5-7) currently is:

```ts
const CANVAS_DISPLAY_FONT =
  '"Teyvat ZHCN", "Bree Serif", "Mitr", Georgia, serif';
const CANVAS_TEXT_FONT = '"Prompt", "Noto Sans Thai", Tahoma, sans-serif';
```

Add two more constants directly after it:

```ts
const CANVAS_DISPLAY_FONT =
  '"Teyvat ZHCN", "Bree Serif", "Mitr", Georgia, serif';
const CANVAS_TEXT_FONT = '"Prompt", "Noto Sans Thai", Tahoma, sans-serif';
const SHARE_CARD_NAME_BASE_FONT_SIZE = 92;
const SHARE_CARD_NAME_MIN_FONT_SIZE = 44;
```

Then add a new function near the other canvas text helpers — insert it directly before `function drawWrappedText(` (`src/utils/share-result.ts:264`):

```ts
function drawFittedName(
  context: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  maximumWidth: number,
) {
  let fontSize = SHARE_CARD_NAME_BASE_FONT_SIZE;
  context.font = `${fontSize}px ${CANVAS_DISPLAY_FONT}`;
  while (
    context.measureText(name).width > maximumWidth &&
    fontSize > SHARE_CARD_NAME_MIN_FONT_SIZE
  ) {
    fontSize -= 2;
    context.font = `${fontSize}px ${CANVAS_DISPLAY_FONT}`;
  }
  const text =
    context.measureText(name).width <= maximumWidth
      ? name
      : truncateCanvasText(context, name, maximumWidth);
  context.fillText(text, x, y);
}
```

- [ ] **Step 2: Use the helper for the name draw call**

In `src/utils/share-result.ts`, lines 169-171 currently are:

```ts
context.fillStyle = "#252a32";
context.font = `92px ${CANVAS_DISPLAY_FONT}`;
context.fillText(character.name, 555, 290);
```

Change to:

```ts
context.fillStyle = "#252a32";
drawFittedName(context, character.name, 555, 290, 375);
```

The `375` matches the `555`-to-`930` name column width already established by the divider line drawn later in the same function (`src/utils/share-result.ts:184-186`, `moveTo(555, 535)` / `lineTo(930, 535)`).

Leave the title draw call two lines below (`context.fillText(character.title[locale], 555, 345);`) unchanged — it is out of scope for this issue (`docs/issue_logs.md`'s UX-05 only covers the character name, and its font is already much smaller at 30px).

- [ ] **Step 3: Verify by hand**

Run `pnpm dev`, reach `/result` for each of these characters (use `?preview=<id>` on the result page, or complete quizzes that land on them) and click "ดาวน์โหลดการ์ด" (downloadCard) for each, in both `th` and `en` locale:

1. `neuvillette` ("Neuvillette") — short name; confirm it still renders large and readable (should need little or no shrinking).
2. `yumemizuki_mizuki` ("Yumemizuki Mizuki") — confirm the name is shrunk to fit within the card's right column and does not visually cross the vertical divider line or run past the card's right edge.
3. `sangonomiya_kokomi` ("Sangonomiya Kokomi") — same check; if it's still too wide even at the minimum font size, confirm it truncates with a trailing `…` instead of overflowing.

Open each downloaded PNG at full size to confirm visually — do not just check that `downloadShareCard()` completes without throwing.

- [ ] **Step 4: Run lint and build**

```bash
pnpm lint
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/share-result.ts
git commit -m "fix(share-card): shrink or truncate long character names to fit"
```

---

### Task 5: UX-02 — Question card height stays stable across questions

**Files:**

- Modify: `src/styles/index.css:889-896, 2507-2509`

**Interfaces:** None — pure CSS change, self-contained.

**Problem:** `.question-card` (`src/styles/index.css:889-896`) has no `min-height`; question prompts (`src/data/quiz/questions.ts`) and answer labels vary widely in length (the four answers per question also wrap to different numbers of lines), so the card visibly grows and shrinks as the user moves between questions.

- [ ] **Step 1: Reserve height on wider viewports**

In `src/styles/index.css`, lines 889-896 currently are:

```css
.question-card {
  position: relative;
  margin-top: 26px;
  padding: 52px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
```

Add a `min-height`:

```css
.question-card {
  position: relative;
  margin-top: 26px;
  padding: 52px;
  min-height: 620px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
```

`min-height` (not `height`) means a question whose content is taller than 620px still grows normally — `overflow: hidden` only clips content that would spill outside the rounded corners of a box sized _smaller_ than its content, which cannot happen here since the box always grows to fit. 620px is a starting estimate sized for the longest observed Thai prompt (~3 wrapped lines at the 34px cap) plus four answer options each wrapped to two lines; **this number must be confirmed and adjusted in Step 3**, not treated as final.

- [ ] **Step 2: Let mobile size to content instead of inheriting the desktop minimum**

In `src/styles/index.css`, the mobile override at lines 2507-2509 (inside the `@media (max-width: 780px)` block starting at line 2464) currently is:

```css
.question-card {
  padding: 34px 22px 24px;
}
```

Change it to:

```css
.question-card {
  padding: 34px 22px 24px;
  min-height: auto;
}
```

This satisfies `docs/issue_logs.md`'s explicit constraint that mobile must not clip text, hide options, or force a fixed height — only desktop/tablet gets the fixed reservation.

- [ ] **Step 3: Verify by hand and tune the 620px value**

Run `pnpm dev` at a desktop width (e.g. 1280px):

1. Switch locale to `th`, step through every quiz question via "next"/"back" (there are questions across all six dimensions in `src/data/quiz/questions.ts`). Watch the card's bottom edge and the position of the "next"/"back" buttons below it — confirm they do not visibly jump between questions.
2. If any question still causes a visible jump (card taller than 620px), increase `min-height` in Step 1 by enough to cover the tallest question you found, and re-check the rest.
3. If 620px leaves excessive empty space below short questions' answers, consider lowering it — but do not lower it below whatever the tallest question in `th` requires.
4. Repeat steps 1-3 with locale set to `en`.
5. Resize the browser to ~768px and ~375px widths. Confirm no text is cut off, no answer option is hidden, and the page still scrolls normally when content is long (this is the mobile `min-height: auto` path, so the card should simply grow past the viewport height as needed, same as before this change).

- [ ] **Step 4: Run lint and build**

```bash
pnpm lint
pnpm build
```

(CSS correctness isn't caught by either — the manual check in Step 3 is the real verification for this task.)

- [ ] **Step 5: Commit**

```bash
git add src/styles/index.css
git commit -m "fix(quiz): reserve question-card height to prevent layout jump"
```

---

## Final check

After all five tasks are committed, re-read `docs/issue_logs.md` and update its status table (`## สรุป`) and each `**สถานะ:**` line from `เปิด` to `ปิด` for UX-01 through UX-05, since all five now have applied fixes and documented verification evidence. Do this as a small final commit once a human has actually performed the manual verification steps above (this plan's steps describe what to check; a status of `ปิด` per the doc's own definition requires "ผ่านเกณฑ์ยอมรับและมีหลักฐานการตรวจ" — passed acceptance criteria with verification evidence — which only a real manual pass, not the plan itself, can provide).
