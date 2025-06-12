// Tipos para degradados en vectores

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: Array<{
    color: string;
    offset: number; // 0-1
  }>;
  // Para degradados lineales
  angle?: number; // en grados, 0 = horizontal derecha
  // Para degradados radiales
  centerX?: number; // 0-1, relativo al vector
  centerY?: number; // 0-1, relativo al vector
  radius?: number; // 0-1, relativo al tamaño del vector
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export type ExtendedVectorColorValue = string | HSLColor | GradientConfig;

// Función para verificar si un color es un degradado
export function isGradientConfig(color: ExtendedVectorColorValue): color is GradientConfig {
  return typeof color === 'object' && color !== null && 'type' in color && 'colors' in color;
}

export function isHSLColor(color: ExtendedVectorColorValue): color is HSLColor {
  return typeof color === 'object' && 
         color !== null && 
         !isGradientConfig(color) && // Asegurarse de que no es un GradientConfig
         'h' in color && 
         's' in color && 
         'l' in color;
}

// Función para generar un ID único para degradados
export function generateGradientId(vectorId: string): string {
  return `gradient-${vectorId}-${Date.now()}`;
}

import type { GradientColor } from '@/domain/color/types';
import { GRADIENT_PRESETS as DOMAIN_GRADIENT_PRESETS } from '@/domain/color/ColorPresets';

// Conversión de GradientColor (dominio) a GradientConfig (render)
const convertToGradientConfig = (g: GradientColor): GradientConfig => {
  const { variant, stops, angle = 0 } = g as any;
  if (variant === 'radial') {
    const { centerX = 0.5, centerY = 0.5, radius = 0.5 } = g as any;
    return {
      type: 'radial',
      centerX,
      centerY,
      radius,
      colors: stops.map((s: any) => ({ color: s.color, offset: s.offset }))
    };
  }
  // Linear (default)
  return {
    type: 'linear',
    angle,
    colors: stops.map((s: any) => ({ color: s.color, offset: s.offset }))
  };
};

// Re-export de presets, ya convertidos
export const PRESET_GRADIENTS: Record<string, GradientConfig> = Object.fromEntries(
  Object.entries(DOMAIN_GRADIENT_PRESETS).map(([key, value]) => [key, convertToGradientConfig(value as GradientColor)])
);
