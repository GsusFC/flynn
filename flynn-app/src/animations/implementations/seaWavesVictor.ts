import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { calculateAngle_SeaWaves } from '../victor2/calculateAngles';

interface SeaWavesV2Props {
  speed: number;           // Velocidad temporal
  frequency: number;       // Frecuencia base de la onda
  amplitude: number;       // Amplitud (grados)
}

const applySeaWavesV2 = ({ vectors, time, dimensions, props }: AnimationFrameData<SeaWavesV2Props>): AnimationResult => {
  const { speed, frequency, amplitude } = props;
  const timeFactor = time * speed;

  const results = vectors.map((vector: Vector) => {
    const angleDeg = calculateAngle_SeaWaves(
      vector.x,
      vector.y,
      timeFactor,
      dimensions.width,
      dimensions.height,
      frequency,
      amplitude,
    );
    const finalAngle = angleDeg * Math.PI / 180;
    return { vector: { ...vector, angle: finalAngle }, data: {} };
  });

  return { vectors: results.map(r => r.vector), animationData: results.map(() => ({})) };
};

const seaWavesV2Meta: AnimationMeta<SeaWavesV2Props> = {
  id: 'seaWavesV2',
  name: 'Sea Waves V2',
  description: 'Olas marinas multi-capa modelo Victor 2.',
  category: 'legacy',
  icon: 'waves',
  controls: [
    { id: 'speed', label: 'Velocidad', type: 'slider', min: 0.2, max: 3, step: 0.1, defaultValue: 1 },
    { id: 'frequency', label: 'Frecuencia', type: 'slider', min: 0.5, max: 8, step: 0.1, defaultValue: 3 },
    { id: 'amplitude', label: 'Amplitud', type: 'slider', min: 10, max: 180, step: 5, defaultValue: 90 },
  ],
  defaultProps: { speed: 1, frequency: 3, amplitude: 90 },
  apply: applySeaWavesV2,
};

registerAnimation(seaWavesV2Meta);

interface SeaWavesVictorProps {
  speed: number;           // Velocidad temporal
  frequency: number;       // Frecuencia base de la onda
  amplitude: number;       // Amplitud (grados)
}

const applySeaWavesVictor = ({ vectors, time, dimensions, props }: AnimationFrameData<SeaWavesVictorProps>): AnimationResult => {
  const { speed, frequency, amplitude } = props;
  const timeFactor = time * speed;

  const results = vectors.map((vector: Vector) => {
    const angleRad = calculateAngle_SeaWaves(
      vector.x,
      vector.y,
      timeFactor,
      dimensions.width,
      dimensions.height,
      frequency,
      amplitude,
    );
    // Usamos directamente el ángulo en radianes
    const finalAngle = angleRad;

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

const seaWavesVictorMeta: AnimationMeta<SeaWavesVictorProps> = {
  id: 'seaWavesVictor',
  name: 'Sea Waves Victor',
  description: 'Olas marinas multi-capa modelo Victor.',
  category: 'legacy',
  icon: 'waves',
  controls: [
    { id: 'speed', label: 'Velocidad', type: 'slider', min: 0.2, max: 3, step: 0.1, defaultValue: 1 },
    { id: 'frequency', label: 'Frecuencia', type: 'slider', min: 0.5, max: 8, step: 0.1, defaultValue: 3 },
    { id: 'amplitude', label: 'Amplitud', type: 'slider', min: 10, max: 180, step: 5, defaultValue: 90 },
  ],
  defaultProps: { speed: 1, frequency: 3, amplitude: 90 },
  apply: applySeaWavesVictor,
};

registerAnimation(seaWavesVictorMeta); 