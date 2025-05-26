/**
 * Utilidades matemáticas para animaciones
 */

/**
 * Convierte grados a radianes
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convierte radianes a grados
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calcula el ángulo entre dos puntos en grados
 */
export function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
  return radToDeg(Math.atan2(y2 - y1, x2 - x1));
}

/**
 * Interpola entre dos ángulos por el camino más corto
 */
export function interpolateAngle(startAngle: number, endAngle: number, t: number): number {
  // Normalizar ángulos a 0-360
  startAngle = startAngle % 360;
  if (startAngle < 0) startAngle += 360;
  
  endAngle = endAngle % 360;
  if (endAngle < 0) endAngle += 360;
  
  // Encontrar el camino más corto
  let diff = endAngle - startAngle;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  // Interpolar
  return (startAngle + diff * t) % 360;
}

/**
 * Calcula la distancia entre dos puntos
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normaliza un valor al rango [0, 1]
 */
export function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Genera un valor pseudoaleatorio determinista basado en una semilla
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Aplica un factor de easing a un valor normalizado
 */
export function applyEasing(t: number, easingType: string = 'linear'): number {
  switch (easingType) {
    case 'linear':
      return t;
    case 'easeInQuad':
      return t * t;
    case 'easeOutQuad':
      return t * (2 - t);
    case 'easeInOutQuad':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'easeInCubic':
      return t * t * t;
    case 'easeOutCubic':
      return (--t) * t * t + 1;
    case 'easeInOutCubic':
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case 'easeOutElastic':
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    default:
      return t;
  }
}
