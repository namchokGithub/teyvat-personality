# Shared Result Schema & Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Firestore document schema, Security Rules, and a minimal publish helper for the "Shared Result" feature (P2 items 1-2 in `DEVELOPMENT_PLAN.md`), fully verified against the Firestore Emulator — with no UI wiring, no route, and no abuse-prevention decision included.

**Architecture:** A pure TS type (`SharedResultDoc`) and a pure mapper (`buildSharedResultDoc`) turn the app's existing `CharacterMatch`/`VisionMatch` into a self-contained snapshot; a thin `publishSharedResult(db, ...)` helper writes it with `serverTimestamp()` after a collision check; `firestore.rules` enforces create-only with full shape/range validation. Everything is verified by one growing node script run inside the Firestore Emulator via `firebase emulators:exec`, following this repo's existing "standalone verification script" convention (`scripts/verify-engine.mjs`, `scripts/validate-data.mjs`) instead of introducing a test framework.

**Tech Stack:** TypeScript, Firebase JS SDK (`firebase/firestore`), `nanoid`, `@firebase/rules-unit-testing`, `firebase-tools` (Firestore Emulator only), Vite's `ssrLoadModule` (existing project pattern for running `.ts` modules from plain node scripts).

**Spec:** [docs/superpowers/specs/2026-08-24-shared-result-schema-rules-design.md](../specs/2026-08-24-shared-result-schema-rules-design.md)

## Global Constraints

- All file changes stay inside `teyvat-personality/` — never touch `genshin-db/` or `paimon-moe/` (CLAUDE.md).
- Document ID: client-generated, 12 characters, alphabet `A-Za-z0-9_-` exactly (spec item 1). Hardcode this alphabet via `nanoid`'s `customAlphabet` rather than relying on its default, so a future `nanoid` version change can't silently drift the ID shape.
- Collection: `sharedResults/{id}`. Full document shape and full `firestore.rules` content are already fully specified in the spec — this plan transcribes and wires them up, it does not redesign them.
- `publishedAt` must be written with `serverTimestamp()`; rules must enforce `request.resource.data.publishedAt == request.time`.
- No raw quiz answers, `UserPersonalityProfile`, or player name may appear anywhere in the shared-result doc.
- No test runner exists in this repo (no vitest/jest) — verification is a single node script (`scripts/verify-shared-result.mjs`) run directly, or wrapped with `firebase emulators:exec --only firestore` once Firestore is involved, matching `scripts/verify-engine.mjs` / `scripts/validate-data.mjs` conventions (no manual `process.exit`, let assertion errors propagate, `try/finally` for cleanup).
- Out of scope, do not implement here: publish-flow UI / `#/shared/:id` route (item 3), invalid-link/old-version UI handling (item 4), App Check/Anonymous Auth or any abuse-prevention (item 5).

---

## File Structure

