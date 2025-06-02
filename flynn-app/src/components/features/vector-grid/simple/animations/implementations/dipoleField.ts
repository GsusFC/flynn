// Dipole Field Animation - Campo eléctrico de dipolo
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación dipoleField
interface DipoleFieldProps {
  separation: number;
  strength: number;
  rotation: number;
}

// Función principal de animación - ULTRA SIMPLE
const animateDipoleField = (
  vectors: SimpleVector[],
  props: DipoleFieldProps,
  context: AnimationContext
): SimpleVector[] => {
  const { separation, strength, rotation } = props;
  const { canvasWidth, canvasHeight, time } = context;
  
  // Posiciones de las dos cargas (centro del canvas)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Separación mucho mayor - usar porcentaje del canvas
  const sep = separation * Math.min(canvasWidth, canvasHeight) * 0.3; // 30% del canvas
  
  // Rotación del dipolo con tiempo
  const angle = rotation + time * 0.002; // Más rápido
  
  // Posiciones de carga positiva y negativa
  const x1 = centerX + Math.cos(angle) * sep;
  const y1 = centerY + Math.sin(angle) * sep;
  const x2 = centerX - Math.cos(angle) * sep;
  const y2 = centerY - Math.sin(angle) * sep;
  
  return vectors.map(vector => {
    // Distancias a cada carga
    const dx1 = vector.x - x1;
    const dy1 = vector.y - y1;
    const dx2 = vector.x - x2;
    const dy2 = vector.y - y2;
    
    const r1 = Math.sqrt(dx1*dx1 + dy1*dy1) + 1; // +1 evita división por 0
    const r2 = Math.sqrt(dx2*dx2 + dy2*dy2) + 1;
    
    // Campo eléctrico simple: E = k*Q/r²
    // Carga 1: positiva, Carga 2: negativa
    const Ex = strength * (dx1/(r1*r1*r1) - dx2/(r2*r2*r2));
    const Ey = strength * (dy1/(r1*r1*r1) - dy2/(r2*r2*r2));
    
    // Convertir a ángulo
    const fieldAngleRadians = Math.atan2(Ey, Ex);
    let fieldAngleDegrees = fieldAngleRadians * (180 / Math.PI);
    // Normalizar el ángulo a un rango de 0-360 grados
    fieldAngleDegrees = ((fieldAngleDegrees % 360) + 360) % 360;
    
    // Magnitud del campo para la longitud
    const fieldMagnitude = Math.sqrt(Ex*Ex + Ey*Ey);
    const lengthMultiplier = 0.5 + Math.min(fieldMagnitude * 0.1, 2.0);
    
    return {
      ...vector,
      angle: fieldAngleDegrees,
      length: vector.length * lengthMultiplier
    };
  });
};

// Validación simple
const validateDipoleFieldProps = (props: DipoleFieldProps): boolean => {
  return typeof props.separation === 'number' && 
         typeof props.strength === 'number' && 
         typeof props.rotation === 'number';
};

// Exportar la animación
export const dipoleFieldAnimation = createSimpleAnimation<DipoleFieldProps>({
  id: 'dipoleField',
  name: 'Campo Dipolo',
  description: 'Campo eléctrico de un dipolo - dos cargas opuestas que crean patrones clásicos',
  category: 'advanced',
  icon: '⚡',
  controls: [
    {
      id: 'separation',
      label: 'Separación',
      type: 'slider',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Distancia entre las cargas',
      icon: '↔️'
    },
    {
      id: 'strength',
      label: 'Intensidad',
      type: 'slider',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 500,
      description: 'Fuerza del campo eléctrico',
      icon: '💪'
    },
    {
      id: 'rotation',
      label: 'Rotación',
      type: 'slider',
      min: 0,
      max: 6.28,
      step: 0.1,
      defaultValue: 0,
      description: 'Ángulo del dipolo en radianes',
      icon: '🔄'
    }
  ],
  defaultProps: {
    separation: 1.0,
    strength: 500,
    rotation: 0
  },
  animate: animateDipoleField,
  validateProps: validateDipoleFieldProps
});