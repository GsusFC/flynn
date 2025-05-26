// Animación "perlinFlow" - Flujo basado en ruido de Perlin CORREGIDO
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación perlinFlow
interface PerlinFlowProps {
  noiseScale: number;
  timeEvolutionSpeed: number;
  angleMultiplier: number;
  octaves: number;
  persistence: number;
}

// Cache para factores de tiempo pre-calculados
let timeFactorsCache: { time: number; factors: number[] } | null = null;

// Función de ruido simple optimizada (aproximación de Perlin)
const simpleNoise = (x: number, y: number, time: number): number => {
  // Pre-calcular factores temporales si no están en cache
  if (!timeFactorsCache || timeFactorsCache.time !== time) {
    timeFactorsCache = {
      time,
      factors: [
        time,           // factor1
        time * 0.7,     // factor2  
        time * 1.3      // factor3
      ]
    };
  }

  const [timeFactor1, timeFactor2, timeFactor3] = timeFactorsCache.factors;
  
  // Usar frecuencias constantes pre-calculadas
  const freq1 = Math.sin(x * 0.1 + timeFactor1) * Math.cos(y * 0.1 + timeFactor1);
  const freq2 = Math.sin(x * 0.05 + timeFactor2) * Math.cos(y * 0.05 + timeFactor2) * 0.5;
  const freq3 = Math.sin(x * 0.2 + timeFactor3) * Math.cos(y * 0.2 + timeFactor3) * 0.25;
  
  return (freq1 + freq2 + freq3) / 1.75; // Normalizar
};

// Función de animación optimizada
const animatePerlinFlow = (
  vectors: SimpleVector[],
  props: PerlinFlowProps,
  context: AnimationContext
): SimpleVector[] => {
  const timeEvolution = context.time * props.timeEvolutionSpeed;
  
  // Pre-calcular constantes
  const angleMultiplierPi = props.angleMultiplier * Math.PI;
  const piOver180 = Math.PI / 180;
  const rad180OverPi = 180 / Math.PI;
  
  return vectors.map(vector => {
    // Coordenadas normalizadas para el ruido
    const noiseX = vector.originalX * props.noiseScale;
    const noiseY = vector.originalY * props.noiseScale;
    
    // Generar ruido con múltiples octavas
    let noiseValue = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for (let i = 0; i < props.octaves; i++) {
      noiseValue += simpleNoise(
        noiseX * frequency, 
        noiseY * frequency, 
        timeEvolution * frequency
      ) * amplitude;
      
      amplitude *= props.persistence;
      frequency *= 2;
    }
    
    // Convertir ruido a ángulo con mayor variación
    const noiseAngle = noiseValue * angleMultiplierPi;
    
    // Combinar con ángulo original para suavidad
    const baseAngle = vector.originalAngle * piOver180;
    const finalAngle = baseAngle + noiseAngle;
    
    // Convertir a grados y normalizar
    let angleDegrees = (finalAngle * rad180OverPi) % 360;
    if (angleDegrees < 0) angleDegrees += 360;
    
    return {
      ...vector,
      angle: angleDegrees
    };
  });
};

// Validación de props
const validatePerlinFlowProps = (props: PerlinFlowProps): boolean => {
  return (
    typeof props.noiseScale === 'number' &&
    typeof props.timeEvolutionSpeed === 'number' &&
    typeof props.angleMultiplier === 'number' &&
    typeof props.octaves === 'number' &&
    typeof props.persistence === 'number' &&
    props.noiseScale > 0 &&
    props.timeEvolutionSpeed >= 0 &&
    props.angleMultiplier > 0 &&
    props.octaves >= 1 &&
    props.octaves <= 6 &&
    props.persistence > 0 &&
    props.persistence <= 1
  );
};

// Exportar la animación perlinFlow corregida
export const perlinFlowAnimation = createSimpleAnimation<PerlinFlowProps>({
  id: 'perlinFlow',
  name: 'Flujo Perlin',
  description: 'Flujo orgánico basado en ruido de Perlin con variación angular completa',
  category: 'advanced',
  icon: '🌪️',
  controls: [
    {
      id: 'noiseScale',
      label: 'Escala de Ruido',
      type: 'slider',
      min: 0.001,
      max: 0.1,
      step: 0.001,
      defaultValue: 0.02,
      description: 'Escala del patrón de ruido',
      icon: '📏'
    },
    {
      id: 'timeEvolutionSpeed',
      label: 'Velocidad Temporal',
      type: 'slider',
      min: 0,
      max: 0.01,
      step: 0.0001,
      defaultValue: 0.002,
      description: 'Velocidad de evolución temporal',
      icon: '⏱️'
    },
    {
      id: 'angleMultiplier',
      label: 'Multiplicador Angular',
      type: 'slider',
      min: 0.5,
      max: 4,
      step: 0.1,
      defaultValue: 2,
      description: 'Intensidad de la variación angular',
      icon: '🔄'
    },
    {
      id: 'octaves',
      label: 'Octavas',
      type: 'slider',
      min: 1,
      max: 4,
      step: 1,
      defaultValue: 3,
      description: 'Número de capas de ruido',
      icon: '🌊'
    },
    {
      id: 'persistence',
      label: 'Persistencia',
      type: 'slider',
      min: 0.1,
      max: 0.8,
      step: 0.1,
      defaultValue: 0.5,
      description: 'Influencia de las octavas superiores',
      icon: '💪'
    }
  ],
  defaultProps: {
    noiseScale: 0.02,
    timeEvolutionSpeed: 0.002,
    angleMultiplier: 2,
    octaves: 3,
    persistence: 0.5
  },
  animate: animatePerlinFlow,
  validateProps: validatePerlinFlowProps
});
