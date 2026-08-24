# Character Personality Generation Plan

> Status: executed. All 125 `src/data/personality/character-personalities/{id}.json` profiles exist. The implemented generator is `scripts/generate-character-personality-drafts.mjs` (run as `node scripts/generate-character-personality-drafts.mjs [--overwrite-drafts]`, not the `scripts/preview-character-personalities.mts` / `pnpm personality:preview` command named below) — it drafts scores from Thai keyword signals in lore text and writes `src/data/personality/character-personalities/_generation-review-report.md` for manual review, rather than the interactive preview-only flow originally planned. Kept as the design reference for scoring rules, trait vocabulary, and evidence priority when new characters are added.

## Goal

Create one fan-made personality interpretation for each researched character. The interpretation is based primarily on that character's lore and secondarily on the project's element-trait model.

Outputs will live at:

```text
src/data/personality/character-personalities/{id}.json
```

This directory is the interpretation layer. Do not write personality data into `src/data/characters/{id}.json`, which remains factual master data.

## Approved output schema

```json
{
  "id": "aino",
  "personality": {
    "social": 0,
    "decision": 0,
    "lifestyle": 0,
    "adventure": 0,
    "responsibility": 0,
    "expression": 0
  },
  "traits": {
    "traitName": 0.0
  },
  "strengths": [""],
  "weaknesses": [""]
}
```

Rules:

- All six `personality` values are integers from `0` through `100`.
- `traits` is a string-to-number map, not a string array. Each weight is from `0.0` through `1.0`.
- Use the canonical reusable trait names from `src/data/personality/element-personalities.json` and `CONTEXT.md`; add a new name only when its meaning is materially distinct.
- `strengths` and `weaknesses` are concise Thai strings. Use three to five entries for each where the lore supports them.
- Treat every profile as a fan-made interpretation, not official character data.

## Dimension definitions

| Dimension | `0` | `100` |
| --- | --- | --- |
| `social` | strongly introverted / socially withdrawn | strongly extroverted / socially energized |
| `decision` | strongly emotion- or value-driven | strongly logic- or reason-driven |
| `lifestyle` | spontaneous / flexible | structured / planned |
| `adventure` | cautious / risk-averse | adventurous / risk-tolerant |
| `responsibility` | free-spirited / low duty orientation | strongly duty-driven / responsible |
| `expression` | reserved / emotionally private | highly expressive / emotionally visible |

`lifestyle` deliberately uses the direction above, matching `CONTEXT.md` and `docs/scope.md`.

## Evidence and scoring method

For each character, read the matching files:

```text
src/data/characters/{id}.json
src/data/lore/{id}.json
src/data/personality/element-personalities.json
```

Use the lore fields in this priority order:

1. `personalityNotes`, `behaviorPatterns`, and `conflicts`
2. `motivations`, `values`, and `relationships`
3. `strengthEvidence` and `weaknessEvidence`
4. `stories`, `voiceOvers`, and `analysisNotes`

Map evidence to dimensions as follows:

| Dimension | Evidence to assess |
| --- | --- |
| `social` | preference for solitude or company, initiative in relationships, social energy by context |
| `decision` | analysis and evidence versus values, attachment, instinct, or emotion when making consequential choices |
| `lifestyle` | routines, planning, organization, consistency, improvisation, and tendency to depart from requirements |
| `adventure` | willingness to explore, experiment, travel, confront danger, or accept uncertain outcomes |
| `responsibility` | promises, duty, stewardship, care for dependents, and willingness to accept obligations |
| `expression` | visible emotion, directness, enthusiasm, self-disclosure, and context-dependent reserve |

Use `50` as the neutral starting point. Move away from neutral only when the lore supports it. Context-dependent behavior is represented by a middle score unless one context is clearly dominant.

Each dimension needs at least two independent pieces of lore evidence where available. A score is rounded to the nearest integer and should normally fall within `15–85`; use more extreme scores only with repeated, unambiguous evidence.

