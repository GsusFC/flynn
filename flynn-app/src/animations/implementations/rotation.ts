import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

// Definir las props específicas para esta animación
interface RotationProps {
  speed: number;
}

// Implementación de la lógica de la animación
const applyRotation = ({ vectors, time, props }: AnimationFrameData<RotationProps>): AnimationResult => {
  const { speed } = props;
  
  const newVectors = vectors.map((vector: Vector, index: number) => ({
    ...vector,
    // La fórmula original era un poco caótica, la simplifico para que 'speed' sea el único factor
    angle: (vector.angle + time * 0.01 * speed + index * 0.01) % (Math.PI * 2),
  }));

  // Esta animación no produce datos específicos para color dinámico
  const animationData = vectors.map(() => ({}));

  return { vectors: newVectors, animationData };
};

// Metadatos de la animación
const rotationMeta: AnimationMeta<RotationProps> = {
  id: 'rotation',
  name: 'Rotation',
  description: 'Rotación continua de los vectores sobre su origen.',
  category: 'core',
  icon: 'sync',
  
  controls: [
    {
      id: 'speed',
      label: 'Speed',
      type: 'slider',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 1,
      description: 'Velocidad de la rotación'
    }
  ],
  
  defaultProps: {
    speed: 1,
  },
  
  apply: applyRotation,
};

// Registrar la animación en el sistema
registerAnimation(rotationMeta); 