- `src/types/index.ts` (modify) — add `SharedResultVersion`, `SharedResultCharacterSnapshot`, `SharedResultVisionSnapshot`, `SharedResultSnapshot`, `SharedResultDoc`.
- `src/lib/shared-result.ts` (create) — `createSharedResultId()`, `buildSharedResultDoc()` (pure mapper), `publishSharedResult(db, ...)` (Firestore write helper, takes `Firestore` as a parameter for testability — no dependency on the app's `firebaseApp` singleton).
- `firestore.rules` (create, at `teyvat-personality/` root) — starts as a deny-all placeholder (Task 1), replaced with the real rules in Task 3.
- `firebase.json` (create, at `teyvat-personality/` root) — Firestore Emulator config only.
- `.gitignore` (modify) — ignore emulator log/cache noise.
- `package.json` (modify) — add `nanoid` dependency; add `firebase-tools` and `@firebase/rules-unit-testing` devDependencies; add/evolve the `verify:shared-result` script.
- `scripts/verify-shared-result.mjs` (create, grows across Tasks 2-4) — the single verification script.

---

### Task 1: Dependencies and Firebase config scaffolding

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `firebase.json`
- Create: `firestore.rules`
- Create: `scripts/verify-shared-result.mjs`

**Interfaces:**
- Produces: an npm script `verify:shared-result` that later tasks extend; a `firestore.rules` file later tasks replace the contents of.

- [ ] **Step 1: Add dependencies**

In `package.json`, add to `"dependencies"`:

```json
"nanoid": "latest",
```

And add to `"devDependencies"`:

```json
"@firebase/rules-unit-testing": "latest",
"firebase-tools": "latest",
```

- [ ] **Step 2: Install**

Run: `pnpm install`
Expected: lockfile updates, install succeeds.

- [ ] **Step 3: Create the Firestore Emulator config**

Create `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": false
    }
  }
}
```

- [ ] **Step 4: Create a deny-all placeholder rules file**

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

This is intentionally denies everything — Task 3 replaces it with the real rules, and having a real (if trivial) starting point lets Task 3's tests go red for the right reason before going green.

- [ ] **Step 5: Ignore emulator noise**

Add to `.gitignore`:

```
firebase-debug.log
firestore-debug.log
.firebase/
```

- [ ] **Step 6: Create the verification script stub**

Create `scripts/verify-shared-result.mjs`:

```js
console.log("Shared result verification harness ready.");
```

- [ ] **Step 7: Wire the npm script and confirm the emulator boots**

Add to `package.json` `"scripts"`:

```json
"verify:shared-result": "firebase emulators:exec --project demo-teyvat-personality --only firestore \"node scripts/verify-shared-result.mjs\"",
```

Run: `pnpm run verify:shared-result`
Expected: `firebase-tools` downloads/starts the Firestore Emulator (first run may take longer while it fetches the emulator jar), prints `Shared result verification harness ready.`, then reports emulator tests as passed and shuts the emulator down, exit code 0.

The `demo-` project ID prefix tells the emulator to run fully offline with no real Firebase project, login, or `.firebaserc` required.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore firebase.json firestore.rules scripts/verify-shared-result.mjs
git commit -m "chore: scaffold Firestore emulator harness for shared-result rules"
```

---

### Task 2: SharedResultDoc types and the pure snapshot mapper

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/lib/shared-result.ts`
- Modify: `scripts/verify-shared-result.mjs`

**Interfaces:**
- Consumes: `CharacterMatch`, `VisionMatch`, `LocalizedText` (existing, `src/types/index.ts`)
- Produces: `SharedResultVersion { questionVersion: string; algorithmVersion: string }`, `SharedResultSnapshot` (doc shape minus `publishedAt`), `SharedResultDoc` (full doc shape), `createSharedResultId(): string`, `buildSharedResultDoc(character: CharacterMatch, vision: VisionMatch, versions: SharedResultVersion): SharedResultSnapshot` — all from `src/lib/shared-result.ts` / `src/types/index.ts`, consumed by Task 3 (rules fixtures mirror this shape) and Task 4 (`publishSharedResult` wraps this mapper).

- [ ] **Step 1: Add the failing mapper assertions**

Replace the contents of `scripts/verify-shared-result.mjs` with:

```js
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  logLevel: "error",
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sampleCharacter = {
  characterId: "kirara",
  name: "Kirara",
  element: "Dendro",
  region: "Inazuma",
  compatibility: 87,
  title: { th: "นักส่งพัสดุ", en: "The Postal Courier" },
  summary: { th: "สรุปตัวละคร", en: "Character summary" },
  matchingTraits: [{ th: "ขยัน", en: "Diligent" }],
  matchingTraitIds: ["diligent"],
  artworkUrl: undefined,
};
const sampleVision = {
  element: "Dendro",
  affinity: 91,
  summary: { th: "สรุปธาตุ", en: "Vision summary" },
};
const sampleVersions = { questionVersion: "q3", algorithmVersion: "a1" };

try {
  const sharedResult = await server.ssrLoadModule("/src/lib/shared-result.ts");

  const snapshot = sharedResult.buildSharedResultDoc(sampleCharacter, sampleVision, sampleVersions);
  assert(snapshot.schemaVersion === 1, "schemaVersion must be 1");
  assert(snapshot.questionVersion === "q3" && snapshot.algorithmVersion === "a1", "version fields must pass through untouched");
  assert(snapshot.character.characterId === "kirara" && snapshot.character.compatibility === 87, "character snapshot must carry core fields");
  assert(snapshot.character.artworkUrl === null, "a missing artworkUrl must coerce to null, not undefined");
  assert(Array.isArray(snapshot.character.matchingTraits) && snapshot.character.matchingTraits[0].en === "Diligent", "matchingTraits must pass through");
  assert(snapshot.vision.element === "Dendro" && snapshot.vision.affinity === 91, "vision snapshot must carry core fields");

  const ids = new Set(Array.from({ length: 50 }, () => sharedResult.createSharedResultId()));
  assert(ids.size === 50, "createSharedResultId must not collide across 50 calls");
  assert([...ids].every((id) => /^[A-Za-z0-9_-]{12}$/.test(id)), "createSharedResultId must match the URL-safe 12-character pattern");

  console.log("Shared result mapper verification passed.");
} finally {
  await server.close();
}
```

- [ ] **Step 2: Run it and confirm it fails for the right reason**

Run: `node scripts/verify-shared-result.mjs`
Expected: FAIL — `src/lib/shared-result.ts` does not exist yet, so `ssrLoadModule` throws.

- [ ] **Step 3: Add the types**

At the very top of `src/types/index.ts`, add:

```ts
import type { Timestamp } from "firebase/firestore";

```

At the end of `src/types/index.ts`, add:

```ts

export interface SharedResultVersion {
  questionVersion: string;
  algorithmVersion: string;
}

export interface SharedResultCharacterSnapshot {
  characterId: string;
  name: string;
  element: string;
  region: string;
  compatibility: number;
  title: LocalizedText;
  summary: LocalizedText;
  matchingTraits: LocalizedText[];
  artworkUrl: string | null;
}

export interface SharedResultVisionSnapshot {
  element: string;
  affinity: number;
  summary: LocalizedText;
}

export interface SharedResultSnapshot extends SharedResultVersion {
  schemaVersion: 1;
  character: SharedResultCharacterSnapshot;
  vision: SharedResultVisionSnapshot;
}

export interface SharedResultDoc extends SharedResultSnapshot {
  publishedAt: Timestamp;
}
```

- [ ] **Step 4: Implement the mapper**

Create `src/lib/shared-result.ts`:

```ts
import { customAlphabet } from "nanoid";

import type {
  CharacterMatch,
  SharedResultCharacterSnapshot,
  SharedResultSnapshot,
  SharedResultVersion,
  SharedResultVisionSnapshot,
  VisionMatch,
} from "../types";

const SHARED_RESULT_ID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const SHARED_RESULT_ID_LENGTH = 12;
const generateSharedResultId = customAlphabet(SHARED_RESULT_ID_ALPHABET, SHARED_RESULT_ID_LENGTH);

export function createSharedResultId(): string {
  return generateSharedResultId();
}

function toCharacterSnapshot(character: CharacterMatch): SharedResultCharacterSnapshot {
  return {
    characterId: character.characterId,
    name: character.name,
    element: character.element,
    region: character.region,
    compatibility: Math.round(character.compatibility),
    title: character.title,
    summary: character.summary,
    matchingTraits: character.matchingTraits,
    artworkUrl: character.artworkUrl ?? null,
  };
}

function toVisionSnapshot(vision: VisionMatch): SharedResultVisionSnapshot {
  return {
    element: vision.element,
    affinity: Math.round(vision.affinity),
    summary: vision.summary,
  };
}

export function buildSharedResultDoc(
  character: CharacterMatch,
  vision: VisionMatch,
  versions: SharedResultVersion,
): SharedResultSnapshot {
  return {
    schemaVersion: 1,
    questionVersion: versions.questionVersion,
    algorithmVersion: versions.algorithmVersion,
    character: toCharacterSnapshot(character),
    vision: toVisionSnapshot(vision),
  };
}
```

- [ ] **Step 5: Run it again and confirm it passes**

Run: `node scripts/verify-shared-result.mjs`
Expected: prints `Shared result mapper verification passed.`, exit code 0.

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc -b`
Expected: no errors (confirms the new types compile and `firebase/firestore`'s `Timestamp` type resolves).

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/lib/shared-result.ts scripts/verify-shared-result.mjs
git commit -m "feat: add SharedResultDoc types and pure snapshot mapper"
```

---

### Task 3: Real Firestore Rules, verified against the emulator

**Files:**
- Modify: `firestore.rules`
- Modify: `package.json` (wrap `verify:shared-result` with the emulator)
- Modify: `scripts/verify-shared-result.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks' code (rules tests use literal fixture objects, deliberately independent of the app's mapper, so the rules are proven correct on their own terms — see spec's "Out of scope" rationale for keeping these decoupled).
- Produces: a real, tested `firestore.rules` that Task 4's `publishSharedResult` integration test relies on being correct.

- [ ] **Step 1: Point the npm script at the emulator**

In `package.json`, change the `verify:shared-result` script to:

```json
"verify:shared-result": "firebase emulators:exec --project demo-teyvat-personality --only firestore \"node scripts/verify-shared-result.mjs\"",
```

(This is the same command from Task 1 Step 7 — Task 1 already wired it; this step exists only if it was reverted. Confirm it matches before continuing.)

- [ ] **Step 2: Add the failing rules assertions**

Append to `scripts/verify-shared-result.mjs`, replacing the final `console.log("Shared result mapper verification passed.");` line with the same line followed by this new block (keep the mapper test's `try { ... }` above intact — this is a new top-level block after that `try/finally` closes):

```js

const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORT = 8080;
const EMULATOR_PROJECT_ID = "demo-teyvat-personality";

const { readFileSync } = await import("node:fs");
const { initializeTestEnvironment, assertSucceeds, assertFails } = await import("@firebase/rules-unit-testing");
const { doc, getDoc, getDocs, collection, setDoc, deleteDoc, serverTimestamp, Timestamp } = await import("firebase/firestore");

function sampleSharedResultDoc() {
  return {
    schemaVersion: 1,
    questionVersion: "q3",
    algorithmVersion: "a1",
    publishedAt: serverTimestamp(),
    character: {
      characterId: "kirara",
      name: "Kirara",
      element: "Dendro",
      region: "Inazuma",
      compatibility: 87,
      title: { th: "นักส่งพัสดุ", en: "The Postal Courier" },
      summary: { th: "สรุปตัวละคร", en: "Character summary" },
      matchingTraits: [{ th: "ขยัน", en: "Diligent" }],
      artworkUrl: null,
    },
    vision: {
      element: "Dendro",
      affinity: 91,
      summary: { th: "สรุปธาตุ", en: "Vision summary" },
    },
  };
}

const testEnv = await initializeTestEnvironment({
  projectId: EMULATOR_PROJECT_ID,
  firestore: {
    rules: readFileSync("firestore.rules", "utf8"),
    host: EMULATOR_HOST,
    port: EMULATOR_PORT,
  },
});

try {
  const db = testEnv.unauthenticatedContext().firestore();
  const validId = "sharedRes001";

  await assertSucceeds(setDoc(doc(db, "sharedResults", validId), sampleSharedResultDoc()));

  await assertFails(setDoc(doc(db, "sharedResults", "tooShort"), sampleSharedResultDoc()));

  const missingField = sampleSharedResultDoc();
  delete missingField.character.name;
  await assertFails(setDoc(doc(db, "sharedResults", "sharedRes002"), missingField));

  const outOfRange = sampleSharedResultDoc();
  outOfRange.character.compatibility = 150;
  await assertFails(setDoc(doc(db, "sharedResults", "sharedRes003"), outOfRange));

  const fakeTimestamp = sampleSharedResultDoc();
  fakeTimestamp.publishedAt = Timestamp.fromMillis(0);
  await assertFails(setDoc(doc(db, "sharedResults", "sharedRes004"), fakeTimestamp));

  await assertSucceeds(getDoc(doc(db, "sharedResults", validId)));

  await assertFails(getDocs(collection(db, "sharedResults")));

  const overwrite = sampleSharedResultDoc();
  overwrite.character.compatibility = 1;
  await assertFails(setDoc(doc(db, "sharedResults", validId), overwrite));

  await assertFails(deleteDoc(doc(db, "sharedResults", validId)));

  console.log("Shared result rules verification passed.");
} finally {
  await testEnv.cleanup();
}
```

- [ ] **Step 3: Run it and confirm it fails for the right reason**

Run: `pnpm run verify:shared-result`
Expected: FAIL — the placeholder `firestore.rules` denies everything, so the first `assertSucceeds(setDoc(...))` and the later `assertSucceeds(getDoc(...))` both fail (they expected success but got denied).

- [ ] **Step 4: Implement the real rules**

Replace the contents of `firestore.rules` with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sharedResults/{id} {
      allow get: if true;
      allow list: if false;

      allow create: if
        id.matches('^[A-Za-z0-9_-]{12}$') &&
        request.resource.data.keys().hasOnly([
          'schemaVersion', 'questionVersion', 'algorithmVersion',
          'publishedAt', 'character', 'vision'
        ]) &&
        request.resource.data.schemaVersion == 1 &&
        request.resource.data.questionVersion is string &&
        request.resource.data.algorithmVersion is string &&
        request.resource.data.publishedAt == request.time &&
        isValidCharacter(request.resource.data.character) &&
        isValidVision(request.resource.data.vision);

      allow update: if false;
      allow delete: if false;
    }
  }
}

function isValidCharacter(c) {
  return c.keys().hasOnly([
      'characterId', 'name', 'element', 'region', 'compatibility',
      'title', 'summary', 'matchingTraits', 'artworkUrl'
    ])
    && c.characterId is string && c.name is string
    && c.element is string && c.region is string
    && c.compatibility is int && c.compatibility >= 0 && c.compatibility <= 100
    && isLocalizedText(c.title) && isLocalizedText(c.summary)
    && c.matchingTraits is list
    && (c.artworkUrl == null || c.artworkUrl is string);
}

function isValidVision(v) {
  return v.keys().hasOnly(['element', 'affinity', 'summary'])
    && v.element is string
    && v.affinity is int && v.affinity >= 0 && v.affinity <= 100
    && isLocalizedText(v.summary);
}

function isLocalizedText(t) {
  return t.keys().hasOnly(['th', 'en']) && t.th is string && t.en is string;
}
```

- [ ] **Step 5: Run it again and confirm it passes**

Run: `pnpm run verify:shared-result`
Expected: prints both `Shared result mapper verification passed.` and `Shared result rules verification passed.`, exit code 0.

- [ ] **Step 6: Commit**

```bash
git add firestore.rules package.json scripts/verify-shared-result.mjs
git commit -m "feat: implement create/read-only Firestore rules for shared results"
```

---

### Task 4: `publishSharedResult` write helper, verified end-to-end against the emulator

**Files:**
- Modify: `src/lib/shared-result.ts`
- Modify: `scripts/verify-shared-result.mjs`

**Interfaces:**
- Consumes: `buildSharedResultDoc`, `createSharedResultId` (Task 2), the real `firestore.rules` (Task 3)
- Produces: `publishSharedResult(db: Firestore, character: CharacterMatch, vision: VisionMatch, versions: SharedResultVersion): Promise<string>` — the function a future item-3 publish-flow UI will call as `publishSharedResult(getFirestore(firebaseApp), character, vision, versions)`. Takes `db` as a parameter (not the app's `firebaseApp` singleton) so it can be exercised against the emulator here without touching real Firebase config.

- [ ] **Step 1: Add the failing integration assertions**

Append to the end of `scripts/verify-shared-result.mjs`, as a new top-level block after everything Task 2 and Task 3 added (their own `try/finally` blocks are already closed by this point — this block opens and closes its own Vite server independently, so it does not need to touch any earlier code):

```js

const integrationServer = await createServer({
  root: process.cwd(),
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  logLevel: "error",
});

try {
  const { initializeApp } = await import("firebase/app");
  const { connectFirestoreEmulator, getFirestore, doc, getDoc, setDoc } = await import("firebase/firestore");

  const integrationApp = initializeApp({ projectId: EMULATOR_PROJECT_ID }, "shared-result-integration-test");
  const integrationDb = getFirestore(integrationApp);
  connectFirestoreEmulator(integrationDb, EMULATOR_HOST, EMULATOR_PORT);

  const sharedResult = await integrationServer.ssrLoadModule("/src/lib/shared-result.ts");
  const publishedId = await sharedResult.publishSharedResult(integrationDb, sampleCharacter, sampleVision, sampleVersions);
  assert(/^[A-Za-z0-9_-]{12}$/.test(publishedId), "publishSharedResult must return a 12-character opaque id");

  const stored = await getDoc(doc(integrationDb, "sharedResults", publishedId));
  assert(stored.exists(), "the published document must exist after publishSharedResult resolves");
  const storedData = stored.data();
  assert(storedData.character.characterId === sampleCharacter.characterId, "stored character snapshot must match the input character");
  assert(typeof storedData.publishedAt?.toMillis === "function", "publishedAt must be a Firestore Timestamp");

  let secondWriteRejected = false;
  try {
    await setDoc(doc(integrationDb, "sharedResults", publishedId), { ...storedData, character: { ...storedData.character, compatibility: 1 } });
  } catch {
    secondWriteRejected = true;
  }
  assert(secondWriteRejected, "overwriting an already-published document must be rejected by the rules");

  console.log("Shared result publish-helper integration verification passed.");
} finally {
  await integrationServer.close();
}
```

`EMULATOR_HOST`, `EMULATOR_PORT`, `EMULATOR_PROJECT_ID`, `assert`, `sampleCharacter`, `sampleVision`, and `sampleVersions` are the same top-level `const`s Task 2 and Task 3 already declared earlier in this file — do not redeclare them.

- [ ] **Step 2: Run it and confirm it fails for the right reason**

Run: `pnpm run verify:shared-result`
Expected: FAIL — `sharedResult.publishSharedResult` is `undefined`, calling it throws.

- [ ] **Step 3: Implement `publishSharedResult`**

In `src/lib/shared-result.ts`, add to the imports:

```ts
import { doc, getDoc, serverTimestamp, setDoc, type Firestore } from "firebase/firestore";
```

And append the function:

```ts
const MAX_SHARED_RESULT_ID_ATTEMPTS = 5;

export async function publishSharedResult(
  db: Firestore,
  character: CharacterMatch,
  vision: VisionMatch,
  versions: SharedResultVersion,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_SHARED_RESULT_ID_ATTEMPTS; attempt += 1) {
    const id = createSharedResultId();
    const ref = doc(db, "sharedResults", id);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, { ...buildSharedResultDoc(character, vision, versions), publishedAt: serverTimestamp() });
    return id;
  }
  throw new Error(`Could not generate a unique shared result id after ${MAX_SHARED_RESULT_ID_ATTEMPTS} attempts`);
}
```

- [ ] **Step 4: Run it again and confirm it passes**

Run: `pnpm run verify:shared-result`
Expected: all three success lines print (mapper, rules, publish-helper integration), exit code 0.

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm exec tsc -b && pnpm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/shared-result.ts scripts/verify-shared-result.mjs
git commit -m "feat: add publishSharedResult write helper with id-collision retry"
```

---

### Task 5: Full-suite check and plan bookkeeping

**Files:**
- Modify: `docs/plans/DEVELOPMENT_PLAN.md`
- Modify: `docs/plans/_plan_log.md`

**Interfaces:** none — this task only runs existing checks and updates plan docs.

- [ ] **Step 1: Run the full existing verification suite plus the new one**

Run: `pnpm install && pnpm run lint && pnpm run build && pnpm run verify:shared-result`
Expected: all pass, including the existing `validate:data` (invoked by `build`) and the new emulator-based `verify:shared-result`.

- [ ] **Step 2: Check off the completed backlog items**

In `DEVELOPMENT_PLAN.md`, under `## P2 — Shared Result ข้ามอุปกรณ์ (เลื่อนทำภายหลัง)`, change items 1 and 2 from `[ ]` to `[x]`, keeping their existing text and the link to the spec.

- [ ] **Step 3: Log the completed work**

Add a new dated entry to `_plan_log.md` (above `## Verification ล่าสุด`), e.g.:

```markdown
## <วันที่ implement จริง> — P2 Shared Result schema/rules

- ใช้ Firestore schema `sharedResults/{id}` แบบ self-contained snapshot ตาม spec 2026-08-24-shared-result-schema-rules-design.md
- เขียนและทดสอบ Firestore Security Rules แบบ create/read only ผ่าน Firestore Emulator (`pnpm run verify:shared-result`)
- เพิ่ม `publishSharedResult` write helper พร้อม id-collision retry ให้ item 3 (publish flow UI) เรียกใช้ต่อได้ทันที
```

- [ ] **Step 4: Commit**

```bash
git add docs/plans/DEVELOPMENT_PLAN.md docs/plans/_plan_log.md
git commit -m "docs: close P2 schema/rules backlog items"
```
