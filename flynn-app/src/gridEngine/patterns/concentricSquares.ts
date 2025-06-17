import type { Point } from '../types';

export interface ConcentricSquaresProps {
  count: number;
  containerWidth: number;
  containerHeight: number;
  numSquares?: number;
  rotation?: number; // degrees
  margin?: number;
}

export function generateConcentricSquares(props: ConcentricSquaresProps): Point[] {
  const {
    count,
    containerWidth,
    containerHeight,
    numSquares = 5,
    rotation = 0,
    margin = 20,
  } = props;

  if (count === 0 || numSquares === 0) return [];

  const points: Point[] = [];
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const maxRadius = Math.min(containerWidth - 2 * margin, containerHeight - 2 * margin) / 2;
  const rotationRad = (rotation * Math.PI) / 180;

  const pointsPerSquare = Array(numSquares).fill(0);
  for (let i = 0; i < count; i++) {
    pointsPerSquare[i % numSquares]++;
  }

  for (let i = 0; i < numSquares; i++) {
    const squareRadius = maxRadius * ((i + 0.5) / numSquares);
    const sideLength = squareRadius * 2;
    const perimeter = sideLength * 4;
    const numPointsOnSquare = pointsPerSquare[i];

    if (numPointsOnSquare === 0) continue;

    for (let j = 0; j < numPointsOnSquare; j++) {
      const distOnPerimeter = (j / numPointsOnSquare) * perimeter;
      
      let p_x = 0;
      let p_y = 0;

      if (distOnPerimeter < sideLength) { // Top side
        p_x = -squareRadius + distOnPerimeter;
        p_y = -squareRadius;
      } else if (distOnPerimeter < sideLength * 2) { // Right side
        p_x = squareRadius;
        p_y = -squareRadius + (distOnPerimeter - sideLength);
      } else if (distOnPerimeter < sideLength * 3) { // Bottom side
        p_x = squareRadius - (distOnPerimeter - sideLength * 2);
        p_y = squareRadius;
      } else { // Left side
        p_x = -squareRadius;
        p_y = squareRadius - (distOnPerimeter - sideLength * 3);
      }

      const x = centerX + p_x * Math.cos(rotationRad) - p_y * Math.sin(rotationRad);
      const y = centerY + p_x * Math.sin(rotationRad) + p_y * Math.cos(rotationRad);
      
      points.push({ x, y });
    }
  }

  return points;
} 