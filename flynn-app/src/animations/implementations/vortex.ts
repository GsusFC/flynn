import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult } from '../types';

// Props
interface VortexProps {
  strength: number;
  rotationSpeed: number;
}

// Lógica
const applyVortex = ({ vectors, time, props, dimensions }: AnimationFrameData<VortexProps>): AnimationResult => {
  const { strength, rotationSpeed } = props;
  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;

  const newVectors = vectors.map((vector) => {
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Angulo hacia el centro, más un offset perpendicular para crear el giro
    const angleToCenter = Math.atan2(dy, dx);
    const vortexAngle = angleToCenter + (Math.PI / 2); // 90 grados para la dirección tangencial
    
    // La fuerza del vórtice disminuye con la distancia
    const force = 1 / (1 + dist * 0.01) * strength;
    
    // Mezclamos el ángulo actual con el del vórtice
    const currentAngle = vector.angle;
    // (código de `shortest_angle` para una mezcla suave)
    const shortest_angle = ((((vortexAngle - currentAngle) % (2 * Math.PI)) + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
    const newAngle = currentAngle + shortest_angle * force * 0.1; // 0.1 para suavizar

    // Añadimos una rotación global lenta
    const finalAngle = newAngle + time * 0.1 * rotationSpeed;

    return {
      ...vector,
      angle: finalAngle,
    };
  });

  return { vectors: newVectors, animationData: [] };
};

// Meta
const vortexMeta: AnimationMeta<VortexProps> = {
  id: 'vortex',
  name: 'Vortex',
  description: 'Un campo de fuerza que arrastra los vectores en un vórtice.',
  category: 'core',
  icon: 'tornado',

  controls: [
    {
      id: 'strength',
      label: 'Strength',
      type: 'slider',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 1,
      description: 'Fuerza de atracción del vórtice'
    },
    {
      id: 'rotationSpeed',
      label: 'Rotation Speed',
      type: 'slider',
      min: 0,
      max: 5,
      step: 0.1,
      defaultValue: 1,
      description: 'Velocidad de giro global del vórtice'
    }
  ],

  defaultProps: {
    strength: 1,
    rotationSpeed: 1,
  },

  apply: applyVortex,
};

// Registro
registerAnimation(vortexMeta); 