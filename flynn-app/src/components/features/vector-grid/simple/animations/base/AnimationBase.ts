// Clase base abstracta para todas las animaciones
import type { 
  AnimationModule, 
  AnimationControl, 
  AnimationContext,
  AnimationFunction 
} from '../types';
import type { SimpleVector } from '../../simpleTypes';

// Clase base abstracta que todas las animaciones deben extender
export abstract class AnimationBase<T = Record<string, unknown>> implements AnimationModule<T> {
  // Propiedades requeridas por AnimationModule
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly controls: AnimationControl[];
  abstract readonly defaultProps: T;
  
  // Propiedades opcionales con valores por defecto
  readonly category: 'basic' | 'waves' | 'interaction' | 'flow' | 'advanced' = 'basic';
  readonly icon?: string;

  // Método abstracto que cada animación debe implementar
  abstract animate: AnimationFunction<T>;

  // Métodos opcionales del ciclo de vida
  onInit?(props: T): void;
  onDestroy?(): void;

  // Validación por defecto (puede ser sobrescrita)
  validateProps(props: T): boolean {
    // Validación básica - verificar que props no sea null/undefined
    if (!props || typeof props !== 'object') {
      console.warn(`[${this.id}] Props inválidas:`, props);
      return false;
    }
    return true;
  }

  // Método helper para crear controles de slider
  protected createSliderControl(
    id: string,
    label: string,
    min: number,
    max: number,
    defaultValue: number,
    step?: number,
    description?: string,
    icon?: string
  ): AnimationControl {
    return {
      id,
      label,
      type: 'slider',
      min,
      max,
      step: step || (max - min > 10 ? 1 : 0.1),
      defaultValue,
      description,
      icon
    };
  }

  // Método helper para crear controles de select
  protected createSelectControl(
    id: string,
    label: string,
    options: Array<{ value: string | number; label: string }>,
    defaultValue: string | number,
    description?: string,
    icon?: string
  ): AnimationControl {
    return {
      id,
      label,
      type: 'select',
      options,
      defaultValue,
      description,
      icon
    };
  }

  // Método helper para crear controles de toggle
  protected createToggleControl(
    id: string,
    label: string,
    defaultValue: boolean,
    description?: string,
    icon?: string
  ): AnimationControl {
    return {
      id,
      label,
      type: 'toggle',
      defaultValue,
      description,
      icon
    };
  }

  // Método helper para crear controles de color
  protected createColorControl(
    id: string,
    label: string,
    defaultValue: string,
    description?: string,
    icon?: string
  ): AnimationControl {
    return {
      id,
      label,
      type: 'color',
      defaultValue,
      description,
      icon
    };
  }

  // Método helper para validar rangos numéricos
  protected validateNumberRange(
    value: number,
    min: number,
    max: number,
    name: string
  ): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      console.warn(`[${this.id}] ${name} debe ser un número válido`);
      return false;
    }
    if (value < min || value > max) {
      console.warn(`[${this.id}] ${name} debe estar entre ${min} y ${max}`);
      return false;
    }
    return true;
  }

  // Método helper para clonar vectores de forma segura
  protected cloneVectors(vectors: SimpleVector[]): SimpleVector[] {
    return vectors.map(vector => ({ ...vector }));
  }

  // Método helper para aplicar transformaciones a un vector
  protected transformVector(
    vector: SimpleVector,
    transform: {
      angle?: number;
      length?: number;
      opacity?: number;
      x?: number;
      y?: number;
    }
  ): SimpleVector {
    return {
      ...vector,
      angle: transform.angle !== undefined ? this.normalizeAngle(transform.angle) : vector.angle,
      length: transform.length !== undefined ? Math.max(0, transform.length) : vector.length,
      opacity: transform.opacity !== undefined ? Math.max(0, Math.min(1, transform.opacity)) : vector.opacity,
      x: transform.x !== undefined ? transform.x : vector.x,
      y: transform.y !== undefined ? transform.y : vector.y
    };
  }

  // Método helper para normalizar ángulos
  protected normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  // Método helper para calcular distancia
  protected distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // Método helper para interpolación lineal
  protected lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  // Método helper para obtener el centro del canvas
  protected getCanvasCenter(context: AnimationContext) {
    return {
      x: context.canvasWidth / 2,
      y: context.canvasHeight / 2
    };
  }

  // Método para obtener metadatos de la animación
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      controlsCount: this.controls.length,
      hasLifecycle: !!(this.onInit || this.onDestroy)
    };
  }
}

// Función helper para crear una animación simple sin clase
export function createSimpleAnimation<T = Record<string, unknown>>(
  config: {
    id: string;
    name: string;
    description: string;
    category?: 'basic' | 'waves' | 'interaction' | 'flow' | 'advanced';
    icon?: string;
    controls: AnimationControl[];
    defaultProps: T;
    animate: AnimationFunction<T>;
    validateProps?: (props: T) => boolean;
    onInit?: (props: T) => void;
    onDestroy?: () => void;
  }
): AnimationModule<T> {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    category: config.category || 'basic',
    icon: config.icon,
    controls: config.controls,
    defaultProps: config.defaultProps,
    animate: config.animate,
    validateProps: config.validateProps,
    onInit: config.onInit,
    onDestroy: config.onDestroy
  };
}
