// Animación "staticAngle" - Ángulo estático
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación staticAngle
interface StaticAngleProps {
  angle: number;
}

// Función de animación que aplica un ángulo fijo a todos los vectores
const animateStaticAngle = (
  vectors: SimpleVector[],
  props: StaticAngleProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: AnimationContext
): SimpleVector[] => {
  const normalizedAngle = normalizeAngle(props.angle);
  
  return vectors.map(vector => ({
    ...vector,
    angle: normalizedAngle
  }));
};

// Validación de props
const validateStaticAngleProps = (props: StaticAngleProps): boolean => {
  if (typeof props.angle !== 'number' || isNaN(props.angle)) {
    console.warn('[staticAngle] El ángulo debe ser un número válido');
    return false;
  }
  return true;
};

// Exportar la animación staticAngle
export const staticAngleAnimation = createSimpleAnimation<StaticAngleProps>({
  id: 'staticAngle',
  name: 'Ángulo estático',
  description: 'Todos los vectores apuntan en la misma dirección fija',
  category: 'basic',
  icon: '📐',
  controls: [
    {
      id: 'angle',
      label: 'Ángulo',
      type: 'slider',
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 45,
      description: 'Ángulo en grados (0-360°)',
      icon: '🔄'
    }
  ],
  defaultProps: {
    angle: 45
  },
  animate: animateStaticAngle,
  validateProps: validateStaticAngleProps
});
