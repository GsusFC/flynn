import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface SeaWavesProps {
  numWaves: number;
  speed: number;
  direction: number; // angle in radians
  waviness: number;
  amplitude: number;
}

// Pre-definir algunas características para las capas de olas para no saturar la UI
const WAVE_PARAMS = [
  { freqMultiplier: 1.0, ampMultiplier: 1.0, speedMultiplier: 1.0 },
  { freqMultiplier: 2.2, ampMultiplier: 0.4, speedMultiplier: 0.7 },
  { freqMultiplier: 0.7, ampMultiplier: 0.6, speedMultiplier: 1.5 },
  { freqMultiplier: 3.1, ampMultiplier: 0.2, speedMultiplier: 0.4 },
  { freqMultiplier: 1.5, ampMultiplier: 0.8, speedMultiplier: 1.2 },
];

const applySeaWaves = ({ vectors, time, props }: AnimationFrameData<SeaWavesProps>): AnimationResult => {
  const { numWaves, speed, direction, waviness, amplitude } = props;

  const cosDir = Math.cos(direction);
  const sinDir = Math.sin(direction);

  const results = vectors.map((vector: Vector) => {
    const rotatedX = vector.x * cosDir + vector.y * sinDir;
    
    let totalOffset = 0;
    let maxPossibleAmplitude = 0;

    for (let i = 0; i < numWaves && i < WAVE_PARAMS.length; i++) {
      const params = WAVE_PARAMS[i];
      const frequency = waviness * params.freqMultiplier;
      const waveAmplitude = amplitude * params.ampMultiplier;
      const waveSpeed = speed * params.speedMultiplier;

      const wave = Math.sin(rotatedX * frequency * 0.01 + time * waveSpeed) * waveAmplitude;
      totalOffset += wave;
      maxPossibleAmplitude += waveAmplitude;
    }

    const finalAngle = direction + totalOffset;

    const newVector = {
      ...vector,
      angle: finalAngle,
    };
    
    const data = {
      // Normalizamos el offset por la amplitud máxima posible para obtener un valor [0, 1]
      fieldStrength: maxPossibleAmplitude > 0 ? (totalOffset / maxPossibleAmplitude + 1) / 2 : 0.5,
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map((r: any) => r.vector);
  const animationData = results.map((r: any) => r.data);

  return { vectors: newVectors, animationData };
};

const seaWavesMeta: AnimationMeta<SeaWavesProps> = {
  id: 'seaWaves',
  name: 'Sea Waves',
  description: 'Simula el movimiento de las olas del mar superponiendo múltiples ondas.',
  category: 'core',
  icon: 'waves', // Re-using this icon
  
  controls: [
    { id: 'direction', type: 'slider', label: 'Dirección', min: 0, max: Math.PI * 2, step: 0.05, defaultValue: 0 },
    { id: 'speed', type: 'slider', label: 'Velocidad', min: 0.1, max: 3, step: 0.1, defaultValue: 0.8 },
    { id: 'waviness', type: 'slider', label: 'Agitación', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5 },
    { id: 'amplitude', type: 'slider', label: 'Amplitud', min: 0.1, max: Math.PI / 2, step: 0.05, defaultValue: 0.4 },
    { id: 'numWaves', type: 'slider', label: 'Nº de Olas', min: 1, max: WAVE_PARAMS.length, step: 1, defaultValue: 3 },
  ],
  
  defaultProps: {
    numWaves: 3,
    speed: 0.8,
    direction: 0,
    waviness: 0.5,
    amplitude: 0.4,
  },
  
  apply: applySeaWaves,
};

registerAnimation(seaWavesMeta); 