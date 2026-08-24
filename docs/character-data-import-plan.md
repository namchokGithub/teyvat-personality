# Character Data Import Plan

> Status: executed. All 125 `src/data/characters/{id}.json` files exist per this schema, and `src/data/characters/_missing-data-report.md` is generated. Kept as the re-run reference for when new characters are added — the "Future updates / re-run behavior" and "Execution steps" sections below still describe how to safely re-run the importer. Scope: read `genshin-db/` and `paimon-moe/` (read-only), write only inside `teyvat-personality/`.

## Goal

For every entry in the canonical character index, `src/data/characters/_characters.json` (125 entries), generate a file `src/data/characters/{id}.json` following the exact schema of the existing `nahida.json`:

`_characters.json` is the only character index used by the importer, character repository, and project documentation. Each entry must contain at least `{ "id": "string", "name": "string" }`; validate that `id` is non-empty and unique before importing. The index supplies the authoritative import order and the `id`/`name` values written to each factual character file.

```json
{
  "id": "string",
  "name": "string",
  "region": "string | null",
  "element": "string | null",
  "weapon": "string | null",
  "rarity": "number | null",
  "title": "string | null",
  "description": "string | null",
  "birthday": { "birthdayText": "string", "birthdayMMDD": [number, number] } | null,
  "gender": "string | null",
  "personality": null,
  "traits": [],
  "strengths": [],
  "weaknesses": []
}
```

Each output file is a plain JSON object (`{ ... }`), **not** wrapped in an array. The existing `nahida.json` follows this same object schema.

`personality`, `traits`, `strengths`, `weaknesses` are only set to their empty defaults (`null`/`[]`) **the first time a file is created**. See "Future updates / re-run behavior" below — a re-run must never overwrite these fields on a file that already exists.

### Missing-value rule

Every schema field is always present. When a field has no reliable source value, write `null`; never omit the field and never use an empty string or an empty birthday object. This includes `birthday`, which must be either its complete object or `null`.

## Lookup key rule

`_characters.json` ids use snake_case (`hu_tao`, `arataki_itto`). `genshin-db/src/data/English/characters/*.json` filenames use lowercase with no separators (`hutao.json`, `aratakiitto.json`). To find the source file for a given id:

```
gdbKey = id.toLowerCase().replace(/_/g, "")
sourceFile = genshin-db/src/data/English/characters/{gdbKey}.json
```

Verified against all 125 ids — this normalization resolves 116/125 correctly.

## Field source mapping

| Output field            | Primary source                                                                                                                | Path in genshin-db file |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `id`, `name`            | `src/data/characters/_characters.json` (canonical index)                                                                      | —                       |
| `title`                 | genshin-db                                                                                                                    | `title`                 |
| `description`           | genshin-db                                                                                                                    | `description`           |
| `region`                | genshin-db                                                                                                                    | `region`                |
| `element`               | genshin-db                                                                                                                    | `elementText`           |
| `weapon`                | genshin-db                                                                                                                    | `weaponText`            |
| `rarity`                | genshin-db                                                                                                                    | `rarity`                |
| `gender`                | genshin-db                                                                                                                    | `gender`                |
| `birthday.birthdayText` | genshin-db                                                                                                                    | `birthday`              |
| `birthday.birthdayMMDD` | genshin-db`birthdaymmdd` ("10/27" → `[10,27]`), cross-checked against `paimon-moe/src/data/birthdays.js` (`{ id: [mm, dd] }`) | —                       |

Cross-validation rule: when both sources have a birthday MM/DD value, they must agree. If they conflict, do not guess — write `birthday: null` and record the conflict for manual review.

## Known gaps found during investigation

Checked all 125 ids against genshin-db (120 files) and paimon-moe (`birthdays.js`, `characters.js`, `characterData/*.json`):

**9 ids have no genshin-db file:**

- `alyosha`, `odette` — not yet in genshin-db. Fallback: `paimon-moe/src/data/characterData/{id}.json` has `description` (no `title`, no `gender`). `paimon-moe/src/data/birthdays.js` has their birthday MM/DD (`alyosha: [2,9]`, `odette: [2,20]`).
  - **Resolved:** `birthdayText` is derived from that MM/DD using the same "Month Day" pattern seen in genshin-db (e.g. `[2,9]` → `"February 9"`, `[2,20]` → `"February 20"`). Not a gap — no report entry for birthday on these two.
  - Convert Paimon weapon and rarity values before writing: `polearm` → `"Polearm"`, `sword` → `"Sword"`, `rare` → `4`, and `legendary` → `5`. Therefore Alyosha receives `"Polearm"` and `4`; Odette receives `"Sword"` and `5`.
  - `title`, `gender`, `region`, and `element` still have no structured source in either repo → write `null` and report them as missing.
