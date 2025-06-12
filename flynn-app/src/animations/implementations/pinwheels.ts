import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface PinwheelsProps {
  gridSize: number;
  speed: number;
  alternating: boolean;
}

const applyPinwheels = ({ vectors, time, props }: AnimationFrameData<PinwheelsProps>): AnimationResult => {
  const { gridSize, speed, alternating } = props;

  const newVectors: Vector[] = vectors.map(vector => {
    // 1. Encontrar el centro del molinete más cercano
    const cellX = Math.floor(vector.x / gridSize);
    const cellY = Math.floor(vector.y / gridSize);
    const centerX = cellX * gridSize + gridSize / 2;
    const centerY = cellY * gridSize + gridSize / 2;

    // 2. Calcular el vector desde el centro del molinete
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;

    // 3. Calcular el ángulo tangencial (perpendicular al radio)
    const baseAngle = Math.atan2(dy, dx);
    const tangentAngle = baseAngle + Math.PI / 2;

    // 4. Determinar la dirección de rotación
    let direction = 1;
    if (alternating) {
      if ((cellX + cellY) % 2 === 1) {
        direction = -1;
      }
    }

    // 5. Aplicar la rotación basada en el tiempo
    const finalAngle = tangentAngle + time * speed * direction;

    return {
      ...vector,
      angle: finalAngle,
    };
  });

  return { vectors: newVectors, animationData: [] };
};

const pinwheelsMeta: AnimationMeta<PinwheelsProps> = {
  id: 'pinwheels',
  name: 'Pinwheels',
  description: 'Un campo de molinetes que giran, con dirección alternable.',
  category: 'core',
  icon: 'fan',
  
  controls: [
    {
      id: 'gridSize',
      type: 'slider',
      label: 'Tamaño de Celdas',
      min: 20,
      max: 400,
      step: 5,
      defaultValue: 100,
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad',
      min: -5,
      max: 5,
      step: 0.1,
      defaultValue: 1,
    },
    {
      id: 'alternating',
      type: 'checkbox',
      label: 'Alternar Dirección',
      defaultValue: true,
    },
  ],
  
  defaultProps: {
    gridSize: 100,
    speed: 1,
    alternating: true,
  },
  
  apply: applyPinwheels,
};

registerAnimation(pinwheelsMeta); 