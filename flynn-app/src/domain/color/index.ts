// Domain Color System - Public API
// Punto de entrada único para el sistema de colores

export { ColorEngine } from './ColorEngine';
export { 
  SOLID_PRESETS,
  GRADIENT_PRESETS, 
  HSL_PRESETS,
  COLOR_CATEGORIES,
  DEFAULT_COLOR,
  getColorPreset,
  getAllColorPresets,
  getPresetsByCategory,
  isValidColorPreset,
  convertLegacyGradient
} from './ColorPresets';

export type {
  ColorMode,
  SolidColor,
  GradientColor,
  HSLColor,
  DynamicColor,
  ColorStop,
  VectorColor,
  ColorContext,
  ColorConfig,
  ProcessedColor
} from './types';

// Import needed types for factory
import type { SolidColor, GradientColor, HSLColor, DynamicColor } from './types';

// Factory functions para crear colores fácilmente
export const ColorFactory = {
  solid: (value: string): SolidColor => ({ type: 'solid', value }),
  
  linearGradient: (angle: number, stops: Array<{offset: number, color: string}>): GradientColor => ({
    type: 'gradient',
    variant: 'linear',
    angle,
    stops
  }),
  
  radialGradient: (stops: Array<{offset: number, color: string}>): GradientColor => ({
    type: 'gradient',
    variant: 'radial',
    stops
  }),
  
  hslRainbow: (speed = 0.001, saturation = 70, lightness = 60): HSLColor => ({
    type: 'hsl',
    variant: 'rainbow',
    speed,
    saturation,
    lightness
  }),
  
  hslFlow: (speed = 0.002, saturation = 80, lightness = 55): HSLColor => ({
    type: 'hsl',
    variant: 'flow',
    speed,
    saturation,
    lightness
  })
};

// Utilities
export const ColorUtils = {
  /**
   * Convierte color hex a RGB
   */
  hexToRgb: (hex: string): {r: number, g: number, b: number} | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  /**
   * Convierte RGB a hex
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  /**
   * Obtiene contraste para texto
   */
  getContrastColor: (backgroundColor: string): string => {
    const rgb = ColorUtils.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
};