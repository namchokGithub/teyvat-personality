export interface DendroParticle {
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

const colors = ["#9BCB72", "#C4DFA5", "#6FA45B"];

export function createDendroParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 7 + Math.random() * 6,
    speed: 13 + Math.random() * 18,
    sway: 12 + Math.random() * 20,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.7 + Math.random() * 1.4,
    opacity: 0.48 + Math.random() * 0.22,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawDendroEffect(
  context: CanvasRenderingContext2D,
  particles: DendroParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.y += particle.speed * delta;
    particle.x +=
      Math.sin(elapsed * 1.4 + particle.phase) * particle.sway * delta;
    particle.rotation += particle.rotationSpeed * delta;
    if (particle.y > height + particle.size * 2) {
      particle.y = -particle.size * 2;
      particle.x = Math.random() * width;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    context.globalAlpha = particle.opacity;
    context.shadowColor = particle.color;
    context.shadowBlur = 3;
    context.beginPath();
    context.ellipse(
      0,
      0,
      particle.size * 0.58,
      particle.size,
      Math.PI / 4,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();
  }
}
