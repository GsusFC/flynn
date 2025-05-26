// Animación "directionalFlow" - Flujo direccional
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación directionalFlow
interface DirectionalFlowProps {
  flowAngle: number;
  turbulence: number;
}

// Función de animación que crea flujo direccional
const animateDirectionalFlow = (
  vectors: SimpleVector[],
  props: DirectionalFlowProps,
  context: AnimationContext
): SimpleVector[] => {
  return vectors.map(vector => {
    // Generar turbulencia basada en posición y tiempo
    const turbulenceX = Math.sin(vector.x * 0.01 + context.time * 0.001) * props.turbulence * 180;
    const turbulenceY = Math.cos(vector.y * 0.01 + context.time * 0.0008) * props.turbulence * 180;
    const turbulenceTime = Math.sin(context.time * 0.002) * props.turbulence * 90;
    
    // Combinar turbulencias
    const totalTurbulence = turbulenceX + turbulenceY + turbulenceTime;
    
    // Aplicar ángulo de flujo principal más turbulencia
    const finalAngle = props.flowAngle + totalTurbulence;
    
    return {
      ...vector,
      angle: normalizeAngle(finalAngle)
    };
  });
};

// Validación de props
const validateDirectionalFlowProps = (props: DirectionalFlowProps): boolean => {
  if (typeof props.flowAngle !== 'number') {
    console.warn('[directionalFlow] El ángulo de flujo debe ser un número');
    return false;
  }
  if (typeof props.turbulence !== 'number' || props.turbulence < 0 || props.turbulence > 1) {
    console.warn('[directionalFlow] La turbulencia debe estar entre 0 y 1');
    return false;
  }
  return true;
};

// Exportar la animación directionalFlow
export const directionalFlowAnimation = createSimpleAnimation<DirectionalFlowProps>({
  id: 'directionalFlow',
  name: 'Flujo direccional',
  description: 'Los vectores se alinean en una dirección con turbulencia configurable',
  category: 'flow',
  icon: '➡️',
  controls: [
    {
      id: 'flowAngle',
      label: 'Ángulo de flujo',
      type: 'slider',
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 0,
      description: 'Ángulo principal del flujo (0-360°)',
      icon: '🧭'
    },
    {
      id: 'turbulence',
      label: 'Turbulencia',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.2,
      description: 'Magnitud de la variación aleatoria (0-1)',
      icon: '🌪️'
    }
  ],
  defaultProps: {
    flowAngle: 0,
    turbulence: 0.2
  },
  animate: animateDirectionalFlow,
  validateProps: validateDirectionalFlowProps
});
