# Cookie Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cookie/localStorage consent banner and preferences dialog to teyvat-personality, with a `hasAnalyticsConsent()` interface ready for a future analytics integration, without gating any of the app's existing localStorage usage.

**Architecture:** A pure state module (`src/lib/consent.ts`) reads/writes a single localStorage key. A dumb `CookieConsentBanner` and a `CookiePreferencesDialog` (reusing the existing `useDialogAccessibility` hook pattern) are wired into `App.tsx`, which owns the "has the user decided yet" boolean and is the only place that calls the module's write function — both components only report the user's choice upward.

**Tech Stack:** React, TypeScript, existing `useDialogAccessibility` hook, lucide-react icons, the project's own bilingual `t(locale, key)` i18n helper. No new dependencies.

**Spec:** [docs/superpowers/specs/2026-08-25-cookie-consent-design.md](../specs/2026-08-25-cookie-consent-design.md)

## Global Constraints

- All file changes stay inside `teyvat-personality/` — never touch `genshin-db/` or `paimon-moe/` (CLAUDE.md).
- Storage key: `teyvat-cookie-consent-v1`. Shape: `{ version: 1; analytics: boolean; decidedAt: string }`.
- `getConsent()`/`hasDecided()`/`hasAnalyticsConsent()` must fail safe on any error (corrupt JSON, unavailable storage, unknown `version`) to "not decided" / `analytics: false` — never assume consent was granted when it can't be verified.
- Closing `CookiePreferencesDialog` any way other than its Save button (X, backdrop click, Esc) must NOT write any consent value — only Save calls the write path.
- No test runner exists in this repo for UI (no vitest/jest). Pure logic in `src/lib/consent.ts` gets a standalone node verification script (matching `scripts/verify-engine.mjs` / `scripts/verify-shared-result.mjs` conventions — Vite's `ssrLoadModule`, no manual `process.exit`, `try/finally` cleanup). UI wiring is verified by manual browser QA (start the dev server, drive it with the claude-in-chrome tools, inspect `localStorage` via the page's JS console).
- Out of scope, do not implement here: any real analytics SDK integration, a full cookie-policy page, moving existing localStorage keys (`teyvat-quiz-progress-v3`, `teyvat-quiz-result-v1`, `teyvat-theme`, `teyvat-locale`, `teyvat-share-throttle-v1`) behind a consent gate, any Marketing/Ads category.
- Commits are real (`git commit`), never `git push`, per this repo's current session convention.

---

## File Structure

- `src/lib/consent.ts` (create) — `getConsent()`, `hasDecided()`, `hasAnalyticsConsent()`, `setConsent(analytics)`. Pure state module, no React.
- `scripts/verify-consent.mjs` (create) — standalone verification script for the above.
- `src/components/consent/CookieConsentBanner.tsx` (create) — dumb presentational banner, no consent-lib import.
- `src/components/consent/CookiePreferencesDialog.tsx` (create) — modal with two toggle rows; reads `getConsent()` only to initialize its own toggle display.
- `src/components/consent/index.ts` (create) — barrel, matching `components/share/index.ts` / `components/common/index.tsx` convention.
- `src/App.tsx` (modify) — owns `cookieDialogOpen` and `cookieConsentDecided` state; renders the banner/dialog; is the only caller of `setConsent`; passes `onOpenCookieSettings` to `AppFooter`.
- `src/components/common/index.tsx` (modify) — `AppFooter` gains an `onOpenCookieSettings` prop and a persistent "cookie settings" link.
- `src/locales/th.ts`, `src/locales/en.ts` (modify) — new copy keys.
- `src/styles/index.css` (modify) — banner, dialog rows, and toggle-switch styles.

---

### Task 1: `consent.ts` state module + verification script

**Files:**
- Create: `src/lib/consent.ts`
- Create: `scripts/verify-consent.mjs`
- Modify: `package.json` (add `verify:consent` script)

