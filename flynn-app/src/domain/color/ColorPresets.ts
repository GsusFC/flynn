// Color Presets - Colores predefinidos y configuraciones comunes
// Migración de PRESET_GRADIENTS y creación de nuevos presets

import type { VectorColor, SolidColor, GradientColor, HSLColor } from './types';

// ✅ Colores sólidos predefinidos
export const SOLID_PRESETS: Record<string, SolidColor> = {
  emerald: { type: 'solid', value: '#10b981' },
  blue: { type: 'solid', value: '#3b82f6' },
  purple: { type: 'solid', value: '#8b5cf6' },
  red: { type: 'solid', value: '#ef4444' },
  orange: { type: 'solid', value: '#f97316' },
  yellow: { type: 'solid', value: '#eab308' },
  pink: { type: 'solid', value: '#ec4899' },
  white: { type: 'solid', value: '#ffffff' },
  black: { type: 'solid', value: '#000000' },
  gray: { type: 'solid', value: '#6b7280' }
};

// ✅ Gradientes predefinidos (migrados de PRESET_GRADIENTS)
export const GRADIENT_PRESETS: Record<string, GradientColor> = {
  auroraBoreal: {
    type: 'gradient',
    variant: 'linear',
    angle: 0,
    stops: [
      { offset: 0, color: '#05051f' },
      { offset: 0.2, color: '#69c1ff' },
      { offset: 0.4, color: '#97f7f3' },
      { offset: 0.6, color: '#76f6bd' },
      { offset: 0.8, color: '#aaebc9' },
      { offset: 1, color: '#cb304f' }
    ]
  },
  
  sunset: {
    type: 'gradient',
    variant: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#ff6b6b' },
      { offset: 0.5, color: '#feca57' },
      { offset: 1, color: '#ff9ff3' }
    ]
  },
  
  ocean: {
    type: 'gradient',
    variant: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ]
  },
  
  forest: {
    type: 'gradient',
    variant: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#134e5e' },
      { offset: 1, color: '#71b280' }
    ]
  },
  
  fire: {
    type: 'gradient',
    variant: 'radial',
    stops: [
      { offset: 0, color: '#ff416c' },
      { offset: 1, color: '#ff4b2b' }
    ]
  },
  
  cosmic: {
    type: 'gradient',
    variant: 'conic',
    stops: [
      { offset: 0, color: '#8360c3' },
      { offset: 0.33, color: '#2ebf91' },
      { offset: 0.66, color: '#ffecd2' },
      { offset: 1, color: '#8360c3' }
    ]
  },
  
  neon: {
    type: 'gradient',
    variant: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#00f2fe' },
      { offset: 1, color: '#4facfe' }
    ]
  },

  flow: {
    type: 'gradient',
    variant: 'linear',
    angle: 70,
    stops: [
      { offset: 0, color: '#2b5876' },
      { offset: 1, color: '#4e4376' }
    ]
  },

  grayscale: {
    type: 'gradient',
    variant: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#eeeeee' },
      { offset: 0.5, color: '#999999' },
      { offset: 1, color: '#444444' }
    ]
  },

  pastel: {
    type: 'gradient',
    variant: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#fbc2eb' },  // light pink
      { offset: 0.5, color: '#a6c1ee' }, // soft lavender/blue
      { offset: 1, color: '#fbc2eb' }   // repeat for smooth loop
    ]
  },

  metallic: {
    type: 'gradient',
    variant: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#b8c6db' },  // steel blue-grey
      { offset: 0.25, color: '#f5f7fa' }, // highlight
      { offset: 0.5, color: '#c3cfe2' },  // mid tone
      { offset: 0.75, color: '#f5f7fa' }, // highlight
      { offset: 1, color: '#b8c6db' }   // return to base
    ]
  },

  rainbow: {
    type: 'gradient',
    variant: 'linear',
    angle: 120,
    stops: [
      { offset: 0, color: '#ff0000' },    // Red
      { offset: 0.2, color: '#ffff00' },   // Yellow
      { offset: 0.4, color: '#00ff00' },   // Green
      { offset: 0.6, color: '#00ffff' },   // Cyan
      { offset: 0.8, color: '#0000ff' },   // Blue
      { offset: 1, color: '#ff00ff' }    // Magenta
    ]
  },

  pulse: {
    type: 'gradient',
    variant: 'radial',
    stops: [
      { offset: 0, color: '#f093fb' },   // Bright Pink center
      { offset: 1, color: '#f5576c' }    // Darker red edge
    ]
  },

  subtle: {
    type: 'gradient',
    variant: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#e0eafc' },   // very light blue
      { offset: 1, color: '#cfdef3' }    // slightly darker light blue
    ]
  }
};

// ✅ HSL presets animados
export const HSL_PRESETS: Record<string, HSLColor> = {
  rainbow: {
    type: 'hsl',
    variant: 'rainbow',
    speed: 0.001,
    saturation: 70,
    lightness: 60
  },
  
  flow: {
    type: 'hsl',
    variant: 'flow',
    speed: 0.002,
    saturation: 80,
    lightness: 55
  },
  
  pulse: {
    type: 'hsl',
    variant: 'cycle',
    speed: 0.005,
    saturation: 90,
    lightness: 50
  },
  
  subtle: {
    type: 'hsl',
    variant: 'flow',
    speed: 0.0005,
    saturation: 40,
    lightness: 70
  }
};

// ✅ Presets combinados por categoría
export const COLOR_CATEGORIES = {
  solid: SOLID_PRESETS,
  gradient: GRADIENT_PRESETS,
  hsl: HSL_PRESETS
} as const;

// ✅ Preset por defecto
export const DEFAULT_COLOR: VectorColor = SOLID_PRESETS.emerald;

// ✅ Funciones utilitarias
export function getColorPreset(category: keyof typeof COLOR_CATEGORIES, name: string): VectorColor | null {
  const categoryPresets = COLOR_CATEGORIES[category];
  return categoryPresets[name] || null;
}

export function getAllColorPresets(): Record<string, VectorColor> {
  return {
    ...SOLID_PRESETS,
    ...GRADIENT_PRESETS,
    ...HSL_PRESETS
  };
}

export function getPresetsByCategory(category: keyof typeof COLOR_CATEGORIES): Record<string, VectorColor> {
  return COLOR_CATEGORIES[category];
}

// ✅ Validación de presets
export function isValidColorPreset(preset: any): preset is VectorColor {
  return preset && 
         typeof preset === 'object' && 
         'type' in preset &&
         ['solid', 'gradient', 'hsl', 'dynamic'].includes(preset.type);
}

// ✅ Conversión legacy (para migración gradual)
export function convertLegacyGradient(legacyGradient: any): GradientColor {
  // Convertir formato anterior a nuevo formato
  if (legacyGradient.type && legacyGradient.colors) {
    return {
      type: 'gradient',
      variant: legacyGradient.type === 'linear' ? 'linear' : 'radial',
      angle: legacyGradient.angle || 0,
      stops: legacyGradient.colors.map((stop: any) => ({
        offset: stop.offset,
        color: stop.color,
        opacity: stop.opacity
      }))
    };
  }
  
  // Fallback
  return GRADIENT_PRESETS.sunset;
}