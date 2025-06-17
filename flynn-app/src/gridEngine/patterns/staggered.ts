import type { Point } from '../types';

export interface StaggeredPatternProps {
  rows: number;
  cols: number;
  spacing: number;
}

export const generateStaggeredPattern = ({
  rows,
  cols,
  spacing,
}: StaggeredPatternProps): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const staggerOffset = (i % 2) * (spacing / 2);
      points.push({
        x: j * spacing + staggerOffset,
        y: i * spacing,
        row: i,
        col: j,
      });
    }
  }
  return points;
}; 