**Interfaces:**
- Produces: `getConsent(): { version: 1; analytics: boolean; decidedAt: string } | null`, `hasDecided(): boolean`, `hasAnalyticsConsent(): boolean`, `setConsent(analytics: boolean): void` — consumed by Task 2's components (read) and Task 3's `App.tsx` (read + the only write caller).

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-consent.mjs`:

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

class FakeStorage {
  #store = new Map();
  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null;
  }
  setItem(key, value) {
    this.#store.set(key, String(value));
  }
  removeItem(key) {
    this.#store.delete(key);
  }
}

globalThis.localStorage = new FakeStorage();

try {
  const consent = await server.ssrLoadModule("/src/lib/consent.ts");

  assert(consent.hasDecided() === false, "hasDecided must be false with empty storage");
  assert(consent.hasAnalyticsConsent() === false, "hasAnalyticsConsent must default to false");
  assert(consent.getConsent() === null, "getConsent must be null with empty storage");

  consent.setConsent(true);
  assert(consent.hasDecided() === true, "hasDecided must be true after setConsent");
  assert(consent.hasAnalyticsConsent() === true, "hasAnalyticsConsent must reflect true after setConsent(true)");
  const stored = consent.getConsent();
  assert(
    stored !== null && stored.version === 1 && stored.analytics === true && typeof stored.decidedAt === "string",
    "getConsent must return the stored shape",
  );

  consent.setConsent(false);
  assert(consent.hasAnalyticsConsent() === false, "hasAnalyticsConsent must reflect false after setConsent(false)");

  localStorage.setItem("teyvat-cookie-consent-v1", "{not valid json");
  assert(consent.getConsent() === null, "getConsent must fail safe to null on corrupt JSON");
  assert(consent.hasAnalyticsConsent() === false, "hasAnalyticsConsent must fail safe to false on corrupt JSON");

  localStorage.setItem("teyvat-cookie-consent-v1", JSON.stringify({ version: 2, analytics: true, decidedAt: "x" }));
  assert(consent.getConsent() === null, "getConsent must reject an unknown schema version");
  assert(consent.hasDecided() === false, "hasDecided must be false for an unknown schema version");

  console.log("Cookie consent verification passed.");
} finally {
  await server.close();
}
```

- [ ] **Step 2: Run it and confirm it fails for the right reason**

Run: `node scripts/verify-consent.mjs`
Expected: FAIL — `src/lib/consent.ts` does not exist yet, so `ssrLoadModule` throws.

- [ ] **Step 3: Implement the state module**

Create `src/lib/consent.ts`:

```ts
const STORAGE_KEY = "teyvat-cookie-consent-v1";

interface CookieConsent {
  version: 1;
  analytics: boolean;
  decidedAt: string;
}

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      (value as { version?: unknown }).version !== 1 ||
      typeof (value as { analytics?: unknown }).analytics !== "boolean" ||
      typeof (value as { decidedAt?: unknown }).decidedAt !== "string"
    ) {
      return null;
    }
    return value as CookieConsent;
  } catch {
    return null;
  }
}

export function hasDecided(): boolean {
  return getConsent() !== null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics ?? false;
}

export function setConsent(analytics: boolean) {
  try {
    const value: CookieConsent = { version: 1, analytics, decidedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently, hasDecided() stays false.
  }
}
```

- [ ] **Step 4: Run it again and confirm it passes**

Run: `node scripts/verify-consent.mjs`
Expected: prints `Cookie consent verification passed.`, exit code 0.

- [ ] **Step 5: Wire the npm script**

Add to `package.json`'s `"scripts"`:

```json
"verify:consent": "node scripts/verify-consent.mjs",
```

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc -b`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/specs/2026-08-25-cookie-consent-design.md docs/superpowers/plans/2026-08-25-cookie-consent.md src/lib/consent.ts scripts/verify-consent.mjs package.json
git commit -m "feat: add cookie consent state module with fail-safe defaults"
```

---

### Task 2: Consent UI components (banner + preferences dialog) and locale copy

**Files:**
- Modify: `src/locales/th.ts`
- Modify: `src/locales/en.ts`
- Create: `src/components/consent/CookieConsentBanner.tsx`
- Create: `src/components/consent/CookiePreferencesDialog.tsx`
- Create: `src/components/consent/index.ts`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: `getConsent` from `src/lib/consent.ts` (Task 1) — read-only, inside `CookiePreferencesDialog` only.
- Produces: `CookieConsentBanner({ locale, onAcceptAll, onNecessaryOnly, onOpenSettings })`, `CookiePreferencesDialog({ locale, open, onClose, onSave })` where `onSave: (analytics: boolean) => void` — consumed by Task 3's `App.tsx`, which is the only place that turns these callbacks into a real `setConsent()` call.

- [ ] **Step 1: Add locale keys**

In `src/locales/th.ts`, insert immediately before the `notFoundBody: "เส้นทางนี้อยู่นอกแผนที่ Teyvat",` line:

