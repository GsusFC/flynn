import type { Point } from './types';

/**
 * Desplaza todos los puntos de forma que su bounding-box quede centrada
 * en el contenedor dado.
 */
export function centerPoints(
  pts: Point[],
  containerWidth: number,
  containerHeight: number
): Point[] {
  if (!pts.length) return pts;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const bboxCenterX = (minX + maxX) / 2;
  const bboxCenterY = (minY + maxY) / 2;
  const offsetX = containerWidth / 2 - bboxCenterX;
  const offsetY = containerHeight / 2 - bboxCenterY;

  // devolver nuevos objetos para mantener inmutabilidad
  return pts.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));
} 