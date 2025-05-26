import { AnimatedVectorItem, AnimationType, AnimationParams } from './types';
import { getAnimationImplementation } from './animationRegistry';

/**
 * Motor principal de animación
 * Aplica la animación seleccionada a los vectores según los parámetros actuales
 */
export function updateVectorsWithAnimation(
  vectors: AnimatedVectorItem[],
  animationType: AnimationType,
  animationProps: Record<string, unknown>,
  params: AnimationParams
): AnimatedVectorItem[] {
  // Si no hay tipo de animación o está pausado, mantener los vectores sin cambios
  if (!animationType || params.isPaused) {
    return vectors;
  }
  
  try {
    // Obtener la implementación correspondiente al tipo de animación
    const animation = getAnimationImplementation(animationType);
    
    // Ejecutar la actualización de vectores con la implementación específica
    return animation.update(vectors, params, animationProps || animation.defaultProps);
  } catch (error) {
    console.error(`Error al aplicar animación "${animationType}":`, error);
    
    // En caso de error, devolver los vectores sin cambios
    return vectors;
  }
}

/**
 * Crea un objeto AnimationParams con valores actuales
 * Útil para normalizar los parámetros que se pasan a las funciones de animación
 */
export function createAnimationParams(
  time: number,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
  mouseX: number | null,
  mouseY: number | null,
  isPaused: boolean
): AnimationParams {
  return {
    time,
    deltaTime,
    canvasWidth,
    canvasHeight,
    mousePosition: {
      x: mouseX,
      y: mouseY
    },
    isPaused
  };
}

/**
 * Verifica si dos arrays de vectores son iguales
 * Útil para optimizaciones de renderizado
 */
export function areVectorsEqual(vectorsA: AnimatedVectorItem[], vectorsB: AnimatedVectorItem[]): boolean {
  if (vectorsA.length !== vectorsB.length) return false;
  
  for (let i = 0; i < vectorsA.length; i++) {
    const a = vectorsA[i];
    const b = vectorsB[i];
    
    if (a.id !== b.id || 
        a.angle !== b.angle || 
        a.length !== b.length || 
        a.width !== b.width || 
        a.opacity !== b.opacity) {
      return false;
    }
  }
  
  return true;
}

/**
 * Inicializa un vector con propiedades de animación
 * Útil para asegurarse de que todos los vectores tienen las propiedades necesarias
 */
export function initializeAnimatedVector(vector: Partial<AnimatedVectorItem>): AnimatedVectorItem {
  const baseX = vector.baseX || 0;
  const baseY = vector.baseY || 0;
  const angle = vector.angle || 0;
  const length = vector.length || 10;
  const width = vector.width || 2;
  const opacity = vector.opacity || 1;
  
  return {
    id: vector.id || `vector-${Math.random().toString(36).substring(2, 9)}`,
    // Current position
    x: vector.x || baseX,
    y: vector.y || baseY,
    // Base position
    baseX,
    baseY,
    // Original position for animations
    originalX: vector.originalX || baseX,
    originalY: vector.originalY || baseY,
    // Current angle
    angle,
    currentAngle: vector.currentAngle || angle,
    // Base and original angles
    baseAngle: vector.baseAngle || angle,
    originalAngle: vector.originalAngle || angle,
    initialAngle: vector.initialAngle || angle,
    // Previous angle for smooth transitions
    previousAngle: vector.previousAngle || angle,
    // Current length
    length,
    // Base and original length
    baseLength: vector.baseLength || length,
    originalLength: vector.originalLength || length,
    // Current width
    width,
    // Base and original width
    baseWidth: vector.baseWidth || width,
    // Current opacity
    opacity,
    // Base and original opacity
    baseOpacity: vector.baseOpacity || opacity,
    // Color properties
    color: vector.color || '#ffffff',
    originalColor: vector.originalColor || '#ffffff',
    // Factor properties for animations
    lengthFactor: vector.lengthFactor || 1,
    widthFactor: vector.widthFactor || 1,
    intensityFactor: vector.intensityFactor || 1,
    // Grid position
    r: vector.r,
    c: vector.c,
    // Animation specific data
    animationData: vector.animationData || {},
    animationState: vector.animationState,
    customData: vector.customData,
    flockId: vector.flockId
  };
}
