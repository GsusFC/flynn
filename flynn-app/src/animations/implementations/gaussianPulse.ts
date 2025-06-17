import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface GaussianPulseProps {
  centerOrbitRadius: number; // % of min(dim) /2
  orbitSpeed: number;        // revolutions per second
  sigmaBase: number;         // base sigma (px)
  sigmaAmplitude: number;    // how much sigma breathes (+/-)
  sigmaFreq: number;         // Hz of breathing
  swirlStrength: number;     // adds tangential component
}

const applyGaussianPulse = ({ vectors, dimensions, time, props }: AnimationFrameData<GaussianPulseProps>): AnimationResult => {
  const {
    centerOrbitRadius = 30,
    orbitSpeed = 0.05,
    sigmaBase = 120,
    sigmaAmplitude = 60,
    sigmaFreq = 0.2,
    swirlStrength = 0.0,
  } = props;

  const minDim = Math.min(dimensions.width, dimensions.height);
  const orbitRadPx = (centerOrbitRadius / 100) * (minDim / 2);
  const orbitAngle = time * orbitSpeed * 2 * Math.PI;
  const centerX = dimensions.width / 2 + Math.cos(orbitAngle) * orbitRadPx;
  const centerY = dimensions.height / 2 + Math.sin(orbitAngle) * orbitRadPx;

  const sigma = sigmaBase + Math.sin(time * sigmaFreq * 2 * Math.PI) * sigmaAmplitude;
  const sx2 = Math.max(0.001, sigma * sigma);
  const sy2 = sx2;

  const results = vectors.map((v: Vector) => {
    const dx = v.x - centerX;
    const dy = v.y - centerY;

    // Gradient direction
    let angle = Math.atan2(dy / sy2, dx / sx2);

    // Optional swirl tangential component
    if (swirlStrength !== 0) {
      const radialAngle = Math.atan2(dy, dx);
      angle += swirlStrength * Math.PI/2; // 90deg tangential offset scaled
    }

    const exponent = -((dx*dx)/(2*sx2) + (dy*dy)/(2*sy2));
    const gVal = Math.exp(exponent);

    return {
      vector: { ...v, angle },
      data: { fieldStrength: gVal }
    };
  });

  return {
    vectors: results.map(r=>r.vector),
    animationData: results.map(r=>r.data)
  };
};

const gaussianPulseMeta: AnimationMeta<GaussianPulseProps> = {
  id: 'gaussianPulse',
  name: 'Gaussian Pulse',
  description: 'Un gradiente gaussiano cuyo centro orbita y la anchura (sigma) respira, creando ondas fluidas.',
  category: 'experimental',
  icon: 'radar',
  controls: [
    { id: 'centerOrbitRadius', type: 'slider', label: 'Radio Órbita (%)', min: 0, max: 50, step: 1, defaultValue: 30 },
    { id: 'orbitSpeed', type: 'slider', label: 'Velocidad Órbita (rev/s)', min: 0, max: 0.2, step: 0.01, defaultValue: 0.05 },
    { id: 'sigmaBase', type: 'slider', label: 'Sigma Base (px)', min: 20, max: 300, step: 5, defaultValue: 120 },
    { id: 'sigmaAmplitude', type: 'slider', label: 'Amplitud Sigma', min: 0, max: 200, step: 5, defaultValue: 60 },
    { id: 'sigmaFreq', type: 'slider', label: 'Frecuencia Respiración (Hz)', min: 0, max: 1, step: 0.05, defaultValue: 0.2 },
    { id: 'swirlStrength', type: 'slider', label: 'Fuerza Espiral', min: 0, max: 1, step: 0.05, defaultValue: 0 },
  ],
  defaultProps: {
    centerOrbitRadius: 30,
    orbitSpeed: 0.05,
    sigmaBase: 120,
    sigmaAmplitude: 60,
    sigmaFreq: 0.2,
    swirlStrength: 0,
  },
  apply: applyGaussianPulse,
};

registerAnimation(gaussianPulseMeta); 