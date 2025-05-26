// Animación "seaWaves" - Simulación orgánica de olas
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle, distance } from '../base/utils';

// Props para la animación seaWaves
interface SeaWavesProps {
  baseFrequency: number;
  baseAmplitude: number;
  rippleFrequency: number;
  rippleAmplitude: number;
  choppiness: number;
  spatialFactor: number;
}

// Función de animación que simula olas del mar
const animateSeaWaves = (
  vectors: SimpleVector[],
  props: SeaWavesProps,
  context: AnimationContext
): SimpleVector[] => {
  const time = context.time * 0.001; // Convertir a segundos
  
  // Pre-calcular constantes temporales para optimizar
  const baseTimePhase = time * props.baseFrequency;
  const rippleTimePhase = time * props.rippleFrequency;
  const rippleTimePhase2 = rippleTimePhase * 0.8;
  const chopTimePhase = rippleTimePhase * 1.5;
  const radialTimePhase = baseTimePhase * 2;
  
  // Pre-calcular factores espaciales constantes
  const spatialBase = props.spatialFactor;
  const spatialBaseY = spatialBase * 0.7;
  const spatialRipple1 = spatialBase * 1.3;
  const spatialRipple2 = spatialBase * 1.1;
  const spatialChopX = spatialBase * 2.1;
  const spatialChopY = spatialBase * 1.9;
  
  // Pre-calcular amplitudes
  const rippleAmp2 = props.rippleAmplitude * 0.7;
  const chopAmp = props.choppiness * 20;
  const radialAmp = props.baseAmplitude * 0.3;
  
  // Pre-calcular centro
  const centerX = context.canvasWidth / 2;
  const centerY = context.canvasHeight / 2;
  
  return vectors.map(vector => {
    // Calcular distancia desde el centro para efecto radial
    const distFromCenter = distance(vector.x, vector.y, centerX, centerY);
    
    // Pre-calcular posiciones espaciales
    const xSpatial = vector.x * spatialBase;
    const ySpatial = vector.y * spatialBaseY;
    
    // Onda base - movimiento principal
    const baseWave = Math.sin(xSpatial + ySpatial + baseTimePhase) * props.baseAmplitude;
    
    // Ondas secundarias - ripples
    const ripple1 = Math.sin((vector.x * spatialRipple1) + rippleTimePhase) * props.rippleAmplitude;
    const ripple2 = Math.cos((vector.y * spatialRipple2) + rippleTimePhase2) * rippleAmp2;
    
    // Efecto de "choppiness" - variaciones más agudas
    const chop = Math.sin(
      (vector.x * spatialChopX) + 
      (vector.y * spatialChopY) + 
      chopTimePhase
    ) * chopAmp;
    
    // Efecto radial desde el centro
    const radialEffect = Math.sin((distFromCenter * 0.01) + radialTimePhase) * radialAmp;
    
    // Combinar todas las ondas
    const totalOffset = baseWave + ripple1 + ripple2 + chop + radialEffect;
    
    // Aplicar al ángulo original
    const finalAngle = vector.originalAngle + totalOffset;
    
    return {
      ...vector,
      angle: normalizeAngle(finalAngle)
    };
  });
};

// Validación de props
const validateSeaWavesProps = (props: SeaWavesProps): boolean => {
  if (typeof props.baseFrequency !== 'number' || props.baseFrequency <= 0) {
    console.warn('[seaWaves] La frecuencia base debe ser un número positivo');
    return false;
  }
  if (typeof props.baseAmplitude !== 'number' || props.baseAmplitude <= 0) {
    console.warn('[seaWaves] La amplitud base debe ser un número positivo');
    return false;
  }
  if (typeof props.choppiness !== 'number' || props.choppiness < 0 || props.choppiness > 1) {
    console.warn('[seaWaves] El choppiness debe estar entre 0 y 1');
    return false;
  }
  return true;
};

// Exportar la animación seaWaves
export const seaWavesAnimation = createSimpleAnimation<SeaWavesProps>({
  id: 'seaWaves',
  name: 'Olas del mar',
  description: 'Simulación orgánica de olas combinando múltiples funciones sinusoidales',
  category: 'waves',
  icon: '🌊',
  controls: [
    {
      id: 'baseFrequency',
      label: 'Frecuencia base',
      type: 'slider',
      min: 0.001,
      max: 0.01,
      step: 0.001,
      defaultValue: 0.003,
      description: 'Frecuencia de la onda principal (0.001-0.01)',
      icon: '📡'
    },
    {
      id: 'baseAmplitude',
      label: 'Amplitud base',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 30,
      description: 'Amplitud de la onda principal (10-100°)',
      icon: '📊'
    },
    {
      id: 'rippleFrequency',
      label: 'Frecuencia ripples',
      type: 'slider',
      min: 0.001,
      max: 0.02,
      step: 0.001,
      defaultValue: 0.005,
      description: 'Frecuencia de las ondas secundarias (0.001-0.02)',
      icon: '〰️'
    },
    {
      id: 'rippleAmplitude',
      label: 'Amplitud ripples',
      type: 'slider',
      min: 5,
      max: 50,
      step: 2,
      defaultValue: 15,
      description: 'Amplitud de las ondas secundarias (5-50°)',
      icon: '📈'
    },
    {
      id: 'choppiness',
      label: 'Agitación',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Factor de agitación para variaciones agudas (0-1)',
      icon: '⚡'
    },
    {
      id: 'spatialFactor',
      label: 'Factor espacial',
      type: 'slider',
      min: 0.005,
      max: 0.05,
      step: 0.005,
      defaultValue: 0.01,
      description: 'Cómo la posición afecta la onda (0.005-0.05)',
      icon: '🗺️'
    }
  ],
  defaultProps: {
    baseFrequency: 0.003,
    baseAmplitude: 30,
    rippleFrequency: 0.005,
    rippleAmplitude: 15,
    choppiness: 0.5,
    spatialFactor: 0.01
  },
  animate: animateSeaWaves,
  validateProps: validateSeaWavesProps
});
