import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();

interface PerlinFlowProps {
  scale: number;
  speed: number;
  force: number;
}

const applyPerlinFlow = ({ vectors, time, props }: AnimationFrameData<PerlinFlowProps>): AnimationResult => {
  const { scale, speed, force } = props;

  const results = vectors.map((vector: Vector) => {
    const noiseValue = noise3D(vector.x * scale, vector.y * scale, time * speed);
    const angle = ((noiseValue + 1) / 2) * Math.PI * 2 * force;

    const newVector = {
      ...vector,
      angle: angle,
    };
    
    const data = {
      fieldStrength: (noiseValue + 1) / 2, // Normalizar a [0, 1]
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map((r: any) => r.vector);
  const animationData = results.map((r: any) => r.data);

  return { vectors: newVectors, animationData };
};

const perlinFlowMeta: AnimationMeta<PerlinFlowProps> = {
  id: 'perlinFlow',
  name: 'Perlin Flow',
  description: 'Un campo de flujo basado en ruido Perlin/Simplex que evoluciona en el tiempo.',
  category: 'core',
  icon: 'wind',
  
  controls: [
    {
      id: 'scale',
      type: 'slider',
      label: 'Escala',
      min: 0.001,
      max: 0.1,
      step: 0.001,
      defaultValue: 0.02,
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad',
      min: 0.01,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.1,
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
    scale: 0.02,
    speed: 0.1,
    force: 1,
  },
  
  apply: applyPerlinFlow,
};

registerAnimation(perlinFlowMeta); 