import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { simpleNoise } from '@/lib/noise';
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();

// Props
interface TurbulenceProps {
  speed: number;
  frequency: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

// Lógica
const applyTurbulence = ({ vectors, time, props }: AnimationFrameData<TurbulenceProps>): AnimationResult => {
  const { speed, frequency, octaves, persistence, lacunarity } = props;

  const results = vectors.map((vector: Vector) => {
    let x = vector.x * frequency;
    let y = vector.y * frequency;
    let z = time * speed;

    let noise = 0;
    let amp = 1;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
      noise += simpleNoise(x * (0.005 * freq), y * (0.005 * freq), z) * amp;
      amp *= 0.5;
      freq *= 2;
    }

    const angle = noise * Math.PI * 2;

    return {
      ...vector,
      angle: angle,
    };
  });

  return { vectors: results, animationData: [] };
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
    },
    {
      id: 'persistence',
      label: 'Persistence',
      type: 'slider',
      min: 0.1,
      max: 1,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Persistencia del ruido'
    },
    {
      id: 'lacunarity',
      label: 'Lacunarity',
      type: 'slider',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 2,
      description: 'Lacunarity del ruido'
    }
  ],

  defaultProps: {
    speed: 0.5,
    frequency: 1,
    octaves: 3,
    persistence: 0.5,
    lacunarity: 2,
  },

  apply: applyTurbulence,
};

// Registro
registerAnimation(turbulenceMeta); 