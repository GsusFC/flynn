// Animación "rippleEffect" - Onda Continua OPTIMIZADA
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación rippleEffect
interface RippleEffectProps {
  waveSpeed: number;
  waveLength: number;
  amplitude: number;
  centerX?: number;
  centerY?: number;
}

// Cache para center values (se actualiza solo cuando cambian las props del centro)
let cachedCenterX = 0;
let cachedCenterY = 0;
let cachedCenterKey = '';

// Función de animación que crea ondas continuas desde el centro
const animateRippleEffect = (
  vectors: SimpleVector[],
  props: RippleEffectProps,
  context: AnimationContext
): SimpleVector[] => {
  const { waveSpeed, waveLength, amplitude } = props;
  
  // Cache para center values
  const centerKey = `${props.centerX ?? context.canvasWidth / 2}-${props.centerY ?? context.canvasHeight / 2}`;
  if (centerKey !== cachedCenterKey) {
    cachedCenterX = props.centerX ?? context.canvasWidth / 2;
    cachedCenterY = props.centerY ?? context.canvasHeight / 2;
    cachedCenterKey = centerKey;
  }
  
  // Pre-calcular valores que no cambian por vector
  const timeFactor = context.time * 0.001;
  const timeSpeedFactor = timeFactor * waveSpeed;
  const amplitudeRadians = amplitude * Math.PI / 180; // Convertir amplitude a radianes una sola vez
  const twoPi = Math.PI * 2;
  const radToDeg = 180 / Math.PI;

  return vectors.map(vector => {
    // Calcular distancia desde el centro (optimizar reutilizando dx, dy si es posible)
    const dx = vector.originalX - cachedCenterX;
    const dy = vector.originalY - cachedCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calcular fase de la onda basada en distancia y tiempo
    const phase = (distance / waveLength - timeSpeedFactor) * twoPi;
    
    // Calcular amplitud de la onda en radianes (evitar conversión)
    const waveAmplitude = Math.sin(phase) * amplitudeRadians;
    
    // Calcular ángulo radial desde el centro
    const radialAngle = Math.atan2(dy, dx);
    
    // El efecto ripple hace que los vectores apunten radialmente con variación ondulatoria
    const rippleAngle = radialAngle + waveAmplitude;
    
    // Convertir a grados solo una vez al final
    const finalAngle = rippleAngle * radToDeg;
    
    return {
      ...vector,
      angle: normalizeAngle(finalAngle)
    };
  });
};

// Validación de props
const validateRippleEffectProps = (props: RippleEffectProps): boolean => {
  if (typeof props.waveSpeed !== 'number' || isNaN(props.waveSpeed) || props.waveSpeed <= 0) {
    console.warn('[rippleEffect] La velocidad de onda debe ser un número positivo');
    return false;
  }
  if (typeof props.waveLength !== 'number' || isNaN(props.waveLength) || props.waveLength <= 0) {
    console.warn('[rippleEffect] La longitud de onda debe ser un número positivo');
    return false;
  }
  if (typeof props.amplitude !== 'number' || isNaN(props.amplitude)) {
    console.warn('[rippleEffect] La amplitud debe ser un número');
    return false;
  }
  return true;
};

// Exportar la animación rippleEffect
export const rippleEffectAnimation = createSimpleAnimation<RippleEffectProps>({
  id: 'rippleEffect',
  name: 'Onda Continua',
  description: 'Ondas continuas que se propagan desde el centro como ondas en el agua',
  category: 'waves',
  icon: '🌊',
  controls: [
    {
      id: 'waveSpeed',
      label: 'Velocidad Onda',
      type: 'slider',
      min: 0.1,
      max: 5.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Velocidad de propagación de la onda (0.1-5.0)',
      icon: '⚡'
    },
    {
      id: 'waveLength',
      label: 'Longitud Onda',
      type: 'slider',
      min: 50,
      max: 500,
      step: 10,
      defaultValue: 150,
      description: 'Longitud de onda en píxeles (50-500)',
      icon: '📏'
    },
    {
      id: 'amplitude',
      label: 'Amplitud',
      type: 'slider',
      min: 10,
      max: 90,
      step: 5,
      defaultValue: 60,
      description: 'Amplitud del efecto en grados (10-90)',
      icon: '📊'
    }
  ],
  defaultProps: {
    waveSpeed: 1.0,
    waveLength: 150,
    amplitude: 60
  },
  animate: animateRippleEffect,
  validateProps: validateRippleEffectProps
});
