import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface GaussianGradientProps {
  centerX: number; // percentage
  centerY: number; // percentage
  sigmaX: number;
  sigmaY: number;
  invert: boolean;
}

const applyGaussianGradient = ({ vectors, dimensions, props }: AnimationFrameData<GaussianGradientProps>): AnimationResult => {
  const { centerX, centerY, sigmaX, sigmaY, invert } = props;

  const realCenterX = dimensions.width * (centerX / 100);
  const realCenterY = dimensions.height * (centerY / 100);

  // Evitar división por cero si sigma es cero
  const sx2 = Math.max(0.001, sigmaX * sigmaX);
  const sy2 = Math.max(0.001, sigmaY * sigmaY);

  const results = vectors.map(vector => {
    const dx = vector.x - realCenterX;
    const dy = vector.y - realCenterY;

    let angle = Math.atan2(dy / sy2, dx / sx2);
    
    if (invert) {
      angle += Math.PI;
    }
    
    // Calcular el valor de la función Gaussiana en este punto
    const exponent = -((dx**2) / (2 * sx2) + (dy**2) / (2 * sy2));
    const gaussianValue = Math.exp(exponent);

    const newVector = {
      ...vector,
      angle: angle,
    };
    
    const data = {
      // El valor de la gaussiana ya está en el rango [0, 1]
      fieldStrength: gaussianValue,
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map(r => r.vector);
  const animationData = results.map(r => r.data);

  return { vectors: newVectors, animationData };
};

const gaussianGradientMeta: AnimationMeta<GaussianGradientProps> = {
  id: 'gaussianGradient',
  name: 'Gaussian Gradient',
  description: 'Los vectores siguen el gradiente de una función Gaussiana.',
  category: 'core',
  icon: 'aperture',
  
  controls: [
    { id: 'centerX', type: 'slider', label: 'Centro X (%)', min: 0, max: 100, step: 1, defaultValue: 50 },
    { id: 'centerY', type: 'slider', label: 'Centro Y (%)', min: 0, max: 100, step: 1, defaultValue: 50 },
    { id: 'sigmaX', type: 'slider', label: 'Propagación X', min: 1, max: 500, step: 1, defaultValue: 100 },
    { id: 'sigmaY', type: 'slider', label: 'Propagación Y', min: 1, max: 500, step: 1, defaultValue: 100 },
    { id: 'invert', type: 'checkbox', label: 'Invertir', defaultValue: false },
  ],
  
  defaultProps: {
    centerX: 50,
    centerY: 50,
    sigmaX: 100,
    sigmaY: 100,
    invert: false,
  },
  
  apply: applyGaussianGradient,
  enableLengthDynamics: false, // Es un campo estático, la longitud no debería variar
};

registerAnimation(gaussianGradientMeta); 