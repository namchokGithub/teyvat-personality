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
