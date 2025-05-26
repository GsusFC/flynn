// Animación "hslGradientFlow" - Degradados HSL animados dinámicamente
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import type { GradientConfig } from '../../../types/gradientTypes';

// Props para la animación hslGradientFlow
interface HslGradientFlowProps {
  hueSpeed: number;
  saturation: number;
  lightness: number;
  gradientLength: number;
  flowDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  timeOffset: number;
}

// Cache para cálculos de centro
let centerCache: { canvasWidth: number; canvasHeight: number; centerX: number; centerY: number } | null = null;

// Función de animación optimizada que crea degradados HSL dinámicos
const animateHslGradientFlow = (
  vectors: SimpleVector[],
  props: HslGradientFlowProps,
  context: AnimationContext
): SimpleVector[] => {
  const time = context.time * props.timeOffset;
  
  // Pre-calcular constantes
  const hueSpeedTime = time * props.hueSpeed;
  const gradientLength360 = props.gradientLength * 360;
  
  // Cache para cálculos de centro en modo radial
  if (!centerCache || centerCache.canvasWidth !== context.canvasWidth || centerCache.canvasHeight !== context.canvasHeight) {
    centerCache = {
      canvasWidth: context.canvasWidth,
      canvasHeight: context.canvasHeight,
      centerX: 0.5,
      centerY: 0.5
    };
  }
  
  return vectors.map(vector => {
    // Calcular posición normalizada
    const normalizedX = vector.originalX / context.canvasWidth;
    const normalizedY = vector.originalY / context.canvasHeight;
    
    // Calcular base del gradiente según la dirección
    let gradientBase = 0;
    switch (props.flowDirection) {
      case 'horizontal':
        gradientBase = normalizedX;
        break;
      case 'vertical':
        gradientBase = normalizedY;
        break;
      case 'diagonal':
        gradientBase = (normalizedX + normalizedY) * 0.5; // Optimización: * 0.5 en lugar de / 2
        break;
      case 'radial':
        const deltaX = normalizedX - centerCache!.centerX;
        const deltaY = normalizedY - centerCache!.centerY;
        gradientBase = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Optimización: evitar Math.pow
        break;
    }
    
    // Crear gradiente dinámico basado en tiempo y posición
    const baseHue = (hueSpeedTime + gradientBase * gradientLength360) % 360;
    
    // Pre-calcular ángulos de matiz para evitar cálculos repetitivos
    const roundedBaseHue = Math.round(baseHue);
    const hue60 = Math.round((baseHue + 60) % 360);
    const hue120 = Math.round((baseHue + 120) % 360);
    const hue180 = Math.round((baseHue + 180) % 360);
    
    // Crear degradado con múltiples colores HSL
    const gradientConfig: GradientConfig = {
      type: props.flowDirection === 'radial' ? 'radial' : 'linear',
      angle: props.flowDirection === 'horizontal' ? 90 : 
             props.flowDirection === 'vertical' ? 0 : 45,
      colors: [
        {
          color: `hsl(${roundedBaseHue}, ${props.saturation}%, ${props.lightness}%)`,
          offset: 0
        },
        {
          color: `hsl(${hue60}, ${props.saturation}%, ${props.lightness}%)`,
          offset: 0.3
        },
        {
          color: `hsl(${hue120}, ${props.saturation}%, ${props.lightness}%)`,
          offset: 0.6
        },
        {
          color: `hsl(${hue180}, ${props.saturation}%, ${props.lightness}%)`,
          offset: 1
        }
      ]
    };
    
    return {
      ...vector,
      color: gradientConfig
    };
  });
};

// Validación de props
const validateHslGradientFlowProps = (props: HslGradientFlowProps): boolean => {
  return (
    typeof props.hueSpeed === 'number' &&
    typeof props.saturation === 'number' &&
    typeof props.lightness === 'number' &&
    typeof props.gradientLength === 'number' &&
    typeof props.flowDirection === 'string' &&
    typeof props.timeOffset === 'number' &&
    props.hueSpeed >= 0 &&
    props.saturation >= 0 && props.saturation <= 100 &&
    props.lightness >= 0 && props.lightness <= 100 &&
    props.gradientLength > 0 &&
    props.timeOffset > 0 &&
    ['horizontal', 'vertical', 'diagonal', 'radial'].includes(props.flowDirection)
  );
};

// Exportar la animación hslGradientFlow
export const hslGradientFlowAnimation = createSimpleAnimation<HslGradientFlowProps>({
  id: 'hslGradientFlow',
  name: 'HSL Gradient Flow',
  description: 'Degradados HSL dinámicos que fluyen a través del grid en tiempo real',
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
      id: 'gradientLength',
      label: 'Longitud del Degradado',
      type: 'slider',
      min: 0.5,
      max: 3,
      step: 0.1,
      defaultValue: 1.5,
      description: 'Longitud espacial del degradado',
      icon: '📏'
    },
    {
      id: 'flowDirection',
      label: 'Dirección del Flujo',
      type: 'select',
      options: [
        { value: 'horizontal', label: '➡️ Horizontal' },
        { value: 'vertical', label: '⬇️ Vertical' },
        { value: 'diagonal', label: '↘️ Diagonal' },
        { value: 'radial', label: '🎯 Radial' }
      ],
      defaultValue: 'horizontal',
      description: 'Dirección del flujo del degradado',
      icon: '🧭'
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
    gradientLength: 1.5,
    flowDirection: 'horizontal',
    timeOffset: 0.005
  },
  animate: animateHslGradientFlow,
  validateProps: validateHslGradientFlowProps
});
