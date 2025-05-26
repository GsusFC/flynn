// Utilidades para vectores dinámicos
// Cálculos de longitud y grosor dinámicos basados en animación

import type { SimpleVector, DynamicVectorConfig } from '../simple/simpleTypes';

/**
 * Calcula la intensidad de la animación basada en el cambio de ángulo
 */
export const calculateAnimationIntensity = (
  currentAngle: number,
  previousAngle: number,
  maxChange: number = 180
): number => {
  if (previousAngle === undefined) return 0;
  
  const angleDelta = Math.abs(currentAngle - previousAngle);
  // Normalizar el cambio de ángulo considerando el wrap-around (0-360)
  const normalizedDelta = Math.min(angleDelta, 360 - angleDelta);
  
  return Math.min(normalizedDelta / maxChange, 1);
};

/**
 * Calcula la longitud dinámica de un vector
 */
export const calculateDynamicLength = (
  vector: SimpleVector,
  config: DynamicVectorConfig,
  animationIntensity: number = 0
): number => {
  console.log('📏 calculateDynamicLength called:', {
    enableDynamicLength: config.enableDynamicLength,
    baseLength: vector.length,
    animationIntensity,
    lengthMultiplier: config.lengthMultiplier
  });

  if (!config.enableDynamicLength) {
    console.log('📏 Early exit: dynamic length disabled');
    return vector.length;
  }

  const baseLength = vector.length;
  
  // Factor basado en la intensidad de la animación
  const intensityFactor = 1 + (animationIntensity * config.lengthMultiplier * 0.5);
  
  // Factor basado en el cambio de ángulo
  const angleDelta = vector.previousAngle !== undefined 
    ? calculateAnimationIntensity(vector.angle, vector.previousAngle)
    : 0;
  
  const changeFactor = 1 + (angleDelta * config.responsiveness * 0.3);
  
  // Factor basado en la intensidad del vector (si está disponible)
  const vectorIntensityFactor = vector.intensity !== undefined
    ? 1 + (vector.intensity * config.lengthMultiplier * 0.4)
    : 1;
  
  const dynamicLength = baseLength * intensityFactor * changeFactor * vectorIntensityFactor;
  
  // Aplicar límites razonables
  const minLength = baseLength * 0.3;
  const maxLength = baseLength * 3.0;
  
  return Math.max(minLength, Math.min(maxLength, dynamicLength));
};

/**
 * Calcula el grosor dinámico de un vector
 */
export const calculateDynamicWidth = (
  vector: SimpleVector,
  config: DynamicVectorConfig,
  animationIntensity: number = 0
): number => {
  if (!config.enableDynamicWidth) {
    return vector.width;
  }

  const baseWidth = vector.width;
  
  // Factor basado en la intensidad de la animación
  const intensityFactor = 1 + (animationIntensity * config.widthMultiplier * 0.4);
  
  // Factor basado en el cambio de ángulo (más sutil que la longitud)
  const angleDelta = vector.previousAngle !== undefined 
    ? calculateAnimationIntensity(vector.angle, vector.previousAngle)
    : 0;
  
  const changeFactor = 1 + (angleDelta * config.responsiveness * 0.2);
  
  // Factor basado en la intensidad del vector
  const vectorIntensityFactor = vector.intensity !== undefined
    ? 1 + (vector.intensity * config.widthMultiplier * 0.3)
    : 1;
  
  const dynamicWidth = baseWidth * intensityFactor * changeFactor * vectorIntensityFactor;
  
  // Aplicar límites razonables
  const minWidth = Math.max(1, baseWidth * 0.5);
  const maxWidth = baseWidth * 2.5;
  
  return Math.max(minWidth, Math.min(maxWidth, dynamicWidth));
};

/**
 * Aplica suavizado a los cambios dinámicos para evitar saltos bruscos
 */
export const applySmoothingToVector = (
  currentVector: SimpleVector,
  previousVector: SimpleVector | undefined,
  config: DynamicVectorConfig
): SimpleVector => {
  if (!previousVector || config.smoothing === 0) {
    return currentVector;
  }

  const smoothingFactor = Math.max(0, Math.min(1, config.smoothing));
  
  // Suavizar longitud dinámica
  const smoothedLength = currentVector.dynamicLength !== undefined && previousVector.dynamicLength !== undefined
    ? previousVector.dynamicLength + (currentVector.dynamicLength - previousVector.dynamicLength) * smoothingFactor
    : currentVector.dynamicLength;
  
  // Suavizar grosor dinámico
  const smoothedWidth = currentVector.dynamicWidth !== undefined && previousVector.dynamicWidth !== undefined
    ? previousVector.dynamicWidth + (currentVector.dynamicWidth - previousVector.dynamicWidth) * smoothingFactor
    : currentVector.dynamicWidth;

  return {
    ...currentVector,
    dynamicLength: smoothedLength,
    dynamicWidth: smoothedWidth
  };
};

