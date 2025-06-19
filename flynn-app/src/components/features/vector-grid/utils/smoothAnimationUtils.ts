/**
 * Smooth Animation Utilities
 * Sistema para evitar saltos bruscos en animaciones vectoriales
 */

/**
 * Interpolación angular suave que toma el camino más corto
 */
export const smoothAngleLerp = (current: number, target: number, factor: number = 0.1): number => {
  let diff = target - current;
  
  // Asegurar que tomamos el camino más corto en el círculo
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  
  return current + diff * factor;
};

/**
 * Interpolación suave con easing exponencial
 */
export const smoothEaseOut = (current: number, target: number, factor: number = 0.1): number => {
  const diff = target - current;
  const easedFactor = 1 - Math.pow(1 - factor, 2); // Easing cuadrático
  return current + diff * easedFactor;
};

/**
 * Limita la velocidad de cambio para evitar saltos bruscos
 */
export const limitChangeSpeed = (
  current: number, 
  target: number, 
  maxDelta: number, 
  deltaTime: number
): number => {
  const diff = target - current;
  const maxChange = maxDelta * deltaTime;
  
  if (Math.abs(diff) <= maxChange) {
    return target;
  }
  
  return current + Math.sign(diff) * maxChange;
};

/**
 * Sistema de filtro de paso bajo para suavizar señales ruidosas
 */
export class LowPassFilter {
  private value: number = 0;
  private alpha: number;
  
  constructor(cutoffFreq: number = 0.1) {
    this.alpha = Math.min(1, Math.max(0, cutoffFreq));
  }
  
  filter(input: number): number {
    this.value = this.value + this.alpha * (input - this.value);
    return this.value;
  }
  
  reset(value: number = 0): void {
    this.value = value;
  }
}

/**
 * Cache para valores previos de animación
 */
export class AnimationValueCache {
  private cache = new Map<string, number>();
  private filters = new Map<string, LowPassFilter>();
  
  getSmoothValue(key: string, newValue: number, smoothFactor: number = 0.1): number {
    const prevValue = this.cache.get(key) ?? newValue;
    const smoothValue = smoothEaseOut(prevValue, newValue, smoothFactor);
    this.cache.set(key, smoothValue);
    return smoothValue;
  }
  
  getFilteredValue(key: string, newValue: number, cutoffFreq: number = 0.1): number {
    if (!this.filters.has(key)) {
      this.filters.set(key, new LowPassFilter(cutoffFreq));
    }
    
    return this.filters.get(key)!.filter(newValue);
  }
  
  clear(): void {
    this.cache.clear();
    this.filters.clear();
  }
}

/**
 * Detector de saltos bruscos en animaciones
 */
export const detectAnimationJump = (
  current: number, 
  previous: number, 
  threshold: number = 0.5
): boolean => {
  const diff = Math.abs(current - previous);
  return diff > threshold;
};

/**
 * Corrector de saltos para animaciones continuas
 */
export const correctAnimationJump = (
  current: number, 
  previous: number, 
  threshold: number = 0.5,
  smoothFactor: number = 0.2
): number => {
  if (detectAnimationJump(current, previous, threshold)) {
    // Si detectamos un salto brusco, usar interpolación suave
    return smoothEaseOut(previous, current, smoothFactor);
  }
  return current;
};

/**
 * Normaliza ángulos al rango [-PI, PI]
 */
export const normalizeAngle = (angle: number): number => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

/**
 * Sistema de timing suave para animaciones
 */
export class SmoothTimer {
  private lastTime: number = 0;
  private smoothDelta: number = 0;
  private readonly alpha: number = 0.9; // Factor de suavizado
  
  update(currentTime: number): number {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return 0;
    }
    
    const rawDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Suavizar el deltaTime para evitar picos
    this.smoothDelta = this.smoothDelta * this.alpha + rawDelta * (1 - this.alpha);
    
    // Limitar el deltaTime para evitar saltos grandes
    return Math.min(this.smoothDelta, 0.1); // Máximo 100ms
  }
  
  reset(): void {
    this.lastTime = 0;
    this.smoothDelta = 0;
  }
} 