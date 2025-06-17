import type { Point } from '../types';

interface PolarOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  distribution?: 'uniform' | 'logarithmic';
  radialBias?: number; // -1 (more rings) to 1 (more lines)
  margin?: number;
}

export function generatePolar(opts: PolarOptions): Point[] {
  const {
    count,
    containerWidth: w,
    containerHeight: h,
    distribution = 'uniform',
    radialBias = 0, // Default to balanced
    margin = 20,
  } = opts;

  if (count <= 0) return [];
  if (count === 1) return [{ x: w / 2, y: h / 2 }];

  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.min(w, h) / 2 - margin;

  // Calculate rings and lines based on count and bias
  const base = Math.sqrt(count);
  // The bias factor adjusts the balance between lines and rings.
  // A higher bias means more lines and fewer rings.
  const biasFactor = 1 + (radialBias * 0.75); // Maps [-1, 1] to [0.25, 1.75] for a stronger effect
  
  const numLines = Math.max(3, Math.round(base * biasFactor));
  const numRings = Math.ceil(count / numLines);

  const pts: Point[] = [];
  let pointsGenerated = 0;

  for (let ringIdx = 0; ringIdx < numRings; ringIdx++) {
    // Determine how many points to place on the current ring
    const remainingPoints = count - pointsGenerated;
    const pointsOnThisRing = Math.min(remainingPoints, numLines);

    if (pointsOnThisRing <= 0) break;

    const t = (ringIdx + 0.5) / numRings; // Use +0.5 to avoid placing points at the exact center
    const radius = distribution === 'logarithmic' ? maxRadius * Math.pow(t, 1.5) : maxRadius * t;

    for (let lineIdx = 0; lineIdx < pointsOnThisRing; lineIdx++) {
      // Use pointsOnThisRing for the angle calculation to ensure even distribution, even on the last partial ring
      const angle = (lineIdx / pointsOnThisRing) * 2 * Math.PI;
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        ring: ringIdx,
        line: lineIdx,
      });
    }
    pointsGenerated += pointsOnThisRing;
  }

  return pts;
} 