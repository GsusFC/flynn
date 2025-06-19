import type { LabControls } from '../hooks/useLabControls';

export interface IntelligentPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'scientific' | 'artistic' | 'architectural' | 'organic' | 'experimental';
  tags: string[];
  config: Partial<LabControls>;
}

export const INTELLIGENT_PRESETS: Record<string, IntelligentPreset> = {
  // SCIENTIFIC CATEGORY
  fibonacci_flow: {
    id: 'fibonacci_flow',
    name: 'Espiral Fibonacci Científica',
    description: 'Patrón de phyllotaxis con flujo Perlin y colores oceánicos para visualización científica',
    emoji: '🌻',
    category: 'scientific',
    tags: ['fibonacci', 'perlin', 'scientific', 'ocean'],
    config: {
      gridMode: 'math',
      gridSize: 900,
      gridPattern: 'fibonacci',
      fibonacciDensity: 1.2,
      fibonacciRadius: 0.85,
      fibonacciAngle: 137.5,
      animationType: 'perlinFlow',
      animationSpeed: 0.8,
      animationIntensity: 1.2,
      colorConfig: {
        mode: 'gradient',
        color: { type: 'gradient', variant: 'linear', angle: 45, stops: [
          { offset: 0, color: '#0077be' },
          { offset: 0.5, color: '#00a8cc' },
          { offset: 1, color: '#40e0d0' }
        ]}
      },
      depthPattern: 'waves',
      depthNoiseScale: 0.8,
      depthMin: -3,
      depthMax: 8,
      vectorShape: 'straight',
      vectorThickness: 0.015
    }
  },

  golden_vortex: {
    id: 'golden_vortex',
    name: 'Vórtice Proporción Áurea',
    description: 'Distribución áurea con animación de vórtice y colores dinámicos reactivos',
    emoji: '🌪️',
    category: 'scientific',
    tags: ['golden', 'vortex', 'dynamic', 'mathematical'],
    config: {
      gridMode: 'math',
      gridSize: 1225,
      gridPattern: 'golden',
      goldenExpansion: 1.3,
      goldenRotation: 15,
      goldenCompression: 0.9,
      animationType: 'vortex',
      animationSpeed: 1.5,
      animationIntensity: 1.0,
      vortexStrength: 1.2,
      vortexRotation: 2.5,
      colorConfig: {
        mode: 'dynamic',
        color: { type: 'dynamic', hue: 280, saturation: 75, lightness: 65, intensityResponse: 1.2, effect: 'hue' }
      },
      depthPattern: 'vortex',
      depthNoiseScale: 1.2,
      depthMin: -5,
      depthMax: 12,
      vectorShape: 'arc',
      vectorThickness: 0.02
    }
  },

  radial_waves: {
    id: 'radial_waves',
    name: 'Ondas Radiales de Laboratorio',
    description: 'Patrón radial con ondas suaves y gradientes metálicos para análisis de propagación',
    emoji: '📡',
    category: 'scientific',
    tags: ['radial', 'waves', 'metallic', 'propagation'],
    config: {
      gridMode: 'math',
      gridSize: 625,
      gridPattern: 'radial',
      radialPatternBias: 0.3,
      radialMaxRadius: 0.95,
      animationType: 'smoothWaves',
      animationSpeed: 0.6,
      animationIntensity: 0.8,
      colorConfig: {
        mode: 'gradient',
        color: { type: 'gradient', variant: 'radial', stops: [
          { offset: 0, color: '#c0c0c0' },
          { offset: 0.6, color: '#708090' },
          { offset: 1, color: '#2f4f4f' }
        ]}
      },
      depthPattern: 'ridges',
      depthNoiseScale: 0.6,
      depthMin: -2,
      depthMax: 6,
      vectorShape: 'wave',
      vectorThickness: 0.012
    }
  },

  // ARTISTIC CATEGORY
  cosmic_spiral: {
    id: 'cosmic_spiral',
    name: 'Espiral Cósmica',
    description: 'Espiral logarítmica con colores HSL animados y efectos de nebulosa',
    emoji: '🌌',
    category: 'artistic',
    tags: ['spiral', 'cosmic', 'hsl', 'nebula'],
    config: {
      gridMode: 'math',
      gridSize: 1600,
      gridPattern: 'logSpiral',
      spiralTightness: 0.15,
      spiralArms: 3,
      spiralStartRadius: 8,
      animationType: 'spiral',
      animationSpeed: 0.4,
      animationIntensity: 1.5,
      colorConfig: {
        mode: 'hsl',
        color: { type: 'hsl', hue: 260, saturation: 85, lightness: 60, speed: 0.3, variant: 'flow' }
      },
      depthPattern: 'spiral',
      depthNoiseScale: 1.0,
      depthMin: -8,
      depthMax: 15,
      depthTemporalMode: 'pulse',
      depthTemporalSpeed: 0.8,
      depthTemporalAmplitude: 0.4,
      vectorShape: 'spiral',
      vectorThickness: 0.025
    }
  },

  aurora_flow: {
    id: 'aurora_flow',
    name: 'Flujo de Aurora',
    description: 'Patrón hexagonal con flujo de tinta y colores de aurora boreal',
    emoji: '✨',
    category: 'artistic',
    tags: ['hexagonal', 'aurora', 'flow', 'organic'],
    config: {
      gridMode: 'math',
      gridSize: 900,
      gridPattern: 'hexagonal',
      hexagonalSpacing: 1.2,
      hexagonalOffset: 0.6,
      animationType: 'inkFlow',
      animationSpeed: 1.0,
      animationIntensity: 1.3,
      colorConfig: {
        mode: 'gradient',
        color: { type: 'gradient', variant: 'linear', angle: 120, stops: [
          { offset: 0, color: '#00ff88' },
          { offset: 0.3, color: '#00ccff' },
          { offset: 0.7, color: '#8844ff' },
          { offset: 1, color: '#ff0066' }
        ]}
      },
      depthPattern: 'perlin',
      depthNoiseScale: 0.9,
      depthMin: -4,
      depthMax: 10,
      depthFlowDirection: 45,
      depthFlowIntensity: 0.8,
      depthTurbulence: 0.3,
      vectorShape: 'organic',
      vectorThickness: 0.018
    }
  },

  // ARCHITECTURAL CATEGORY
  triangular_lattice: {
    id: 'triangular_lattice',
    name: 'Retícula Triangular',
    description: 'Estructura triangular con gradientes sutiles y movimiento geométrico',
    emoji: '📐',
    category: 'architectural',
    tags: ['triangular', 'lattice', 'geometric', 'subtle'],
    config: {
      gridMode: 'math',
      gridSize: 900,
      gridPattern: 'triangular',
      animationType: 'geometricPattern',
      animationSpeed: 0.4,
      animationIntensity: 0.5,
      colorConfig: {
        mode: 'gradient',
        color: { type: 'gradient', variant: 'linear', angle: 90, stops: [
          { offset: 0, color: '#ecf0f1' },
          { offset: 1, color: '#bdc3c7' }
        ]}
      },
      depthPattern: 'waves',
      depthNoiseScale: 0.3,
      depthMin: -1,
      depthMax: 3,
      vectorShape: 'straight',
      vectorThickness: 0.010
    }
  },

  // ORGANIC CATEGORY
  voronoi_cells: {
    id: 'voronoi_cells',
    name: 'Células Voronoi',
    description: 'Diagrama de Voronoi con movimiento de bandada y colores orgánicos',
    emoji: '🧬',
    category: 'organic',
    tags: ['voronoi', 'cellular', 'flocking', 'organic'],
    config: {
      gridMode: 'math',
      gridSize: 400,
      gridPattern: 'voronoi',
      voronoiSeed: 42,
      animationType: 'flocking',
      animationSpeed: 1.2,
      animationIntensity: 1.1,
      colorConfig: {
        mode: 'dynamic',
        color: { type: 'dynamic', hue: 120, saturation: 60, lightness: 55, intensityResponse: 0.8, effect: 'saturation' }
      },
      depthPattern: 'perlin',
      depthNoiseScale: 1.1,
      depthMin: -6,
      depthMax: 12,
      depthSpatialMode: 'center',
      depthDistanceFactor: 1.2,
      vectorShape: 'organic',
      vectorThickness: 0.020
    }
  },

  ocean_currents: {
    id: 'ocean_currents',
    name: 'Corrientes Oceánicas',
    description: 'Patrón polar con corrientes oceánicas y colores de profundidad marina',
    emoji: '🌊',
    category: 'organic',
    tags: ['polar', 'ocean', 'currents', 'marine'],
    config: {
      gridMode: 'math',
      gridSize: 1225,
      gridPattern: 'polar',
      polarDistribution: 'logarithmic',
      polarRadialBias: 0.4,
      animationType: 'oceanCurrents',
      animationSpeed: 0.7,
      animationIntensity: 1.4,
      colorConfig: {
        mode: 'gradient',
        color: { type: 'gradient', variant: 'radial', stops: [
          { offset: 0, color: '#87ceeb' },
          { offset: 0.4, color: '#4682b4' },
          { offset: 0.8, color: '#191970' },
          { offset: 1, color: '#000080' }
        ]}
      },
      depthPattern: 'waves',
      depthNoiseScale: 1.3,
      depthMin: -10,
      depthMax: 5,
      depthFlowDirection: 0,
      depthFlowIntensity: 1.5,
      depthTurbulence: 0.6,
      vectorShape: 'wave',
      vectorThickness: 0.016
    }
  },

  // EXPERIMENTAL CATEGORY
  quantum_field: {
    id: 'quantum_field',
    name: 'Campo Cuántico',
    description: 'Patrón fibonacci con turbulencia y efectos temporales de terremoto',
    emoji: '⚛️',
    category: 'experimental',
    tags: ['quantum', 'fibonacci', 'turbulence', 'temporal'],
    config: {
      gridMode: 'math',
      gridSize: 2025,
      gridPattern: 'fibonacci',
      fibonacciDensity: 1.8,
      fibonacciRadius: 0.9,
      animationType: 'turbulence',
      animationSpeed: 2.0,
      animationIntensity: 1.8,
      colorConfig: {
        mode: 'hsl',
        color: { type: 'hsl', hue: 320, saturation: 80, lightness: 70, speed: 1.5, variant: 'cycle' }
      },
      depthPattern: 'fractal',
      depthLayers: 4,
      depthNoiseScale: 1.8,
      depthMin: -15,
      depthMax: 20,
      depthTemporalMode: 'earthquake',
      depthTemporalSpeed: 3.0,
      depthTemporalAmplitude: 0.8,
      vectorShape: 'bezier',
      vectorThickness: 0.030
    }
  },

  cellular_automata: {
    id: 'cellular_automata',
    name: 'Autómata Celular',
    description: 'Grid básico con autómata celular y colores que responden a la complejidad',
    emoji: '🤖',
    category: 'experimental',
    tags: ['cellular', 'automata', 'grid', 'complex'],
    config: {
      gridMode: 'basic',
      rows: 25,
      cols: 25,
      spacing: 35,
      animationType: 'cellularAutomata',
      animationSpeed: 0.8,
      animationIntensity: 1.0,
      colorConfig: {
        mode: 'dynamic',
        color: { type: 'dynamic', hue: 45, saturation: 70, lightness: 50, intensityResponse: 1.5, effect: 'lightness' }
      },
      depthPattern: 'ridges',
      depthNoiseScale: 0.8,
      depthMin: -2,
      depthMax: 8,
      depthSpatialMode: 'edges',
      depthDistanceFactor: 1.5,
      vectorShape: 'zigzag',
      vectorThickness: 0.014
    }
  }
};

