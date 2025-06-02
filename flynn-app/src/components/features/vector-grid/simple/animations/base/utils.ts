// Utilidades compartidas para todas las animaciones
import type { SimpleVector } from '../../simpleTypes';

// Utilidad para normalizar ángulos (optimizado y seguro)
export const normalizeAngle = (angle: number): number => {
  if (isNaN(angle) || !isFinite(angle)) return 0;
  return ((angle % 360) + 360) % 360;
};

// Utilidad para calcular distancia entre dos puntos
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// Utilidad para interpolar entre dos valores
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Utilidad para mapear un valor de un rango a otro
export const mapRange = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
};

// Utilidad para aplicar easing
export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Utilidad para clonar vectores
export const cloneVector = (vector: SimpleVector): SimpleVector => ({
  ...vector
});

// Utilidad para clonar array de vectores
export const cloneVectors = (vectors: SimpleVector[]): SimpleVector[] => {
  return vectors.map(cloneVector);
};

// Utilidad para validar props
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  name: string
): boolean => {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`${name} debe ser un número válido`);
    return false;
  }
  if (value < min || value > max) {
    console.warn(`${name} debe estar entre ${min} y ${max}`);
    return false;
  }
  return true;
};

// Cache para factores de tiempo pre-calculados para simpleNoise
// NOTA: Este caché es global. Si simpleNoise se usa en múltiples contextos
// con diferentes secuencias de 'time', podría necesitarse una gestión de caché más sofisticada
// o que la función sea completamente pura y reciba los factores precalculados.
let timeFactorsCache: { time: number; factors: number[] } | null = null;

// Función de ruido simple optimizada (aproximación de Perlin)
// Originalmente de perlinFlow.ts
export const simpleNoise = (x: number, y: number, time: number): number => {
  // Pre-calcular factores temporales si no están en cache
  if (!timeFactorsCache || timeFactorsCache.time !== time) {
    timeFactorsCache = {
      time,
      factors: [
        time,           // factor1
        time * 0.7,     // factor2  
        time * 1.3      // factor3
      ]
    };
  }

  const [timeFactor1, timeFactor2, timeFactor3] = timeFactorsCache.factors;
  
  // Usar frecuencias constantes pre-calculadas
  const freq1 = Math.sin(x * 0.1 + timeFactor1) * Math.cos(y * 0.1 + timeFactor1);
  const freq2 = Math.sin(x * 0.05 + timeFactor2) * Math.cos(y * 0.05 + timeFactor2) * 0.5;
  const freq3 = Math.sin(x * 0.2 + timeFactor3) * Math.cos(y * 0.2 + timeFactor3) * 0.25;
  
  return (freq1 + freq2 + freq3) / 1.75; // Normalizar
};

// Utilidad para crear un generador de ruido simple
export const createNoiseGenerator = (seed: number = 1) => {
  let currentSeed = seed;
  
  const random = (): number => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  return {
    noise1D: (x: number): number => {
      const intX = Math.floor(x);
      const fracX = x - intX;
      
      currentSeed = intX;
      const a = random();
      currentSeed = intX + 1;
      const b = random();
      
      return lerp(a, b, fracX);
    },
    
    noise2D: (x: number, y: number): number => {
      const intX = Math.floor(x);
      const intY = Math.floor(y);
      const fracX = x - intX;
      const fracY = y - intY;
      
      currentSeed = intX + intY * 57;
      const a = random();
      currentSeed = intX + 1 + intY * 57;
      const b = random();
      currentSeed = intX + (intY + 1) * 57;
      const c = random();
      currentSeed = intX + 1 + (intY + 1) * 57;
      const d = random();
      
      const i1 = lerp(a, b, fracX);
      const i2 = lerp(c, d, fracX);
      
      return lerp(i1, i2, fracY);
    }
  };
};

// Utilidad para calcular el centro de un canvas
export const getCanvasCenter = (width: number, height: number) => ({
  x: width / 2,
  y: height / 2
});

// Utilidad para convertir coordenadas polares a cartesianas
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

// Utilidad para calcular el ángulo entre dos puntos
export const angleBetweenPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

// Utilidad para aplicar transformaciones a vectores
export const transformVector = (
  vector: SimpleVector,
  transform: {
    angle?: number;
    length?: number;
    opacity?: number;
    x?: number;
    y?: number;
  }
): SimpleVector => {
  return {
    ...vector,
    angle: transform.angle !== undefined ? normalizeAngle(transform.angle) : vector.angle,
    length: transform.length !== undefined ? Math.max(0, transform.length) : vector.length,
    opacity: transform.opacity !== undefined ? Math.max(0, Math.min(1, transform.opacity)) : vector.opacity,
    x: transform.x !== undefined ? transform.x : vector.x,
    y: transform.y !== undefined ? transform.y : vector.y
  };
};
