import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

// Props
interface WaveProps {
  speed: number;
  intensity: number;
  frequency: number; // Nueva prop para controlar la "densidad" de la onda
  amplitude: number;
  direction: number; // en grados
}

// Lógica
const applyWave = ({ vectors, time, layout, props }: AnimationFrameData<WaveProps>): AnimationResult => {
  const { speed, intensity, frequency, amplitude, direction } = props;
  const angleRad = direction * (Math.PI / 180);

  // Detectar si la cuadrícula es de tipo polar/radial
  const isRadial = layout?.rings !== undefined && layout.rings > 0;

  const results = vectors.map((vector: Vector) => {
    let waveValue;

    if (isRadial) {
      // Comportamiento para cuadrículas polares/radiales
      const ring = vector.ring ?? 0;
      const totalRings = layout?.rings ?? 1;
      // Propagar la onda desde el centro hacia afuera
      waveValue = Math.sin(ring * (frequency / totalRings) - time * speed) * intensity;
    } else {
      // Comportamiento original para cuadrículas cartesianas (onda plana)
      const projected = vector.x * Math.cos(angleRad) + vector.y * Math.sin(angleRad);
      waveValue = Math.sin(projected * (0.01 * frequency) + time * speed) * intensity;
    }
    
    const newVector = {
      ...vector,
      angle: waveValue * 3, // Absoluto, no aditivo + escalado para ser más visible
    };
    
    const data = {
      fieldStrength: (waveValue / intensity + 1) / 2, // Normalizar a [0, 1]
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map((r: any) => r.vector);
  const animationData = results.map((r: any) => r.data);

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
    },
    {
      id: 'amplitude',
      label: 'Amplitud',
      type: 'slider',
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 5,
    },
    {
      id: 'direction',
      label: 'Dirección',
      type: 'slider',
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 0,
    }
  ],
  
  defaultProps: {
    speed: 1,
    intensity: 2,
    frequency: 5,
    amplitude: 5,
    direction: 0,
  },
  
  apply: applyWave,
};

// Registro
registerAnimation(waveMeta); 