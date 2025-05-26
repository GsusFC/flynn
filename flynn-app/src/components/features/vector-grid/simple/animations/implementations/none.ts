// Animación "none" - Sin animación, vectores estáticos
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación none (vacías)
type NoneProps = Record<string, unknown>;

// Función de animación que simplemente retorna los vectores en su estado original
const animateNone = (
  vectors: SimpleVector[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: NoneProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: AnimationContext
): SimpleVector[] => {
  return vectors.map(vector => ({
    ...vector,
    angle: vector.originalAngle
  }));
};

// Exportar la animación none
export const noneAnimation = createSimpleAnimation<NoneProps>({
  id: 'none',
  name: 'Sin animación',
  description: 'Los vectores permanecen estáticos en su ángulo original',
  category: 'basic',
  icon: '⏸️',
  controls: [], // Sin controles
  defaultProps: {} as NoneProps,
  animate: animateNone,
  validateProps: () => true // Siempre válida ya que no tiene props
});
