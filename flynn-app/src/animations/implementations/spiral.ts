import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult } from '../types';
import type { Vector } from '@/app/dev/FlynVectorGrid';

// Props
interface SpiralProps {
  speed: number;
  intensity: number;
  tightness: number; // Nueva prop para el "apretado" de la espiral
}

// Lógica
const applySpiral = ({ vectors, time, props, dimensions }: AnimationFrameData<SpiralProps>): AnimationResult => {
  const { speed, intensity, tightness } = props;
  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;
  const animationData: Array<Record<string, any>> = [];

  const newVectors = vectors.map((vector) => {
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToCenter = Math.atan2(dy, dx);
    
    const spiralAngle = time * speed + dist * (0.01 * tightness);
    const angle = angleToCenter + spiralAngle;

    animationData.push({ fieldStrength: dist / Math.max(width, height) });

    return {
      ...vector,
      angle: (vector.angle + angle * intensity * 0.1) % (Math.PI * 2)
    };
  });

  return { vectors: newVectors, animationData };
};

// Meta
const spiralMeta: AnimationMeta<SpiralProps> = {
  id: 'spiral',
  name: 'Spiral',
  description: 'Los vectores giran en espiral alrededor del centro.',
  category: 'core',
  icon: 'rotate_right',

  controls: [
    {
      id: 'speed',
      label: 'Speed',
      type: 'slider',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1,
      description: 'Velocidad de rotación de la espiral'
    },
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'slider',
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 0.5,
      description: 'Fuerza del efecto espiral'
    },
    {
      id: 'tightness',
      label: 'Tightness',
      type: 'slider',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 2,
      description: 'Cómo de "apretados" están los brazos de la espiral'
    }
  ],

  defaultProps: {
    speed: 1,
    intensity: 0.5,
    tightness: 2,
  },

  apply: applySpiral,
};

// Registro
registerAnimation(spiralMeta); 