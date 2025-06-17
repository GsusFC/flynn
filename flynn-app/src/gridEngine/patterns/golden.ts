import type { Point } from '../types';

interface GoldenOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  expansion?: number; // multiplier of radius
  rotation?: number;  // base rotation deg
  compression?: number; // multiplier compress radius
  margin?: number;
}

export function generateGolden(opts: GoldenOptions): Point[] {
  const {
    count,
    containerWidth: w,
    containerHeight: h,
    expansion = 1.0,
    rotation = 0,
    compression = 1.0,
    margin = 20,
  } = opts;

  const ratio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = 2 * Math.PI / ratio;
  const rotRad = rotation * Math.PI / 180;

  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.min(w, h) / 2 - margin;
  const scale = maxRadius / Math.sqrt(count);

  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(i) * scale * expansion * compression;
    const theta = i * goldenAngle + rotRad;
    if (r > maxRadius) continue;
    pts.push({ x: cx + Math.cos(theta) * r, y: cy + Math.sin(theta) * r });
  }
  return pts;
} 