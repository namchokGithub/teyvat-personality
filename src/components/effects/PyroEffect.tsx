export interface PyroParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
  life: number;
  color: string;
}

const colors = ["#F4A261", "#F6C177", "#E76F51"];

export function createPyroParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 3 + Math.random() * 4.5,
    speed: 26 + Math.random() * 34,
    drift: 8 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.58 + Math.random() * 0.17,
    life: Math.random(),
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawPyroEffect(
  context: CanvasRenderingContext2D,
  particles: PyroParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.y -= particle.speed * delta;
    particle.x +=
      Math.sin(elapsed * 2 + particle.phase) * particle.drift * delta;
    particle.life -= delta * 0.22;
    if (particle.y < -particle.size || particle.life <= 0) {
      particle.y = height + particle.size;
      particle.x = Math.random() * width;
      particle.life = 0.7 + Math.random() * 0.3;
    }

    context.save();
    context.fillStyle = particle.color;
    context.globalAlpha = particle.opacity * particle.life;
    context.shadowColor = particle.color;
    context.shadowBlur = 7;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}
