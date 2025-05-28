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

  // Props ya validadas y limpias

  // Extraer controles globales
  const globalControls = extractGlobalControls(props as unknown as Record<string, unknown>);
  
  const centerX = context.canvasWidth * 0.5;
  const centerY = context.canvasHeight * 0.5;
  
  // Pre-calcular valores con fallbacks robustos
  const rotationSpeed = props.rotationSpeed ?? 0.3;
  const patternType = props.patternType ?? 'tangential';
  const spiralIntensity = props.spiralIntensity ?? 0.01;
  
  const effectiveSpeed = applyGlobalSpeed(rotationSpeed, globalControls);
  const timeFactor = context.time * effectiveSpeed * 0.001;
  
  // Constantes optimizadas
  const piHalf = Math.PI * 0.5;

  return vectors.map(vector => {
    // Calcular posición relativa al centro
    const dx = vector.originalX - centerX;
    const dy = vector.originalY - centerY;
    
    // ALGORITMO ORIGINAL: ángulo hacia el centro
    const angleToCenter = Math.atan2(dy, dx);
    
    // Calcular distancia para todos los patrones (necesario para intensidad)
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Aplicar patrón específico basado en el algoritmo original
    let tangentialAngle: number;
    
    if (patternType === 'radial') {
      // Radial: directamente hacia/desde el centro
      tangentialAngle = angleToCenter;
    } else if (patternType === 'tangential') {
      // Tangencial: perpendicular al radio (ALGORITMO ORIGINAL)
      tangentialAngle = angleToCenter + piHalf;
    } else { // spiral
      // Espiral: tangencial + factor de distancia
      tangentialAngle = angleToCenter + piHalf + distance * spiralIntensity;
    }

    // ALGORITMO ORIGINAL: rotación temporal uniforme (efecto agujas de reloj)
    // Ajustamos la velocidad de rotación usando effectiveSpeed
    tangentialAngle += timeFactor;

    // Convertir a grados
    const finalAngle = normalizeAngle(tangentialAngle * (180 / Math.PI));

    return {
      ...vector,
      angle: finalAngle
    };
  });
};

// Validación de props mejorada
const validateGeometricPatternProps = (props: any): boolean => {
  // Validar rotationSpeed con fallback robusto
  const rotationSpeed = props.rotationSpeed ?? props.speed ?? 0.3;
  const finalRotationSpeed = typeof rotationSpeed === 'string' ? parseFloat(rotationSpeed) : rotationSpeed;
  
  if (typeof finalRotationSpeed !== 'number' || isNaN(finalRotationSpeed)) {
    console.warn('[geometricPattern] rotationSpeed inválido, usando default 0.3:', props.rotationSpeed);
    return true; // No invalidar, usar default
  }
  const patternType = props.patternType ?? 'tangential';
  if (!['radial', 'tangential', 'spiral'].includes(patternType)) {
    console.warn('[geometricPattern] patternType inválido, usando default tangential:', props.patternType);
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
