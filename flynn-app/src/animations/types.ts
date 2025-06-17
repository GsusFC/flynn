import type { ExtendedVectorColorValue } from '@/components/features/vector-grid/types/gradientTypes';

export interface Vector {
  id: string;
  x: number;
  y: number;
  initialAngle: number;
  angle: number;
  length: number;
  initialLength: number;
  color: ExtendedVectorColorValue;
  shapeParams?: Record<string, number>;
  row?: number;
  col?: number;
  ring?: number;
}

// --- Tipos para la definición de Controles en la UI ---

interface BaseControlDef {
  id: string; // Corresponde a una clave en las Props de la animación
  label: string;
  description?: string;
  icon?: string;
}

interface SliderControlDef extends BaseControlDef {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

interface SelectControlDef<T extends string | number> extends BaseControlDef {
  type: 'select';
  options: Array<{ value: T; label: string }>;
  defaultValue: T;
}

interface CheckboxControlDef extends BaseControlDef {
  type: 'checkbox';
  defaultValue: boolean;
}

interface ColorControlDef extends BaseControlDef {
  type: 'color';
  defaultValue: string;
}

interface ButtonControlDef extends BaseControlDef {
  type: 'button';
}

export type ControlDef = SliderControlDef | SelectControlDef<any> | CheckboxControlDef | ColorControlDef | ButtonControlDef;
export type { SliderControlDef, SelectControlDef, CheckboxControlDef, ColorControlDef, ButtonControlDef };


// --- Tipos para el Contrato de Animación ---

/**
 * Los datos que se pasan a la función `apply` de una animación en cada frame.
 * Es genérico para aceptar las props específicas de cada animación.
 */
export interface AnimationFrameData<TProps = Record<string, any>> {
  vectors: Readonly<Vector[]>;
  time: number;
  dimensions: { width: number; height: number };
  mousePos: { x: number | null; y: number | null };
  props: TProps;
  layout?: {
    rows?: number;
    cols?: number;
    rings?: number;
    lines?: number;
    arms?: number;
    spacing?: number;
  };
}

/**
 * El resultado que debe devolver la función `apply` de una animación.
 */
export interface AnimationResult {
  vectors: Vector[];
  /** Datos extra por vector que pueden usar otros sistemas (ej: color dinámico). */
  animationData: Array<Record<string, any>>;
  /** El ángulo objetivo que la animación desea para el vector (opcional). */
  targetAngles?: (number | undefined)[];
}

/**
 * La Interfaz de Metadatos que define una animación.
 * Reemplaza a la `AnimationImplementation` anterior.
 */
export interface AnimationMeta<TProps extends Record<string, any>> {
  id: string;
  name: string;
  description?: string;
  category?: 'core' | 'simple' | 'experimental' | 'legacy';
  icon?: string;
  
  /** Define los sliders, selects, etc. que se mostrarán en la UI. */
  controls: ControlDef[];
  
  /** Los valores por defecto para todas las props que usan los controles. */
  defaultProps: TProps;
  
  /** La lógica de la animación que se ejecuta cada frame. */
  apply: (data: AnimationFrameData<TProps>) => AnimationResult;

  /** Flag opcional para deshabilitar Length Dynamics. Si no se define, es true. */
  enableLengthDynamics?: boolean;
} 