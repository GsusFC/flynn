import type { Point } from '../types';

export interface VoronoiPatternProps {
  count: number;
  containerWidth: number;
  containerHeight: number;
  margin?: number;
  seed?: number;
}

export function generateVoronoiPattern(props: VoronoiPatternProps): Point[] {
  const {
    count,
    containerWidth,
    containerHeight,
    margin = 20,
    seed = 1,
  } = props;

  const points: Point[] = [];
  const contentWidth = containerWidth - 2 * margin;
  const contentHeight = containerHeight - 2 * margin;
  const startX = margin;
  const startY = margin;
  
  // Simple pseudo-random generator based on seed
  let currentSeed = seed;
  const random = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    // Using a more robust pseudo-random approach
    const x = startX + random() * contentWidth;
    const y = startY + random() * contentHeight;
    points.push({ x, y });
  }

  return points;
} 