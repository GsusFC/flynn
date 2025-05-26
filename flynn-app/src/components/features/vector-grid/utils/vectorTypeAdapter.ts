import { AnimatedVectorItem } from '../animations/types';

/**
 * Tipo para los vectores en el sistema antiguo
 */
export interface LegacyVectorItem {
  id: string;
  x: number;
  y: number;
  angle?: number;
  length?: number;
  width?: number;
  opacity?: number;
  r?: number;
  c?: number;
  [key: string]: unknown; // Para cualquier otra propiedad adicional
}

/**
 * Convierte un vector del formato antiguo al nuevo formato
 * @param legacyVector Vector en formato antiguo
 * @returns Vector en formato nuevo (AnimatedVectorItem)
 */
export function convertToAnimatedVector(legacyVector: LegacyVectorItem): AnimatedVectorItem {
  // Asegurarse de preservar todas las propiedades de posición y estilo
  const angle = legacyVector.angle || 0;
  const length = legacyVector.length || 10;
  const width = legacyVector.width || 2;
  const opacity = legacyVector.opacity || 1;
  
  return {
    id: legacyVector.id,
    // Current position
    x: legacyVector.x,
    y: legacyVector.y,
    // Base position
    baseX: legacyVector.x,
    baseY: legacyVector.y,
    // Original position for animations
    originalX: legacyVector.x,
    originalY: legacyVector.y,
    // Current angle
    angle,
    currentAngle: angle,
    // Base and original angles
    baseAngle: angle,
    originalAngle: angle,
    initialAngle: angle,
    // Previous angle for smooth transitions
    previousAngle: angle,
    // Current length
    length,
    // Base and original length
    baseLength: length,
    originalLength: length,
    // Current width
    width,
    // Base and original width
    baseWidth: width,
    // Current opacity
    opacity,
    // Base and original opacity
    baseOpacity: opacity,
    // Color properties
    color: '#ffffff',
    originalColor: '#ffffff',
    // Factor properties for animations
    lengthFactor: 1,
    widthFactor: 1,
    intensityFactor: 1,
    // Grid position
    r: legacyVector.r,
    c: legacyVector.c,
    // Animation specific data
    animationData: {}
  };
}

/**
 * Convierte un arreglo de vectores del formato antiguo al nuevo formato
 */
export function convertToAnimatedVectors(legacyVectors: LegacyVectorItem[]): AnimatedVectorItem[] {
  return legacyVectors.map(convertToAnimatedVector);
}

/**
 * Interfaz del vector para el renderer (sistema antiguo)
 */
export interface RenderVectorItem {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  opacity: number;
  r?: number;
  c?: number;
  originalX?: number;
  originalY?: number;
  originalAngle?: number;
  originalLength?: number;
  originalColor?: string;
  color?: string;
  lengthFactor?: number;
  widthFactor?: number;
  intensityFactor?: number;
  initialAngle?: number;
  currentAngle?: number;
  customData?: Record<string, unknown>;
  previousAngle?: number;
  animationState?: Record<string, unknown>;
  flockId?: string;
}

/**
 * Convierte un vector del nuevo formato al formato que espera el renderer
 */
export function convertToRenderVector(animatedVector: AnimatedVectorItem): RenderVectorItem {
  // Validación silenciosa y corrección automática para mejor rendimiento
  if (typeof animatedVector.baseX !== 'number' || isNaN(animatedVector.baseX)) {
    animatedVector.baseX = 0;
  }
  if (typeof animatedVector.baseY !== 'number' || isNaN(animatedVector.baseY)) {
    animatedVector.baseY = 0;
  }
  
  // Asegurar que las coordenadas son números enteros para evitar problemas de renderizado
  const baseX = Math.round(animatedVector.baseX);
  const baseY = Math.round(animatedVector.baseY);
  
  return {
    id: animatedVector.id,
    x: baseX, // Usar las coordenadas redondeadas
    y: baseY, // Usar las coordenadas redondeadas
    angle: animatedVector.angle,
    length: animatedVector.length,
    width: animatedVector.width,
    opacity: animatedVector.opacity,
    r: animatedVector.r,
    c: animatedVector.c,
    // Propiedades adicionales para compatibilidad
    originalX: baseX,
    originalY: baseY,
    originalAngle: animatedVector.baseAngle,
    originalLength: animatedVector.baseLength,
    initialAngle: animatedVector.baseAngle,
    currentAngle: animatedVector.angle,
    color: animatedVector.color, // CORREGIDO: usar el color real del vector
    lengthFactor: 1,
    widthFactor: 1,
    intensityFactor: 1,
    animationState: animatedVector.animationData || {}
  };
}

/**
 * Convierte un arreglo de vectores del nuevo formato al formato que espera el renderer
 * @param animatedVectors Vectores en formato nuevo
 * @returns Vectores en formato para el renderer
 */
export function convertToRenderVectors(animatedVectors: AnimatedVectorItem[]): RenderVectorItem[] {
  // Verificar datos para depuración
  if (animatedVectors.length > 0) {
    console.log('[Adaptador] Convirtiendo vectores:', {
      total: animatedVectors.length,
      primerVector: {
        id: animatedVectors[0].id,
        baseX: animatedVectors[0].baseX,
        baseY: animatedVectors[0].baseY,
        color: animatedVectors[0].color // Agregar color para debugging
      }
    });
  }
  
  return animatedVectors.map(convertToRenderVector);
}