```ts
  cookieBannerBody:
    "เว็บนี้ใช้ที่เก็บข้อมูลในเบราว์เซอร์เพื่อจำผลลัพธ์และการตั้งค่าของคุณ และอาจใช้ Analytics ในอนาคตเพื่อทำความเข้าใจการใช้งาน",
  cookieAcceptAll: "ยอมรับทั้งหมด",
  cookieNecessaryOnly: "เฉพาะที่จำเป็น",
  cookieCustomize: "ตั้งค่า",
  cookieDialogTitle: "การตั้งค่าคุกกี้",
  cookieDialogBody: "เลือกได้ว่าจะอนุญาตให้เว็บนี้ใช้ที่เก็บข้อมูลหมวดใดบ้าง",
  cookieNecessaryLabel: "จำเป็น",
  cookieNecessaryDesc: "ใช้เก็บผลแบบทดสอบ ธีม และภาษาที่เลือก จำเป็นต่อการทำงานของเว็บ ปิดไม่ได้",
  cookieAnalyticsLabel: "Analytics",
  cookieAnalyticsDesc: "ช่วยให้เข้าใจการใช้งานเว็บ ยังไม่ได้เปิดใช้งานจริงในตอนนี้",
  cookieSave: "บันทึก",
  cookieSettingsLink: "ตั้งค่าคุกกี้",
```

In `src/locales/en.ts`, insert immediately before the `notFoundBody: "This path has wandered beyond Teyvat.",` line:

```ts
  cookieBannerBody:
    "This site uses browser storage to remember your result and preferences, and may use Analytics in the future to understand usage.",
  cookieAcceptAll: "Accept all",
  cookieNecessaryOnly: "Necessary only",
  cookieCustomize: "Customize",
  cookieDialogTitle: "Cookie settings",
  cookieDialogBody: "Choose which categories of storage this site is allowed to use.",
  cookieNecessaryLabel: "Necessary",
  cookieNecessaryDesc: "Stores your quiz result, theme, and language. Required for the site to work, cannot be turned off.",
  cookieAnalyticsLabel: "Analytics",
  cookieAnalyticsDesc: "Helps understand site usage. Not actually active yet.",
  cookieSave: "Save",
  cookieSettingsLink: "Cookie settings",
```

- [ ] **Step 2: Create the banner component**

Create `src/components/consent/CookieConsentBanner.tsx`:

```tsx
import { Cookie } from "lucide-react";

import { Button } from "../common";
import { t } from "../../i18n";
import type { Locale } from "../../types";

export function CookieConsentBanner({
  locale,
  onAcceptAll,
  onNecessaryOnly,
  onOpenSettings,
}: {
  locale: Locale;
  onAcceptAll: () => void;
  onNecessaryOnly: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="cookie-banner" role="region" aria-label={t(locale, "cookieDialogTitle")}>
      <Cookie size={20} aria-hidden="true" />
      <p>{t(locale, "cookieBannerBody")}</p>
      <div className="cookie-banner__actions">
        <Button onClick={onAcceptAll}>{t(locale, "cookieAcceptAll")}</Button>
        <Button variant="secondary" onClick={onNecessaryOnly}>
          {t(locale, "cookieNecessaryOnly")}
        </Button>
        <Button variant="ghost" onClick={onOpenSettings}>
          {t(locale, "cookieCustomize")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the preferences dialog component**

Create `src/components/consent/CookiePreferencesDialog.tsx`:

```tsx
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "../common";
import { useDialogAccessibility } from "../../hooks";
import { t } from "../../i18n";
import { getConsent } from "../../lib/consent";
import type { Locale } from "../../types";

