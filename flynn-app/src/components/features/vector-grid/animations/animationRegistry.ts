import { AnimationImplementation, AnimationType } from './types';
import { noneAnimation } from './implementations/none';
import { staticAngleAnimation } from './implementations/staticAngle';
import { randomLoopAnimation } from './implementations/randomLoop';
import { smoothWavesAnimation } from './implementations/smoothWaves';
import { mouseInteractionAnimation } from './implementations/mouseInteraction';

/**
 * Registro de todas las animaciones disponibles
 */
export const animationRegistry: Record<AnimationType, AnimationImplementation> = {
  none: noneAnimation,
  staticAngle: staticAngleAnimation,
  randomLoop: randomLoopAnimation,
  smoothWaves: smoothWavesAnimation,
  mouseInteraction: mouseInteractionAnimation,
  
  // Estas animaciones serán implementadas próximamente
  seaWaves: null as unknown as AnimationImplementation,
  perlinFlow: null as unknown as AnimationImplementation,
  centerPulse: null as unknown as AnimationImplementation,
  directionalFlow: null as unknown as AnimationImplementation,
  tangenteClasica: null as unknown as AnimationImplementation,
  vortex: null as unknown as AnimationImplementation,
  lissajous: null as unknown as AnimationImplementation,
  flocking: null as unknown as AnimationImplementation,
  randomWalk: null as unknown as AnimationImplementation,
  custom: null as unknown as AnimationImplementation,
};

/**
 * Obtener la implementación de una animación por su ID
 * Si no existe, devuelve la animación 'none'
 */
export function getAnimationImplementation(type: AnimationType): AnimationImplementation {
  const implementation = animationRegistry[type];
  if (!implementation) {
    console.warn(`Animación "${type}" no encontrada. Usando "none" como fallback.`);
    return animationRegistry.none;
  }
  return implementation;
}

/**
 * Obtener las propiedades por defecto para un tipo de animación
 */
export function getDefaultPropsForType(type: AnimationType): Record<string, unknown> {
  return getAnimationImplementation(type).defaultProps;
}

/**
 * Obtener los controles para un tipo de animación
 */
export function getControlsForType(type: AnimationType) {
  return getAnimationImplementation(type).controls;
}

/**
 * Lista de todas las animaciones disponibles con sus metadatos
 * Útil para generar menús o selectores en la UI
 */
export function getAvailableAnimations() {
  return Object.entries(animationRegistry)
    .filter(([, implementation]) => implementation !== null)
    .map(([type, implementation]) => ({
      id: type,
      name: implementation.name,
      description: implementation.description
    }));
}
