/**
 * Sistema de controles globales para todas las animaciones
 * Inspirado en victor2 - controles de velocidad y elasticidad genéricos
 */

export interface GlobalAnimationControls {
  globalSpeed: number;        // 0.1 - 3.0 - Multiplicador de velocidad global
  globalElasticity: number;   // 0.1 - 1.0 - Factor de suavizado/elasticidad
  globalIntensity: number;    // 0.1 - 2.0 - Multiplicador de intensidad/amplitud
  globalDamping: number;      // 0.1 - 1.0 - Factor de amortiguación
}

export const DEFAULT_GLOBAL_CONTROLS: GlobalAnimationControls = {
  globalSpeed: 1.0,
  globalElasticity: 0.8,
  globalIntensity: 1.0,
  globalDamping: 0.95
};

/**
 * Aplica controles globales a un valor de velocidad
 */
export function applyGlobalSpeed(
  baseSpeed: number, 
  globalControls: GlobalAnimationControls
): number {
  return baseSpeed * globalControls.globalSpeed;
}

/**
 * Aplica controles globales a un valor de intensidad/amplitud
 */
export function applyGlobalIntensity(
  baseIntensity: number, 
  globalControls: GlobalAnimationControls
): number {
  return baseIntensity * globalControls.globalIntensity;
}

/**
 * Aplica elasticidad a una transición entre dos valores
 */
export function applyElasticity(
  currentValue: number,
  targetValue: number,
  deltaTime: number,
  globalControls: GlobalAnimationControls
): number {
  const elasticityFactor = globalControls.globalElasticity;
  const transitionSpeed = 5.0 * elasticityFactor; // Velocidad base de transición
  
  // Interpolación exponencial para suavizado
  const lerpFactor = 1 - Math.exp(-transitionSpeed * deltaTime);
  return currentValue + (targetValue - currentValue) * lerpFactor;
}

/**
 * Aplica amortiguación basada en distancia
 */
export function applyDistanceDamping(
  value: number,
  distance: number,
  maxDistance: number,
  globalControls: GlobalAnimationControls
): number {
  if (maxDistance <= 0) return value;
  
  const normalizedDistance = Math.min(distance / maxDistance, 1);
  const dampingFactor = globalControls.globalDamping;
  
  // Aplicar amortiguación exponencial
  const damping = Math.pow(dampingFactor, normalizedDistance);
  return value * damping;
}

/**
 * Función de easing con elasticidad configurable
 */
export function elasticEase(
  t: number, 
  globalControls: GlobalAnimationControls,
  easeType: 'in' | 'out' | 'inOut' = 'inOut'
): number {
  const elasticity = globalControls.globalElasticity;
  
  // Ajustar la intensidad del efecto elástico
  const amplitude = 1.0;
  const period = 0.3 * (1 - elasticity + 0.1); // Menos elasticidad = período más corto
  
  if (t === 0) return 0;
  if (t === 1) return 1;
  
  switch (easeType) {
    case 'in':
      return -amplitude * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - period / 4) * (2 * Math.PI) / period);
    
    case 'out':
      return amplitude * Math.pow(2, -10 * t) * Math.sin((t - period / 4) * (2 * Math.PI) / period) + 1;
    
    case 'inOut':
    default:
      if (t < 0.5) {
        return -0.5 * amplitude * Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / period);
      }
      return amplitude * Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / period) * 0.5 + 1;
  }
}

/**
 * Aplica suavizado temporal a un ángulo
 */
export function smoothAngleTransition(
  currentAngle: number,
  targetAngle: number,
  deltaTime: number,
  globalControls: GlobalAnimationControls
): number {
  // Normalizar diferencia angular
  let angleDiff = targetAngle - currentAngle;
  while (angleDiff > 180) angleDiff -= 360;
  while (angleDiff < -180) angleDiff += 360;
  
  // Aplicar elasticidad
  const smoothedDiff = applyElasticity(0, angleDiff, deltaTime, globalControls);
  
  // Retornar ángulo suavizado
  let result = currentAngle + smoothedDiff;
  while (result < 0) result += 360;
  while (result >= 360) result -= 360;
  
  return result;
}

