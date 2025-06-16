import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface PulseProps {
  speed: number;
  amplitude: number;
  pulseWidth: number; // Ancho de la onda del pulso
  // El estado del pulso se pasará desde el componente de la cuadrícula
  pulseState?: { active: boolean; startTime: number };
}

const applyPulse = ({ vectors, time, dimensions, props }: AnimationFrameData<PulseProps>): AnimationResult => {
  const { speed = 1, amplitude = Math.PI / 2, pulseWidth = 50, pulseState } = props;

  // Si no hay un pulso activo, no hacemos nada o aplicamos una ligera calma.
  if (!pulseState?.active) {
    // Los vectores vuelven lentamente a su ángulo original (si lo tuvieran) o a 0.
    const newVectors = vectors.map((v: Vector) => ({ ...v, angle: (v.angle || 0) * 0.9 }));
    return { vectors: newVectors, animationData: vectors.map(() => ({})) };
  }

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  
  // Tiempo transcurrido desde que se inició el pulso
  const elapsedTime = time - pulseState.startTime;
  
  // El radio del frente de la onda del pulso
  const pulseRadius = elapsedTime * speed * 200; // Multiplicador para velocidad perceptible

  const results = vectors.map((vector: Vector) => {
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;
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
      label: 'Lanzar Pulso',
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