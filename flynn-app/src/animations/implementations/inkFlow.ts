import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { noise } from '@/lib/perlin';

interface InkFlowProps {
  flowSpeed: number;
  turbulence: number;
  streamStrength: number;
  direction: number; // en grados
}

const applyInkFlow = ({ vectors, time, props }: AnimationFrameData<InkFlowProps>): AnimationResult => {
  const { flowSpeed, turbulence, streamStrength, direction } = props;
  
  const timeFactor = time * flowSpeed * 0.1;
  const directionRad = direction * (Math.PI / 180);

  const targetAngles = vectors.map((vector: Vector) => {
    // 1. Corriente Principal (Base Flow)
    // Una onda suave que depende de la posición perpendicular a la dirección del flujo.
    const projected = vector.x * Math.sin(directionRad) - vector.y * Math.cos(directionRad);
    const baseAngle = directionRad + Math.sin(projected * 0.01 + timeFactor) * 0.5;

    // 2. Perturbaciones Locales (Turbulence)
    // Ruido Perlin que crea los remolinos.
    const noiseFactor = turbulence * 0.005;
    const noiseAngle = noise(
      vector.x * noiseFactor,
      vector.y * noiseFactor,
      timeFactor
    ) * Math.PI * 2; // El ruido da un valor [0,1], lo mapeamos a un círculo completo.

    // 3. Mezcla de ángulos
    // Usamos streamStrength para mezclar entre el flujo base y la turbulencia.
    // Para mezclar ángulos correctamente, lo hacemos en el espacio vectorial (x, y).
    const baseVec = { x: Math.cos(baseAngle), y: Math.sin(baseAngle) };
    const noiseVec = { x: Math.cos(noiseAngle), y: Math.sin(noiseAngle) };

    const finalVec = {
      x: baseVec.x * streamStrength + noiseVec.x * (1 - streamStrength),
      y: baseVec.y * streamStrength + noiseVec.y * (1 - streamStrength),
    };

    const finalAngle = Math.atan2(finalVec.y, finalVec.x);

    return finalAngle;
  });

  return {
    vectors: [...vectors],
    animationData: [], // No generamos datos extra por ahora
    targetAngles,
  };
};

const inkFlowMeta: AnimationMeta<InkFlowProps> = {
  id: 'inkFlow',
  name: 'Corrientes de Tinta',
  description: 'Un campo de flujo orgánico con remolinos dinámicos, basado en Ruido Perlin.',
  category: 'core',
  icon: 'wind',
  
  controls: [
    { id: 'direction', type: 'slider', label: 'Dirección Flujo', min: 0, max: 360, step: 1, defaultValue: 0 },
    { id: 'flowSpeed', type: 'slider', label: 'Velocidad', min: 0.1, max: 5, step: 0.1, defaultValue: 1 },
    { id: 'turbulence', type: 'slider', label: 'Turbulencia', min: 0.1, max: 10, step: 0.1, defaultValue: 3 },
    { id: 'streamStrength', type: 'slider', label: 'Fuerza Corriente', min: 0, max: 1, step: 0.05, defaultValue: 0.5 },
  ],
  
  defaultProps: {
    flowSpeed: 1,
    turbulence: 3,
    streamStrength: 0.5,
    direction: 0,
  },
  
  apply: applyInkFlow,
};

registerAnimation(inkFlowMeta); 