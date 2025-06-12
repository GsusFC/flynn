export type VectorShape = 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';

export interface SliderSpec {
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

export interface ShapeDefinition {
    label: string;
    params: Record<string, SliderSpec>;
}

export const SHAPE_REGISTRY: Record<VectorShape, ShapeDefinition> = {
    straight: {
        label: 'Straight Lines',
        params: {},
    },
    wave: {
        label: 'Wave Serpentine',
        params: {
            frequency: { label: 'Frequency', min: 0.5, max: 10, step: 0.1, defaultValue: 2 },
            amplitude: { label: 'Amplitude', min: 0, max: 5, step: 0.1, defaultValue: 1 },
        },
    },
    bezier: {
        label: 'Smooth Curves',
        params: {
            curvature: { label: 'Curvature', min: -2, max: 2, step: 0.1, defaultValue: 1 },
            pulse: { label: 'Pulse', min: 0, max: 5, step: 0.1, defaultValue: 0 },
        },
    },
    spiral: {
        label: 'Spiral Coils',
        params: {
            turns: { label: 'Turns', min: 1, max: 10, step: 0.5, defaultValue: 2 },
            tightness: { label: 'Tightness', min: 0.1, max: 3, step: 0.1, defaultValue: 1 },
        },
    },
    arc: {
        label: 'Simple Arcs',
        params: {
            curvature: { label: 'Curvature', min: -2, max: 2, step: 0.1, defaultValue: 1 },
            pulse: { label: 'Pulse', min: 0, max: 5, step: 0.1, defaultValue: 0 },
        },
    },
    organic: {
        label: 'Organic Forms',
        params: {
            noise: { label: 'Noise Amount', min: 0, max: 2, step: 0.1, defaultValue: 0.5 },
            sinuosity: { label: 'Sinuosity', min: 0, max: 2, step: 0.1, defaultValue: 1 },
        },
    },
};

// Helper to generate default params for a given shape
export const getDefaultShapeParams = (shape: VectorShape) => {
    const paramsConfig = SHAPE_REGISTRY[shape].params;
    const defaultParams: Record<string, number> = {};
    for (const key in paramsConfig) {
        defaultParams[key] = paramsConfig[key].defaultValue;
    }
    return defaultParams;
}; 