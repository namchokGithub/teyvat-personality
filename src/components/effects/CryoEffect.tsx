export interface CryoParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
  color: string;
}

const colors = ["#B8DCF5", "#D7ECFA", "#8EC8E8"];

export function createCryoParticles(
  count: number,
  width: number,
  height: number,
) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 3.5 + Math.random() * 4.5,
    speed: 16 + Math.random() * 22,
    drift: 4 + Math.random() * 10,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.56 + Math.random() * 0.19,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function drawCryoEffect(
  context: CanvasRenderingContext2D,
  particles: CryoParticle[],
  delta: number,
  elapsed: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.y += particle.speed * delta;
    particle.x += Math.sin(elapsed + particle.phase) * particle.drift * delta;
    if (particle.y > height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * width;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.strokeStyle = particle.color;
    context.globalAlpha = particle.opacity;
    context.lineWidth = 1.5;
    context.shadowColor = particle.color;
    context.shadowBlur = 4;
    for (let arm = 0; arm < 3; arm += 1) {
      context.rotate(Math.PI / 3);
      context.beginPath();
      context.moveTo(-particle.size, 0);
      context.lineTo(particle.size, 0);
      context.stroke();
    }
    context.restore();
  }
}