/**
 * Actualiza un vector con propiedades dinámicas
 */
export const updateVectorWithDynamics = (
  vector: SimpleVector,
  previousVector: SimpleVector | undefined,
  config: DynamicVectorConfig,
  globalAnimationIntensity: number = 0
): SimpleVector => {
  // Calcular intensidad específica del vector
  const vectorIntensity = vector.previousAngle !== undefined
    ? calculateAnimationIntensity(vector.angle, vector.previousAngle)
    : 0;
  
  // Combinar intensidad global y específica del vector
  const combinedIntensity = Math.max(globalAnimationIntensity, vectorIntensity);
  
  // Calcular propiedades dinámicas
  const dynamicLength = calculateDynamicLength(vector, config, combinedIntensity);
  const dynamicWidth = calculateDynamicWidth(vector, config, combinedIntensity);
  
  // Crear vector actualizado
  const updatedVector: SimpleVector = {
    ...vector,
    dynamicLength,
    dynamicWidth,
    intensity: combinedIntensity,
    previousAngle: vector.angle
  };
  
  // Aplicar suavizado si está configurado
  return applySmoothingToVector(updatedVector, previousVector, config);
};

/**
 * Actualiza un array completo de vectores con dinámicas
 */
export const updateVectorsWithDynamics = (
  vectors: SimpleVector[],
  previousVectors: SimpleVector[] | undefined,
  config: DynamicVectorConfig,
  globalAnimationIntensity: number = 0
): SimpleVector[] => {
  return vectors.map((vector, index) => {
    const previousVector = previousVectors?.[index];
    return updateVectorWithDynamics(vector, previousVector, config, globalAnimationIntensity);
  });
};

/**
 * Calcula la intensidad global de la animación basada en todos los vectores
 */
export const calculateGlobalAnimationIntensity = (
  vectors: SimpleVector[],
  previousVectors: SimpleVector[] | undefined
): number => {
  if (!previousVectors || previousVectors.length !== vectors.length) {
    return 0;
  }

  let totalIntensity = 0;
  let validVectors = 0;

  for (let i = 0; i < vectors.length; i++) {
    const current = vectors[i];
    const previous = previousVectors[i];
    
    if (previous) {
      const intensity = calculateAnimationIntensity(current.angle, previous.angle);
      totalIntensity += intensity;
      validVectors++;
    }
  }

  return validVectors > 0 ? totalIntensity / validVectors : 0;
};

/**
 * Configuración por defecto para vectores dinámicos
 */
export const DEFAULT_DYNAMIC_CONFIG: DynamicVectorConfig = {
  enableDynamicLength: false,
  enableDynamicWidth: false,
  lengthMultiplier: 1.0,
  widthMultiplier: 1.0,
  responsiveness: 0.7,
  smoothing: 0.8
};

/**
 * Valida y normaliza la configuración de vectores dinámicos
 */
export const validateDynamicConfig = (config: Partial<DynamicVectorConfig>): DynamicVectorConfig => {
  const validated = {
    enableDynamicLength: config.enableDynamicLength ?? DEFAULT_DYNAMIC_CONFIG.enableDynamicLength,
    enableDynamicWidth: config.enableDynamicWidth ?? DEFAULT_DYNAMIC_CONFIG.enableDynamicWidth,
    lengthMultiplier: Math.max(0.1, Math.min(3.0, config.lengthMultiplier ?? DEFAULT_DYNAMIC_CONFIG.lengthMultiplier)),
    widthMultiplier: Math.max(0.1, Math.min(3.0, config.widthMultiplier ?? DEFAULT_DYNAMIC_CONFIG.widthMultiplier)),
    responsiveness: Math.max(0.0, Math.min(1.0, config.responsiveness ?? DEFAULT_DYNAMIC_CONFIG.responsiveness)),
    smoothing: Math.max(0.0, Math.min(1.0, config.smoothing ?? DEFAULT_DYNAMIC_CONFIG.smoothing))
  };

  console.log('🔧 validateDynamicConfig:', {
    input: config,
    output: validated
  });

  return validated;
};
