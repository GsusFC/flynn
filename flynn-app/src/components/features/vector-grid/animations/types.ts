

import type { AnimatedVectorItem, AnimationType } from '../core/types';

/**
 * Tipos básicos de animación disponibles
 * Re-export from core types to maintain consistency
 */
export type { AnimationType } from '../core/types';

/**
 * Vector con propiedades de animación
 * Re-export from core types to maintain compatibility
 */
export type { AnimatedVectorItem } from '../core/types';

/**
 * Parámetros comunes para todas las funciones de animación
 */
export interface AnimationParams {
  time: number;     // Tiempo actual (en segundos)
  deltaTime: number; // Tiempo transcurrido desde el último frame (en segundos)
  canvasWidth: number; // Ancho del canvas
  canvasHeight: number; // Alto del canvas
  mousePosition: {  // Posición actual del ratón
    x: number | null;
    y: number | null;
  };
  isPaused: boolean; // Si la animación está pausada
}

/**
 * Interfaz común para todas las implementaciones de animación
 */
export interface AnimationImplementation {
  id: AnimationType; // Identificador único (debe coincidir con AnimationType)
  name: string;      // Nombre para mostrar en la UI
  description: string; // Descripción para mostrar en la UI
  
  // Función principal que actualiza los vectores en cada frame
  update: (
    vectors: AnimatedVectorItem[],
    params: AnimationParams,
    props: Record<string, unknown>
  ) => AnimatedVectorItem[];
  
  // Props por defecto para esta animación
  defaultProps: Record<string, unknown>;
  
  // Metadatos para generar controles en la UI
  controls: AnimationControl[];
}

/**
 * Tipos de controles para la UI
 */
export type ControlType = 'slider' | 'select' | 'checkbox' | 'color' | 'radio';

/**
 * Definición de un control para la UI
 */
export interface AnimationControl {
  id: string;       // Identificador único (debe coincidir con la propiedad en defaultProps)
  type: ControlType; // Tipo de control
  label: string;    // Etiqueta para mostrar
  min?: number;     // Valor mínimo (para sliders)
  max?: number;     // Valor máximo (para sliders)
  step?: number;    // Paso (para sliders)
  options?: Array<{value: string | number; label: string}>; // Opciones (para selects y radios)
  defaultValue: unknown; // Valor por defecto
  tooltip?: string; // Texto de ayuda
}

/**
 * Tipos de ondas para smoothWaves
 */
export type WaveType = 'circular' | 'linear' | 'diagonal';

/**
 * Tipos de interacción con el ratón
 */
export type MouseEffectType = 'attract' | 'repel' | 'align';

/**
 * Direcciones de rotación
 */
export type RotationDirection = 'clockwise' | 'counterClockwise';
