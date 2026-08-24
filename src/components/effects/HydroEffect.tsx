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
