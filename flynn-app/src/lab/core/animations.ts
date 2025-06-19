import * as THREE from 'three';
import { LabVector } from './types';

/**
 * Propiedades de control para la animación de Vortex.
 */
export interface VortexProps {
  strength: number;
  rotationSpeed: number;
}

/**
 * Adaptación de la animación Vortex de Flynn para el Lab 3D.
 * Calcula el ángulo de rotación para cada vector en un campo de vórtice.
 * 
 * @param vectors - Array de vectores del grid del laboratorio.
 * @param time - Tiempo de la animación (de useFrame).
 * @param props - Propiedades de control (fuerza, velocidad).
 * @returns Un array de ángulos (en radianes) para cada vector.
 */
export const applyVortex = (
  vectors: LabVector[],
  time: number,
  props: VortexProps
): number[] => {
  const { strength, rotationSpeed } = props;
  
  // Asumimos un grid cuadrado centrado en el origen.
  // La dimensión no es tan crítica aquí como la posición relativa.
  const centerX = 0;
  const centerY = 0;

  const angles = vectors.map((vector) => {
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;
    
    // Angulo hacia el centro, más un offset perpendicular para crear el giro
    const angleToCenter = Math.atan2(dy, dx);
    const vortexAngle = angleToCenter + Math.PI / 2;
    
    // Para simplificar, no usaremos la mezcla suave del original por ahora.
    // Aplicamos directamente el ángulo del vórtice.
    const newAngle = vortexAngle;

    // Añadimos una rotación global lenta
    const finalAngle = newAngle + time * 0.1 * rotationSpeed;

    return finalAngle * strength; // La fuerza modula la rotación final
  });

  return angles;
};

/**
 * Propiedades de control para la animación de longitud oscilante.
 */
export interface OscillatingLengthProps {
  lengthMin: number;
  lengthMax: number;
  oscillationFreq: number;
  oscillationAmp: number;
}

/**
 * Adaptación de la dinámica de longitud de Flynn para el Lab 3D.
 * Calcula una longitud oscilante para cada vector.
 * 
 * @param vectors - Array de vectores del grid del laboratorio.
 * @param time - Tiempo de la animación (de useFrame).
 * @param props - Propiedades de control para la oscilación.
 * @returns Un array de longitudes para cada vector.
 */
export const calculateOscillatingLength = (
  vectors: LabVector[],
  time: number,
  props: OscillatingLengthProps
): number[] => {
  const { lengthMin, lengthMax, oscillationFreq, oscillationAmp } = props;

  const lengths = vectors.map((vector, i) => {
    // Fase basada en la posición para que no todos los vectores oscilen igual
    const combinedPhase = (vector.x + vector.y) * 0.1;

    // Lógica de oscilación compleja del hook original
    const wave1 = Math.sin(time * oscillationFreq + combinedPhase);
    const wave2 = Math.sin(time * oscillationFreq * 1.618 + combinedPhase * 0.5) * 0.3;
    const wave3 = Math.cos(time * oscillationFreq * 0.7 + combinedPhase * 1.5) * 0.2;
    const complexOscillation = (wave1 + wave2 + wave3) * oscillationAmp;

    // Mapeamos la oscilación (-1 a 1) al rango de longitud (min a max)
    const baseLength = (lengthMax + lengthMin) / 2;
    const lengthRange = (lengthMax - lengthMin) / 2;
    
    const finalLength = baseLength + complexOscillation * lengthRange;

    // Aseguramos que la longitud esté dentro de los límites
    return Math.max(lengthMin, Math.min(finalLength, lengthMax));
  });

  return lengths;
}; 