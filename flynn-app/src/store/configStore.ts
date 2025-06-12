import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PresetConfig } from '@/types/config';
import { getDefaultShapeParams } from '@/lib/shapeRegistry';
import { getAnimation } from '@/animations/registry';
import type { VectorShape } from '@/lib/shapeRegistry';

type AnimationId = PresetConfig['animation'];

const initialConfig: PresetConfig = {
    name: 'Custom',
    gridSize: 25,
    gridPattern: 'regular',
    animation: 'wave',
    speed: 1,
    intensity: 0.5,
    colorMode: 'dynamic',
    solidColor: '#3b82f6',
    gradientPalette: 'flow',
    colorIntensityMode: 'field',
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
    spatialMode: 'edge',
    mouseInfluence: 0,
    mouseMode: 'attract',
    physicsMode: 'none',
    vectorShape: 'wave',
    shapeParams: getDefaultShapeParams('wave'),
    rotationOrigin: 'start',
    isPaused: false,
    gridMode: 'basic',
};

interface ConfigStore extends PresetConfig {
  gridMode: 'basic' | 'math';
  setConfig: (updater: Partial<PresetConfig> | ((state: PresetConfig) => Partial<PresetConfig>)) => void;
  setAnimation: (animationId: AnimationId) => void;
  setVectorShape: (shape: VectorShape) => void;
}

export const useConfigStore = create<ConfigStore>()(
  immer((set) => ({
    ...initialConfig,
    gridMode: initialConfig.gridMode,
    setConfig: (updater) => {
      set((state) => {
        const updates = typeof updater === 'function' ? updater(state) : updater;
        
        if (updates.gridMode) {
            if (updates.gridMode === 'basic') {
                state.gridSize = 0;
            } else if (updates.gridMode === 'math') {
                state.rows = 0;
                state.cols = 0;
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