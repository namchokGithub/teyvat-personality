import { useEffect, useRef, useState } from "react";

import { createCryoParticles, drawCryoEffect } from "./CryoEffect";
import { createDendroParticles, drawDendroEffect } from "./DendroEffect";
import { createPyroParticles, drawPyroEffect } from "./PyroEffect";

export type VisionEffect = "cryo" | "dendro" | "pyro";

const particleCounts: Record<
  VisionEffect,
  { desktop: number; mobile: number }
> = {
  cryo: { desktop: 52, mobile: 24 },
  dendro: { desktop: 46, mobile: 22 },
  pyro: { desktop: 48, mobile: 24 },
};

function VisionEffectCanvas({ effect }: { effect: VisionEffect }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let particles:
      | ReturnType<typeof createCryoParticles>
      | ReturnType<typeof createDendroParticles>
      | ReturnType<typeof createPyroParticles> = [];

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
          ? particleCounts[effect].mobile
          : particleCounts[effect].desktop;
      particles =
        effect === "cryo"
          ? createCryoParticles(count, width, height)
          : effect === "dendro"
            ? createDendroParticles(count, width, height)
            : createPyroParticles(count, width, height);
    };

    const render = (time: number) => {
      frameId = 0;
      if (!isVisible || reducedMotion.matches) return;

      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      if (effect === "cryo")
        drawCryoEffect(
          context,
          particles as ReturnType<typeof createCryoParticles>,
          delta,
          elapsed,
          width,
          height,
        );
      if (effect === "dendro")
        drawDendroEffect(
          context,
          particles as ReturnType<typeof createDendroParticles>,
          delta,
          elapsed,
          width,
          height,
        );
      if (effect === "pyro")
        drawPyroEffect(
          context,
          particles as ReturnType<typeof createPyroParticles>,
          delta,
          elapsed,
          width,
          height,
        );
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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

export function VisionEffectOverlay({ effect }: { effect: VisionEffect }) {
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
