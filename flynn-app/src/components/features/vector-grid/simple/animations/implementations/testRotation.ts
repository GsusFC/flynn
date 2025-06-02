// Test Animation - Rotación simple y obvia para verificar que el pipeline funciona
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props súper simples
interface TestRotationProps {
  speed: number;
}

// Función de animación ULTRA OBVIA
const animateTestRotation = (
  vectors: SimpleVector[],
  props: TestRotationProps,
  context: AnimationContext
): SimpleVector[] => {
  const { speed } = props;
  const { time } = context;
  
  // Rotación simple - TODOS los vectores rotan al mismo tiempo
  const rotationAngle = time * speed * 0.01; // Convertir a algo visible
  
  return vectors.map(vector => {
    return {
      ...vector,
      angle: rotationAngle // Todos apuntan en la misma dirección, rotando
    };
  });
};

// Validación simple
const validateTestRotationProps = (props: TestRotationProps): boolean => {
  return typeof props.speed === 'number';
};

// Exportar la animación
export const testRotationAnimation = createSimpleAnimation<TestRotationProps>({
  id: 'testRotation',
  name: 'Test Rotación',
  description: 'Animación de prueba - todos los vectores rotan juntos',
  category: 'test',
  icon: '🔄',
  controls: [
    {
      id: 'speed',
      label: 'Velocidad',
      type: 'slider',
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 5,
      description: 'Velocidad de rotación',
      icon: '⚡'
    }
  ],
  defaultProps: {
    speed: 5
  },
  animate: animateTestRotation,
  validateProps: validateTestRotationProps
});