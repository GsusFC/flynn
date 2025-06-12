import type { CustomGradient } from './customGradients';

// Helper to parse HSL strings
const parseHsl = (hsl: string): [number, number, number] | null => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
};

// Helper to parse Hex strings
const hexToRgb = (hex: string): [number, number, number] => {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    // 6 digits
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
};


// Function to interpolate between two colors
const lerpColor = (color1: string, color2: string, factor: number): string => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return rgbToHex(r, g, b);
};


export const evaluateGradient = (
  gradient: CustomGradient, 
  x: number, // normalized 0-1
  y: number, // normalized 0-1
  time: number // for dynamic effects
): string => {
  if (!gradient?.gradient?.stops || gradient.gradient.stops.length === 0) {
    return '#FFFFFF'; // Default color if gradient is invalid
  }

  const { stops, type = 'linear' } = gradient.gradient;
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

  // For now, we only implement a simple linear gradient logic.
  // This can be expanded to support radial, conic, etc.
  // We'll also use a simple time-based animation for now.
  const animatedTime = (time * 0.1) % 1;
  let factor = (x + y) / 2; // Simple average for position
  factor = (factor + animatedTime) % 1; // Animate the factor

  if (factor < sortedStops[0].offset) {
    return sortedStops[0].color;
  }
  if (factor > sortedStops[sortedStops.length - 1].offset) {
    return sortedStops[sortedStops.length - 1].color;
  }

  let startStop = sortedStops[0];
  let endStop = sortedStops[sortedStops.length - 1];

  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (factor >= sortedStops[i].offset && factor <= sortedStops[i + 1].offset) {
      startStop = sortedStops[i];
      endStop = sortedStops[i + 1];
      break;
    }
  }

  const range = endStop.offset - startStop.offset;
  if (range === 0) {
    return startStop.color;
  }

  const normalizedFactor = (factor - startStop.offset) / range;
  return lerpColor(startStop.color, endStop.color, normalizedFactor);
}; 