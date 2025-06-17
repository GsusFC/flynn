import type { Point } from '../types';

export interface RegularOptions {
  rows: number;
  cols: number;
  spacing: number;
}

export function generateRegular(opts: RegularOptions): Point[] {
  const { rows, cols, spacing } = opts;

  // Seguridad mínimo 1
  const r = Math.max(1, Math.round(rows));
  const c = Math.max(1, Math.round(cols));

  const pts: Point[] = [];
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      pts.push({ x: j * spacing, y: i * spacing, row: i, col: j });
    }
  }
  return pts;
} 