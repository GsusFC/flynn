// Flow Field Animation - Campo de flujo con ruido Perlin
import type { AnimationModule, AnimationContext } from '../types';
import type { SimpleVector } from '../../simpleTypes';

// Función de ruido corregida y simplificada
function noise(x: number, y: number, z: number = 0): number {
  // Función hash mejorada que produce valores entre -1 y 1
  const hash = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return (hash - Math.floor(hash)) * 2 - 1; // Normalizar a [-1, 1]
}

// Función de ruido simple y efectiva
function simpleNoise(x: number, y: number, time: number): number {
  // Múltiples frecuencias para variación
  const n1 = noise(x * 1.0, y * 1.0, time) * 0.5;
  const n2 = noise(x * 2.0, y * 2.0, time) * 0.25;
  const n3 = noise(x * 4.0, y * 4.0, time) * 0.125;
  
  return n1 + n2 + n3;
}

export const flowFieldAnimation: AnimationModule = {
  id: 'flowField',
  name: 'Flow Field',
  description: 'Campo de flujo orgánico usando ruido Perlin para direcciones naturales',
  category: 'flow',
  icon: '🌊',
  
  controls: [
    {
      id: 'scale',
      label: 'Escala del Campo',
      type: 'slider',
      min: 0.005,
      max: 0.05,
      step: 0.001,
      defaultValue: 0.02
    },
    {
      id: 'strength',
      label: 'Fuerza',
      type: 'slider',
      min: 0.1,
      max: 3.0,
      step: 0.1,
      defaultValue: 1.0
    },
    {
      id: 'timeScale',
      label: 'Velocidad Temporal',
      type: 'slider',
      min: 0.0,
      max: 0.02,
      step: 0.001,
      defaultValue: 0.005
    },
    {
      id: 'coherence',
      label: 'Coherencia',
      type: 'slider',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0
    }
  ],
  
  defaultProps: {
    scale: 0.02,    // Matched from controls
    strength: 1.0,  // Matched from controls
    timeScale: 0.005, // Matched from controls
    coherence: 1.0   // Matched from controls
  },
  
  validateProps: (props: Record<string, unknown>): boolean => {
    const { scale, strength, timeScale, coherence } = props;
    // Validate against control definitions
    return (
      typeof scale === 'number' && scale >= 0.005 && scale <= 0.05 &&
      typeof strength === 'number' && strength >= 0.1 && strength <= 3.0 &&
      typeof timeScale === 'number' && timeScale >= 0.0 && timeScale <= 0.02 &&
      typeof coherence === 'number' && coherence >= 0.1 && coherence <= 2.0
    );
  },
  
  animate: (
    vectors: SimpleVector[], 
    props: Record<string, unknown>, 
    context: AnimationContext
  ): SimpleVector[] => {
    const { 
      scale = flowFieldAnimation.defaultProps.scale, 
      strength = flowFieldAnimation.defaultProps.strength, 
      timeScale = flowFieldAnimation.defaultProps.timeScale,
      coherence = flowFieldAnimation.defaultProps.coherence
    } = props;
    
    const { time, canvasWidth, canvasHeight } = context;
    const currentTime = time * (timeScale as number);
    
    return vectors.map(vector => {
      // Coordenadas normalizadas simples
      const nx = vector.x * (scale as number);
      const ny = vector.y * (scale as number);
      
      // Generar ángulo del campo usando ruido mejorado
      const noiseValue = simpleNoise(nx, ny, currentTime);
      
      // Convertir ruido a ángulo con más variación
      const flowAngle = noiseValue * Math.PI * (coherence as number);
      
      // Factor de mezcla mucho más agresivo
      const mixFactor = Math.min((strength as number) * 0.8, 1.0);
      
      // Diferencia angular más corta
      let angleDiff = flowAngle - vector.angle;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Aplicar cambio directo y visible
      const newAngle = vector.angle + angleDiff * mixFactor;
      
      // Longitud dinámica basada en intensidad del ruido
      const intensity = Math.abs(noiseValue);
      const lengthMultiplier = 0.6 + intensity * 0.8;
      
      return {
        ...vector,
        angle: newAngle,
        length: vector.length * lengthMultiplier
      };
    });
  }
};