export function CookiePreferencesDialog({
  locale,
  open,
  onClose,
  onSave,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSave: (analytics: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(dialogRef, onClose, open);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (open) setAnalyticsEnabled(getConsent()?.analytics ?? false);
  }, [open]);

  if (!open) return null;

  const save = () => {
    onSave(analyticsEnabled);
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="dialog cookie-preferences-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-body"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog__close" type="button" onClick={onClose} aria-label={t(locale, "close")}>
          <X size={18} aria-hidden="true" />
        </button>
        <h2 id="cookie-dialog-title">{t(locale, "cookieDialogTitle")}</h2>
        <p id="cookie-dialog-body">{t(locale, "cookieDialogBody")}</p>
        <div className="cookie-preferences__row">
          <div>
            <strong>{t(locale, "cookieNecessaryLabel")}</strong>
            <p>{t(locale, "cookieNecessaryDesc")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="true"
            disabled
            className="cookie-toggle cookie-toggle--on"
            aria-label={t(locale, "cookieNecessaryLabel")}
          >
            <span className="cookie-toggle__thumb" />
          </button>
        </div>
        <div className="cookie-preferences__row">
          <div>
            <strong>{t(locale, "cookieAnalyticsLabel")}</strong>
            <p>{t(locale, "cookieAnalyticsDesc")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={analyticsEnabled}
            className={`cookie-toggle ${analyticsEnabled ? "cookie-toggle--on" : ""}`}
            aria-label={t(locale, "cookieAnalyticsLabel")}
            onClick={() => setAnalyticsEnabled((value) => !value)}
          >
            <span className="cookie-toggle__thumb" />
          </button>
        </div>
        <Button onClick={save}>{t(locale, "cookieSave")}</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the barrel export**

Create `src/components/consent/index.ts`:

```ts
export { CookieConsentBanner } from "./CookieConsentBanner";
export { CookiePreferencesDialog } from "./CookiePreferencesDialog";
```

- [ ] **Step 5: Add styles**

Append to `src/styles/index.css`:

```css
.cookie-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 16px min(5%, 32px);
  background: var(--surface);
  border-top: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.cookie-banner p {
  flex: 1 1 260px;
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.cookie-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cookie-preferences-dialog {
  max-width: 460px;
}
.cookie-preferences__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
}
.cookie-preferences__row p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.cookie-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  border: 0;
  border-radius: 99px;
  background: var(--line);
  cursor: pointer;
  transition: background 0.18s;
}
.cookie-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.cookie-toggle--on {
  background: var(--dendro);
}
.cookie-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s;
}
.cookie-toggle--on .cookie-toggle__thumb {
  transform: translateX(20px);
}
```

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm exec tsc -b && pnpm run lint`
Expected: no errors. (These two new components aren't imported anywhere yet, so this only proves they compile in isolation — Task 3 wires them in.)

- [ ] **Step 7: Commit**

```bash
git add src/locales/th.ts src/locales/en.ts src/components/consent/CookieConsentBanner.tsx src/components/consent/CookiePreferencesDialog.tsx src/components/consent/index.ts src/styles/index.css
git commit -m "feat: add cookie consent banner and preferences dialog components"
```

---

### Task 3: Wire into `App.tsx` and `AppFooter`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/common/index.tsx`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: `hasDecided`, `setConsent` from `src/lib/consent.ts` (Task 1); `CookieConsentBanner`, `CookiePreferencesDialog` from `src/components/consent` (Task 2).
- Produces: `AppFooter({ locale, onOpenCookieSettings }: { locale: Locale; onOpenCookieSettings: () => void })` — this changes `AppFooter`'s existing signature (it previously took only `{ locale }`), consumed by `App.tsx`.

- [ ] **Step 1: Update `AppFooter`**

In `src/components/common/index.tsx`, replace:

```tsx
export function AppFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="app-footer">
      <PageContainer>
        <p>{t(locale, "disclaimer")} · By Lesser Lord Kusanali © 2026</p>
      </PageContainer>
    </footer>
  );
}
```

with:

```tsx
export function AppFooter({
  locale,
  onOpenCookieSettings,
}: {
  locale: Locale;
  onOpenCookieSettings: () => void;
}) {
  return (
    <footer className="app-footer">
      <PageContainer>
        <p>{t(locale, "disclaimer")} · By Lesser Lord Kusanali © 2026</p>
        <button type="button" className="text-button" onClick={onOpenCookieSettings}>
          {t(locale, "cookieSettingsLink")}
        </button>
      </PageContainer>
    </footer>
  );
}
```

- [ ] **Step 2: Add footer link spacing**

Append to `src/styles/index.css`:

```css
.app-footer .text-button {
  margin-top: 6px;
  font-size: 12px;
}
```

- [ ] **Step 3: Wire state and rendering into `App.tsx`**

In `src/App.tsx`, update the imports at the top:

```tsx
import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { AppFooter, AppHeader, RouteFocus } from "./components/common";
import { CookieConsentBanner, CookiePreferencesDialog } from "./components/consent";
import { t } from "./i18n";
import { hasDecided, setConsent } from "./lib/consent";
import { CharacterPage, CharactersPage, LandingPage, MatchingPage, NotFoundPage, QuizPage, ResultPage } from "./pages";
import type { Locale, Theme } from "./types";
```

Inside the `App()` function, add these two lines alongside the existing `locale`/`theme` state (right after `const hasExplicitTheme = useRef(readStoredTheme() !== null);`):

```tsx
const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
const [cookieConsentDecided, setCookieConsentDecided] = useState(() => hasDecided());
```

In the returned JSX, immediately before the closing `<AppFooter locale={locale} />` line, replace that line with:

```tsx
{!cookieConsentDecided && (
  <CookieConsentBanner
    locale={locale}
    onAcceptAll={() => {
      setConsent(true);
      setCookieConsentDecided(true);
    }}
    onNecessaryOnly={() => {
      setConsent(false);
      setCookieConsentDecided(true);
    }}
    onOpenSettings={() => setCookieDialogOpen(true)}
  />
)}
<CookiePreferencesDialog
  locale={locale}
  open={cookieDialogOpen}
  onClose={() => setCookieDialogOpen(false)}
  onSave={(analytics) => {
    setConsent(analytics);
    setCookieConsentDecided(true);
  }}
/>
<AppFooter locale={locale} onOpenCookieSettings={() => setCookieDialogOpen(true)} />
```

- [ ] **Step 4: Typecheck, lint, build**

Run: `pnpm exec tsc -b && pnpm run lint && pnpm run build`
Expected: no errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/common/index.tsx src/styles/index.css
git commit -m "feat: wire cookie consent banner and settings dialog into the app shell"
```

---

### Task 4: Manual browser QA and final verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the full existing verification suite plus the new one**

Run: `pnpm install && pnpm run lint && pnpm exec tsc -b && pnpm run build && pnpm run verify:consent`
Expected: all pass.

- [ ] **Step 2: Start the dev server**

Run (background): `pnpm run dev`
Note the printed local URL (e.g. `http://localhost:5173/`).

- [ ] **Step 3: First-visit banner**

Using the claude-in-chrome browser tools: open a fresh tab, run `localStorage.clear()` via the JS console tool, then navigate to the app's root URL. Screenshot. Expected: the cookie banner is visible at the bottom of the page with three buttons (Accept all / Necessary only / Customize, in whichever locale is active).

- [ ] **Step 4: Accept all persists and gates open**

Click "Accept all" (or its Thai label). Screenshot — banner should disappear. Run in the JS console: check that reloading the page does not bring the banner back, and that the app's own `localStorage.getItem("teyvat-cookie-consent-v1")` (read via the JS console tool) parses to `{"version":1,"analytics":true,"decidedAt":"..."}`.

- [ ] **Step 5: Necessary-only path**

Run `localStorage.clear()` again, reload, click "Necessary only". Confirm via the JS console that `localStorage.getItem("teyvat-cookie-consent-v1")` now parses with `"analytics":false`.

- [ ] **Step 6: Settings dialog reflects and updates state, from both entry points**

With a decision already made (analytics false from Step 5), click the footer's "Cookie settings" link. Screenshot — dialog should open with the Analytics toggle in the off position and the Necessary toggle shown on but not clickable (attempt clicking it via the browser tool and confirm the stored value is unaffected). Toggle Analytics on, click Save. Screenshot — dialog closes. Confirm via the JS console that `localStorage.getItem("teyvat-cookie-consent-v1")` now has `"analytics":true`. Reopen the dialog (via the footer link again) and confirm the Analytics toggle now shows on, reflecting the saved value.

- [ ] **Step 7: Closing without Save is a no-op**

With the dialog open, change the Analytics toggle to a different value than what's currently stored, then close the dialog via the X button (not Save). Confirm via the JS console that `localStorage.getItem("teyvat-cookie-consent-v1")` is unchanged from before this step.

- [ ] **Step 8: Banner reappears only when undecided, and disappears via the dialog path too**

Run `localStorage.clear()` and reload — confirm the banner reappears. This time, instead of clicking a banner button, click "Customize" to open the dialog directly, then click Save. Screenshot — confirm the banner is gone after the dialog closes (this proves the lifted `cookieConsentDecided` state in `App.tsx` correctly reacts to a decision made via the dialog, not just via the banner's own buttons).

- [ ] **Step 9: Report and clean up**

Note any visual or console issues found. Close the browser tab(s) opened for this QA. Stop the dev server.

- [ ] **Step 10: Commit only if Steps 1-8 required any fixes**

If everything passed with no code changes needed, there is nothing to commit for this task. If QA uncovered a bug you fixed, commit it:

```bash
git add -A
git commit -m "fix: <describe the QA fix>"
```
