---
name: teyvat-code-style
description: Coding style and conventions for the teyvat-personality codebase (Vite + React + TypeScript). Use this whenever writing, editing, reviewing, or generating any .ts/.tsx file in this repo — components, pages, hooks, engine/schema/data modules, or scripts — even for small edits, and even if the user doesn't mention "style" or "convention". Covers formatting authority (Prettier/ESLint), export/import shape, naming, type modeling (as-const id unions, string-literal state machines), effect-cleanup idioms, error-handling philosophy, and comment policy actually followed in this repo. Do not use for product/domain rules (personality model, data separation, character import) — those live in AGENTS.md and CONTEXT.md.
---

# Teyvat Personality — Code Style

This repo has a consistent, deliberate style across ~65 source files. New or
edited code should read as if the same person wrote it. This skill documents
what that style actually is, verified against the current codebase — not a
generic TypeScript/React style guide.

Domain and architecture rules (personality model, data separation, character
import rules, what AI may/may not invent) live in `AGENTS.md` and
`CONTEXT.md` — read those separately when the task touches that territory.
This skill is only about *how code is written*, not what it does.

## Stack

Vite, React, TypeScript, Tailwind CSS v4, React Router, Zod, Firebase Web SDK,
ESLint (`typescript-eslint` + `react-hooks` + `react-refresh`), Prettier,
pnpm. No test framework yet (deferred — don't add one unless asked).

## Formatting authority: Prettier and ESLint, not vibes

`.prettierrc.json` (`semi: true`, `singleQuote: false`, `trailingComma: "all"`,
default 80-col width) and `eslint.config.js` are the ground truth. Don't hand-
wrap or hand-quote code to match a specific file's look — run the tools:

```
pnpm format   # prettier --write .
pnpm lint     # eslint .
```

Two known wrinkles, both confirmed by actually running Prettier against this
repo — don't assume either without checking:

1. **This checkout uses CRLF line endings** (Windows + `core.autocrlf=true`),
   but Prettier's default output is LF. That means `prettier --check` /
   `pnpm format:check` flags nearly every file even when the content is
   already correctly formatted. Don't trust a bare "code style issues found"
   warning as evidence of a real problem — run `pnpm format` (write) and read
   `git diff` for the file you actually touched; if the diff is empty or pure
   line-ending noise, the content was already fine.
2. **`src/engine/index.ts` and `src/schemas/index.ts` currently contain real,
   non-CRLF formatting drift** (dense single-line function bodies, unwrapped
   80+ char lines) — they do not match the wrapped, one-expression-per-line
   look the rest of the codebase has. Don't copy that dense style into new
   code, and don't treat those two files as the reference example. If you
   substantially edit either file, running `pnpm format` on it is an
   improvement, not scope creep.

## Exports: always named, never default

Zero `export default` anywhere in `src/`, including page and component
modules that a framework convention might otherwise nudge toward one
(`main.tsx`, every `pages/*.tsx`, every component). Always:

```ts
export function ResultPage({ locale }: { locale: Locale }) { ... }
```

Some feature folders (`components/common/`, `components/result/`,
`components/share/`, `hooks/`, `pages/`, `data/quiz/`) have a real barrel
`index.ts`/`index.tsx` that re-exports the folder's public surface, and call
sites import from the folder:

```ts
import { Button, ContentCard, PageContainer } from "../components/common";
```

This is **not universal** — `src/utils/index.ts` is just `export {};` (a
stub) and nothing imports from `../utils` as a barrel; every util
(`quiz-result.ts`, `share-result.ts`, `character-preview.ts`, ...) is
imported directly by its file path, and so are `data/characters/*` and
`data/personality/*`. Before adding a new file to a folder, check whether
that folder's existing siblings are actually re-exported from its
`index.ts` and imported that way elsewhere — don't assume a barrel exists or
should be added just because the folder has an `index.ts` file, and don't
add a folder's first barrel export speculatively. When in doubt, match
`utils/`'s direct-import default rather than `hooks/`'s barrel.

The one exception is a genuinely route-level lazy chunk (`SharedResultPage`
in `App.tsx`), which is dynamically `import()`-ed and re-wrapped as
`{ default: module.SharedResultPage }` at the call site — the source module
itself still only has a named export.

## Imports: third-party first, then local, one concern per line

```ts
import { BookOpen, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, ContentCard } from "../components/common";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { CharacterMatch, Locale } from "../types";
import { loadCharacterById } from "../data/characters/repository";
```

- External packages, then a blank line, then local (relative) imports.
- `type` imports are inlined (`import { type X }` or `import type { X }`),
  not written as a separate `import type * as X`.
- No path aliases — everything is relative (`../`, `../../`).
- Import order isn't enforced by ESLint (no `import/order` plugin), so it's a
  convention, not a build gate: match the ordering style of the surrounding
  file rather than inventing a new scheme. Multi-image/asset imports in a
  file are typically each their own statement, alphabetized by the local
  binding name within their own logical group (e.g. UI icons together,
  region icons together) — see `src/components/common/index.tsx` for the
  pattern.
- Prettier decides the multi-line-vs-single-line wrapping for each import
  statement; don't manually force one form or the other.

## Naming

- `camelCase` for variables, functions, hooks (`useQuizProgress`).
- `PascalCase` for components, types, interfaces.
- `SCREAMING_SNAKE_CASE` for module-level constants that are versions,
  storage keys, or tuning numbers (`QUESTION_VERSION`, `STORAGE_KEY`,
  `QUIZ_IDLE_TIMEOUT_MS`).
- Function names are verb-first and describe the operation, not the
  implementation: `buildUserPersonalityProfile`, `rankCharacterMatches`,
  `canPublishSharedResult`, `recordSharedResultPublish`,
  `downloadShareCard`. Avoid vague names like `handle`/`process`/`data`.

## Type modeling patterns actually used here

**Closed ID sets** are modeled as an `as const` array plus a derived union,
never a hand-written union or a TS `enum`:

```ts
export const DIMENSION_IDS = ["social", "decision", /* … */] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];
```

Reuse this pattern for any new finite identifier set instead of writing
`type X = "a" | "b" | "c"` by hand — it keeps the runtime array and the type
in one place.

**Component props**: an inline object type literal in the destructured
parameter for props that are local to one component —

```ts
export function AppFooter({
  locale,
  onOpenCookieSettings,
}: {
  locale: Locale;
  onOpenCookieSettings: () => void;
}) { ... }
```

— and a separate named `type`/`interface` only once the shape is exported,
reused across files, or extends an existing HTML/DOM type
(`ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ... }`).
Don't pre-emptively extract a `Props` interface for a component that doesn't
need one yet.

**Async/UI state is a string-literal union, not booleans or a TS enum:**

```ts
type Feedback = "idle" | "copiedLink" | "copiedSummary" | "shared" | "downloaded" | "error";
type SharedResultState = "preview" | "shared" | "invalid";
// shareLinkState: "idle" | "publishing" | "published" | "throttled" | "error"
```

When a piece of UI/async state has more than two meaningful cases (loading /
success / specific failure kinds), reach for this pattern instead of
stacking multiple booleans (`isLoading`, `isError`, `hasPublished`, ...).

## Effects: guard async work against unmount, don't just fire-and-forget

Every `useEffect` that kicks off async work (a fetch, a dynamic `import()`, a
promise chain) uses the same guard idiom to avoid setting state after the
component is gone or an input changed mid-flight:

```ts
useEffect(() => {
  let active = true;
  someAsyncThing().then((value) => {
    if (active) setSomething(value);
  });
  return () => {
    active = false;
  };
}, [dep]);
```

Use this whenever an effect's callback resolves after the effect could have
been cleaned up — not just for fetches, for any `.then()`/awaited work
started inside `useEffect`.

## Error handling: throw on invariants, swallow with a comment on environment failures

Two distinct behaviors, chosen deliberately, not interchangeably:

- **Programmer/data invariant violations throw immediately** with a specific
  message — this is the default in engine, schema, and data-loading code:
  `throw new Error("Quiz answers are incomplete")`,
  `throw new Error(\`Invalid answer for ${question.id}: ...\`)`. Never
  silently coerce or default around bad internal state; fail loud so the bug
  surfaces during development/validation, not as a wrong quiz result.
- **Environment-dependent failures that are expected in normal usage** (
  `localStorage` unavailable in private browsing, `document.execCommand`
  clipboard fallback, a QR code that fails to generate) are caught and
  swallowed, surfaced instead as UI state (`setFeedback("error")`,
  `setDownloadError(true)`) — and when the catch body would otherwise look
  suspicious (an empty `catch {}`), it gets a one-line comment explaining why
  it's safe to ignore, e.g. `// Storage unavailable (private browsing,
  quota) — fail silently, hasDecided() stays false.`

Validation only happens at a boundary that crosses trust — parsing URL
search params (`parseSharedResult`), an external JSON module, raw quiz
answers. A pure internal helper that only ever receives already-validated,
already-typed data from another module in this codebase (a display
formatter, a small transform) does not re-validate or re-clamp its inputs;
it trusts its caller, matching how `character.compatibility` is rendered
as `${value}%` everywhere without re-checking the range.

## Comments: almost none, by design

Fewer than 10% of files have any comment at all. This isn't an oversight —
names, types, and small functions carry the meaning. Don't add comments that
restate what the code does. The rare comment that does exist explains a
*non-obvious why* behind an otherwise-suspicious-looking line (an empty
catch, a magic-looking glob pattern) — match that bar, not a lower one.

## Quick checklist before finishing a change

- [ ] Named export, no `export default`.
- [ ] If the folder's existing siblings are re-exported from its
      `index.ts(x)` (check first — `utils/`, `data/characters/`, and
      `data/personality/` deliberately are *not*), added the new export
      there too.
- [ ] New finite ID set uses the `as const` array + `(typeof X)[number]`
      pattern, not a hand-written union or enum.
- [ ] New multi-case async/UI state is a string-literal union, not booleans.
- [ ] Any `useEffect` with async work inside has the `active` guard.
- [ ] Invariant violations throw with a specific message; only genuinely
      environment-dependent failures are caught and swallowed.
- [ ] No added comments beyond a rare non-obvious "why".
- [ ] `pnpm lint` and `pnpm format` run clean (read the diff, not just the
      CRLF-noisy `--check` warning, per the note above).