/**
 * Crea una función de interpolación con controles globales
 */
export function createGlobalLerp(globalControls: GlobalAnimationControls) {
  return (start: number, end: number, factor: number): number => {
    // Aplicar elasticidad al factor de interpolación
    const elasticFactor = elasticEase(Math.max(0, Math.min(1, factor)), globalControls);
    return start + (end - start) * elasticFactor;
  };
}

/**
 * Aplica todos los controles globales a un contexto de animación
 */
export function applyGlobalControls<T extends Record<string, unknown>>(
  animationProps: T,
  globalControls: GlobalAnimationControls
): T & { _globalControls: GlobalAnimationControls } {
  return {
    ...animationProps,
    _globalControls: globalControls
  };
}

/**
 * Extrae controles globales de props de animación
 */
export function extractGlobalControls<T extends Record<string, unknown>>(
  props: T & { _globalControls?: GlobalAnimationControls }
): GlobalAnimationControls {
  return props._globalControls || DEFAULT_GLOBAL_CONTROLS;
}

/**
 * Valida controles globales
 */
export function validateGlobalControls(controls: Partial<GlobalAnimationControls>): boolean {
  const { globalSpeed, globalElasticity, globalIntensity, globalDamping } = controls;
  
  if (globalSpeed !== undefined && (typeof globalSpeed !== 'number' || globalSpeed < 0.1 || globalSpeed > 3.0)) {
    console.warn('globalSpeed debe estar entre 0.1 y 3.0');
    return false;
  }
  
  if (globalElasticity !== undefined && (typeof globalElasticity !== 'number' || globalElasticity < 0.1 || globalElasticity > 1.0)) {
    console.warn('globalElasticity debe estar entre 0.1 y 1.0');
    return false;
  }
  
  if (globalIntensity !== undefined && (typeof globalIntensity !== 'number' || globalIntensity < 0.1 || globalIntensity > 2.0)) {
    console.warn('globalIntensity debe estar entre 0.1 y 2.0');
    return false;
  }
  
  if (globalDamping !== undefined && (typeof globalDamping !== 'number' || globalDamping < 0.1 || globalDamping > 1.0)) {
    console.warn('globalDamping debe estar entre 0.1 y 1.0');
    return false;
  }
  
  return true;
}

/**
 * Combina controles globales con valores por defecto
 */
export function mergeGlobalControls(
  partial: Partial<GlobalAnimationControls>
): GlobalAnimationControls {
  return {
    ...DEFAULT_GLOBAL_CONTROLS,
    ...partial
  };
}

/**
 * Crea controles de UI para los controles globales
 */
export function createGlobalControlsUI() {
  return [
    {
      id: 'globalSpeed',
      label: 'Velocidad Global',
      type: 'slider' as const,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      defaultValue: DEFAULT_GLOBAL_CONTROLS.globalSpeed,
      description: 'Multiplicador de velocidad para todas las animaciones',
      icon: '⚡'
    },
    {
      id: 'globalElasticity',
      label: 'Elasticidad Global',
      type: 'slider' as const,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      defaultValue: DEFAULT_GLOBAL_CONTROLS.globalElasticity,
      description: 'Factor de suavizado y elasticidad para transiciones',
      icon: '🌊'
    },
    {
      id: 'globalIntensity',
      label: 'Intensidad Global',
      type: 'slider' as const,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: DEFAULT_GLOBAL_CONTROLS.globalIntensity,
      description: 'Multiplicador de intensidad/amplitud para efectos',
      icon: '💪'
    },
    {
      id: 'globalDamping',
      label: 'Amortiguación Global',
      type: 'slider' as const,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      defaultValue: DEFAULT_GLOBAL_CONTROLS.globalDamping,
      description: 'Factor de amortiguación por distancia',
      icon: '🎯'
    }
  ];
}
