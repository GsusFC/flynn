import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();

interface CurlNoiseProps {
  scale: number;
  speed: number;
  epsilon: number;
}

const applyCurlNoise = ({ vectors, time, props }: AnimationFrameData<CurlNoiseProps>): AnimationResult => {
  const { scale, speed, epsilon } = props;

  const results = vectors.map(vector => {
    const x = vector.x * scale;
    const y = vector.y * scale;
    const z = time * speed;

    // Calcular la derivada parcial del ruido con respecto a Y (para la componente X del curl)
    const n1_y = noise3D(x, y + epsilon, z);
    const n2_y = noise3D(x, y - epsilon, z);
    const dNdY = (n1_y - n2_y) / (2 * epsilon);

    // Calcular la derivada parcial del ruido con respecto a X (para la componente Y del curl)
    const n1_x = noise3D(x + epsilon, y, z);
    const n2_x = noise3D(x - epsilon, y, z);
    const dNdX = (n1_x - n2_x) / (2 * epsilon);

    // El vector del campo de curl es (dNdY, -dNdX)
    // El nuevo ángulo es el ángulo de este vector
    const angle = Math.atan2(-dNdX, dNdY);
    
    // La magnitud del vector del curl nos da una buena medida de la fuerza del campo
    const fieldMagnitude = Math.sqrt(dNdY**2 + dNdX**2);

    const newVector = {
      ...vector,
      angle: angle,
    };
    
    const data = {
      // Normalizamos de forma aproximada. Los valores rara vez superan ~50 con los props por defecto.
      fieldStrength: Math.min(fieldMagnitude / 50, 1.0), 
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map(r => r.vector);
  const animationData = results.map(r => r.data);

  return { vectors: newVectors, animationData };
};

const curlNoiseMeta: AnimationMeta<CurlNoiseProps> = {
  id: 'curlNoise',
  name: 'Curl Noise',
  description: 'Un campo de flujo sin divergencia que crea patrones de remolinos estables.',
  category: 'core',
  icon: 'swirl', // Usaré un ícono custom o uno que se parezca
  
  controls: [
    {
      id: 'scale',
      type: 'slider',
      label: 'Escala',
      min: 0.001,
      max: 0.1,
      step: 0.001,
      defaultValue: 0.01,
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad',
      min: 0.01,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.05,
    },
    {
      id: 'epsilon',
      type: 'slider',
      label: 'Epsilon (detalle)',
      min: 0.001,
      max: 0.1,
      step: 0.001,
      defaultValue: 0.01,
    },
  ],
  
  defaultProps: {
    scale: 0.01,
    speed: 0.05,
    epsilon: 0.01,
  },
  
  apply: applyCurlNoise,
};

registerAnimation(curlNoiseMeta); 