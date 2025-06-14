import type { VectorShape } from "@/lib/shapeRegistry";
import type { AnimationMeta } from "@/animations/types";

// Mantener estos tipos básicos para evitar dependencias circulares complejas
type AnimationId = AnimationMeta<any>['id'];
type GridPattern = 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar' | 'logSpiral' | 'concentricSquares';

export interface PresetConfig {
    name: string;
    gridSize: number;
    gridPattern: GridPattern;
    animation: AnimationId;
    speed: number;
    intensity: number;
    colorMode: 'solid' | 'gradient' | 'dynamic';
    solidColor: string;
    gradientPalette: string;
    colorIntensityMode: 'field' | 'velocity' | 'distance' | 'angle';
    colorHueShift: number;
    colorSaturation: number;
    colorBrightness: number;
    backgroundColor: string;
    lengthMin: number;
    lengthMax: number;
    oscillationFreq: number;
    oscillationAmp: number;
    pulseSpeed: number;
    spatialFactor: number;
    spatialMode: 'edge' | 'center' | 'mixed';
    mouseInfluence: number;
    mouseMode: 'attract' | 'repel' | 'stretch';
    physicsMode: 'none' | 'velocity' | 'pressure' | 'field';
    vectorShape: VectorShape;
    shapeParams: Record<string, number>;
    rotationOrigin: 'start' | 'center' | 'end';
    isPaused: boolean;
    gridMode: 'basic' | 'math';
    gridScale?: number;
    /** Grid properties for basic mode */
    rows?: number;
    cols?: number;
    spacing?: number;
    
    /** Pattern-specific parameters for math mode */
    // Fibonacci pattern
    fibonacciDensity?: number;
    fibonacciRadius?: number;
    fibonacciAngle?: number;
    
    // Radial pattern
    radialRings?: number;
    radialVectorsPerRing?: number;
    radialMaxRadius?: number;
    
    // Polar pattern
    polarRadialLines?: number;
    polarRings?: number;
    polarDistribution?: 'uniform' | 'logarithmic';
    
    // Golden ratio pattern
    goldenExpansion?: number;
    goldenRotation?: number;
    goldenCompression?: number;
    
    // Spiral pattern
    spiralTightness?: number;
    spiralArms?: number;
    spiralStartRadius?: number;
    
    // Hexagonal pattern
    hexagonalSpacing?: number;
    hexagonalOffset?: number;
    
    [key: string]: any;
} 