- `traveler_anemo`, `traveler_dendro`, `traveler_electro`, `traveler_geo`, `traveler_hydro`, `traveler_pyro`, `traveler_cryo` (7 ids) — genshin-db has no per-element Traveler entry, only `aether.json` (Male) / `lumine.json` (Female), both with empty `title` and empty `birthday`/`birthdaymmdd`. `paimon-moe/src/data/birthdays.js` has no traveler entry either.
  - Use the shared Traveler values for all seven files: `description`, `descriptionTh`, `weapon`, and `rarity` are identical across the Aether/Lumine source records. Set `title` to `"Descender"` and `titleTh` to `"ผู้มาเยือน"`, the documented shared classification of the Traveler. `traveler_cryo` changes only `element` to `"Cryo"`.
  - Set `element` by the element suffix in the id (`traveler_anemo` → `"Anemo"`, etc.). This is an explicit import rule, including `traveler_cryo`.
  - **Resolved — `region`:** each Traveler variant's archon nation is derived from its `element` via this project's own `src/data/masters/regions.json` (each region entry already carries its matching `element`), not invented: `anemo→"Mondstadt"`, `geo→"Liyue"`, `electro→"Inazuma"`, `dendro→"Sumeru"`, `hydro→"Fontaine"`, `pyro→"Natlan"`, `cryo→"Snezhnaya"`. Not a gap — no report entry for region on any of the 7.
  - **Resolved — dynamic fields:** `birthday` is the player's choice, not a canonical MM/DD; `gender` is determined by the selected twin (Aether = Male, Lumine = Female). Both stay `null` on all seven `traveler_*` files and are excluded from the missing-data report.

**4 genshin-db files have no matching canonical-index id** (not relevant to this task, no action): `aether`, `lumine`, `manekin`, `manekina`.

## Future updates / re-run behavior

genshin-db and paimon-moe get updated over time (new patches, new characters, corrected data). The import must be safe to **re-run repeatedly** without destroying manually-researched personality content. Rule:

| File state                     | `id`/`name`/`region`/`element`/`weapon`/`rarity`/`title`/`description`/`birthday`/`gender`                                                   | `personality`/`traits`/`strengths`/`weaknesses`                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `{id}.json` does not exist yet | Write sourced values; write `null` when no reliable source exists.                                                                        | Set to empty defaults (`null`/`[]`)                                              |
| `{id}.json` already exists     | Refresh a field only when the new source value is non-null. Never replace an existing non-null value with `null` or another blank value. | **Never touch** — leave whatever is already in the file untouched, even if empty |

Practical effect: running the import script again after this task (e.g. when a new character patch drops) only (a) creates files for ids that are new to `_characters.json`, and (b) refreshes factual fields on existing files when upstream provides a concrete value. Existing known factual data and any personality research a human has added survive every re-run.

The missing-data report (`_missing-data-report.md`) is regenerated fresh on every run — it reflects current gaps, not historical ones, so gaps that get fixed upstream (e.g. `alyosha`/`odette` eventually landing in genshin-db) simply stop appearing.

## Execution steps (for the actual run, later)

1. Load and validate `src/data/characters/_characters.json`: every entry needs a non-empty `id` and `name`, and no two entries may share an `id`. Build the id → genshin-db-file map from this canonical index; for the 9 gap ids, fall back to paimon-moe sources where available.
2. For each of the 125 ids: if `src/data/characters/{id}.json` does not exist, create it as a plain object (not array-wrapped) with sourced factual fields, `null` for every missing factual field, and empty `personality`/`traits`/`strengths`/`weaknesses`. If it already exists, refresh only factual fields that have a new non-null source value; preserve existing values when the new source value is null, and leave `personality`/`traits`/`strengths`/`weaknesses` exactly as found.
3. For `alyosha`/`odette`, format `birthdayText` from the paimon-moe MM/DD pair ("Month Day").
4. For the 7 `traveler_*` ids, use the shared Traveler profile and derive the element from the id; `traveler_cryo` differs only by using `"Cryo"` as its element. Set the shared title to `Descender` / `ผู้มาเยือน`; derive `region` from the element via `src/data/masters/regions.json` (element → region name). Keep `birthday: null` (player's choice) and `gender: null` (selected twin) and do not flag either as a gap.
5. For any other field that can't be sourced from either repo, write `null` (never fabricate) and add a line to the gap report.
6. Write a single summary file, e.g. `src/data/characters/_missing-data-report.md` (or `.json`), listing per-id which fields were written as `null` and why (no source / source conflict). Traveler `birthday`/`gender` and alyosha/odette `birthday` are excluded from this report per the resolutions above.
7. Do not touch `genshin-db/` or `paimon-moe/`. Do not add `personality`/`traits`/`strengths`/`weaknesses` content in this pass — only the empty-default scaffold on first creation.
