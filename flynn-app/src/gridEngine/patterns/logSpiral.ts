import type { Point } from '../types';

export interface LogSpiralOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  tightness?: number;   // 0.05 - 0.5
  arms?: number;        // número de brazos
  startRadius?: number; // píxeles
  margin?: number;
}

export function generateLogSpiral(opts: LogSpiralOptions): Point[] {
  const {
    count,
    containerWidth: w,
    containerHeight: h,
    tightness = 0.2,
    arms = 2,
    startRadius = 5,
    margin = 20,
  } = opts;

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) / 2 - margin;
  const pts: Point[] = [];

  for (let i = 0; i < count; i++) {
    const armIndex = i % arms;
    const pointsPerArm = Math.ceil(count / arms);
    const pointIndexInArm = Math.floor(i / arms);

    const angle = (pointIndexInArm / pointsPerArm) * 8 * Math.PI; // More rotation for denser spirals
    const armOffset = (armIndex / arms) * 2 * Math.PI;
    const spiralAngle = angle + armOffset;

    const radius = startRadius * Math.exp(tightness * angle);
    const normalizedRadius = Math.min(radius, maxR);
    
    pts.push({
      x: cx + Math.cos(spiralAngle) * normalizedRadius,
      y: cy + Math.sin(spiralAngle) * normalizedRadius,
      arm: armIndex,
    });
  }
  return pts;
} 