import { AnimationImplementation, AnimatedVectorItem } from '../types';

/**
 * Animación "none" - No hace nada, mantiene los vectores en su estado inicial
 */
export const noneAnimation: AnimationImplementation = {
  id: 'none',
  name: 'Sin animación',
  description: 'Los vectores mantienen su ángulo inicial sin cambios',
  
  defaultProps: {},
  
  controls: [],
  
  update: (vectors: AnimatedVectorItem[]): AnimatedVectorItem[] => {
    // Simplemente devuelve los vectores sin cambios, reseteando cualquier animación previa
    return vectors.map(vector => ({
      ...vector,
      angle: vector.baseAngle,
      length: vector.baseLength,
      width: vector.baseWidth,
      opacity: vector.baseOpacity
    }));
  }
};
