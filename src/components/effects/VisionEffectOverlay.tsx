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
): void {
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
