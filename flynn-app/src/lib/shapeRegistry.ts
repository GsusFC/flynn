export type VectorShape = 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic' | 'zigzag' | 'dash' | 'spring' | 'triangleWave' | 'double';

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
    zigzag: {
        label: 'Zigzag',
        params: {
            segments: { label: 'Segments', min: 2, max: 20, step: 1, defaultValue: 8 },
            amplitude: { label: 'Amplitude', min: 0.1, max: 5, step: 0.1, defaultValue: 1 },
        },
    },
    dash: {
        label: 'Dashed',
        params: {
            segments: { label: 'Dashes', min: 2, max: 30, step: 1, defaultValue: 10 },
            gap: { label: 'Gap (%)', min: 0, max: 0.9, step: 0.05, defaultValue: 0.3 },
        },
    },
    spring: {
        label: 'Spring',
        params: {
            coils: { label: 'Coils', min: 3, max: 20, step: 1, defaultValue: 8 },
            radius: { label: 'Radius', min: 0.1, max: 3, step: 0.1, defaultValue: 0.5 },
        },
    },
    triangleWave: {
        label: 'Triangle Wave',
        params: {
            frequency: { label: 'Frequency', min: 1, max: 15, step: 0.5, defaultValue: 4 },
            amplitude: { label: 'Amplitude', min: 0.1, max: 5, step: 0.1, defaultValue: 1 },
        },
    },
    double: {
        label: 'Double Line',
        params: {
            gap: { label: 'Gap', min: 1, max: 10, step: 0.5, defaultValue: 3 },
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