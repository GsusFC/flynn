import { AnimationImplementation, AnimatedVectorItem, AnimationParams } from '../types';

/**
 * Animación "staticAngle" - Establece un ángulo fijo para todos los vectores
 */
export const staticAngleAnimation: AnimationImplementation = {
  id: 'staticAngle',
  name: 'Ángulo estático',
  description: 'Todos los vectores se orientan y mantienen un ángulo fijo especificado',
  
  defaultProps: {
    angle: 45, // Ángulo en grados (0-360)
  },
  
  controls: [
    {
      id: 'angle',
      type: 'slider',
      label: 'Ángulo',
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 45,
      tooltip: 'Ángulo en grados (0-360) al que apuntarán todos los vectores'
    }
  ],
  
  update: (
    vectors: AnimatedVectorItem[], 
    _params: AnimationParams, 
    props: Record<string, unknown>
  ): AnimatedVectorItem[] => {
    const angle = Number(props.angle) || 45;
    
    return vectors.map(vector => ({
      ...vector,
      angle: angle,
      // Mantener otras propiedades en sus valores base
      length: vector.baseLength,
      width: vector.baseWidth,
      opacity: vector.baseOpacity
    }));
  }
};
