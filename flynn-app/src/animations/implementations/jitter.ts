import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface JitterProps {
  amount: number;
}

const applyJitter = ({ vectors, props: { amount } }: AnimationFrameData<JitterProps>): AnimationResult => {
  const results = vectors.map((vector: Vector) => {
    // jitterAmount va de -amount a +amount
    const jitterAmount = (Math.random() - 0.5) * amount * 2; 
    
    const newVector = {
      ...vector,
      angle: vector.angle + jitterAmount,
    };
    
    const data = {
      // Normalizamos el valor absoluto del jitter a [0, 1]
      fieldStrength: Math.abs(jitterAmount) / amount,
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map((r: any) => r.vector);
  const animationData = results.map((r: any) => r.data);

  return { vectors: newVectors, animationData };
};

const jitterMeta: AnimationMeta<JitterProps> = {
  id: 'jitter',
  name: 'Jitter',
  description: 'Añade una variación aleatoria a los vectores en cada fotograma.',
  category: 'core',
  icon: 'zap',
  
  controls: [
    {
      id: 'amount',
      type: 'slider',
      label: 'Intensidad',
      min: 0,
      max: Math.PI / 4,
      step: 0.01,
      defaultValue: Math.PI / 16,
    },
  ],
  
  defaultProps: {
    amount: Math.PI / 16,
  },
  
  apply: applyJitter,
};

registerAnimation(jitterMeta); 