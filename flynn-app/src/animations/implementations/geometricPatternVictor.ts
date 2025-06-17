import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { calculateAngle_GeometricPattern } from '../victor2/calculateAngles';

interface GeometricPatternV2Props {
  speed: number;      // Velocidad de rotación
}

const applyGeoV2 = ({ vectors, time, dimensions, props }: AnimationFrameData<GeometricPatternV2Props>): AnimationResult => {
  const { speed } = props;
  const timeFactor = time * speed;

  const results = vectors.map((vector: Vector) => {
    const angleRad = calculateAngle_GeometricPattern(
      vector.x,
      vector.y,
      timeFactor,
      dimensions.width,
      dimensions.height,
    );
    const finalAngle = angleRad;
    return { vector: { ...vector, angle: finalAngle }, data: {} };
  });

  return { vectors: results.map(r => r.vector), animationData: results.map(() => ({})) };
};

const geoV2Meta: AnimationMeta<GeometricPatternV2Props> = {
  id: 'geometricPatternV2',
  name: 'Geometric Pattern V2',
  description: 'Patrón geométrico tangencial (Victor 2).',
  category: 'legacy',
  icon: 'sun',
  controls: [
    { id: 'speed', label: 'Velocidad', type: 'slider', min: 0.1, max: 3, step: 0.1, defaultValue: 1 },
  ],
  defaultProps: { speed: 1 },
  apply: applyGeoV2,
};

registerAnimation(geoV2Meta); 