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
