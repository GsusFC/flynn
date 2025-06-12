import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { createNoise3D } from 'simplex-noise';

// Dos generadores de ruido para crear campos U y V no correlacionados.
// Usar createNoise3D() dos veces es suficiente para obtener instancias diferentes.
const noiseU = createNoise3D();
const noiseV = createNoise3D();

interface OceanCurrentsProps {
  scale: number;
  speed: number;
  force: number;
}

const applyOceanCurrents = ({ vectors, time, props }: AnimationFrameData<OceanCurrentsProps>): AnimationResult => {
  const { scale, speed, force } = props;

  const newVectors: Vector[] = vectors.map(vector => {
    const x = vector.x * scale;
    const y = vector.y * scale;
    const z = time * speed;

    // Muestrear el primer campo de ruido para la componente U (horizontal)
    const uComponent = noiseU(x, y, z) * force;
    
    // Muestrear el segundo campo de ruido para la componente V (vertical)
    // Se muestrea un punto diferente en el "espacio" del ruido para mayor aleatoriedad
    const vComponent = noiseV(x + 100, y + 100, z) * force;

    // El ángulo final es el del vector de flujo (U, V)
    const angle = Math.atan2(vComponent, uComponent);

    return {
      ...vector,
      angle: angle,
    };
  });

  return { vectors: newVectors, animationData: [] };
};

const oceanCurrentsMeta: AnimationMeta<OceanCurrentsProps> = {
  id: 'oceanCurrents',
  name: 'Ocean Currents',
  description: 'Simula corrientes oceánicas complejas usando dos campos de ruido.',
  category: 'core',
  icon: 'wind', // Re-using icon
  
  controls: [
    {
      id: 'scale',
      type: 'slider',
      label: 'Escala',
      min: 0.001,
      max: 0.05,
      step: 0.001,
      defaultValue: 0.008,
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad',
      min: 0.01,
      max: 0.3,
      step: 0.01,
      defaultValue: 0.05,
    },
    {
      id: 'force',
      type: 'slider',
      label: 'Fuerza',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1,
    },
  ],
  
  defaultProps: {
    scale: 0.008,
    speed: 0.05,
    force: 1,
  },
  
  apply: applyOceanCurrents,
};

registerAnimation(oceanCurrentsMeta); 