import type { Point } from '../types';

interface HexagonalOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  spacingMultiplier?: number; // escala del espaciado
  offsetFactor?: number;      // 0..1 factor del desplazamiento horizontal en filas impares (0.5 = hex estándar)
  margin?: number;
}

export function generateHexagonal(opts: HexagonalOptions): Point[] {
  const {
    count,
    containerWidth: w,
    containerHeight: h,
    spacingMultiplier = 1.0,
    offsetFactor = 0.5,
    margin = 20,
  } = opts;

  if (count <= 0) return [];

  const contentW = w - 2 * margin;
  const contentH = h - 2 * margin;

  // Estimate the number of columns to make the grid roughly aspect-ratio correct
  const aspectRatio = contentW / contentH;
  const cols = Math.round(Math.sqrt(count * aspectRatio * (2 / Math.sqrt(3)) ));
  const rows = Math.ceil(count / cols);

  // Determine spacing based on fitting the grid in the container
  const spacingX = contentW / (cols + offsetFactor);
  const spacingY = contentH / (rows * 0.866);
  const spacing = Math.min(spacingX, spacingY) * spacingMultiplier;

  const pts: Point[] = [];
  for (let row = 0; row < rows && pts.length < count; row++) {
    for (let col = 0; col < cols && pts.length < count; col++) {
      const offsetX = (row % 2) * spacing * offsetFactor;
      pts.push({
        x: col * spacing + offsetX,
        y: row * spacing * 0.866, // 0.866 is approx. sqrt(3)/2
        row: row,
        col: col,
      });
    }
  }

  return pts;
} 