// Animación "geometricPattern" - Patrón Geométrico CORREGIDO
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';
import { 
  applyGlobalSpeed, 
  extractGlobalControls
} from '../../../utils/globalAnimationControls';

// Props para la animación geometricPattern
interface GeometricPatternProps {
  rotationSpeed: number;
  patternType: 'radial' | 'tangential' | 'spiral';
  spiralIntensity?: number; // Nuevo: Factor para la espiral
}

// Función de animación ULTRA-OPTIMIZADA para mejor rendimiento
const animateGeometricPattern = (
  vectors: SimpleVector[],
  props: GeometricPatternProps,
  context: AnimationContext
): SimpleVector[] => {
  // DEBUG: Log para verificar que se está ejecutando
  console.log('geometricPattern ejecutándose:', {
    patternType: props.patternType,
    rotationSpeed: props.rotationSpeed,
    vectorCount: vectors.length
  });

  // Extraer controles globales
  const globalControls = extractGlobalControls(props as unknown as Record<string, unknown>);
  
  const centerX = context.canvasWidth * 0.5;
  const centerY = context.canvasHeight * 0.5;
  
  // Pre-calcular valores que no cambian por vector (algoritmo original optimizado)
  const effectiveSpeed = applyGlobalSpeed(props.rotationSpeed, globalControls);
  const timeFactor = context.time * effectiveSpeed * 0.001;
  
  // Constantes optimizadas
  const piHalf = Math.PI * 0.5;
  const spiralFactor = 0.01;

  return vectors.map(vector => {
    // Calcular posición relativa al centro
    const dx = vector.originalX - centerX;
    const dy = vector.originalY - centerY;
    
    // ALGORITMO ORIGINAL: ángulo hacia el centro
    const angleToCenter = Math.atan2(dy, dx);
    
    // Aplicar patrón específico basado en el algoritmo original
    let tangentialAngle: number;
    let distance = 0;
    
    if (props.patternType === 'radial') {
      // Radial: directamente hacia/desde el centro
      tangentialAngle = angleToCenter;
    } else if (props.patternType === 'tangential') {
      // Tangencial: perpendicular al radio (ALGORITMO ORIGINAL)
      tangentialAngle = angleToCenter + piHalf;
    } else { // spiral
      // Espiral: tangencial + factor de distancia
      distance = Math.sqrt(dx * dx + dy * dy);
      // Usar el nuevo prop, con un fallback al valor anterior si no está definido
      const currentSpiralFactor = props.spiralIntensity ?? spiralFactor; // spiralFactor (0.01) como fallback
      tangentialAngle = angleToCenter + piHalf + distance * currentSpiralFactor;
    }

    // ALGORITMO ORIGINAL: rotación temporal uniforme (efecto agujas de reloj)
    // Ajustamos la velocidad de rotación usando effectiveSpeed
    tangentialAngle += timeFactor;

    // Convertir a grados
    const finalAngle = normalizeAngle(tangentialAngle * (180 / Math.PI));

    // DEBUG: Log primer vector para ver cambios
    if (vector.originalX === vectors[0].originalX && vector.originalY === vectors[0].originalY) {
      console.log('Primer vector transformado (simplificado):', {
        original: vector.originalAngle,
        tangential: tangentialAngle * (180 / Math.PI),
        finalAngle,
        patternType: props.patternType
      });
    }

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
  // Eliminamos la validación de centerInfluence y patternIntensity si ya no se usan directamente en el cálculo del ángulo
  if (props.patternType === 'spiral' && 
      props.spiralIntensity !== undefined && 
      (typeof props.spiralIntensity !== 'number' || isNaN(props.spiralIntensity))) {
    console.warn('[geometricPattern] La intensidad de la espiral debe ser un número para el tipo espiral');
    // Decidimos no invalidar la prop aquí, ya que tenemos un fallback en la animación.
    // Si fuera crítico, retornaríamos false.
  }
  return true;
};

// Exportar la animación geometricPattern corregida
export const geometricPatternAnimation = createSimpleAnimation<GeometricPatternProps>({
  id: 'geometricPattern',
  name: 'Patrón Geométrico Avanzado',
  description: 'Patrones geométricos con controles globales y movimiento orgánico (ajustado para cienpiés)',
  category: 'advanced',
  icon: '🔷',
  controls: [
    {
      id: 'rotationSpeed',
      label: 'Velocidad Rotación',
      type: 'slider',
      min: 0.01,
      max: 1.0,
      step: 0.01,
      defaultValue: 0.3, // Ajustado a un valor más cercano al original
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
      id: 'spiralIntensity',
      label: 'Intensidad Espiral',
      type: 'slider',
      min: 0.001,
      max: 0.1, 
      step: 0.001,
      defaultValue: 0.01,
      description: 'Ajusta la forma de la espiral (solo para tipo Espiral)',
      icon: '🌀'
    },
    // Eliminamos centerInfluence y patternIntensity de los controles si ya no se usan directamente
  ],
  defaultProps: {
    rotationSpeed: 0.3,
    patternType: 'tangential',
    spiralIntensity: 0.01, // Valor por defecto para la nueva prop
  },
  animate: animateGeometricPattern,
  validateProps: validateGeometricPatternProps
});
