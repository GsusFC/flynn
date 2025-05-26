/**
 * Utilidades matemáticas avanzadas para animaciones de vectores
 * Basado en las mejores prácticas de victor2
 */

/**
 * Calcula el peso de influencia basado en la distancia
 * Útil para efectos que disminuyen con la distancia
 */
export function calculateInfluenceWeight(
  distance: number,
  maxRadius: number,
  falloffType: 'linear' | 'quadratic' | 'exponential' | 'smooth' = 'smooth'
): number {
  if (distance >= maxRadius) return 0;
  if (distance <= 0) return 1;
  
  const normalizedDistance = distance / maxRadius;
  
  switch (falloffType) {
    case 'linear':
      return 1 - normalizedDistance;
    
    case 'quadratic':
      return 1 - (normalizedDistance * normalizedDistance);
    
    case 'exponential':
      return Math.exp(-normalizedDistance * 3); // e^(-3x) para caída suave
    
    case 'smooth':
    default:
      // Smoothstep function para transición suave
      const t = 1 - normalizedDistance;
      return t * t * (3 - 2 * t);
  }
}

/**
 * Normaliza la diferencia entre dos ángulos al rango [-180, 180]
 */
export function normalizeAngleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  if (isNaN(diff) || !isFinite(diff)) return 0;
  diff = ((diff + 180) % 360) - 180;
  if (diff <= -180) diff += 360;
  return diff;
}

/**
 * Normaliza un ángulo al rango [0, 360)
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Convierte grados a radianes
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convierte radianes a grados
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Mezcla suavemente dos ángulos con interpolación circular
 */
export function blendAngles(
  angle1: number, 
  angle2: number, 
  factor: number
): number {
  const diff = normalizeAngleDifference(angle1, angle2);
  return normalizeAngle(angle1 + diff * factor);
}

/**
 * Interpola linealmente entre dos valores
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpola con suavizado (smoothstep)
 */
export function smoothstep(a: number, b: number, t: number): number {
  const clampedT = Math.max(0, Math.min(1, t));
  const smoothT = clampedT * clampedT * (3 - 2 * clampedT);
  return lerp(a, b, smoothT);
}

/**
 * Calcula el centro de masa (centroide) de un grupo de puntos
 */
export function calculateCentroid(points: Array<{ x: number; y: number }>): { x: number; y: number } {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
}

/**
 * Calcula el centro de masa ponderado
 */
export function calculateWeightedCentroid(
  points: Array<{ x: number; y: number; weight?: number }>
): { x: number; y: number } {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  
  let totalWeight = 0;
  const weightedSum = points.reduce(
    (acc, point) => {
      const weight = point.weight ?? 1;
      totalWeight += weight;
      return {
        x: acc.x + point.x * weight,
        y: acc.y + point.y * weight
      };
    },
    { x: 0, y: 0 }
  );
  
  if (totalWeight === 0) {
    return calculateCentroid(points);
  }
  
  return {
    x: weightedSum.x / totalWeight,
    y: weightedSum.y / totalWeight
  };
}

/**
 * Calcula la distancia euclidiana entre dos puntos
 */
export function getDistance(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula la distancia al cuadrado (más eficiente cuando no necesitas la raíz)
 */
export function getDistanceSquared(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Calcula el ángulo entre dos puntos en grados
 */
export function getAngleBetweenPoints(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return radiansToDegrees(Math.atan2(dy, dx));
}

/**
 * Restringe un valor a un rango específico
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Mapea un valor de un rango a otro
 */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
}

/**
 * Genera un número aleatorio en un rango
 */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Genera un número aleatorio con distribución normal (aproximada)
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Verifica si un punto está dentro de un círculo
 */
export function isPointInCircle(
  pointX: number,
  pointY: number,
  circleX: number,
  circleY: number,
  radius: number
): boolean {
  return getDistanceSquared(pointX, pointY, circleX, circleY) <= radius * radius;
}

/**
 * Verifica si un punto está dentro de un rectángulo
 */
export function isPointInRectangle(
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  return pointX >= rectX && 
         pointX <= rectX + rectWidth && 
         pointY >= rectY && 
         pointY <= rectY + rectHeight;
}

/**
 * Calcula el promedio de un array de números
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calcula el promedio de ángulos (considerando la naturaleza circular)
 */
export function averageAngles(angles: number[]): number {
  if (angles.length === 0) return 0;
  
  let sumX = 0;
  let sumY = 0;
  
  angles.forEach(angle => {
    const rad = degreesToRadians(angle);
    sumX += Math.cos(rad);
    sumY += Math.sin(rad);
  });
  
  const avgX = sumX / angles.length;
  const avgY = sumY / angles.length;
  
  return radiansToDegrees(Math.atan2(avgY, avgX));
}

/**
 * Aplica una función de easing
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeIn(t: number): number {
  return t * t;
}

export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
