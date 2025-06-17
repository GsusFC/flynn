import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PresetConfig } from '@/types/config';
import { getDefaultShapeParams } from '@/lib/shapeRegistry';
import { getAnimation } from '@/animations/registry';
import type { VectorShape } from '@/lib/shapeRegistry';

type AnimationId = PresetConfig['animation'];

interface ConfigStore extends PresetConfig {
  pulseState?: { active: boolean; startMs: number };
  setConfig: (updater: Partial<PresetConfig & { pulseState?: { active: boolean; startMs: number } }> | ((state: PresetConfig & { pulseState?: { active: boolean; startMs: number } }) => Partial<PresetConfig & { pulseState?: { active: boolean; startMs: number } }>)) => void;
  setAnimation: (animationId: AnimationId) => void;
  setVectorShape: (shape: VectorShape) => void;
}

export const useConfigStore = create<ConfigStore>()(
  immer((set) => ({
    // Propiedades de configuración inicial
    name: 'Custom',
    gridSize: 0,
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5,
    colorMode: 'dynamic' as const,
    solidColor: '#3b82f6',
    gradientPalette: 'flow',
    colorIntensityMode: 'field' as const,
    colorHueShift: 1,
    colorSaturation: 80,
    colorBrightness: 60,
    backgroundColor: '#000000',
    lengthMin: 10,
    lengthMax: 25,
    oscillationFreq: 1,
    oscillationAmp: 0.3,
    pulseSpeed: 1,
    spatialFactor: 0.2,
    spatialMode: 'edge' as const,
    mouseInfluence: 0,
    mouseMode: 'attract' as const,
    physicsMode: 'none' as const,
    vectorShape: 'straight' as const,
    shapeParams: getDefaultShapeParams('wave'),
    rotationOrigin: 'start' as const,
    isPaused: false,
    gridScale: 1,
    gridMode: 'basic' as const,
    // Grid properties for basic mode
    rows: 10,
    cols: 10,
    spacing: 0,
    
    // Pattern-specific parameters with defaults
    // Fibonacci pattern
    fibonacciDensity: 1.0,
    fibonacciRadius: 0.8,
    fibonacciAngle: 137.5,
    
    // Radial pattern
    radialPatternBias: 0, // -1 for rings, 1 for lines
    radialMaxRadius: 0.9,
    
    // Polar pattern
    polarDistribution: 'uniform' as const,
    polarRadialBias: 0, // -1 for rings, 1 for lines
    
    // Golden ratio pattern
    goldenExpansion: 1.0,
    goldenRotation: 0,
    goldenCompression: 1.0,
    
    // Spiral pattern
    spiralTightness: 0.2,
    spiralArms: 2,
    spiralStartRadius: 5,
    
    // Hexagonal pattern
    hexagonalSpacing: 1.0,
    hexagonalOffset: 0.5,

    // Concentric Squares pattern
    concentricSquaresNumSquares: 5,
    concentricSquaresRotation: 0,

    // Voronoi pattern
    voronoiSeed: 1,
    
    pulseState: { active: false, startMs: 0 }, // Estado inicial del pulso
    
    // Métodos del store
    setConfig: (updater) => {
      set((state) => {
        const updates = typeof updater === 'function' ? updater(state) : updater;
        
        if (updates.gridMode) {
            if (updates.gridMode === 'basic') {
                // Volvemos al modo basado en filas/columnas → ignoramos gridSize
                state.gridSize = 0;
                state.gridPattern = 'regular';
            } else if (updates.gridMode === 'math') {
                // En modo matemático se ignoran filas/columnas
                state.rows = 0;
                state.cols = 0;
                if (state.gridSize === 0) {
                    state.gridSize = 100; // valor por defecto razonable
                }
            }
        }
        
        Object.assign(state, updates);
      });
    },
    setAnimation: (animationId) => {
        const animationMeta = getAnimation(animationId);
        set((state) => {
            state.animation = animationId;
            if (animationMeta) {
                Object.assign(state, animationMeta.defaultProps);
            }
        });
    },
    setVectorShape: (shape) => {
        set((state) => {
            state.vectorShape = shape;
            state.shapeParams = getDefaultShapeParams(shape);
        });
    },
  }))
); 