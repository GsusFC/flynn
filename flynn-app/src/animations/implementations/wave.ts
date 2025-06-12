import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult } from '../types';

// Props
interface WaveProps {
  speed: number;
  intensity: number;
  frequency: number; // Nueva prop para controlar la "densidad" de la onda
}

// Lógica
const applyWave = ({ vectors, time, props }: AnimationFrameData<WaveProps>): AnimationResult => {
  const { speed, intensity, frequency } = props;
  
  const results = vectors.map((vector) => {
    const waveValue = Math.sin(vector.y * (0.01 * frequency) + time * speed) * intensity;
    
    const newVector = {
      ...vector,
      angle: waveValue,
    };
    
    const data = {
      fieldStrength: (waveValue / intensity + 1) / 2, // Normalizar a [0, 1]
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map(r => r.vector);
  const animationData = results.map(r => r.data);

  return { vectors: newVectors, animationData };
};

// Meta
const waveMeta: AnimationMeta<WaveProps> = {
  id: 'wave',
  name: 'Wave',
  description: 'Onda sinusoidal que afecta al ángulo de los vectores.',
  category: 'core',
  icon: 'waves',
  
  controls: [
    {
      id: 'speed',
      label: 'Velocidad',
      type: 'slider',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1,
    },
    {
      id: 'intensity',
      label: 'Intensidad',
      type: 'slider',
      min: 0,
      max: Math.PI / 2,
      step: 0.05,
      defaultValue: 1,
    },
    {
      id: 'frequency',
      label: 'Frecuencia',
      type: 'slider',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 5,
    }
  ],
  
  defaultProps: {
    speed: 1,
    intensity: 1,
    frequency: 5,
  },
  
  apply: applyWave,
};

// Registro
registerAnimation(waveMeta); 