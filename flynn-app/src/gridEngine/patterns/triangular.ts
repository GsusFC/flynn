import type { Point } from '../types';

interface TriangularOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  margin?: number;
}

export function generateTriangular(opts: TriangularOptions): Point[] {
  const { count, containerWidth: w, containerHeight: h, margin = 20 } = opts;

  const availableW = w - 2 * margin;
  const availableH = h - 2 * margin;

  // Estimar columnas y filas para un patrón triangular
  const cols = Math.ceil(Math.sqrt(count * 1.2));
  const triSpacingX = availableW / (cols + 1);
  const triSpacingY = triSpacingX * Math.sqrt(3) / 2;
  const rows = Math.max(1, Math.floor(availableH / triSpacingY));

  const pts: Point[] = [];
  for (let r = 0; r < rows && pts.length < count; r++) {
    const rowOffset = (r % 2) * triSpacingX / 2;
    for (let c = 0; c < cols && pts.length < count; c++) {
      const x = margin + triSpacingX + c * triSpacingX + rowOffset;
      const y = margin + triSpacingY + r * triSpacingY;
      pts.push({ x, y });
    }
  }

  return pts;
} 