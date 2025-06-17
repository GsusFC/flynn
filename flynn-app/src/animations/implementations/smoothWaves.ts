import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { calculateAngle_SmoothWaves } from '../victor2/calculateAngles';

interface SmoothWavesProps {
  speed: number;        // Factor de velocidad temporal
  frequency: number;    // Escala de la onda en eje X/Y
  amplitude: number;    // Amplitud en radianes
}

const applySmoothWaves = ({ vectors, time, dimensions, props }: AnimationFrameData<SmoothWavesProps>): AnimationResult => {
  const { speed, frequency, amplitude } = props;
  const timeFactor = time * speed;

  const results = vectors.map((vector: Vector) => {
    const angleRad = calculateAngle_SmoothWaves(
      vector.x,
      vector.y,
      timeFactor,
      dimensions.width,
      dimensions.height,
    );
    // Aplicamos frequency y amplitude directamente en radianes
    const finalAngle = angleRad * frequency * amplitude;

    return {
      targetAngle: finalAngle,
      data: { fieldStrength: (Math.sin(timeFactor) + 1) / 2 },
    };
  });

  const targetAngles = results.map(r => r.targetAngle);
  const animationData = results.map(r => r.data);

  return {
    vectors: [...vectors],
    animationData: animationData,
    targetAngles: targetAngles,
  };
};

const smoothWavesMeta: AnimationMeta<SmoothWavesProps> = {
  id: 'smoothWaves',
  name: 'Smooth Waves',
  description: 'Ondas senoidales suaves (versión Victor 2).',
  category: 'legacy',
  icon: 'waves',
  controls: [
    { id: 'speed', label: 'Velocidad', type: 'slider', min: 0.2, max: 3, step: 0.1, defaultValue: 1 },
    { id: 'frequency', label: 'Frecuencia', type: 'slider', min: 0.1, max: 3, step: 0.1, defaultValue: 1 },
    { id: 'amplitude', label: 'Amplitud', type: 'slider', min: 0.1, max: 2, step: 0.1, defaultValue: 1 },
  ],
  defaultProps: {
    speed: 1,
    frequency: 1,
    amplitude: 3,
  },
  apply: applySmoothWaves,
};

registerAnimation(smoothWavesMeta); 