// Tipos simplificados para el nuevo sistema VectorGrid
// Sin complejidad innecesaria, solo lo esencial

import type { ExtendedVectorColorValue } from '../types/gradientTypes';

// SOLO ANIMACIONES CON GRACIA - expandido con nuevas animaciones
export type AnimationType = 
  | 'none'
  | 'smoothWaves'
  | 'mouseInteraction'
  | 'randomLoop'
  | 'centerPulse'
  | 'seaWaves'
  | 'tangenteClasica'
  | 'lissajous'
  | 'perlinFlow'
  | 'hslRainbow'
  | 'hslGradientFlow'
  | 'geometricPattern'
  | 'vortex'
  | 'pinwheels'
  | 'rippleEffect'
  | 'jitter';

export type VectorShape = 'arrow' | 'line' | 'curve' | 'circle' | 'dot';

// Tipo para el punto de rotaciรณn de los vectores
export type RotationOrigin = 'center' | 'start' | 'end' | 'tail';

// Configuraciรณn para transiciones de rotaciรณn
export interface RotationTransition {
  isTransitioning: boolean;
  fromOrigin: RotationOrigin;
  toOrigin: RotationOrigin;
  progress: number; // 0-1
  startTime: number;
  duration: number; // ms
}

// Vector simplificado - solo propiedades esenciales (ahora soporta degradados y dinรกmicos)
export interface SimpleVector {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: ExtendedVectorColorValue; // Ahora soporta string, HSL y degradados
  opacity: number;
  // Posiciรณn original para animaciones
  originalX: number;
  originalY: number;
  originalAngle: number;
  // Posiciรณn en el grid
  gridRow: number;
  gridCol: number;
  // Propiedades dinรกmicas (nuevas)
  dynamicLength?: number;
  dynamicWidth?: number;
  intensity?: number; // Factor de intensidad 0-1 para cรกlculos dinรกmicos
  previousAngle?: number; // Para calcular cambios de direcciรณn
}

// Configuraciรณn del grid - simple y directo
export interface GridConfig {
  rows: number;
  cols: number;
  spacing: number;
  margin: number;
}

// Configuraciรณn de vectores - simple (ahora soporta degradados, dinรกmicos y rotaciรณn)
export interface VectorConfig {
  shape: VectorShape;
  length: number;
  width: number;
  color: ExtendedVectorColorValue; // Ahora soporta string, HSL y degradados
  opacity?: number;
  rotationOrigin: RotationOrigin; // Nueva propiedad para punto de rotaciรณn
}

// Configuraciรณn de vectores dinรกmicos (nueva)
export interface DynamicVectorConfig {
  enableDynamicLength: boolean;
  enableDynamicWidth: boolean;
  lengthMultiplier: number;    // 0.5 - 3.0
  widthMultiplier: number;     // 0.5 - 3.0
  responsiveness: number;      // Quรฉ tan reactivo es el cambio
  smoothing: number;           // Factor de suavizado para transiciones
}

// Props de animaciones - solo las necesarias (ELIMINADAS LAS SIN GRACIA)
export interface SmoothWavesProps {
  frequency: number;
  amplitude: number;
  speed: number;
  baseAngle: number;
  patternScale: number;
  waveType: 'circular' | 'linear' | 'diagonal';
  timeScale: number;
}

export interface MouseInteractionProps {
  interactionRadius: number;
  attractionDistance: number;
  repulsionDistance: number;
  effectType: 'attract' | 'repel' | 'align';
  strength: number;
  alignAngleOffset: number;
}

export interface RandomLoopProps {
  intervalMs: number;
  transitionSpeedFactor: number;
}

