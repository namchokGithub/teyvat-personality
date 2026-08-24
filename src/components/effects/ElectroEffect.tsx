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
