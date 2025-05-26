// Animación "lissajous" - Simulación de curvas de Lissajous con vectores discretos
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación lissajous
interface LissajousProps {
  xFrequency: number;
  yFrequency: number;
  xAmplitude: number;
  yAmplitude: number;
  phaseOffset: number;
  timeSpeed: number;
}

// Función de animación que simula curvas de Lissajous
const animateLissajous = (
  vectors: SimpleVector[],
  props: LissajousProps,
  context: AnimationContext
): SimpleVector[] => {
  const time = context.time * props.timeSpeed;
  const centerX = context.canvasWidth * 0.5;
  const centerY = context.canvasHeight * 0.5;
  
  // Pre-calcular constantes de normalización
  const canvasWidthHalf = context.canvasWidth * 0.5;
  const canvasHeightHalf = context.canvasHeight * 0.5;
  
  // Pre-calcular constantes temporales
  const xFreqTime = props.xFrequency * time;
  const yFreqTime = props.yFrequency * time;
  
  // Pre-calcular constantes trigonométricas
  const twoPi = 2 * Math.PI;
  const radToDeg = 180 / Math.PI;
  
  return vectors.map(vector => {
    // Normalizar posición del vector respecto al centro (optimizado)
    const normalizedX = (vector.originalX - centerX) / canvasWidthHalf;
    const normalizedY = (vector.originalY - centerY) / canvasHeightHalf;
    
    // Pre-calcular fases espaciales
    const xSpatialPhase = normalizedX * Math.PI;
    const ySpatialPhase = normalizedY * Math.PI;
    
    // Calcular el ángulo tangente a la curva de Lissajous en este punto
    // Derivadas de las funciones de Lissajous (optimizado)
    const dxdt = props.xFrequency * Math.cos(xFreqTime + xSpatialPhase) * props.xAmplitude;
    const dydt = props.yFrequency * Math.cos(yFreqTime + ySpatialPhase + props.phaseOffset) * props.yAmplitude;
    
    // Ángulo tangente a la curva
    let tangentAngle = Math.atan2(dydt, dxdt);
    
    // Agregar influencia de la posición para crear variación espacial (optimizado)
    const spatialInfluence = Math.sin(normalizedX * twoPi) * Math.cos(normalizedY * twoPi);
    tangentAngle += spatialInfluence * 0.5;
    
    // Convertir a grados y normalizar (optimizado)
    let angleDegrees = (tangentAngle * radToDeg) % 360;
    if (angleDegrees < 0) angleDegrees += 360;
    
    return {
      ...vector,
      angle: angleDegrees
    };
  });
};

// Validación de props
const validateLissajousProps = (props: LissajousProps): boolean => {
  return (
    typeof props.xFrequency === 'number' &&
    typeof props.yFrequency === 'number' &&
    typeof props.xAmplitude === 'number' &&
    typeof props.yAmplitude === 'number' &&
    typeof props.phaseOffset === 'number' &&
    typeof props.timeSpeed === 'number' &&
    props.xFrequency > 0 &&
    props.yFrequency > 0 &&
    props.xAmplitude > 0 &&
    props.yAmplitude > 0 &&
    props.timeSpeed >= 0
  );
};

// Exportar la animación lissajous corregida
export const lissajousAnimation = createSimpleAnimation<LissajousProps>({
  id: 'lissajous',
  name: 'Lissajous',
  description: 'Vectores que siguen las tangentes de curvas de Lissajous matemáticas',
  category: 'advanced',
  icon: '∞',
  controls: [
    {
      id: 'xFrequency',
      label: 'Frecuencia X',
      type: 'slider',
      min: 1,
      max: 8,
      step: 0.5,
      defaultValue: 3,
      description: 'Frecuencia de oscilación en X',
      icon: '↔️'
    },
    {
      id: 'yFrequency',
      label: 'Frecuencia Y',
      type: 'slider',
      min: 1,
      max: 8,
      step: 0.5,
      defaultValue: 2,
      description: 'Frecuencia de oscilación en Y',
      icon: '↕️'
    },
    {
      id: 'xAmplitude',
      label: 'Amplitud X',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 50,
      description: 'Amplitud de oscilación en X',
      icon: '📏'
    },
    {
      id: 'yAmplitude',
      label: 'Amplitud Y',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 50,
      description: 'Amplitud de oscilación en Y',
      icon: '📐'
    },
    {
      id: 'phaseOffset',
      label: 'Desfase',
      type: 'slider',
      min: 0,
      max: 6.28,
      step: 0.1,
      defaultValue: 1.57,
      description: 'Desfase entre X e Y (π/2 = 90°)',
      icon: '🔄'
    },
    {
      id: 'timeSpeed',
      label: 'Velocidad',
      type: 'slider',
      min: 0,
      max: 0.02,
      step: 0.001,
      defaultValue: 0.005,
      description: 'Velocidad de evolución temporal',
      icon: '⚡'
    }
  ],
  defaultProps: {
    xFrequency: 3,
    yFrequency: 2,
    xAmplitude: 50,
    yAmplitude: 50,
    phaseOffset: 1.57, // π/2
    timeSpeed: 0.005
  },
  animate: animateLissajous,
  validateProps: validateLissajousProps
});
