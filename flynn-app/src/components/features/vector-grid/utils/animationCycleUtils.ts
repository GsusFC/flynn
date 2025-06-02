// Utilidades para detección de ciclos de animación
// Para generar GIFs con bucles perfectos

import type { AnimationType, AnimationCycle } from '../simple/simpleTypes';

/**
 * Configuraciones de ciclo por tipo de animación
 * Basado en análisis matemático de cada animación
 */
const ANIMATION_CYCLE_CONFIGS: Record<AnimationType, AnimationCycle> = {
  none: {
    duration: 1000,
    frameCount: 30,
    isDetected: true
  },
  smoothWaves: {
    duration: 4000,
    frameCount: 120,
    isDetected: true
  },
  mouseInteraction: {
    duration: 2000,
    frameCount: 60,
    isDetected: false // Depende de la interacción del usuario
  },
  randomLoop: {
    duration: 2000,
    frameCount: 60,
    isDetected: false // Aleatorio por naturaleza
  },
  centerPulse: {
    duration: 1000,
    frameCount: 30,
    isDetected: true
  },
  seaWaves: {
    duration: 6000,
    frameCount: 180,
    isDetected: true
  },
  tangenteClasica: {
    duration: 8000,
    frameCount: 240,
    isDetected: true
  },
  lissajous: {
    duration: 5000,
    frameCount: 150,
    isDetected: true
  },
  perlinFlow: {
    duration: 10000,
    frameCount: 300,
    isDetected: true
  },
  geometricPattern: {
    duration: 6000,
    frameCount: 180,
    isDetected: true
  },
  vortex: {
    duration: 5000,
    frameCount: 150,
    isDetected: true
  },
  pinwheels: {
    duration: 8000,
    frameCount: 240,
    isDetected: true
  },
  rippleEffect: {
    duration: 4000,
    frameCount: 120,
    isDetected: true
  },
  jitter: {
    duration: 3000,
    frameCount: 90,
    isDetected: true
  },
  flowField: {
    duration: 8000,
    frameCount: 240,
    isDetected: true
  },
  curlNoise: {
    duration: 12000,
    frameCount: 360,
    isDetected: true
  }
};

/**
 * Detecta el ciclo de animación para un tipo específico
 */
export const detectAnimationCycle = (
  animationType: AnimationType,
  customDuration?: number,
  customFps: number = 30
): AnimationCycle => {
  const baseConfig = ANIMATION_CYCLE_CONFIGS[animationType];
  
  if (customDuration) {
    return {
      duration: customDuration,
      frameCount: Math.ceil((customDuration / 1000) * customFps),
      isDetected: false // Personalizado por el usuario
    };
  }
  
  return {
    ...baseConfig,
    frameCount: Math.ceil((baseConfig.duration / 1000) * customFps)
  };
};

/**
 * Calcula el momento óptimo para comenzar la captura
 * Para asegurar que el bucle sea perfecto
 */
export const calculateOptimalStartTime = (
  animationType: AnimationType,
  currentTime: number
): number => {
  const cycle = ANIMATION_CYCLE_CONFIGS[animationType];
  
  if (!cycle.isDetected) {
    return currentTime; // Para animaciones no determinísticas
  }
  
  // Calcular el offset dentro del ciclo actual
  const cyclePosition = currentTime % cycle.duration;
  
  // Si estamos cerca del inicio del ciclo, empezar ahora
  if (cyclePosition < cycle.duration * 0.1) {
    return currentTime;
  }
  
  // Sino, esperar al próximo ciclo
  const timeToNextCycle = cycle.duration - cyclePosition;
  return currentTime + timeToNextCycle;
};

/**
 * Genera timestamps para captura de frames con bucle perfecto
 */
export const generateFrameTimestamps = (
  cycle: AnimationCycle,
  startTime: number
): number[] => {
  const timestamps: number[] = [];
  const frameInterval = cycle.duration / cycle.frameCount;
  
  for (let i = 0; i < cycle.frameCount; i++) {
    timestamps.push(startTime + (i * frameInterval));
  }
  
  return timestamps;
};

