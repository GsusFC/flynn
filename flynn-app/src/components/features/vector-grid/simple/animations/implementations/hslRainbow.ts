// Animación "hslRainbow" - Degradados HSL animados dinámicamente
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación hslRainbow
interface HslRainbowProps {
  hueSpeed: number;
  saturation: number;
  lightness: number;
  waveLength: number;
  timeOffset: number;
}

// Función de animación que crea degradados HSL dinámicos
const animateHslRainbow = (
  vectors: SimpleVector[],
  props: HslRainbowProps,
  context: AnimationContext
): SimpleVector[] => {
  const time = context.time * props.timeOffset;
  
  return vectors.map(vector => {
    // Calcular posición normalizada
    const normalizedX = vector.originalX / context.canvasWidth;
    const normalizedY = vector.originalY / context.canvasHeight;
    
    // Crear onda de color basada en posición y tiempo
    const positionWave = (normalizedX + normalizedY) * props.waveLength;
    const hue = ((time * props.hueSpeed + positionWave * 360) % 360);
    
    // Crear color HSL dinámico
    const hslColor = {
      h: Math.round(hue),
      s: props.saturation,
      l: props.lightness,
      a: 1
    };
    
    return {
      ...vector,
      color: hslColor
    };
  });
};

// Validación de props
const validateHslRainbowProps = (props: HslRainbowProps): boolean => {
  return (
    typeof props.hueSpeed === 'number' &&
    typeof props.saturation === 'number' &&
    typeof props.lightness === 'number' &&
    typeof props.waveLength === 'number' &&
    typeof props.timeOffset === 'number' &&
    props.hueSpeed >= 0 &&
    props.saturation >= 0 && props.saturation <= 100 &&
    props.lightness >= 0 && props.lightness <= 100 &&
    props.waveLength > 0 &&
    props.timeOffset > 0
  );
};

// Exportar la animación hslRainbow
export const hslRainbowAnimation = createSimpleAnimation<HslRainbowProps>({
  id: 'hslRainbow',
  name: 'HSL Rainbow',
  description: 'Animación de colores HSL que crea un arcoíris dinámico en tiempo real',
  category: 'advanced',
  icon: '🌈',
  controls: [
    {
      id: 'hueSpeed',
      label: 'Velocidad de Matiz',
      type: 'slider',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Velocidad de cambio del matiz (hue)',
      icon: '🎨'
    },
    {
      id: 'saturation',
      label: 'Saturación',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 80,
      description: 'Saturación del color (0-100%)',
      icon: '💫'
    },
    {
      id: 'lightness',
      label: 'Luminosidad',
      type: 'slider',
      min: 10,
      max: 90,
      step: 5,
      defaultValue: 60,
      description: 'Luminosidad del color (10-90%)',
      icon: '💡'
    },
    {
      id: 'waveLength',
      label: 'Longitud de Onda',
      type: 'slider',
      min: 0.5,
      max: 5,
      step: 0.1,
      defaultValue: 2,
      description: 'Longitud de la onda de color espacial',
      icon: '〰️'
    },
    {
      id: 'timeOffset',
      label: 'Velocidad Temporal',
      type: 'slider',
      min: 0.001,
      max: 0.01,
      step: 0.001,
      defaultValue: 0.005,
      description: 'Velocidad de evolución temporal',
      icon: '⏱️'
    }
  ],
  defaultProps: {
    hueSpeed: 0.5,
    saturation: 80,
    lightness: 60,
    waveLength: 2,
    timeOffset: 0.005
  },
  animate: animateHslRainbow,
  validateProps: validateHslRainbowProps
});
