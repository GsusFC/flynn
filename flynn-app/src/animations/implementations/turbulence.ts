import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult } from '../types';
import { simpleNoise } from '@/lib/noise';

// Props
interface TurbulenceProps {
  speed: number;
  frequency: number;
  octaves: number;
}

// Lógica
const applyTurbulence = ({ vectors, time, props }: AnimationFrameData<TurbulenceProps>): AnimationResult => {
  const { speed, frequency, octaves } = props;

  const newVectors = vectors.map((vector) => {
    let noise = 0;
    let amp = 1;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
      noise += simpleNoise(vector.x * (0.005 * freq), vector.y * (0.005 * freq), time * speed) * amp;
      amp *= 0.5;
      freq *= 2;
    }

    const angle = noise * Math.PI * 2;

    return {
      ...vector,
      angle: angle,
    };
  });

  return { vectors: newVectors, animationData: [] };
};

// Meta
const turbulenceMeta: AnimationMeta<TurbulenceProps> = {
  id: 'turbulence',
  name: 'Turbulence',
  description: 'Campo de ruido perlin que crea un efecto de flujo turbulento.',
  category: 'core',
  icon: 'waves',

  controls: [
    {
      id: 'speed',
      label: 'Speed',
      type: 'slider',
      min: 0.1,
      max: 2,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Velocidad de evolución del ruido'
    },
    {
      id: 'frequency',
      label: 'Frequency',
      type: 'slider',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 1,
      description: 'Frecuencia base del ruido'
    },
    {
        id: 'octaves',
        label: 'Octaves',
        type: 'slider',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 3,
        description: 'Capas de ruido para añadir detalle'
    }
  ],

  defaultProps: {
    speed: 0.5,
    frequency: 1,
    octaves: 3,
  },

  apply: applyTurbulence,
};

// Registro
registerAnimation(turbulenceMeta); 