export const PRESET_CATEGORIES = {
  scientific: {
    name: 'Científico',
    description: 'Visualizaciones para análisis y investigación',
    emoji: '🔬',
    color: '#3498db'
  },
  artistic: {
    name: 'Artístico',
    description: 'Expresiones creativas y efectos visuales',
    emoji: '🎨',
    color: '#e74c3c'
  },
  architectural: {
    name: 'Arquitectónico',
    description: 'Estructuras geométricas y diseños precisos',
    emoji: '🏗️',
    color: '#95a5a6'
  },
  organic: {
    name: 'Orgánico',
    description: 'Patrones naturales y movimientos fluidos',
    emoji: '🌿',
    color: '#27ae60'
  },
  experimental: {
    name: 'Experimental',
    description: 'Configuraciones avanzadas y efectos extremos',
    emoji: '⚗️',
    color: '#9b59b6'
  }
};

// Helper function to get presets by category
export const getPresetsByCategory = (category: string): IntelligentPreset[] => {
  return Object.values(INTELLIGENT_PRESETS).filter(preset => preset.category === category);
};

// Helper function to search presets by tags
export const searchPresets = (query: string): IntelligentPreset[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(INTELLIGENT_PRESETS).filter(preset => 
    preset.name.toLowerCase().includes(lowercaseQuery) ||
    preset.description.toLowerCase().includes(lowercaseQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}; 