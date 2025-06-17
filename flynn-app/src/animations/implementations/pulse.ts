import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface PulseProps {
  speed: number;
  amplitude: number;
  pulseWidth: number; // Ancho de la onda del pulso
  pulseState?: { active: boolean; startMs: number };
}

const applyPulse = ({ vectors, dimensions, props }: AnimationFrameData<PulseProps>): AnimationResult => {
  const { speed = 1, amplitude = Math.PI / 2, pulseWidth = 50, pulseState } = props;

  if (!pulseState?.active) {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const smooth = (current: number, target: number, factor = 0.1) => {
      let diff = target - current;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      return current + diff * factor;
    };

    const newVectors = vectors.map((v: Vector) => {
      const dx = v.x - centerX;
      const dy = v.y - centerY;
      const baseAngle = Math.atan2(dy, dx) + Math.PI / 2;
      return { ...v, angle: baseAngle };
    });
    return { vectors: newVectors, animationData: vectors.map(() => ({})) };
  }

  const elapsedSec = (Date.now() - pulseState.startMs) / 1000;
  const pulseRadius = elapsedSec * speed * 200;

  const results = vectors.map((vector: Vector) => {
    const dx = vector.x - dimensions.width / 2;
    const dy = vector.y - dimensions.height / 2;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    // Distancia del vector al frente de la onda
    const delta = Math.abs(distanceToCenter - pulseRadius);

    let angleOffset = 0;
    
    // Si el vector está dentro del ancho de la onda, aplicamos el efecto
    if (delta < pulseWidth) {
      // Usamos una función tipo gaussiana para un efecto suave
      const pulseEffect = Math.exp(-(delta * delta) / (pulseWidth * pulseWidth / 4));
      angleOffset = pulseEffect * amplitude;
    }

    const baseAngle = Math.atan2(dy, dx);
    const newAngle = baseAngle + angleOffset;

    return { 
      vector: { ...vector, angle: newAngle }, 
      data: { fieldStrength: angleOffset / amplitude } 
    };
  });

  return { 
    vectors: results.map((r: any) => r.vector), 
    animationData: results.map((r: any) => r.data) 
  };
};

const pulseMeta: AnimationMeta<PulseProps> = {
  id: 'pulse',
  name: 'Pulse',
  description: 'Genera una única onda expansiva desde el centro al ser activada.',
  category: 'core',
  icon: 'radio',
  
  controls: [
    {
      id: 'triggerPulse',
      type: 'button',
      label: '⚡ Pulso',
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad Expansión',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1,
    },
    {
      id: 'pulseWidth',
      type: 'slider',
      label: 'Ancho del Pulso',
      min: 10,
      max: 200,
      step: 5,
      defaultValue: 50,
    },
    {
      id: 'amplitude',
      type: 'slider',
      label: 'Amplitud (Fuerza)',
      min: 0,
      max: Math.PI,
      step: 0.05,
      defaultValue: Math.PI / 2,
    },
  ],
  
  defaultProps: {
    speed: 1,
    pulseWidth: 50,
    amplitude: Math.PI / 2,
  },
  
  apply: applyPulse,
};

registerAnimation(pulseMeta); 