## Trait method

1. Select the character's element from the factual character file.
2. Copy the element's candidate trait vocabulary and baseline weights from `element-personalities.json`.
3. Compare each candidate trait against lore evidence.
4. Retain three to five traits with clear support; adjust a baseline by at most `0.20` per character.
5. Do not include a trait solely because the character has that element. If lore contradicts or does not support it, lower or omit it.
6. Add non-element traits only where lore has clear repeated evidence, using an existing canonical name first.

The element is therefore a thematic prior for traits, never evidence for a dimension score.

## Strength and weakness method

- Derive strengths only from `strengthEvidence` and repeatedly observed successful behavior.
- Derive weaknesses only from `weaknessEvidence`, conflicts, or repeated detrimental behavior.
- Describe a behavioral tendency, not a diagnosis or moral judgment.
- Do not duplicate the same idea across multiple labels.

## Script design: preview before writing

Create `scripts/preview-character-personalities.mts` first. It must be read-only and have no write mode.

Inputs:

```text
src/data/characters/*.json
src/data/lore/*.json
src/data/personality/element-personalities.json
```

Commands:

```bash
pnpm personality:preview -- --id aino
pnpm personality:preview
```

The script will:

1. Validate the one-to-one character/lore id coverage.
2. Validate factual elements against the element profile ids.
3. Print a per-character review template containing all six dimensions, element trait baselines, lore evidence slots, strengths, and weaknesses.
4. Emit a coverage report for missing or insufficient evidence.
5. Exit non-zero for malformed JSON, unknown elements, missing ids, or values outside their allowed ranges.

The script does **not** infer personality from arbitrary Thai prose. The final scores remain curated interpretations, entered only after review. This avoids opaque keyword-based scoring and keeps every result explainable.

## Implementation sequence after plan approval

1. Add the read-only preview/validation script and its `package.json` command.
2. Run it for Aino and review the generated evidence template.
3. Create Aino's profile as the calibration example.
4. Review Aino against two contrast characters to confirm score spread and trait terminology.
5. Generate profiles in small review batches of 10–15 characters.
6. After every batch, validate JSON, schema ranges, unique ids, and full factual/lore/profile coverage.
7. Build the app after all profiles are present and retain a report of profiles needing manual evidence review.

## Aino calibration preview

The following is a draft for review, not a written profile:

```json
{
  "id": "aino",
  "personality": {
    "social": 45,
    "decision": 70,
    "lifestyle": 35,
    "adventure": 78,
    "responsibility": 75,
    "expression": 55
  },
  "traits": {
    "ideals": 0.85,
    "adaptability": 0.75,
    "responsibility": 0.85,
    "creativity": 0.9,
    "perseverance": 0.8
  },
  "strengths": [
    "วิเคราะห์และประดิษฐ์อย่างชำนาญ",
    "สร้างสรรค์และแก้ปัญหาเก่ง",
    "ดูแลคนสำคัญอย่างจริงจัง"
  ],
  "weaknesses": [
    "หมกมุ่นจนละเลยการพักผ่อน",
    "จัดระเบียบงานและพื้นที่ได้ไม่สม่ำเสมอ",
    "อ่อนไหวเมื่อผลงานไม่ได้รับการยอมรับ"
  ]
}
```

Rationale: Aino is socially selective but warm around trusted people and machinery; analytical in technical problem-solving; improvisational and disorganized in work habits; highly willing to experiment; strongly protective of her mechanical family; and expressive chiefly in trusted or interest-led contexts.

## Acceptance criteria

- Exactly one profile file exists for every character id with usable lore.
- Every profile conforms to the approved schema and numeric ranges.
- Traits are weighted objects and are lore-supported element-theme interpretations.
- Factual character files and lore files remain unchanged by the profile-generation process.
- Every generated profile can be reviewed against cited lore fields before it becomes accepted data.
