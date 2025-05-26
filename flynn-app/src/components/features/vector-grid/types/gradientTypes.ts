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

export type ExtendedVectorColorValue = string | { h: number; s: number; l: number; a?: number } | GradientConfig;

// Función para verificar si un color es un degradado
export function isGradientConfig(color: ExtendedVectorColorValue): color is GradientConfig {
  return typeof color === 'object' && color !== null && 'type' in color && 'colors' in color;
}

// Función para generar un ID único para degradados
export function generateGradientId(vectorId: string): string {
  return `gradient-${vectorId}-${Date.now()}`;
}

// Degradados predefinidos comunes
export const PRESET_GRADIENTS: Record<string, GradientConfig> = {
  sunset: {
    type: 'linear',
    angle: 45,
    colors: [
      { color: '#ff7e5f', offset: 0 },
      { color: '#feb47b', offset: 1 }
    ]
  },
  ocean: {
    type: 'linear',
    angle: 90,
    colors: [
      { color: '#667eea', offset: 0 },
      { color: '#764ba2', offset: 1 }
    ]
  },
  fire: {
    type: 'radial',
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.8,
    colors: [
      { color: '#ff4757', offset: 0 },
      { color: '#ff6b7a', offset: 0.5 },
      { color: '#ff9ff3', offset: 1 }
    ]
  },
  rainbow: {
    type: 'linear',
    angle: 0,
    colors: [
      { color: '#ff0000', offset: 0 },
      { color: '#ff8000', offset: 0.17 },
      { color: '#ffff00', offset: 0.33 },
      { color: '#00ff00', offset: 0.5 },
      { color: '#0080ff', offset: 0.67 },
      { color: '#8000ff', offset: 0.83 },
      { color: '#ff00ff', offset: 1 }
    ]
  },
  aurora: {
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#00c9ff', offset: 0 },
      { color: '#92fe9d', offset: 0.5 },
      { color: '#ff9a9e', offset: 1 }
    ]
  },
  cosmic: {
    type: 'radial',
    centerX: 0.3,
    centerY: 0.3,
    radius: 1.2,
    colors: [
      { color: '#667eea', offset: 0 },
      { color: '#764ba2', offset: 0.4 },
      { color: '#f093fb', offset: 0.8 },
      { color: '#f5576c', offset: 1 }
    ]
  },
  forest: {
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#134e5e', offset: 0 },
      { color: '#71b280', offset: 1 }
    ]
  },
  neon: {
    type: 'linear',
    angle: 45,
    colors: [
      { color: '#ff006e', offset: 0 },
      { color: '#8338ec', offset: 0.5 },
      { color: '#3a86ff', offset: 1 }
    ]
  },
  gold: {
    type: 'linear',
    angle: 90,
    colors: [
      { color: '#ffd700', offset: 0 },
      { color: '#ffb347', offset: 0.5 },
      { color: '#ff8c00', offset: 1 }
    ]
  },
  ice: {
    type: 'radial',
    centerX: 0.5,
    centerY: 0.2,
    radius: 1.0,
    colors: [
      { color: '#e0f6ff', offset: 0 },
      { color: '#74c0fc', offset: 0.6 },
      { color: '#339af0', offset: 1 }
    ]
  },
  volcano: {
    type: 'radial',
    centerX: 0.5,
    centerY: 0.8,
    radius: 0.9,
    colors: [
      { color: '#ff4500', offset: 0 },
      { color: '#ff6347', offset: 0.3 },
      { color: '#ffa500', offset: 0.7 },
      { color: '#ffff00', offset: 1 }
    ]
  },
  cyberpunk: {
    type: 'linear',
    angle: 45,
    colors: [
      { color: '#ff0080', offset: 0 },
      { color: '#7928ca', offset: 0.5 },
      { color: '#00d4ff', offset: 1 }
    ]
  }
};
