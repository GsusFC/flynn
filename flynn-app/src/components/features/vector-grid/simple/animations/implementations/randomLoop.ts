// Animación "randomLoop" - Loop aleatorio
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación randomLoop
interface RandomLoopProps {
  intervalMs: number;
  transitionSpeedFactor: number;
}

// Estado interno para cada vector
interface VectorState {
  targetAngle: number;
  lastChangeTime: number;
  currentAngle: number;
}

// Mapa de estados por vector ID
const vectorStates = new Map<string, VectorState>();

// Función de animación que crea cambios aleatorios periódicos
const animateRandomLoop = (
  vectors: SimpleVector[],
  props: RandomLoopProps,
  context: AnimationContext
): SimpleVector[] => {
  return vectors.map(vector => {
    // Obtener o crear estado para este vector
    let state = vectorStates.get(vector.id);
    
    if (!state) {
      state = {
        targetAngle: Math.random() * 360,
        lastChangeTime: context.time,
        currentAngle: vector.originalAngle
      };
      vectorStates.set(vector.id, state);
    }

    // Verificar si es tiempo de cambiar el ángulo objetivo
    const timeSinceLastChange = context.time - state.lastChangeTime;
    if (timeSinceLastChange >= props.intervalMs) {
      state.targetAngle = Math.random() * 360;
      state.lastChangeTime = context.time;
    }

    // Calcular progreso de la transición
    const transitionProgress = Math.min(1, timeSinceLastChange / props.intervalMs);
    const easedProgress = easeInOutQuad(transitionProgress);

    // Interpolar hacia el ángulo objetivo
    const angleDiff = state.targetAngle - state.currentAngle;
    const normalizedDiff = ((angleDiff + 180) % 360) - 180; // Normalizar diferencia
    
    // Aplicar factor de velocidad de transición
    const transitionSpeed = 0.1 * props.transitionSpeedFactor;
    state.currentAngle += normalizedDiff * transitionSpeed * easedProgress;
    state.currentAngle = normalizeAngle(state.currentAngle);

    return {
      ...vector,
      angle: state.currentAngle
    };
  });
};

// Función de easing
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

// Validación de props
const validateRandomLoopProps = (props: RandomLoopProps): boolean => {
  if (typeof props.intervalMs !== 'number' || props.intervalMs <= 0) {
    console.warn('[randomLoop] El intervalo debe ser un número positivo');
    return false;
  }
  if (typeof props.transitionSpeedFactor !== 'number' || props.transitionSpeedFactor <= 0) {
    console.warn('[randomLoop] El factor de velocidad debe ser un número positivo');
    return false;
  }
  return true;
};

// Función de limpieza cuando se destruye la animación
const onDestroy = () => {
  vectorStates.clear();
};

// Exportar la animación randomLoop
export const randomLoopAnimation = createSimpleAnimation<RandomLoopProps>({
  id: 'randomLoop',
  name: 'Loop aleatorio',
  description: 'Cada vector selecciona un nuevo ángulo objetivo aleatorio a intervalos regulares',
  category: 'basic',
  icon: '🎲',
  controls: [
    {
      id: 'intervalMs',
      label: 'Intervalo',
      type: 'slider',
      min: 500,
      max: 5000,
      step: 100,
      defaultValue: 2000,
      description: 'Milisegundos entre cada cambio de ángulo (500-5000ms)',
      icon: '⏱️'
    },
    {
      id: 'transitionSpeedFactor',
      label: 'Velocidad de transición',
      type: 'slider',
      min: 0.1,
      max: 3.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Multiplicador para la velocidad de transición (0.1-3.0)',
      icon: '⚡'
    }
  ],
  defaultProps: {
    intervalMs: 2000,
    transitionSpeedFactor: 1.0
  },
  animate: animateRandomLoop,
  validateProps: validateRandomLoopProps,
  onDestroy
});
