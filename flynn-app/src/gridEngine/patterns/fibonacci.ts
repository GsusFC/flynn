import type { Point } from '../types';

interface FibonacciOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  density?: number;      // multiplicador de distancia radial (1 = estándar)
  radiusFactor?: number; // 0..1 radio máximo relativo al semiancho del contenedor
  angleDeg?: number;     // ángulo dorado en grados (≈137.5)
}

export function generateFibonacci(opts: FibonacciOptions): Point[] {
  const {
    count,
    containerWidth: w,
    containerHeight: h,
    density = 1.0,
    radiusFactor = 0.8,
    angleDeg = 137.5,
  } = opts;

  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.min(w, h) / 2 * radiusFactor;
  const scale = Math.min(w, h) / Math.sqrt(count) / 2;

  const angleRad = angleDeg * Math.PI / 180;
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    const r = density * Math.sqrt(n) * scale;
    if (r > maxRadius) continue;
    const theta = n * angleRad;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    pts.push({ x, y });
  }
  return pts;
} 