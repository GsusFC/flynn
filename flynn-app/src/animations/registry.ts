import type { AnimationMeta } from './types';

/**
 * El registro central de todas las animaciones disponibles en la aplicación.
 * La clave es el `id` de la animación.
 */
export const ANIMATION_REGISTRY: Record<string, AnimationMeta<any>> = {};

/**
 * Registra una nueva animación en el sistema.
 * Esta función se usará en cada fichero de implementación de animación.
 * 
 * @param meta - El objeto de metadatos que define completamente la animación.
 */
export const registerAnimation = <TProps extends Record<string, any>>(meta: AnimationMeta<TProps>): void => {
  if (ANIMATION_REGISTRY[meta.id]) {
    console.warn(`[AnimationRegistry] Se está sobreescribiendo una animación ya registrada: "${meta.id}"`);
  }
  ANIMATION_REGISTRY[meta.id] = Object.freeze(meta);
};

/**
 * Devuelve los metadatos de una animación específica.
 * @param id - El identificador de la animación.
 * @returns Los metadatos de la animación o undefined si no se encuentra.
 */
export const getAnimation = (id: string): AnimationMeta<any> | undefined => {
  return ANIMATION_REGISTRY[id];
};

/**
 * Devuelve una lista de todas las animaciones registradas.
 * @returns Un array con todos los metadatos de las animaciones.
 */
export const getAllAnimations = (): Array<AnimationMeta<any>> => {
  return Object.values(ANIMATION_REGISTRY);
}; 