/**
 * Verifica si dos estados de animación son similares (para detectar ciclos)
 */
export const areAnimationStatesSimilar = (
  state1: unknown,
  state2: unknown,
  tolerance: number = 0.01
): boolean => {
  if (typeof state1 !== typeof state2) return false;
  
  if (typeof state1 === 'number' && typeof state2 === 'number') {
    return Math.abs(state1 - state2) < tolerance;
  }
  
  if (Array.isArray(state1) && Array.isArray(state2)) {
    if (state1.length !== state2.length) return false;
    
    return state1.every((val, index) => 
      areAnimationStatesSimilar(val, state2[index], tolerance)
    );
  }
  
  if (typeof state1 === 'object' && state1 !== null && state2 !== null) {
    const obj1 = state1 as Record<string, unknown>;
    const obj2 = state2 as Record<string, unknown>;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      areAnimationStatesSimilar(obj1[key], obj2[key], tolerance)
    );
  }
  
  return state1 === state2;
};

/**
 * Detecta automáticamente el ciclo de una animación mediante muestreo
 */
export const autoDetectAnimationCycle = async (
  animationType: AnimationType
): Promise<AnimationCycle> => {
  // Para animaciones conocidas, usar configuración predefinida
  if (ANIMATION_CYCLE_CONFIGS[animationType].isDetected) {
    return ANIMATION_CYCLE_CONFIGS[animationType];
  }
  
  // Para animaciones desconocidas o aleatorias, usar duración por defecto
  return {
    duration: 5000,
    frameCount: 150,
    isDetected: false
  };
};

/**
 * Optimiza la duración del ciclo para diferentes formatos de exportación
 */
export const optimizeCycleForFormat = (
  cycle: AnimationCycle,
  format: 'gif' | 'svg' | 'video',
  targetFileSize?: number
): AnimationCycle => {
  const optimizedCycle = { ...cycle };
  
  switch (format) {
    case 'gif':
      // Para GIF, optimizar para tamaño de archivo
      if (targetFileSize && targetFileSize < 5 * 1024 * 1024) { // < 5MB
        optimizedCycle.frameCount = Math.min(optimizedCycle.frameCount, 60);
        optimizedCycle.duration = Math.min(optimizedCycle.duration, 3000);
      }
      break;
      
    case 'svg':
      // Para SVG animado, mantener alta calidad
      optimizedCycle.frameCount = Math.max(optimizedCycle.frameCount, 60);
      break;
      
    case 'video':
      // Para video, usar frame rates estándar
      const standardFps = [24, 30, 60];
      const currentFps = optimizedCycle.frameCount / (optimizedCycle.duration / 1000);
      const closestFps = standardFps.reduce((prev, curr) => 
        Math.abs(curr - currentFps) < Math.abs(prev - currentFps) ? curr : prev
      );
      optimizedCycle.frameCount = Math.ceil((optimizedCycle.duration / 1000) * closestFps);
      break;
  }
  
  return optimizedCycle;
};

/**
 * Calcula el progreso de captura basado en el ciclo
 */
export const calculateCaptureProgress = (
  currentFrame: number,
  totalFrames: number
): number => {
  return Math.min(currentFrame / totalFrames, 1);
};

/**
 * Genera metadatos del ciclo para incluir en la exportación
 */
export const generateCycleMetadata = (
  animationType: AnimationType,
  cycle: AnimationCycle
): Record<string, string | number | boolean> => {
  return {
    animationType,
    cycleDuration: cycle.duration,
    frameCount: cycle.frameCount,
    fps: cycle.frameCount / (cycle.duration / 1000),
    isDetected: cycle.isDetected,
    generatedAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Valida que un ciclo sea válido para exportación
 */
export const validateCycle = (cycle: AnimationCycle): boolean => {
  return (
    cycle.duration > 0 &&
    cycle.frameCount > 0 &&
    cycle.duration <= 30000 && // Máximo 30 segundos
    cycle.frameCount <= 900 // Máximo 900 frames (30fps * 30s)
  );
};
