// Animación "mouseInteraction" - Interacción con ratón
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle, distance, angleBetweenPoints } from '../base/utils';

// Props para la animación mouseInteraction
interface MouseInteractionProps {
  interactionRadius: number;
  attractionDistance: number;
  repulsionDistance: number;
  effectType: 'attract' | 'repel' | 'align';
  strength: number;
  alignAngleOffset: number;
}

// Función de animación que crea interacción con el mouse
const animateMouseInteraction = (
  vectors: SimpleVector[],
  props: MouseInteractionProps,
  context: AnimationContext
): SimpleVector[] => {
  // Si no hay posición del mouse, retornar vectores sin cambios
  if (context.mousePosition.x === null || context.mousePosition.y === null) {
    return vectors.map(vector => ({
      ...vector,
      angle: vector.originalAngle
    }));
  }

  const mouseX = context.mousePosition.x;
  const mouseY = context.mousePosition.y;

  return vectors.map(vector => {
    const dist = distance(vector.x, vector.y, mouseX, mouseY);
    
    // Si está fuera del radio de interacción, usar ángulo original
    if (dist > props.interactionRadius) {
      return {
        ...vector,
        angle: vector.originalAngle
      };
    }

    // Calcular influencia basada en la distancia
    const influence = Math.max(0, 1 - (dist / props.interactionRadius)) * props.strength;
    
    let targetAngle = vector.originalAngle;

    switch (props.effectType) {
      case 'attract':
        // Apuntar hacia el mouse
        targetAngle = angleBetweenPoints(vector.x, vector.y, mouseX, mouseY);
        break;
        
      case 'repel':
        // Apuntar lejos del mouse
        targetAngle = angleBetweenPoints(mouseX, mouseY, vector.x, vector.y) + props.alignAngleOffset;
        break;
        
      case 'align':
        // Alinearse con la dirección del mouse
        targetAngle = angleBetweenPoints(vector.x, vector.y, mouseX, mouseY) + props.alignAngleOffset;
        break;
    }

    // Interpolar entre el ángulo original y el objetivo
    const angleDiff = targetAngle - vector.originalAngle;
    const normalizedDiff = ((angleDiff + 180) % 360) - 180; // Normalizar diferencia
    const finalAngle = vector.originalAngle + (normalizedDiff * influence);

    return {
      ...vector,
      angle: normalizeAngle(finalAngle)
    };
  });
};

// Validación de props
const validateMouseInteractionProps = (props: MouseInteractionProps): boolean => {

  if (typeof props.interactionRadius !== 'number' || props.interactionRadius <= 0) {
    console.warn('[mouseInteraction] El radio de interacción debe ser un número positivo. Recibido:', props.interactionRadius, typeof props.interactionRadius);
    return false;
  }
  if (typeof props.strength !== 'number' || props.strength < 0) {
    console.warn('[mouseInteraction] La fuerza debe ser un número no negativo');
    return false;
  }
  if (!['attract', 'repel', 'align'].includes(props.effectType)) {
    console.warn('[mouseInteraction] El tipo de efecto debe ser attract, repel o align');
    return false;
  }
  return true;
};

// Exportar la animación mouseInteraction
export const mouseInteractionAnimation = createSimpleAnimation<MouseInteractionProps>({
  id: 'mouseInteraction',
  name: 'Interacción con ratón',
  description: 'Los vectores reaccionan a la posición del cursor dentro de un radio de influencia',
  category: 'interaction',
  icon: '🖱️',
  controls: [
    {
      id: 'interactionRadius',
      label: 'Radio de interacción',
      type: 'slider',
      min: 50,
      max: 300,
      step: 10,
      defaultValue: 150,
      description: 'Radio de influencia alrededor del mouse (px)',
      icon: '📏'
    },
    {
      id: 'attractionDistance',
      label: 'Distancia atracción',
      type: 'slider',
      min: 20,
      max: 200,
      step: 10,
      defaultValue: 50,
      description: 'Distancia para efecto de atracción (px)',
      icon: '🧲'
    },
    {
      id: 'repulsionDistance',
      label: 'Distancia repulsión',
      type: 'slider',
      min: 50,
      max: 300,
      step: 10,
      defaultValue: 150,
      description: 'Distancia para efecto de repulsión (px)',
      icon: '⚡'
    },
    {
      id: 'effectType',
      label: 'Tipo de efecto',
      type: 'select',
      options: [
        { value: 'attract', label: 'Atraer' },
        { value: 'repel', label: 'Repeler' },
        { value: 'align', label: 'Alinear' }
      ],
      defaultValue: 'repel',
      description: 'Cómo reaccionan los vectores al mouse',
      icon: '🎯'
    },
    {
      id: 'strength',
      label: 'Fuerza',
      type: 'slider',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Intensidad del efecto (0.1-2.0)',
      icon: '💪'
    },
    {
      id: 'alignAngleOffset',
      label: 'Offset angular',
      type: 'slider',
      min: 0,
      max: 360,
      step: 15,
      defaultValue: 0,
      description: 'Desfase angular para repel/align (grados)',
      icon: '🔄'
    }
  ],
  defaultProps: {
    interactionRadius: 150,
    attractionDistance: 50,
    repulsionDistance: 150,
    effectType: 'repel',
    strength: 1.0,
    alignAngleOffset: 0
  },
  animate: animateMouseInteraction,
  validateProps: validateMouseInteractionProps
});
