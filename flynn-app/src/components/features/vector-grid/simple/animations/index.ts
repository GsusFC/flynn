// Registry central de animaciones modulares - EXPANDIDO CON NUEVAS ANIMACIONES
import type { AnimationRegistry, AnimationModule, AnimationContext } from './types';
import type { SimpleVector } from '../simpleTypes';

// Importar animaciones existentes
import { noneAnimation } from './implementations/none';
import { smoothWavesAnimation } from './implementations/smoothWaves';
import { mouseInteractionAnimation } from './implementations/mouseInteraction';
import { randomLoopAnimation } from './implementations/randomLoop';
import { seaWavesAnimation } from './implementations/seaWaves';
import { tangenteClasicaAnimation } from './implementations/tangenteClasica';
import { centerPulseAnimation } from './implementations/centerPulse';
import { lissajousAnimation } from './implementations/lissajous';
import { perlinFlowAnimation } from './implementations/perlinFlow';


// Importar nuevas animaciones implementadas
import { geometricPatternAnimation } from './implementations/geometricPattern';
import { vortexAnimation } from './implementations/vortexAnimation';
import { pinwheelsAnimation } from './implementations/pinwheels';
import { rippleEffectAnimation } from './implementations/rippleEffect';
import { jitterAnimation } from './implementations/jitter';

// Registry de animaciones disponibles - EXPANDIDO
export const animationRegistry: AnimationRegistry = {
  // Animaciones básicas
  none: noneAnimation,
  smoothWaves: smoothWavesAnimation,
  mouseInteraction: mouseInteractionAnimation,
  randomLoop: randomLoopAnimation,
  
  // Animaciones de ondas
  seaWaves: seaWavesAnimation,
  rippleEffect: rippleEffectAnimation,
  
  // Animaciones clásicas
  tangenteClasica: tangenteClasicaAnimation,
  centerPulse: centerPulseAnimation,
  lissajous: lissajousAnimation,
  perlinFlow: perlinFlowAnimation,
  

  
  // Nuevas animaciones avanzadas
  geometricPattern: geometricPatternAnimation,
  vortex: vortexAnimation,
  pinwheels: pinwheelsAnimation,
  jitter: jitterAnimation
};

// Función para obtener una animación por ID
export const getAnimation = (id: string): AnimationModule | undefined => {
  return animationRegistry[id];
};

// Función para obtener todas las animaciones
export const getAllAnimations = (): AnimationModule[] => {
  return Object.values(animationRegistry);
};

// Función para obtener animaciones por categoría
export const getAnimationsByCategory = (category: string): AnimationModule[] => {
  return getAllAnimations().filter(animation => animation.category === category);
};

// Función para registrar una nueva animación
export const registerAnimation = (animation: AnimationModule): void => {
  if (animationRegistry[animation.id]) {
    console.warn(`[AnimationRegistry] Animación '${animation.id}' ya existe, será sobrescrita`);
  }
  animationRegistry[animation.id] = animation;
};

// Función para desregistrar una animación
export const unregisterAnimation = (id: string): boolean => {
  if (animationRegistry[id]) {
    delete animationRegistry[id];
    return true;
  }
  return false;
};

// Función para validar si una animación existe
export const hasAnimation = (id: string): boolean => {
  return id in animationRegistry;
};

// Función para obtener los IDs de todas las animaciones
export const getAnimationIds = (): string[] => {
  return Object.keys(animationRegistry);
};

// Función para obtener metadatos de todas las animaciones
export const getAnimationsMetadata = () => {
  return getAllAnimations().map(animation => ({
    id: animation.id,
    name: animation.name,
    description: animation.description,
    category: animation.category || 'basic',
    icon: animation.icon,
    controlsCount: animation.controls.length,
    hasValidation: !!animation.validateProps,
    hasLifecycle: !!(animation.onInit || animation.onDestroy)
  }));
};

// Función para crear props por defecto para una animación
export const getDefaultProps = (animationId: string): Record<string, unknown> => {
  const animation = getAnimation(animationId);
  return animation ? animation.defaultProps : {};
};

// Función para validar props de una animación
export const validateAnimationProps = (
  animationId: string, 
  props: Record<string, unknown>
): boolean => {
  const animation = getAnimation(animationId);
  if (!animation) {
    console.warn(`[AnimationRegistry] Animación '${animationId}' no encontrada`);
    return false;
  }
  
  if (animation.validateProps) {
    return animation.validateProps(props);
  }
  
  return true;
};

// Función para ejecutar una animación
export const executeAnimation = (
  animationId: string,
  vectors: SimpleVector[],
  props: Record<string, unknown>,
  context: AnimationContext
): SimpleVector[] => {
  const animation = getAnimation(animationId);
  
  if (!animation) {
    console.warn(`[AnimationRegistry] Animación '${animationId}' no encontrada`);
    return vectors;
  }
  
  // Validar props si la animación tiene validación
  if (animation.validateProps && !animation.validateProps(props)) {
    console.warn(`[AnimationRegistry] Props inválidas para '${animationId}', usando valores por defecto`);
    // Mezclar props existentes con valores por defecto en lugar de reemplazar completamente
    props = { ...animation.defaultProps, ...props };
    
    // Si aún falla la validación, usar solo los valores por defecto
    if (!animation.validateProps(props)) {
      console.warn(`[AnimationRegistry] Usando solo valores por defecto para '${animationId}'`);
      props = animation.defaultProps;
    }
  }
  
  try {
    return animation.animate(vectors, props, context);
  } catch (error) {
    console.error(`[AnimationRegistry] Error ejecutando '${animationId}':`, error);
    return vectors;
  }
};

// Exportar tipos para uso externo
export type { AnimationModule, AnimationRegistry, AnimationContext } from './types';

// Exportar todas las animaciones
export {
  // Animaciones básicas
  noneAnimation,
  smoothWavesAnimation,
  mouseInteractionAnimation,
  randomLoopAnimation,
  
  // Animaciones de ondas
  seaWavesAnimation,
  rippleEffectAnimation,
  
  // Animaciones clásicas
  tangenteClasicaAnimation,
  centerPulseAnimation,
  lissajousAnimation,
  perlinFlowAnimation,
  

  
  // Nuevas animaciones avanzadas
  geometricPatternAnimation,
  vortexAnimation,
  pinwheelsAnimation,
  jitterAnimation
};
