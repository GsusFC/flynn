// Animación "vortex" - Vórtice giratorio
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle, distance, angleBetweenPoints } from '../base/utils';

// Props para la animación vortex
interface VortexProps {
  strength: number;
  radiusFalloff: number;
  swirlDirection: 'clockwise' | 'counterClockwise';
  useMouseAsCenter: boolean;
  vortexCenterX?: number;
  vortexCenterY?: number;
}

// Función de animación que crea un vórtice
const animateVortex = (
  vectors: SimpleVector[],
  props: VortexProps,
  context: AnimationContext
): SimpleVector[] => {
  // Determinar el centro del vórtice
  let centerX: number, centerY: number;
  
  if (props.useMouseAsCenter && context.mousePosition.x !== null && context.mousePosition.y !== null) {
    centerX = context.mousePosition.x;
    centerY = context.mousePosition.y;
  } else if (props.vortexCenterX !== undefined && props.vortexCenterY !== undefined) {
    centerX = props.vortexCenterX;
    centerY = props.vortexCenterY;
  } else {
    centerX = context.canvasWidth / 2;
    centerY = context.canvasHeight / 2;
  }

  return vectors.map(vector => {
    // Calcular distancia al centro del vórtice
    const dist = distance(vector.x, vector.y, centerX, centerY);
    
    // Si está muy lejos, no aplicar efecto
    if (dist > 400) {
      return {
        ...vector,
        angle: vector.originalAngle
      };
    }

    // Calcular influencia basada en la distancia con falloff
    const maxDistance = 300;
    const normalizedDistance = Math.min(dist / maxDistance, 1);
    const falloffInfluence = Math.pow(1 - normalizedDistance, props.radiusFalloff);
    
    // Calcular ángulo tangencial (perpendicular al radio)
    const radialAngle = angleBetweenPoints(centerX, centerY, vector.x, vector.y);
    const tangentialAngle = props.swirlDirection === 'clockwise' 
      ? radialAngle + 90 
      : radialAngle - 90;
    
    // Aplicar rotación basada en el tiempo y la fuerza
    const timeRotation = context.time * props.strength * 0.1;
    const finalTangentialAngle = tangentialAngle + timeRotation;
    
    // Interpolar entre el ángulo original y el tangencial
    const influence = falloffInfluence * props.strength * 10;
    const angleDiff = finalTangentialAngle - vector.originalAngle;
    const normalizedDiff = ((angleDiff + 180) % 360) - 180;
    const finalAngle = vector.originalAngle + (normalizedDiff * influence);

    return {
      ...vector,
      angle: normalizeAngle(finalAngle)
    };
  });
};

// Validación de props
const validateVortexProps = (props: VortexProps): boolean => {
  if (typeof props.strength !== 'number' || props.strength <= 0) {
    console.warn('[vortex] La fuerza debe ser un número positivo');
    return false;
  }
  if (typeof props.radiusFalloff !== 'number' || props.radiusFalloff <= 0) {
    console.warn('[vortex] El falloff del radio debe ser un número positivo');
    return false;
  }
  if (!['clockwise', 'counterClockwise'].includes(props.swirlDirection)) {
    console.warn('[vortex] La dirección debe ser clockwise o counterClockwise');
    return false;
  }
  return true;
};

// Exportar la animación vortex
export const vortexAnimation = createSimpleAnimation<VortexProps>({
  id: 'vortex',
  name: 'Vórtice',
  description: 'Los vectores giran alrededor de un punto central formando un vórtice',
  category: 'flow',
  icon: '🌪️',
  controls: [
    {
      id: 'strength',
      label: 'Fuerza',
      type: 'slider',
      min: 0.01,
      max: 0.2,
      step: 0.01,
      defaultValue: 0.05,
      description: 'Influencia o velocidad de la rotación (0.01-0.2)',
      icon: '💪'
    },
    {
      id: 'radiusFalloff',
      label: 'Falloff del radio',
      type: 'slider',
      min: 0.5,
      max: 3.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Cómo disminuye la fuerza con la distancia (0.5-3.0)',
      icon: '📉'
    },
    {
      id: 'swirlDirection',
      label: 'Dirección',
      type: 'select',
      options: [
        { value: 'clockwise', label: 'Horario' },
        { value: 'counterClockwise', label: 'Antihorario' }
      ],
      defaultValue: 'clockwise',
      description: 'Dirección de rotación del vórtice',
      icon: '🔄'
    },
    {
      id: 'useMouseAsCenter',
      label: 'Seguir ratón',
      type: 'toggle',
      defaultValue: false,
      description: 'Si es true, el vórtice sigue al ratón',
      icon: '🖱️'
    }
  ],
  defaultProps: {
    strength: 0.05,
    radiusFalloff: 1.0,
    swirlDirection: 'clockwise',
    useMouseAsCenter: false
  },
  animate: animateVortex,
  validateProps: validateVortexProps
});
