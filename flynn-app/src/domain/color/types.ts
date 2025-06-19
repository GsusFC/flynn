// Domain types for color system
// Tipos base para el sistema de colores independiente

export type ColorMode = 'solid' | 'gradient' | 'dynamic' | 'hsl';

export interface SolidColor {
  type: 'solid';
  value: string; // hex, rgb, hsl
  offset?: number;
}

export interface GradientColor {
  type: 'gradient';
  variant: 'linear' | 'radial' | 'conic';
  angle?: number; // para linear
  stops: ColorStop[];
}

export interface HSLColor {
  type: 'hsl';
  variant: 'rainbow' | 'flow' | 'cycle';
  speed: number;
  saturation: number;
  lightness: number;
  hue?: number;
  offset?: number;
}

export interface DynamicColor {
  type: 'dynamic';
  hue: number;
  saturation: number;
  lightness: number;
  intensityResponse: number;
  effect: 'hue' | 'saturation' | 'lightness'; // Propiedad a modular
}

export interface ColorStop {
  offset: number; // 0-1
  color: string;
  opacity?: number; // 0-1
}

export type VectorColor = SolidColor | GradientColor | HSLColor | DynamicColor;

// Context para aplicación de colores
export interface ColorContext {
  time: number;
  vectorIndex: number;
  vectorPosition: { x: number; y: number };
  animationIntensity?: number;
  totalVectors: number;
  canvasDimensions: { width: number; height: number };
}

// Configuración de color unificada
export interface ColorConfig {
  mode: ColorMode;
  color: VectorColor;
  opacity: number;
  blendMode?: string;
}

// Resultado de color procesado
export interface ProcessedColor {
  fill: string;
  stroke?: string;
  opacity: number;
  gradientId?: string; // Para SVG
}