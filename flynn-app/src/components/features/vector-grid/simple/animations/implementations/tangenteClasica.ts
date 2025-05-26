// Animación "tangenteClasica" - Rotación tangencial ULTRA SIMPLE
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación tangenteClasica
interface TangenteClasicaProps {
  rotationSpeed: number;
  direction: 'clockwise' | 'counterClockwise';
}

// Función de animación ULTRA SIMPLIFICADA - sin cache, sin optimizaciones complejas
const animateTangenteClasica = (
  vectors: SimpleVector[],
  props: TangenteClasicaProps,
  context: AnimationContext
): SimpleVector[] => {
  const centerX = context.canvasWidth * 0.5;
  const centerY = context.canvasHeight * 0.5;
  const timeRotation = context.time * props.rotationSpeed;
  const directionMultiplier = props.direction === 'clockwise' ? 1 : -1;
  
  return vectors.map(vector => {
    // Cálculo simple sin cache
    const dx = vector.originalX - centerX;
    const dy = vector.originalY - centerY;
    
    // Ángulo tangencial simple
    const radialAngle = Math.atan2(dy, dx);
    const tangentialAngle = radialAngle + (Math.PI * 0.5 * directionMultiplier);
    
    // Rotación simple
    const finalAngle = tangentialAngle + (timeRotation * directionMultiplier);
    
    // Convertir a grados y normalizar
    let angleDegrees = (finalAngle * 180 / Math.PI) % 360;
    if (angleDegrees < 0) angleDegrees += 360;
    
    return {
      ...vector,
      angle: angleDegrees
    };
  });
};

// Validación simple
const validateTangenteClasicaProps = (props: TangenteClasicaProps): boolean => {
  return (
    typeof props.rotationSpeed === 'number' &&
    props.rotationSpeed >= 0 &&
    props.rotationSpeed <= 0.001 && // Límite máximo para evitar colapso
    (props.direction === 'clockwise' || props.direction === 'counterClockwise')
  );
};

// Exportar la animación tangenteClasica ULTRA SIMPLE
export const tangenteClasicaAnimation = createSimpleAnimation<TangenteClasicaProps>({
  id: 'tangenteClasica',
  name: 'Tangente Clásica',
  description: 'Rotación tangencial simple y segura alrededor del centro',
  category: 'flow',
  icon: '🌀',
  controls: [
    {
      id: 'rotationSpeed',
      label: 'Velocidad',
      type: 'slider',
      min: 0.00001,
      max: 0.0005, // Reducido para evitar colapso
      step: 0.00001,
      defaultValue: 0.0001, // Valor muy bajo por defecto
      description: 'Velocidad de rotación tangencial (muy lenta para estabilidad)',
      icon: '⚡'
    },
    {
      id: 'direction',
      label: 'Dirección',
      type: 'select',
      options: [
        { value: 'clockwise', label: '🔄 Horario' },
        { value: 'counterClockwise', label: '🔃 Antihorario' }
      ],
      defaultValue: 'clockwise',
      description: 'Dirección de la rotación',
      icon: '🔄'
    }
  ],
  defaultProps: {
    rotationSpeed: 0.0001, // Muy lento por defecto
    direction: 'clockwise'
  },
  animate: animateTangenteClasica,
  validateProps: validateTangenteClasicaProps
});
