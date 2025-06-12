import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector, SelectControlDef } from '../types';

const PATTERN_TYPES = ['torus', 'lissajous', 'hypocycloid'] as const;
type PatternType = typeof PATTERN_TYPES[number];

interface GeometricPatternProps {
  patternType: PatternType;
  paramA: number;
  paramB: number;
  paramC: number;
  paramD: number;
  timeFactor: number;
}

const applyGeometricPattern = ({ vectors, time, dimensions, props }: AnimationFrameData<GeometricPatternProps>): AnimationResult => {
  const { patternType, paramA, paramB, paramC, paramD, timeFactor } = props;
  const t = time * timeFactor;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const maxDist = Math.sqrt(centerX**2 + centerY**2);

  const results = vectors.map(vector => {
    const x = vector.x - centerX;
    const y = vector.y - centerY;
    const dist = Math.sqrt(x*x + y*y);
    const angleAtPos = Math.atan2(y, x);

    let finalAngle = 0;
    let fieldStrength = 0;

    switch (patternType) {
      case 'torus': {
        const torusValue = dist * 0.01 * paramA + t;
        finalAngle = angleAtPos + Math.PI / 2 + torusValue;
        fieldStrength = Math.sin(torusValue); // Valor oscilante
        break;
      }
      case 'lissajous': {
        const freqX = paramA * 0.01;
        const freqY = paramB * 0.01;
        const phaseX = paramC;
        const phaseY = paramD + t;
        finalAngle = Math.sin(x * freqX + phaseX) + Math.cos(y * freqY + phaseY);
        fieldStrength = (finalAngle / 2 + 0.5); // Normalizar aprox
        break;
      }
      case 'hypocycloid': {
        const k = paramA;
        finalAngle = ((k - 1) * angleAtPos) + t;
        // La fuerza de campo puede ser el ángulo normalizado, para crear un arcoiris
        fieldStrength = (angleAtPos + Math.PI) / (2 * Math.PI);
        break;
      }
    }

    const newVector = { ...vector, angle: finalAngle };
    const data = {
      angle: (angleAtPos + Math.PI) / (2 * Math.PI), // Normalizar a [0, 1]
      distance: dist / maxDist, // Normalizar a [0, 1]
      fieldStrength: (fieldStrength + 1) / 2, // Normalizar a [0, 1]
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map(r => r.vector);
  const animationData = results.map(r => r.data);

  return { vectors: newVectors, animationData };
};

const geometricPatternMeta: AnimationMeta<GeometricPatternProps> = {
  id: 'geometricPattern',
  name: 'Geometric Pattern',
  description: 'Genera patrones basados en fórmulas matemáticas.',
  category: 'core',
  icon: 'shapes',
  
  controls: [
    {
      id: 'patternType',
      type: 'select',
      label: 'Tipo de Patrón',
      defaultValue: 'torus',
      options: [
        { value: 'torus', label: 'Toroide' },
        { value: 'lissajous', label: 'Lissajous' },
        { value: 'hypocycloid', label: 'Hipocicloide' },
      ],
    } as SelectControlDef<PatternType>, // Type assertion
    { id: 'paramA', type: 'slider', label: 'Parámetro A', min: -10, max: 10, step: 0.1, defaultValue: 3 },
    { id: 'paramB', type: 'slider', label: 'Parámetro B', min: -10, max: 10, step: 0.1, defaultValue: 2 },
    { id: 'paramC', type: 'slider', label: 'Parámetro C', min: 0, max: Math.PI * 2, step: 0.1, defaultValue: 1 },
    { id: 'paramD', type: 'slider', label: 'Parámetro D', min: 0, max: Math.PI * 2, step: 0.1, defaultValue: 1.5 },
    { id: 'timeFactor', type: 'slider', label: 'Factor Tiempo', min: 0, max: 1, step: 0.01, defaultValue: 0.1 },
  ],
  
  defaultProps: {
    patternType: 'torus',
    paramA: 3,
    paramB: 2,
    paramC: 1,
    paramD: 1.5,
    timeFactor: 0.1,
  },
  
  apply: applyGeometricPattern,
  enableLengthDynamics: false,
};

registerAnimation(geometricPatternMeta); 