import type { Point } from '../types';
import { generatePolar } from './polar';

interface RadialOptions {
  count: number;
  containerWidth: number;
  containerHeight: number;
  radialBias?: number; // -1 for rings, 1 for lines
  margin?: number;
}

export function generateRadial(opts: RadialOptions): Point[] {
  // Radial and Polar are conceptually similar. We can reuse the polar generator.
  // The main difference is that radial tends to have points on the same radius,
  // while polar aligns them along radial lines. The new `radialBias` control
  // allows for both behaviors within the same generator.
  return generatePolar({
    ...opts,
    distribution: 'uniform', // Force uniform distribution for classic radial look
  });
} 