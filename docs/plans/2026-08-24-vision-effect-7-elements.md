# Vision Effect 7-Element Expansion Implementation Plan

> **Status (27 August 2026): Complete.** The implementation, automated verification, and manual QA have passed; the completion record is in [_plan_log.md](_plan_log.md). This file remains as the detailed implementation record.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Landing Page "Vision Effect" particle background from 3 elements (Pyro, Cryo, Dendro) to all 7 Genshin elements, replace the always-visible multi-button switcher with a single trigger + portal popover, and fix the root cause of the floating control being covered by cards on mobile.

**Architecture:** Add 4 new pure-canvas particle modules following the exact `create*Particles` / `draw*Effect` shape already used by `CryoEffect.tsx`/`PyroEffect.tsx`/`DendroEffect.tsx`. Introduce one central config module (`visionEffects.config.ts`) holding the `VisionElement` union, default, ordered list, labels, and per-element particle counts, so no file has to re-declare that list. Rewrite `VisionEffectSwitcher.tsx` into a trigger button + `createPortal`-rendered popover (no new dependency — `react-dom`'s `createPortal` is already installed), reusing the existing `useDialogAccessibility` hook (Escape + Tab-trap + focus restore) and the existing `ElementIcon` component (real PNG assets already exist for all 7 elements). Fix mobile stacking by giving the trigger/panel z-indexes clearly above the landing page's `z-index: 20` content layer instead of the current tie, and raise `.dialog-backdrop` above both so modals still outrank the floating control.

**Tech Stack:** React 19 + TypeScript (strict) + Vite + plain Canvas 2D (no animation/UI library). No test runner exists in this repo (`AGENTS.md`: "Unit tests are deferred; do not add a test framework unless the user explicitly asks for it") — verification gates are `tsc -b`, `eslint .`, and `vite build`, matching how the rest of the codebase is verified.

**Spec:** user-provided spec in conversation, 2026-08-24 ("ตรวจสอบระบบ Vision Effect เดิม... ขยายให้ครบทั้ง 7 ธาตุ")

## Global Constraints

- AI may only create/edit files inside `teyvat-personality/` (root `CLAUDE.md`/`AGENTS.md`).
- Do not modify the Matching Engine or Quiz logic.
- Do not add a new dependency if an existing one already covers the need (`react-dom`'s `createPortal` replaces the need for Radix/shadcn Popover — neither is installed).
- Do not add a test framework — none exists; verify via `tsc -b`, `eslint .`, `vite build` (`AGENTS.md`).
- Effect and its trigger render only on the Landing Page — never Quiz or Result.
- `prefers-reduced-motion: reduce` must hide the particle canvas but must NOT disable the element picker.
- Popover must render through a portal to `document.body`, must not be clipped by any `overflow: hidden` ancestor, must not overflow the viewport, and must flip upward on mobile when there isn't room below.
- All interactive targets (trigger + each option) must be at least 44px tall.
- No effect or popover may cause horizontal page scroll.
- Keep the existing localStorage key (`teyvat-vision-effect`) and existing default element (`cryo`) — invalid/stale stored values must fall back to that default.

---

## Investigation Summary (read this before starting)

- **Current effect components:** `src/components/effects/VisionEffectOverlay.tsx` (canvas render loop + `VisionEffect` type, currently `"cryo" | "dendro" | "pyro"`), `CryoEffect.tsx`, `PyroEffect.tsx`, `DendroEffect.tsx` (each exports `create<X>Particles(count, width, height)` and `draw<X>Effect(context, particles, delta, elapsed, width, height)` — pure functions, plain Canvas 2D, no library).
- **Picker component:** `src/components/effects/VisionEffectSwitcher.tsx` — currently renders all 3 option buttons simultaneously in a `role="radiogroup"`, with a roving-tabindex arrow-key handler. This whole component is being replaced by a trigger + popover.
- **State & persistence:** owned entirely by `src/pages/LandingPage.tsx`. `readVisionEffect()` reads `localStorage["teyvat-vision-effect"]`, validates against `"dendro" | "pyro"` (else falls back to `"cryo"`), and a `useEffect` writes the current value back on every change. This is the only place the effect is mounted (`<VisionEffectOverlay />` + `<VisionEffectSwitcher />>` at lines 108-109) — confirms the effect never appears on Quiz/Result pages already.
- **Element icons already exist for all 7 elements**: `src/assets/images/elements/{pyro,hydro,anemo,electro,geo,dendro,cryo}.png`, wired through the existing `ElementIcon` component (`src/components/common/index.tsx:126-155`), which already has a graceful `Sparkles` fallback + `onError` handling. This must be reused directly instead of adding lucide-react fallback icons — the spec's own fallback rule ("ใช้ Asset ของระบบเดิมก่อน") is already satisfied by this component.
- **Element accent colors already exist for all 7 elements** as CSS custom properties (`--element-light/pale/primary/deep`) in a shared multi-selector block in `src/styles/index.css` (~line 1301-1363), keyed by a `--{element}` class suffix and currently consumed by `.vision-card--X`, `.share-card--X`, `.character-profile--X`, `.directory-card__portrait--X`. This is the project's existing "central color config" — the new picker will hook into it by adding its own class suffixes to those same selector groups, NOT by inventing a second, duplicate JS color map (that would be exactly the drift the spec warns against).
- **No Radix/shadcn/Popover/Portal anywhere in the repo or `package.json`.** `react-dom` is already a dependency, so `createPortal` is available with zero new dependencies.
- **Root cause of the mobile "card covers the button" bug:** it is NOT `overflow: hidden` clipping — `.landing-page` has `overflow: hidden` + `isolation: isolate` but no `transform`/`filter`, so it does not become a containing block for `position: fixed` descendants, and fixed elements are never clipped by an ancestor's `overflow` under that condition. The real bug is a **z-index tie broken by DOM order**: `src/styles/index.css`'s rule `.landing-page > :not(.vision-effect-overlay):not(.vision-effect-switcher):not(.dialog-backdrop) { z-index: 20 }` gives the hero/`feature-grid` `PageContainer`s the exact same `z-index: 20` that `.vision-effect-switcher` itself declares. In `LandingPage.tsx`, `<VisionEffectSwitcher />` is mounted BEFORE the hero/feature-grid JSX (lines 108-109 vs. 110+). With equal z-index, later DOM siblings paint on top — so on mobile, where `.feature-grid` collapses to a full-width single column of tall cards, that content visually paints over the fixed bottom-right switcher wherever the boxes overlap on screen. Fix: give the new trigger/panel a z-index clearly above that `20` tier (not just re-declare 20), and this stacking bug disappears without touching `.landing-page`'s `overflow`/`isolation` at all.
- **`useDialogAccessibility(ref, onClose, enabled)`** (`src/hooks/useDialogAccessibility.ts`) already implements Escape-to-close, Tab focus-trap, initial-focus, and focus-restore-on-close — used today by every existing dialog (name-dialog, reset-dialog, share-dialog, character-preview-dialog). The popover reuses this hook as-is rather than hand-rolling a second implementation.
- **No unit test framework** (`AGENTS.md` explicitly defers this) — verification is `tsc -b`, `eslint .`, `vite build`, plus a manual QA checklist (canvas visuals can't be asserted by a script anyway).

---

### Task 1: Electro particle effect

**Files:**
- Create: `src/components/effects/ElectroEffect.tsx`

**Interfaces:**
- Produces: `ElectroParticle` interface, `createElectroParticles(count: number, width: number, height: number): ElectroParticle[]`, `drawElectroEffect(context: CanvasRenderingContext2D, particles: ElectroParticle[], delta: number, elapsed: number, width: number, height: number): void` — same call shape as `CryoEffect.tsx`.

- [ ] **Step 1: Create the file**

```tsx
export interface ElectroParticle {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  opacity: number;
  sparkAt: number;
  sparkUntil: number;
  color: string;
}

const colors = ["#B184D2", "#8B5FBF", "#D6B8EA"];

export function createElectroParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2 + Math.random() * 2,
    driftX: 6 + Math.random() * 10,
    driftY: 6 + Math.random() * 10,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speedX: 0.6 + Math.random() * 0.8,
    speedY: 0.5 + Math.random() * 0.7,
    opacity: 0.45 + Math.random() * 0.2,
    sparkAt: 3 + Math.random() * 4,
    sparkUntil: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawElectroEffect(
  context: CanvasRenderingContext2D,
  particles: ElectroParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.x +=
      Math.sin(elapsed * particle.speedX + particle.phaseX) *
      particle.driftX *
      delta;
    particle.y +=
      Math.cos(elapsed * particle.speedY + particle.phaseY) *
      particle.driftY *
      delta;
    if (particle.x < -particle.size) particle.x = width + particle.size;
    if (particle.x > width + particle.size) particle.x = -particle.size;
    if (particle.y < -particle.size) particle.y = height + particle.size;
    if (particle.y > height + particle.size) particle.y = -particle.size;

    const isSparking = elapsed < particle.sparkUntil;
    if (!isSparking && elapsed >= particle.sparkAt) {
      particle.sparkUntil = elapsed + 0.16;
      particle.sparkAt = elapsed + 3 + Math.random() * 4;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.strokeStyle = particle.color;
    context.fillStyle = particle.color;
    context.globalAlpha = particle.opacity;
    context.shadowColor = particle.color;
    context.shadowBlur = 5;

    if (isSparking) {
      const reach = particle.size * 3.5;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(-reach, -reach * 0.4);
      context.lineTo(-reach * 0.2, reach * 0.2);
      context.lineTo(0, -reach * 0.15);
      context.lineTo(reach * 0.3, reach * 0.35);
      context.lineTo(reach, -reach * 0.3);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(0, 0, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}
```

Design notes tying back to the spec: short erratic movement comes from summed sine/cosine wander on both axes (not a straight line); the "spark" zigzag is per-particle timed with a randomized 3-7s gap and only lasts 0.16s, and every particle's first `sparkAt` is independently randomized, so sparks are staggered — never a synchronized full-screen flash. Opacity is capped at 0.65 and color stays purple/violet (no white flash).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/ElectroEffect.tsx
git commit -m "feat: add electro particle effect"
```

---

### Task 2: Hydro particle effect

**Files:**
- Create: `src/components/effects/HydroEffect.tsx`

**Interfaces:**
- Produces: `HydroParticle`, `createHydroParticles(count, width, height)`, `drawHydroEffect(context, particles, delta, elapsed, width, height)`.

- [ ] **Step 1: Create the file**

```tsx
export interface HydroParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  opacity: number;
  color: string;
}

const colors = ["#7FC7E8", "#A8DDF0", "#4FA8CC"];

export function createHydroParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 3 + Math.random() * 5,
    speed: 10 + Math.random() * 14,
    sway: 5 + Math.random() * 9,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.4 + Math.random() * 0.22,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawHydroEffect(
  context: CanvasRenderingContext2D,
  particles: HydroParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.y -= particle.speed * delta;
    particle.x +=
      Math.sin(elapsed * 0.9 + particle.phase) * particle.sway * delta;
    if (particle.y < -particle.size) {
      particle.y = height + particle.size;
      particle.x = Math.random() * width;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.strokeStyle = particle.color;
    context.fillStyle = particle.color;
    context.lineWidth = 1;
    context.shadowColor = particle.color;
    context.shadowBlur = 4;
    context.beginPath();
    context.arc(0, 0, particle.size, 0, Math.PI * 2);
    context.globalAlpha = particle.opacity * 0.35;
    context.fill();
    context.globalAlpha = particle.opacity;
    context.stroke();
    context.restore();
  }
}
```

Design notes: translucent fill + a stroked ring reads as a bubble/droplet; floats upward slowly (`speed` is deliberately lower than Pyro's) with a gentle sideways sway, wraps at the top edge.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/HydroEffect.tsx
git commit -m "feat: add hydro particle effect"
```

---

### Task 3: Anemo particle effect

**Files:**
- Create: `src/components/effects/AnemoEffect.tsx`

**Interfaces:**
- Produces: `AnemoParticle`, `createAnemoParticles(count, width, height)`, `drawAnemoEffect(context, particles, delta, elapsed, width, height)`.

- [ ] **Step 1: Create the file**

```tsx
export interface AnemoParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  amplitude: number;
  phase: number;
  rotation: number;
  opacity: number;
  color: string;
}

const colors = ["#8FD6C4", "#B3E6D8", "#5FB6A0"];

export function createAnemoParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 5 + Math.random() * 5,
    speed: 18 + Math.random() * 22,
    amplitude: 14 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    opacity: 0.4 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawAnemoEffect(
  context: CanvasRenderingContext2D,
  particles: AnemoParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.x += particle.speed * delta;
    particle.y +=
      Math.sin(elapsed * 1.1 + particle.phase) *
      particle.amplitude *
      delta *
      0.5;
    particle.rotation += delta * 0.6;
    if (particle.x > width + particle.size) {
      particle.x = -particle.size;
      particle.y = Math.random() * height;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = particle.opacity;
    context.strokeStyle = particle.color;
    context.lineWidth = 1.4;
    context.shadowColor = particle.color;
    context.shadowBlur = 3;
    context.beginPath();
    context.moveTo(-particle.size, 0);
    context.quadraticCurveTo(0, -particle.size * 0.7, particle.size, 0);
    context.stroke();
    context.restore();
  }
}
```

Design notes: drawn as a thin curved stroke (quadratic curve), not an ellipse — deliberately distinct from Dendro's leaf shape per the spec ("อย่าใช้ใบไม้เหมือน Dendro มากเกินไป"). Motion is primarily horizontal (side-to-side entry) with a soft vertical sine wave for the curved path, low opacity/thin stroke for a light feel.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/AnemoEffect.tsx
git commit -m "feat: add anemo particle effect"
```

---

### Task 4: Geo particle effect

**Files:**
- Create: `src/components/effects/GeoEffect.tsx`

**Interfaces:**
- Produces: `GeoParticle`, `createGeoParticles(count, width, height)`, `drawGeoEffect(context, particles, delta, elapsed, width, height)`.

- [ ] **Step 1: Create the file**

```tsx
export interface GeoParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

const colors = ["#D4AF5A", "#E8CB86", "#B08830"];

export function createGeoParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2.5 + Math.random() * 3,
    speed: 8 + Math.random() * 12,
    sway: 4 + Math.random() * 8,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.5 + Math.random() * 1,
    opacity: 0.35 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawGeoEffect(
  context: CanvasRenderingContext2D,
  particles: GeoParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.y += particle.speed * delta;
    particle.x +=
      Math.sin(elapsed * 0.8 + particle.phase) * particle.sway * delta;
    particle.rotation += particle.rotationSpeed * delta;
    if (particle.y > height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * width;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    context.globalAlpha = particle.opacity;
    context.shadowColor = particle.color;
    context.shadowBlur = 2;
    context.beginPath();
    context.moveTo(0, -particle.size);
    context.lineTo(particle.size, 0);
    context.lineTo(0, particle.size);
    context.lineTo(-particle.size, 0);
    context.closePath();
    context.fill();
    context.restore();
  }
}
```

Design notes: small rotated-diamond path, size capped at 5.5px and opacity capped at 0.55 so it never reads as a big/opaque shape over text; slow fall with a light sway and slow rotation.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/GeoEffect.tsx
git commit -m "feat: add geo particle effect"
```

---

### Task 5: Central Vision Effect config

**Files:**
- Create: `src/components/effects/visionEffects.config.ts`

**Interfaces:**
- Consumes: nothing (pure data/types).
- Produces: `VisionElement` type, `VISION_EFFECT_DEFAULT`, `VISION_ELEMENTS` (ordered readonly array), `visionElementLabels`, `visionParticleCounts`, `isVisionElement(value): value is VisionElement`. Tasks 6, 7, 9 all import from this file.

- [ ] **Step 1: Create the file**

```ts
export type VisionElement =
  | "pyro"
  | "cryo"
  | "electro"
  | "hydro"
  | "anemo"
  | "geo"
  | "dendro";

export const VISION_EFFECT_DEFAULT: VisionElement = "cryo";

export const VISION_ELEMENTS: readonly VisionElement[] = [
  "pyro",
  "hydro",
  "anemo",
  "electro",
  "dendro",
  "geo",
  "cryo",
];

export const visionElementLabels: Record<VisionElement, string> = {
  pyro: "Pyro",
  hydro: "Hydro",
  anemo: "Anemo",
  electro: "Electro",
  dendro: "Dendro",
  geo: "Geo",
  cryo: "Cryo",
};

export const visionParticleCounts: Record<
  VisionElement,
  { desktop: number; mobile: number }
> = {
  cryo: { desktop: 52, mobile: 24 },
  dendro: { desktop: 46, mobile: 22 },
  pyro: { desktop: 48, mobile: 24 },
  electro: { desktop: 40, mobile: 20 },
  hydro: { desktop: 44, mobile: 22 },
  anemo: { desktop: 42, mobile: 20 },
  geo: { desktop: 40, mobile: 20 },
};

export function isVisionElement(
  value: string | null,
): value is VisionElement {
  return value !== null && (VISION_ELEMENTS as readonly string[]).includes(value);
}
```

Note on the deliberate deviation from the spec's literal example (`visionEffects = { pyro: { label, color, icon }, ... }`): the icon is not duplicated here because real PNG assets already exist for all 7 elements and are already wired through the existing `ElementIcon` component (see Task 7) — pointing a JS config field at `Flame`/`Snowflake`/etc. from `lucide-react` would silently regress to worse-looking fallback icons the project doesn't need. The accent color is likewise not duplicated here because the project's existing convention stores those as CSS custom properties keyed by an element class suffix (`--element-light/pale/primary/deep`, already defined for all 7 elements) — Task 8 hooks the new picker into that same block instead of creating a second, driftable source of the same 7 colors.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/visionEffects.config.ts
git commit -m "feat: add central vision effect config for all 7 elements"
```

---

### Task 6: Wire all 7 elements into the canvas overlay

**Files:**
- Modify: `src/components/effects/VisionEffectOverlay.tsx` (full rewrite of the file body — same structure, more branches)

**Interfaces:**
- Consumes: `createElectroParticles`/`drawElectroEffect` (Task 1), `createHydroParticles`/`drawHydroEffect` (Task 2), `createAnemoParticles`/`drawAnemoEffect` (Task 3), `createGeoParticles`/`drawGeoEffect` (Task 4), `VisionElement`/`visionParticleCounts` from `./visionEffects.config` (Task 5).
- Produces: `VisionElement` re-exported as a type (via the config import), `VisionEffectOverlay({ effect: VisionElement })` — same public API shape as before, callers unaffected except the type now allows 7 values instead of 3.

- [ ] **Step 1: Replace the whole file**

```tsx
import { useEffect, useRef, useState } from "react";

import { createAnemoParticles, drawAnemoEffect } from "./AnemoEffect";
import { createCryoParticles, drawCryoEffect } from "./CryoEffect";
import { createDendroParticles, drawDendroEffect } from "./DendroEffect";
import { createElectroParticles, drawElectroEffect } from "./ElectroEffect";
import { createGeoParticles, drawGeoEffect } from "./GeoEffect";
import { createHydroParticles, drawHydroEffect } from "./HydroEffect";
import { createPyroParticles, drawPyroEffect } from "./PyroEffect";
import {
  visionParticleCounts,
  type VisionElement,
} from "./visionEffects.config";

type Particles =
  | ReturnType<typeof createAnemoParticles>
  | ReturnType<typeof createCryoParticles>
  | ReturnType<typeof createDendroParticles>
  | ReturnType<typeof createElectroParticles>
  | ReturnType<typeof createGeoParticles>
  | ReturnType<typeof createHydroParticles>
  | ReturnType<typeof createPyroParticles>;

function createParticles(
  effect: VisionElement,
  count: number,
  width: number,
  height: number,
): Particles {
  switch (effect) {
    case "anemo":
      return createAnemoParticles(count, width, height);
    case "cryo":
      return createCryoParticles(count, width, height);
    case "dendro":
      return createDendroParticles(count, width, height);
    case "electro":
      return createElectroParticles(count, width, height);
    case "geo":
      return createGeoParticles(count, width, height);
    case "hydro":
      return createHydroParticles(count, width, height);
    case "pyro":
      return createPyroParticles(count, width, height);
  }
}

function drawParticles(
  effect: VisionElement,
  context: CanvasRenderingContext2D,
  particles: Particles,
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  switch (effect) {
    case "anemo":
      drawAnemoEffect(
        context,
        particles as ReturnType<typeof createAnemoParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "cryo":
      drawCryoEffect(
        context,
        particles as ReturnType<typeof createCryoParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "dendro":
      drawDendroEffect(
        context,
        particles as ReturnType<typeof createDendroParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "electro":
      drawElectroEffect(
        context,
        particles as ReturnType<typeof createElectroParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "geo":
      drawGeoEffect(
        context,
        particles as ReturnType<typeof createGeoParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "hydro":
      drawHydroEffect(
        context,
        particles as ReturnType<typeof createHydroParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
    case "pyro":
      drawPyroEffect(
        context,
        particles as ReturnType<typeof createPyroParticles>,
        delta,
        elapsed,
        width,
        height,
      );
      return;
  }
}

function VisionEffectCanvas({ effect }: { effect: VisionElement }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frameId = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let particles: Particles = [];

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);

      const count =
        window.innerWidth < 768
          ? visionParticleCounts[effect].mobile
          : visionParticleCounts[effect].desktop;
      particles = createParticles(effect, count, width, height);
    };

    const render = (time: number) => {
      frameId = 0;
      if (!isVisible || reducedMotion.matches) return;

      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      drawParticles(effect, context, particles, delta, elapsed, width, height);
      frameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      previousTime = performance.now();
      if (!isVisible && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      if (isVisible && !reducedMotion.matches && !frameId) {
        frameId = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [effect]);

  return (
    <canvas
      ref={canvasRef}
      className="vision-effect-overlay__canvas"
      aria-hidden="true"
    />
  );
}

export function VisionEffectOverlay({ effect }: { effect: VisionElement }) {
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (reduceMotion) return null;

  return (
    <div
      className={`vision-effect-overlay vision-effect-overlay--${effect}`}
      aria-hidden="true"
    >
      <VisionEffectCanvas key={effect} effect={effect} />
    </div>
  );
}
```

This preserves every existing behavior (resize handling, tab-visibility pause, `prefers-reduced-motion` gate that hides the canvas but keeps the rest of the page interactive) and only widens the element switch from 3 to 7 branches — the same if/else-by-effect pattern the file already used, now centralized to two small `switch` functions instead of a growing ternary chain.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors. (This step will still show errors from `VisionEffectSwitcher.tsx` and `LandingPage.tsx` referencing the old `VisionEffect` export — that's expected until Tasks 7 and 9 land; do not treat those as failures of this task.)

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/VisionEffectOverlay.tsx
git commit -m "feat: extend vision effect overlay to all 7 elements"
```

---

### Task 7: Rewrite the picker into a single trigger + portal popover

**Files:**
- Modify: `src/components/effects/VisionEffectSwitcher.tsx` (full rewrite)

**Interfaces:**
- Consumes: `VISION_ELEMENTS`, `visionElementLabels`, `VisionElement` from `./visionEffects.config` (Task 5); `ElementIcon` from `../common` (existing); `useDialogAccessibility` from `../../hooks` (existing); `ChevronDown` from `lucide-react` (existing dependency, not previously imported in this repo).
- Produces: `VisionEffectSwitcher({ effect: VisionElement, onChange: (effect: VisionElement) => void })` — same public prop shape as before.

- [ ] **Step 1: Replace the whole file**

```tsx
import { ChevronDown } from "lucide-react";
import {
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useDialogAccessibility } from "../../hooks";
import { ElementIcon } from "../common";
import {
  VISION_ELEMENTS,
  visionElementLabels,
  type VisionElement,
} from "./visionEffects.config";

const PANEL_MARGIN = 12;
const PANEL_WIDTH = 300;

function computePanelPosition(trigger: HTMLElement, panelHeight: number) {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PANEL_WIDTH, viewportWidth - PANEL_MARGIN * 2);

  let left = rect.right - width;
  left = Math.max(
    PANEL_MARGIN,
    Math.min(left, viewportWidth - width - PANEL_MARGIN),
  );

  const spaceBelow = viewportHeight - rect.bottom - PANEL_MARGIN;
  const spaceAbove = rect.top - PANEL_MARGIN;
  const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;
  const top = openUpward
    ? Math.max(PANEL_MARGIN, rect.top - panelHeight - PANEL_MARGIN)
    : Math.min(
        viewportHeight - panelHeight - PANEL_MARGIN,
        rect.bottom + PANEL_MARGIN,
      );

  return { left, top, width };
}

export function VisionEffectSwitcher({
  effect,
  onChange,
}: {
  effect: VisionElement;
  onChange: (effect: VisionElement) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    top: -9999,
    width: PANEL_WIDTH,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useDialogAccessibility(panelRef, close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const selected = panelRef.current?.querySelector<HTMLButtonElement>(
      `[data-vision-effect="${effect}"]`,
    );
    selected?.focus();
  }, [isOpen, effect]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const reposition = () => {
      setPosition(computePanelPosition(trigger, panel.offsetHeight));
    };
    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      ![
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? VISION_ELEMENTS.length - 1
          : (index +
              (event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : -1) +
              VISION_ELEMENTS.length) %
            VISION_ELEMENTS.length;
    const nextElement = VISION_ELEMENTS[nextIndex];
    onChange(nextElement);
    document
      .querySelector<HTMLButtonElement>(`[data-vision-effect="${nextElement}"]`)
      ?.focus();
  };

  const selectElement = (element: VisionElement) => {
    onChange(element);
    close();
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`vision-effect-picker__trigger vision-effect-picker__trigger--${effect}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Vision particle effect: ${visionElementLabels[effect]}`}
        onClick={() => setIsOpen((value) => !value)}
      >
        <ElementIcon element={effect} className="vision-effect-picker__icon" />
        <span>{visionElementLabels[effect]}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="vision-effect-picker__chevron"
        />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="vision-effect-picker__panel"
            role="listbox"
            aria-label="Vision particle effect"
            tabIndex={-1}
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
            }}
          >
            {VISION_ELEMENTS.map((element, index) => (
              <button
                key={element}
                type="button"
                className={`vision-effect-picker__option vision-effect-picker__option--${element}`}
                role="option"
                aria-selected={effect === element}
                aria-label={`Select ${visionElementLabels[element]} particle effect`}
                data-vision-effect={element}
                tabIndex={effect === element ? 0 : -1}
                onClick={() => selectElement(element)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <ElementIcon
                  element={element}
                  className="vision-effect-picker__icon"
                />
                <span>{visionElementLabels[element]}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
```

How this satisfies the spec's checklist:
- **Single trigger button** showing icon + current element name + chevron, with `aria-expanded` driving the chevron's rotation (wired in CSS, Task 8).
- **7 full options** in the popover, each with icon, label, `aria-selected`, hover/focus-visible (CSS, Task 8), and `aria-label`.
- **Keyboard navigation**: arrow keys/Home/End roam between the 7 options (ported unchanged from the old radiogroup logic); Escape and Tab-trap come from reusing `useDialogAccessibility`; opening the popover moves focus to the *currently selected* option (the extra `useEffect` above overrides the hook's default "focus first focusable" behavior, which would otherwise always land on Pyro regardless of selection).
- **Outside click closes** the popover (`pointerdown` listener checking both trigger and panel).
- **Portal to `document.body`**: the popover is never a descendant of `.landing-page`, so it can never be affected by that page's `overflow: hidden`/`isolation: isolate`, on this page or any future one that reuses this component.
- **No new dependency**: `createPortal` comes from `react-dom`, already installed; `ChevronDown` comes from `lucide-react`, already installed.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors (after Task 9 also updates `LandingPage.tsx`'s import — if run standalone before Task 9, expect only a `LandingPage.tsx` import-path error, not one from this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/VisionEffectSwitcher.tsx
git commit -m "feat: replace vision effect switcher with trigger + popover"
```

---

### Task 8: Styles — picker UI, shared color tokens, and the stacking fix

**Files:**
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: the 7 element accent tokens already defined by the shared block at ~line 1301-1363 (`--element-light/pale/primary/deep`).
- Produces: `.vision-effect-picker__trigger(--{element})`, `.vision-effect-picker__panel`, `.vision-effect-picker__option(--{element})`, `.vision-effect-picker__icon`, `.vision-effect-picker__chevron` classes consumed by Task 7's JSX; `.dialog-backdrop` at `z-index: 100`.

- [ ] **Step 1: Remove the old switcher rules**

Find and delete this whole block (currently right after the `@keyframes vision-effect-fade-in` block):

```css
.vision-effect-switcher {
  position: fixed;
  z-index: 20;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  padding: 5px;
  display: flex;
  gap: 3px;
  border: 1px solid rgba(203, 214, 223, 0.92);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 28px rgba(45, 63, 79, 0.12);
  backdrop-filter: blur(10px);
}
.vision-effect-switcher__button {
  min-height: 34px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  transition:
    color 220ms var(--ease-smooth),
    border-color 220ms var(--ease-smooth),
    background-color 220ms var(--ease-smooth),
    box-shadow 220ms var(--ease-smooth),
    transform 220ms var(--ease-smooth);
}
.vision-effect-switcher__button:hover {
  transform: translateY(-1px);
}
.vision-effect-switcher__button:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.vision-effect-switcher__button[aria-checked="true"] {
  box-shadow: inset 0 0 0 1px currentColor;
}
.vision-effect-switcher__button--cryo[aria-checked="true"] {
  color: #4f91b8;
  background: #e6f3fb;
}
.vision-effect-switcher__button--dendro[aria-checked="true"] {
  color: #5d914b;
  background: #edf6e7;
}
.vision-effect-switcher__button--pyro[aria-checked="true"] {
  color: #c9674f;
  background: #fff0e8;
}
```

Replace it with:

```css
.vision-effect-picker__trigger {
  position: fixed;
  z-index: 80;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  min-height: 46px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--element-deep, var(--ink));
  border: 1px solid rgba(203, 214, 223, 0.92);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 28px rgba(45, 63, 79, 0.12);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  transition:
    color 220ms var(--ease-smooth),
    border-color 220ms var(--ease-smooth),
    transform 220ms var(--ease-smooth);
}
.vision-effect-picker__trigger:hover {
  transform: translateY(-1px);
}
.vision-effect-picker__trigger:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.vision-effect-picker__chevron {
  transition: transform 220ms var(--ease-smooth);
}
.vision-effect-picker__trigger[aria-expanded="true"]
  .vision-effect-picker__chevron {
  transform: rotate(180deg);
}
.vision-effect-picker__panel {
  position: fixed;
  z-index: 90;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  border: 1px solid rgba(203, 214, 223, 0.92);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 50px rgba(22, 32, 42, 0.22);
}
.vision-effect-picker__option {
  min-height: 44px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  transition:
    color 200ms var(--ease-smooth),
    border-color 200ms var(--ease-smooth),
    background-color 200ms var(--ease-smooth);
}
.vision-effect-picker__option:hover {
  border-color: rgba(203, 214, 223, 0.92);
}
.vision-effect-picker__option:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.vision-effect-picker__option[aria-selected="true"] {
  color: var(--element-deep, var(--blue));
  border-color: var(--element-pale, var(--line));
  background: var(--element-light, #edf2f6);
}
.vision-effect-picker__trigger .vision-effect-picker__icon,
.vision-effect-picker__option .vision-effect-picker__icon {
  width: 18px;
  height: 18px;
}
```

Why `z-index: 80` / `90` (not just re-declaring `20`): this is the actual stacking-context fix. The old switcher tied at `z-index: 20` with the hero/`feature-grid` siblings, and lost the tie on mobile because it renders earlier in the DOM (see Investigation Summary). Placing the trigger at `80` and the panel at `90` puts both clearly above every existing "Landing Content" layer (`20`) and the implicit "Cards" layer, with no dependency on DOM order at all — so it also can't regress if a future page reorders its JSX.

- [ ] **Step 2: Raise the dialog layer above the new floating control**

Find:

```css
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
```

Replace with:

```css
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
```

This keeps every existing modal (name-dialog, reset-dialog, share-dialog, character-preview-dialog — all share `.dialog-backdrop`) above the new trigger/popover, matching the spec's own layering intent (`Dialog / Critical Overlay z-[100]` is the topmost layer) and preventing the floating button from visually poking through an open modal on mobile.

- [ ] **Step 3: Hook the 7 element accent-color groups up to the new picker classes**

For each of the 7 existing selector groups, add the two new picker selectors to the existing list (values are untouched — this only widens which elements pick up the same, already-correct tokens). For example, find:

```css
.vision-card--pyro,
.share-card--pyro,
.character-profile--pyro,
.directory-card__portrait--pyro {
```

Replace with:

```css
.vision-card--pyro,
.share-card--pyro,
.character-profile--pyro,
.directory-card__portrait--pyro,
.vision-effect-picker__trigger--pyro,
.vision-effect-picker__option--pyro {
```

Repeat the same edit (add `.vision-effect-picker__trigger--{element}, .vision-effect-picker__option--{element}` to that element's selector list) for `hydro`, `anemo`, `electro`, `dendro`, `cryo`, and `geo` — there are 7 such selector groups total, all together in one place (~line 1301-1363). Do not duplicate the hex values anywhere — only widen the existing selector lists.

- [ ] **Step 4: Remove the now-obsolete mobile rules for the old switcher**

Inside the `@media (max-width: 780px)` block, find and delete:

```css
  .vision-effect-switcher {
    right: 14px;
    bottom: 14px;
  }
  .vision-effect-switcher__button {
    padding: 0 8px;
  }
```

Inside the `@media (max-width: 450px)` block, find and delete:

```css
  .vision-effect-switcher__button span {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
```

(This sr-only-the-label-on-tiny-screens rule doesn't apply anymore — the popover only opens on demand, so there's no longer a permanently-visible row of 3+ labels competing for space on a 320px-wide screen. The trigger button always shows its label; the panel is a 2-column grid with room for each label.)

- [ ] **Step 5: Add a small mobile width safeguard for the panel**

Inside the `@media (max-width: 450px)` block (near the other picker-adjacent rules removed in Step 4), add:

```css
  .vision-effect-picker__trigger {
    right: 14px;
    bottom: 14px;
  }
```

- [ ] **Step 6: Verify the build**

Run: `npx vite build --logLevel warn`
Expected: build succeeds; only the pre-existing, unrelated `calculate-result.ts` dynamic-import warning appears (do not try to fix that here — out of scope).

- [ ] **Step 7: Commit**

```bash
git add src/styles/index.css
git commit -m "fix: vision effect picker styling and mobile stacking z-index"
```

---

### Task 9: Widen persistence validation to all 7 elements

**Files:**
- Modify: `src/pages/LandingPage.tsx:1-42` (import block + `readVisionEffect`)

**Interfaces:**
- Consumes: `VisionElement`, `VISION_EFFECT_DEFAULT`, `isVisionElement` from `../components/effects/visionEffects.config` (Task 5).

- [ ] **Step 1: Update the import**

Find:

```tsx
import {
  VisionEffectOverlay,
  type VisionEffect,
} from "../components/effects/VisionEffectOverlay";
import { VisionEffectSwitcher } from "../components/effects/VisionEffectSwitcher";
```

Replace with:

```tsx
import { VisionEffectOverlay } from "../components/effects/VisionEffectOverlay";
import { VisionEffectSwitcher } from "../components/effects/VisionEffectSwitcher";
import {
  isVisionElement,
  VISION_EFFECT_DEFAULT,
  type VisionElement,
} from "../components/effects/visionEffects.config";
```

- [ ] **Step 2: Widen `readVisionEffect` and the state type**

Find:

```tsx
const VISION_EFFECT_STORAGE_KEY = "teyvat-vision-effect";

function readVisionEffect(): VisionEffect {
  const savedEffect = localStorage.getItem(VISION_EFFECT_STORAGE_KEY);
  return savedEffect === "dendro" || savedEffect === "pyro"
    ? savedEffect
    : "cryo";
}
```

Replace with:

```tsx
const VISION_EFFECT_STORAGE_KEY = "teyvat-vision-effect";

function readVisionEffect(): VisionElement {
  const savedEffect = localStorage.getItem(VISION_EFFECT_STORAGE_KEY);
  return isVisionElement(savedEffect) ? savedEffect : VISION_EFFECT_DEFAULT;
}
```

- [ ] **Step 3: Update the state hook's type reference**

Find:

```tsx
  const [visionEffect, setVisionEffect] =
    useState<VisionEffect>(readVisionEffect);
```

Replace with:

```tsx
  const [visionEffect, setVisionEffect] =
    useState<VisionElement>(readVisionEffect);
```

No other line in this file changes — the JSX (`<VisionEffectOverlay effect={visionEffect} />` / `<VisionEffectSwitcher effect={visionEffect} onChange={setVisionEffect} />`) and the persistence `useEffect` are unaffected by this rename, since they only ever referred to the value through inferred types.

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors anywhere in the project now.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: persist and validate all 7 vision elements"
```

---

### Task 10: Full verification pass + manual QA checklist

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npx eslint .`
Expected: no errors (warnings only if any pre-existing ones already exist elsewhere in the repo).

- [ ] **Step 3: Production build**

Run: `npx vite build --logLevel warn`
Expected: succeeds; only the pre-existing `calculate-result.ts` dynamic-import warning, nothing new.

- [ ] **Step 4: Manual QA in the browser** (`npm run dev` / `pnpm dev`, open the Landing Page)

  - [ ] Trigger button shows the current element's icon, name, and a chevron; clicking it opens a 7-option popover.
  - [ ] Selecting each of the 7 options changes the particle canvas immediately and updates the trigger's icon/label/accent color.
  - [ ] Reload the page after selecting, e.g., Geo — the page comes back showing Geo (localStorage round-trip).
  - [ ] In DevTools, manually set `localStorage.setItem("teyvat-vision-effect", "not-a-real-element")` then reload — page falls back to Cryo (the default), not a crash.
  - [ ] Resize the browser to a narrow mobile width (e.g. 375px) and scroll the Landing Page — the trigger button stays visible above the feature cards at all scroll positions (this is the mobile stacking bug — confirm it's actually fixed).
  - [ ] With the popover open near the bottom of a short/mobile viewport, confirm it flips to open upward instead of overflowing off-screen.
  - [ ] Open the "start quiz" name dialog on the Landing Page while the vision popover trigger is visible — confirm the dialog now renders above the trigger (not the other way around).
  - [ ] Keyboard-only pass: Tab to the trigger, Enter/Space to open, confirm focus lands on the currently-selected option, Arrow keys move through all 7, Escape closes and returns focus to the trigger.
  - [ ] Enable OS/browser "reduce motion" and reload — canvas particles disappear but the trigger/popover still work and still change the stored element.
  - [ ] Confirm no horizontal scrollbar appears on the Landing Page at any of: 320px, 375px, 768px, 1024px, 1440px widths.
  - [ ] Navigate to `/quiz` and `/result` — confirm no vision effect trigger or canvas appears on either page.

- [ ] **Step 5: Commit** (only if Step 4 surfaced small fixups; otherwise nothing to commit here)

```bash
git add -A
git commit -m "chore: vision effect 7-element QA pass"
```

---

## Self-Review

**Spec coverage:**
- 7 elements implemented — Tasks 1-4 (new) + existing Cryo/Pyro/Dendro (Task 6 wiring). ✓
- Single trigger + popover with 7 full options (icon, label, color, selected/hover/focus, `aria-label`, keyboard nav) — Task 7. ✓
- Desktop: compact popover near the trigger, doesn't overflow viewport — `computePanelPosition` clamps `left`/`top` to viewport bounds — Task 7. ✓
- Mobile: opens upward when insufficient space below, 2-column grid, ≥44px targets, fully visible/not covered — Task 7 (`openUpward` branch) + Task 8 (`grid-template-columns: repeat(2, 1fr)`, `min-height: 44px`). ✓
- Root-cause mobile stacking fix, `position: fixed`, bottom-right, safe-area, no `overflow-hidden` clipping, portal to `document.body` — Task 8 (z-index fix) + Task 7 (`createPortal`) + Investigation Summary (root cause). ✓
- Default element preserved, localStorage round-trip, invalid-value fallback, central config for label/color/effect — Tasks 5 and 9. ✓
- Effect only on Landing Page, cleanup of rAF/listeners, reduced-motion, no aggressive flashing, `pointer-events: none` on particles (inherited unchanged from the existing `.vision-effect-overlay__canvas` rule, `aria-hidden` canvas), no new dependency, TypeScript strict — Task 6 (unchanged canvas/cleanup/reduced-motion plumbing) + Task 1 (capped/staggered Electro spark) + Global Constraints. ✓

**Placeholder scan:** no `TBD`/"add error handling"/"similar to Task N" found — every step has literal file content or an exact command.

**Type consistency:** `VisionElement` is defined once (Task 5) and imported everywhere else (Tasks 6, 7, 9) — no file re-declares the union. `create*Particles`/`draw*Effect` names match between each effect file (Tasks 1-4) and their imports in `VisionEffectOverlay.tsx` (Task 6). `VISION_ELEMENTS`/`visionElementLabels` names match between `visionEffects.config.ts` (Task 5) and `VisionEffectSwitcher.tsx` (Task 7). Class names (`vision-effect-picker__trigger--{element}`, `vision-effect-picker__option--{element}`, `vision-effect-picker__panel`, `vision-effect-picker__icon`, `vision-effect-picker__chevron`) match exactly between Task 7's JSX and Task 8's CSS.
