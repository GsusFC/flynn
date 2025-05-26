// Animación "geometricPattern" - Patrón Geométrico CORREGIDO
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';
import { 
  applyGlobalSpeed, 
  applyGlobalIntensity, 
  extractGlobalControls,
  applyDistanceDamping 
} from '../../../utils/globalAnimationControls';

// Props para la animación geometricPattern
interface GeometricPatternProps {
  rotationSpeed: number;
  patternType: 'radial' | 'tangential' | 'spiral';
  centerInfluence: number;
  patternIntensity: number;
}

// Cache para maxDistance (calculado una vez por canvas size)
let cachedMaxDistance = 0;
let cachedCanvasKey = '';

// Función de animación ULTRA-OPTIMIZADA para mejor rendimiento
const animateGeometricPattern = (
  vectors: SimpleVector[],
  props: GeometricPatternProps,
  context: AnimationContext
): SimpleVector[] => {
  // Optimización: salir temprano si no hay influencia del centro
  if (props.centerInfluence <= 0) {
    return vectors;
  }

  // Extraer controles globales
  const globalControls = extractGlobalControls(props as unknown as Record<string, unknown>);
  
  const centerX = context.canvasWidth * 0.5;
  const centerY = context.canvasHeight * 0.5;
  
  // Cache para maxDistance
  const canvasKey = `${context.canvasWidth}x${context.canvasHeight}`;
  if (canvasKey !== cachedCanvasKey) {
    cachedMaxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    cachedCanvasKey = canvasKey;
  }
  
  // Pre-calcular valores que no cambian por vector
  const effectiveSpeed = applyGlobalSpeed(props.rotationSpeed, globalControls);
  const timeFactor = context.time * effectiveSpeed * 0.001;
  const effectiveIntensity = applyGlobalIntensity(props.patternIntensity, globalControls);
  const rotationOffset = timeFactor * 2;
  const blend = props.centerInfluence;
  const oneMinusBlend = 1 - blend;
  
  // Pre-calcular constantes por tipo de patrón
  const isRadial = props.patternType === 'radial';
  const isTangential = props.patternType === 'tangential';
  const isSpiral = props.patternType === 'spiral';
  const piHalf = isTangential ? Math.PI * 0.5 : 0;
  const spiralFactor = isSpiral ? 0.01 : 0;

  return vectors.map(vector => {
    // Calcular posición relativa al centro
    const dx = vector.originalX - centerX;
    const dy = vector.originalY - centerY;
    
    // Calcular ángulo base una sola vez
    const baseAngleRaw = Math.atan2(dy, dx);
    
    // Aplicar patrón específico de forma optimizada
    let baseAngle: number;
    let distance = 0;
    
    if (isRadial) {
      baseAngle = baseAngleRaw;
    } else if (isTangential) {
      baseAngle = baseAngleRaw + piHalf;
    } else { // spiral
      distance = Math.sqrt(dx * dx + dy * dy);
      baseAngle = baseAngleRaw + distance * spiralFactor + timeFactor;
    }

    // Aplicar rotación temporal
    baseAngle += rotationOffset;

    // Mantener ángulo en radianes - no convertir a grados innecesariamente
    const angleOffset = baseAngle * effectiveIntensity;

    // Calcular distance solo si no se calculó antes (para damping)
    if (distance === 0) {
      distance = Math.sqrt(dx * dx + dy * dy);
    }

    // Aplicar amortiguación por distancia
    const dampedOffset = applyDistanceDamping(
      angleOffset, 
      distance, 
      cachedMaxDistance, 
      globalControls
    );
    
    // Mezclar ángulos
    const finalAngle = normalizeAngle(
      vector.originalAngle * oneMinusBlend + dampedOffset * blend
    );

    return {
      ...vector,
      angle: finalAngle
    };
  });
};

// Validación de props mejorada
const validateGeometricPatternProps = (props: GeometricPatternProps): boolean => {
  if (typeof props.rotationSpeed !== 'number' || isNaN(props.rotationSpeed)) {
    console.warn('[geometricPattern] La velocidad de rotación debe ser un número');
    return false;
  }
  if (!['radial', 'tangential', 'spiral'].includes(props.patternType)) {
    console.warn('[geometricPattern] El tipo de patrón debe ser radial, tangential o spiral');
    return false;
  }
  if (typeof props.centerInfluence !== 'number' || isNaN(props.centerInfluence) || 
      props.centerInfluence < 0 || props.centerInfluence > 1) {
    console.warn('[geometricPattern] La influencia del centro debe ser un número entre 0 y 1');
    return false;
  }
  if (typeof props.patternIntensity !== 'number' || isNaN(props.patternIntensity) || 
      props.patternIntensity < 0 || props.patternIntensity > 2) {
    console.warn('[geometricPattern] La intensidad del patrón debe ser un número entre 0 y 2');
    return false;
  }
  return true;
};

// Exportar la animación geometricPattern corregida
export const geometricPatternAnimation = createSimpleAnimation<GeometricPatternProps>({
  id: 'geometricPattern',
  name: 'Patrón Geométrico Avanzado',
  description: 'Patrones geométricos con controles globales y movimiento orgánico',
  category: 'advanced',
  icon: '🔷',
  controls: [
    {
      id: 'rotationSpeed',
      label: 'Velocidad Rotación',
      type: 'slider',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Velocidad de rotación del patrón (afectada por velocidad global)',
      icon: '🔄'
    },
    {
      id: 'patternType',
      label: 'Tipo de Patrón',
      type: 'select',
      options: [
        { value: 'radial', label: '📡 Radial (Desde Centro)' },
        { value: 'tangential', label: '🌀 Tangencial (Circular)' },
        { value: 'spiral', label: '🌪️ Espiral (Dinámico)' }
      ],
      defaultValue: 'tangential',
      description: 'Tipo de patrón geométrico',
      icon: '📐'
    },
    {
      id: 'centerInfluence',
      label: 'Influencia Centro',
      type: 'slider',
      min: 0.0,
      max: 1.0,
      step: 0.1,
      defaultValue: 0.8,
      description: 'Influencia del centro en el patrón (0=sin efecto, 1=máximo)',
      icon: '🎯'
    },
    {
      id: 'patternIntensity',
      label: 'Intensidad Patrón',
      type: 'slider',
      min: 0.0,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Intensidad del efecto del patrón (afectada por intensidad global)',
      icon: '💪'
    }
  ],
  defaultProps: {
    rotationSpeed: 0.5,
    patternType: 'tangential',
    centerInfluence: 0.8,
    patternIntensity: 1.0
  },
  animate: animateGeometricPattern,
  validateProps: validateGeometricPatternProps
});
