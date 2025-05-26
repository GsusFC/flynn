// Tipos base para el sistema modular de animaciones
import type { SimpleVector, MousePosition } from '../simpleTypes';

// Contexto de animación que se pasa a cada función de animación
export interface AnimationContext {
  time: number;
  mousePosition: MousePosition;
  pulseCenter: { x: number; y: number } | null;
  pulseStartTime: number | null;
  canvasWidth: number;
  canvasHeight: number;
}

// Tipos de controles UI disponibles
export type ControlType = 'slider' | 'select' | 'toggle' | 'color';

// Definición de un control UI
export interface AnimationControl {
  id: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  defaultValue: string | number | boolean;
  description?: string;
  icon?: string;
}

// Función de animación genérica
export type AnimationFunction<T = Record<string, unknown>> = (
  vectors: SimpleVector[],
  props: T,
  context: AnimationContext
) => SimpleVector[];

// Módulo de animación completo
export interface AnimationModule<T = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  category?: 'basic' | 'waves' | 'interaction' | 'flow' | 'advanced';
  icon?: string;
  controls: AnimationControl[];
  defaultProps: T;
  animate: AnimationFunction<T>;
  // Funciones opcionales para ciclo de vida
  onInit?: (props: T) => void;
  onDestroy?: () => void;
  // Validación de props
  validateProps?: (props: T) => boolean;
}

// Registry de animaciones
export interface AnimationRegistry {
  [key: string]: AnimationModule<any>;
}

// Props dinámicas para cualquier animación
export type DynamicAnimationProps = Record<string, unknown>;

// Resultado de la función de animación
export interface AnimationResult {
  vectors: SimpleVector[];
  // Datos adicionales que la animación puede retornar
  metadata?: Record<string, unknown>;
}

// Configuración de una animación activa
export interface ActiveAnimation {
  id: string;
  props: DynamicAnimationProps;
  module: AnimationModule;
}

// Eventos del sistema de animaciones
export interface AnimationEvents {
  onAnimationChange?: (animationId: string) => void;
  onPropsChange?: (animationId: string, props: DynamicAnimationProps) => void;
  onError?: (error: Error, animationId: string) => void;
}

// Metadatos de una animación
export interface AnimationMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  version?: string;
  author?: string;
  tags?: string[];
  performance?: 'low' | 'medium' | 'high';
  complexity?: 'simple' | 'intermediate' | 'advanced';
}
