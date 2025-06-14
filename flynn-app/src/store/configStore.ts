import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PresetConfig } from '@/types/config';
import { getDefaultShapeParams } from '@/lib/shapeRegistry';
import { getAnimation } from '@/animations/registry';
import type { VectorShape } from '@/lib/shapeRegistry';

type AnimationId = PresetConfig['animation'];

interface ConfigStore extends PresetConfig {
  setConfig: (updater: Partial<PresetConfig> | ((state: PresetConfig) => Partial<PresetConfig>)) => void;
  setAnimation: (animationId: AnimationId) => void;
  setVectorShape: (shape: VectorShape) => void;
}

export const useConfigStore = create<ConfigStore>()(
  immer((set) => ({
    // Propiedades de configuración inicial
    name: 'Custom',
    gridSize: 25,
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
    vectorShape: 'wave' as const,
    shapeParams: getDefaultShapeParams('wave'),
    rotationOrigin: 'start' as const,
    isPaused: false,
    gridScale: 1,
    gridMode: 'basic' as const,
    
    // Métodos del store
    setConfig: (updater) => {
      set((state) => {
        const updates = typeof updater === 'function' ? updater(state) : updater;
        
        if (updates.gridMode) {
            if (updates.gridMode === 'basic') {
                state.gridSize = 0;
            } else if (updates.gridMode === 'math') {
                state.gridSize = 0;
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