export interface CenterPulseProps {
  pulseSpeed: number;
  pulseIntensity: number;
  pulseRadius: number;
  continuous: string;
  pulseFrequency: number;
  waveType: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

export interface SeaWavesProps {
  baseFrequency: number;
  baseAmplitude: number;
  rippleFrequency: number;
  rippleAmplitude: number;
  choppiness: number;
  spatialFactor: number;
}

export interface TangenteClasicaProps {
  rotationSpeed: number;
  direction: 'clockwise' | 'counterClockwise';
}

export interface LissajousProps {
  xFrequency: number;
  yFrequency: number;
  xAmplitude: number;
  yAmplitude: number;
  phaseOffset: number;
  timeSpeed: number;
}

export interface PerlinFlowProps {
  noiseScale: number;
  timeEvolutionSpeed: number;
  angleMultiplier: number;
  octaves: number;
  persistence: number;
}

export interface HslRainbowProps {
  hueSpeed: number;
  saturation: number;
  lightness: number;
  waveLength: number;
  timeOffset: number;
}

export interface HslGradientFlowProps {
  hueSpeed: number;
  saturation: number;
  lightness: number;
  gradientLength: number;
  flowDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  timeOffset: number;
}

// Props para las nuevas animaciones
export interface GeometricPatternProps {
  rotationSpeed: number;
  patternType: 'radial' | 'tangential' | 'spiral';
  centerInfluence: number;
  patternIntensity: number;
}

export interface VortexProps {
  intensity: number;
  rotationSpeed: number;
  inwardPull: number;
}

export interface PinwheelsProps {
  pinwheelCount: number;
  rotationSpeed: number;
  moveSpeed: number;
  influenceRadius: number;
}

export interface RippleEffectProps {
  waveSpeed: number;
  waveLength: number;
  amplitude: number;
}

export interface JitterProps {
  intensity: number;
  frequency: number;
  baseAnimation: 'smoothWaves' | 'static' | 'none';
}

// Union type para props de animaciรณn - EXPANDIDO CON NUEVAS ANIMACIONES
export type AnimationProps = 
  | { type: 'none' }
  | ({ type: 'smoothWaves' } & SmoothWavesProps)
  | ({ type: 'mouseInteraction' } & MouseInteractionProps)
  | ({ type: 'randomLoop' } & RandomLoopProps)
  | ({ type: 'centerPulse' } & CenterPulseProps)
  | ({ type: 'seaWaves' } & SeaWavesProps)
  | ({ type: 'tangenteClasica' } & TangenteClasicaProps)
  | ({ type: 'lissajous' } & LissajousProps)
  | ({ type: 'perlinFlow' } & PerlinFlowProps)
  | ({ type: 'hslRainbow' } & HslRainbowProps)
  | ({ type: 'hslGradientFlow' } & HslGradientFlowProps)
  | ({ type: 'geometricPattern' } & GeometricPatternProps)
  | ({ type: 'vortex' } & VortexProps)
  | ({ type: 'pinwheels' } & PinwheelsProps)
  | ({ type: 'rippleEffect' } & RippleEffectProps)
  | ({ type: 'jitter' } & JitterProps);

// Tipos para exportaciรณn (nuevos)
export type ExportFormat = 'svg' | 'animated-svg' | 'gif';

export interface ExportConfig {
  format: ExportFormat;
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high' | 'maximum';
  // Para GIF y SVG animado
  duration?: number;
  fps?: number;
  loop?: boolean;
  // Para GIF especรญficamente
  dithering?: boolean;
  colorPalette?: 'adaptive' | 'web-safe' | 'grayscale';
  // Para SVG especรญficamente
  precision?: number;
  optimize?: boolean;
}

export interface AnimationCycle {
  duration: number;        // Duraciรณn del ciclo completo en ms
  frameCount: number;      // Frames necesarios para bucle perfecto
  startOffset?: number;    // Offset para comenzar en punto รณptimo
  isDetected: boolean;     // Si el ciclo fue detectado automรกticamente
}

export interface ExportFrame {
  timestamp: number;
  vectors: SimpleVector[];
  canvasData?: ImageData;
}

// Props principales del componente (expandido)
export interface SimpleVectorGridProps {
  // Configuraciรณn del grid
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  
  // Configuraciรณn de animaciรณn
  animationType: AnimationType;
  animationProps: AnimationProps;
  
  // Configuraciรณn de vectores dinรกmicos (nueva)
  dynamicVectorConfig?: DynamicVectorConfig;
  
  // Configuraciรณn del canvas
  width: number;
  height: number;
  backgroundColor?: string;
  
  // Estados
  isPaused?: boolean;
  debugMode?: boolean;
  
  // Callbacks opcionales
  onVectorCountChange?: (count: number) => void;
  onPulseComplete?: () => void;
  onExportProgress?: (progress: number) => void;
}

// Ref del componente para control externo (expandido)
export interface SimpleVectorGridRef {
  triggerPulse: (x?: number, y?: number) => void;
  togglePause: () => void;
  getVectors: () => SimpleVector[];
  getCurrentVectors: () => SimpleVector[]; // Vectores con estado actual de animación
  resetVectors: () => void;
  // Nuevas funciones de exportaciรณn
  exportSVG: (config?: Partial<ExportConfig>) => Promise<string>;
  exportAnimatedSVG: (config?: Partial<ExportConfig>) => Promise<string>;
  exportGIF: (config?: Partial<ExportConfig>) => Promise<Blob>;
  detectAnimationCycle: () => AnimationCycle;
}

// Posiciรณn del mouse
export interface MousePosition {
  x: number | null;
  y: number | null;
}

// Estado interno del hook (expandido con rotaciรณn)
export interface VectorGridState {
  vectors: SimpleVector[];
  mousePosition: MousePosition;
  isPaused: boolean;
  lastUpdateTime: number;
  pulseCenter: { x: number; y: number } | null;
  pulseStartTime: number | null;
  // Nuevos estados para vectores dinรกmicos
  previousVectors?: SimpleVector[];
  dynamicConfig?: DynamicVectorConfig;
  // Estados para exportaciรณn
  isExporting?: boolean;
  exportProgress?: number;
  capturedFrames?: ExportFrame[];
  // Estado para transiciones de rotaciรณn (nuevo)
  rotationTransition?: RotationTransition;
}
