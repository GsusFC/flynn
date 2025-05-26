// Animación "centerPulse" - Pulso radial desde el centro CORREGIDO COMPLETAMENTE
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { 
  applyGlobalSpeed, 
  applyGlobalIntensity, 
  extractGlobalControls,
  applyDistanceDamping 
} from '../../../utils/globalAnimationControls';

// Props para la animación centerPulse - CORREGIDO: continuous como string
interface CenterPulseProps {
  pulseSpeed: number;
  pulseIntensity: number;
  pulseRadius: number;
  continuous: string; // String para compatibilidad con el sistema de controles
  pulseFrequency: number;
  waveType: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

// Función para generar diferentes tipos de ondas MEJORADA
const generateWave = (phase: number, waveType: 'sine' | 'square' | 'triangle' | 'sawtooth'): number => {
  const normalizedPhase = phase % (2 * Math.PI);
  
  switch (waveType) {
    case 'sine':
      return Math.sin(normalizedPhase);
    
    case 'square':
      // Onda cuadrada más pronunciada
      return normalizedPhase < Math.PI ? 1 : -1;
    
    case 'triangle':
      // Onda triangular corregida
      if (normalizedPhase < Math.PI) {
        return (2 * normalizedPhase) / Math.PI - 1;
      } else {
        return 3 - (2 * normalizedPhase) / Math.PI;
      }
    
    case 'sawtooth':
      // Onda diente de sierra más clara
      return (normalizedPhase / Math.PI) - 1;
    
    default:
      return Math.sin(normalizedPhase);
  }
};

// Cache para maxDistance (calculado una vez por canvas size)
let cachedMaxDistance = 0;
let cachedCanvasKey = '';

// Función de animación COMPLETAMENTE CORREGIDA con pulso único
const animateCenterPulse = (
  vectors: SimpleVector[],
  props: CenterPulseProps,
  context: AnimationContext
): SimpleVector[] => {
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
  
  // NUEVA LÓGICA: Pulso único vs continuo
  const isContinuous = props.continuous === 'true';
  const hasPulse = context.pulseCenter !== null;
  
  // Si es modo pulso único y no hay pulso activo, mantener vectores estáticos
  if (!isContinuous && !hasPulse) {
    return vectors.map(vector => ({
      ...vector,
      angle: vector.originalAngle // Mantener ángulo original
    }));
  }
  
  // Aplicar velocidad global
  const effectiveSpeed = applyGlobalSpeed(props.pulseSpeed, globalControls);
  const time = context.time * effectiveSpeed;
  
  // Aplicar intensidad global - AUMENTADA para hacer más visible el efecto
  const effectiveIntensity = applyGlobalIntensity(props.pulseIntensity, globalControls);
  
  // Pre-calcular valores que no cambian por vector
  const dampingFactor = 0.4;
  const maxDistanceWithDamping = cachedMaxDistance * dampingFactor;
  const twoPi = Math.PI * 2;
  const radToDeg = 180 / Math.PI;
  
  return vectors.map(vector => {
    // Calcular distancia desde el centro
    const dx = vector.originalX - centerX;
    const dy = vector.originalY - centerY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    // Normalizar distancia usando cached maxDistance
    const normalizedDistance = distanceFromCenter / cachedMaxDistance;
    
    // Calcular ángulo radial (desde el centro hacia afuera)
    const radialAngle = Math.atan2(dy, dx);
    
    // Crear efecto de pulso con diferentes tipos de ondas - MEJORADO
    let pulseEffect = 0;
    
    if (isContinuous) {
      // MODO CONTINUO: Ondas perpetuas
      const wavePhase = time * props.pulseFrequency - normalizedDistance * props.pulseRadius;
      const waveValue = generateWave(wavePhase, props.waveType);
      
      // CORRECCIÓN: Amplificar el efecto moderadamente 
      pulseEffect = waveValue * effectiveIntensity * 0.8; // Factor reducido para movimiento más sutil
    } else if (hasPulse) {
      // MODO PULSO ÚNICO: Solo cuando hay pulso activo
      const pulsePhase = (time % twoPi) - normalizedDistance * props.pulseRadius;
      if (pulsePhase > 0 && pulsePhase < Math.PI) {
        const waveValue = generateWave(pulsePhase, props.waveType);
        
        // CORRECCIÓN: Amplificar el efecto moderadamente
        pulseEffect = waveValue * effectiveIntensity * 0.8; // Factor reducido para movimiento más sutil
      }
    }
    
    // Aplicar amortiguación por distancia (usar valor pre-calculado)
    pulseEffect = applyDistanceDamping(
      pulseEffect, 
      distanceFromCenter, 
      maxDistanceWithDamping, 
      globalControls
    );
    
    // CORRECCIÓN PRINCIPAL: Aplicar el efecto directamente en grados
    // En lugar de aplicar al ángulo radial, aplicar como offset angular directo
    let finalAngleDegrees = (radialAngle * radToDeg) + pulseEffect;
    
    // Normalizar ángulo
    while (finalAngleDegrees < 0) finalAngleDegrees += 360;
    while (finalAngleDegrees >= 360) finalAngleDegrees -= 360;
    
    return {
      ...vector,
      angle: finalAngleDegrees
    };
  });
};

// Validación de props CORREGIDA para string
const validateCenterPulseProps = (props: CenterPulseProps): boolean => {
  return (
    typeof props.pulseSpeed === 'number' &&
    typeof props.pulseIntensity === 'number' &&
    typeof props.pulseRadius === 'number' &&
    typeof props.continuous === 'string' && // String
    typeof props.pulseFrequency === 'number' &&
    typeof props.waveType === 'string' &&
    props.pulseSpeed > 0 &&
    props.pulseIntensity >= 0 &&
    props.pulseRadius > 0 &&
    props.pulseFrequency > 0 &&
    (props.continuous === 'true' || props.continuous === 'false') &&
    ['sine', 'square', 'triangle', 'sawtooth'].includes(props.waveType)
  );
};

// Exportar la animación centerPulse COMPLETAMENTE CORREGIDA
export const centerPulseAnimation = createSimpleAnimation<CenterPulseProps>({
  id: 'centerPulse',
  name: 'Pulso Central Avanzado',
  description: 'Pulsos radiales con modo único/continuo y tipos de ondas claramente visibles',
  category: 'advanced',
  icon: '💥',
  controls: [
    {
      id: 'pulseSpeed',
      label: 'Velocidad del Pulso',
      type: 'slider',
      min: 0.001,
      max: 0.02,
      step: 0.001,
      defaultValue: 0.008, // Aumentado para mejor visibilidad
      description: 'Velocidad de propagación del pulso (afectada por velocidad global)',
      icon: '⚡'
    },
    {
      id: 'pulseIntensity',
      label: 'Intensidad',
      type: 'slider',
      min: 5,
      max: 120, // Aumentado el rango
      step: 5,
      defaultValue: 45, // Aumentado para mejor visibilidad
      description: 'Intensidad del efecto de pulso (afectada por intensidad global)',
      icon: '💪'
    },
    {
      id: 'pulseRadius',
      label: 'Radio de Propagación',
      type: 'slider',
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 6, // Ajustado para mejor propagación
      description: 'Velocidad de propagación radial',
      icon: '📡'
    },
    {
      id: 'waveType',
      label: 'Tipo de Onda',
      type: 'select',
      options: [
        { value: 'sine', label: '🌊 Senoidal (Suave)' },
        { value: 'square', label: '⬜ Cuadrada (Digital)' },
        { value: 'triangle', label: '🔺 Triangular (Lineal)' },
        { value: 'sawtooth', label: '🪚 Diente de Sierra' }
      ],
      defaultValue: 'sine',
      description: 'Forma de la onda del pulso - ¡Ahora claramente visible!',
      icon: '〰️'
    },
    {
      id: 'continuous',
      label: 'Modo de Pulso',
      type: 'select',
      options: [
        { value: 'false', label: '🎯 Pulso Único (Estático)' }, // String 'false'
        { value: 'true', label: '🌊 Pulso Continuo (Perpetuo)' } // String 'true'
      ],
      defaultValue: 'false', // String 'false' por defecto
      description: 'Pulso único: estático hasta presionar botón. Continuo: ondas perpetuas',
      icon: '🔄'
    },
    {
      id: 'pulseFrequency',
      label: 'Frecuencia',
      type: 'slider',
      min: 0.5,
      max: 4,
      step: 0.1,
      defaultValue: 1.5, // Reducido para mejor visibilidad
      description: 'Frecuencia del pulso (más efectivo en modo continuo)',
      icon: '🎵'
    }
  ],
  defaultProps: {
    pulseSpeed: 0.008,
    pulseIntensity: 45,
    pulseRadius: 6,
    continuous: 'false', // String 'false' por defecto
    pulseFrequency: 1.5,
    waveType: 'sine'
  },
  animate: animateCenterPulse,
  validateProps: validateCenterPulseProps
});
