// /Users/gsus/CascadeProjects/Flynn/flynn-app/src/components/features/vector-grid/core/types.ts
import type React from 'react'; // Import React for RefObject


// -------------------- TIPOS DE ANIMACIÓN --------------------

export type AnimationType =
  | 'none'
  | 'staticAngle'
  | 'randomLoop'
  | 'smoothWaves'
  | 'seaWaves' // Conceptual
  | 'perlinFlow' // Conceptual
  | 'mouseInteraction'
  | 'centerPulse'
  | 'directionalFlow'
  | 'tangenteClasica'
  | 'lissajous' // Conceptual
  | 'vortex' // Conceptual
  | 'flocking'
  | 'randomWalk'
  | 'custom';
// Añade más tipos de tu lista aquí a medida que los vayas implementando

// --- Interfaces para AnimationProps ---

export interface NoAnimationProps {
  type: 'none';
}

export interface StaticAngleProps {
  type: 'staticAngle';
  angle: number; // 0-360
}

export interface RandomLoopProps {
  type: 'randomLoop';
  intervalMs?: number; // Default: 2000
  transitionSpeedFactor?: number; // Default: 1.0
}

export interface SmoothWavesProps {
  type: 'smoothWaves';
  frequency?: number; // Default: 0.1 (corregido de getDefaultPropsForType)
  amplitude?: number; // Default: 30 (corregido de getDefaultPropsForType)
  speed?: number;     // Default: 0.5 (corregido de getDefaultPropsForType)
  baseAngle?: number; // Default: 0
  patternScale?: number; // Default: 0.01
  waveType?: 'circular' | 'linear' | 'diagonal'; // Default: 'circular'
  centerX?: number;
  centerY?: number;
  timeScale?: number; // Default: 1.0 (puede coexistir o reemplazar 'speed' a futuro)
}

export interface MouseInteractionProps {
  type: 'mouseInteraction';
  interactionRadius?: number; // Default: 150
  attractionDistance?: number; // Default: 50
  repulsionDistance?: number; // Default: 150
  effectType?: 'attract' | 'repel' | 'align'; // Default: 'repel'
  strength?: number; // Default: 1.0
  alignAngleOffset?: number; // Default: 0
}

// --- Props para CenterPulse ---
export type PulseAngleOffsetMode = 'sine' | 'triangle' | 'random';
export type PulseTargetAngleMode =
  | 'initialRelative'
  | 'currentRelative'
  | 'awayFromCenter'
  | 'towardsCenter'
  | 'perpendicularClockwise'
  | 'perpendicularCounterClockwise';

export interface CenterPulseSubProps {
  pulseDuration?: number; // Default: 1000ms
  maxAngleOffset?: number; // Default: 90
  angleOffsetMode?: PulseAngleOffsetMode;
  targetAngleDuringPulse?: PulseTargetAngleMode;
  maxLengthFactorPulse?: number; // Default: 1.5
  minLengthFactorPulse?: number; // Default: 0.8
  maxWidthFactorPulse?: number; // Default: 1.2
  minWidthFactorPulse?: number; // Default: 0.9
  maxIntensityFactorPulse?: number; // Default: 1.0
  minIntensityFactorPulse?: number; // Default: 0.5
  distanceImpactFactor?: number; // Default: 0.3
  delayPerDistanceUnit?: number; // Default: 0
  easingFnKey?: string; // Default: 'easeInOutQuad'
  angleEasingFnKey?: string; // Default: 'easeOutQuad'
  factorEasingFnKey?: string; // Default: 'easeOutElastic'
}

export interface CenterPulseProps {
  type: 'centerPulse';
  pulse: CenterPulseSubProps;
}

export interface SeaWavesProps {
  type: 'seaWaves';
  baseFrequency?: number; // Default: 0.003
  baseAmplitude?: number; // Default: 30
  rippleFrequency?: number; // Default: 0.005
  rippleAmplitude?: number; // Default: 15
  choppiness?: number; // Default: 0.5 (0 to 1)
  spatialFactor?: number; // Default: 0.01
}

export interface PerlinFlowProps {
  type: 'perlinFlow';
  noiseScale?: number; // Default: 0.02 (escala del ruido de Perlin)
  timeScale?: number; // Default: 0.0005 (velocidad de evolución del campo de ruido)
  forceMagnitude?: number; // Default: 1.5 (fuerza con la que el ruido afecta a los vectores)
  angleOffset?: number; // Default: 0 (offset global para los ángulos del campo de flujo)
}

export interface DirectionalFlowProps {
  type: 'directionalFlow';
  flowAngle?: number; // Default: 0 (0-360 grados, dirección principal del flujo)
  flowSpeed?: number; // Default: 1 (velocidad del flujo)
  angleVariation?: number; // Default: 0 (grados de variación aleatoria alrededor de flowAngle)
  noiseScale?: number; // Default: 0.01 (escala del ruido para variaciones sutiles si angleVariation es 0)
}

export interface TangenteClasicaProps {
  type: 'tangenteClasica';
  rotationSpeed?: number; // Default: 0.01 (radianes por frame o unidad de tiempo)
  radiusFactor?: number; // Default: 1 (multiplicador para un radio base si aplica)
  phaseOffset?: number; // Default: 0 (offset de fase inicial)
  centerX?: number; // Default: centro del grid
  centerY?: number; // Default: centro del grid
}

export interface LissajousProps {
  type: 'lissajous';
  xFrequency?: number; // Default: 3
  yFrequency?: number; // Default: 2
  xPhase?: number; // Default: 0 (radianes)
  yPhase?: number; // Default: Math.PI / 2 (radianes) o 1.5708
  amplitudeScale?: number; // Default: 0.8 (relativo al tamaño de la celda o valor fijo)
  rotationSpeed?: number; // Default: 0 (rotación global de la figura de Lissajous)
  pointMode?: boolean; // Default: false (si es true, los vectores apuntan a la siguiente posición de la curva)
}

export interface VortexProps {
  type: 'vortex';
  strength?: number; // Default: 5 (magnitud del vórtice)
  radius?: number; // Default: 100 (radio de influencia en píxeles o unidades de grid)
  centerX?: number; // Default: centro del grid o posición del ratón
  centerY?: number; // Default: centro del grid o posición del ratón
  rotationSpeed?: number; // Default: 0.01 (velocidad de rotación de los vectores alrededor del centro)
  damping?: number; // Default: 0.95 (factor para reducir el efecto con la distancia)
}

export interface FlockingProps {
  type: 'flocking';
  separationRadius?: number; // Default: 50
  alignmentRadius?: number; // Default: 100
  cohesionRadius?: number; // Default: 150
  separationForce?: number; // Default: 1.5
  alignmentForce?: number; // Default: 1.0
  cohesionForce?: number; // Default: 0.5
  maxSpeed?: number; // Default: 2.0
}

export interface RandomWalkProps {
  type: 'randomWalk';
  stepSize?: number; // Default: 2.0
  changeFrequency?: number; // Default: 0.1
  smoothing?: number; // Default: 0.8
}

export interface CustomProps {
  type: 'custom';
  [key: string]: unknown; // Allow any custom properties
}

// (Añade aquí interfaces para las props de otras animaciones)

// --- Unión Discriminada para AnimationProps ---
export type AnimationProps =
  | NoAnimationProps
  | StaticAngleProps
  | RandomLoopProps
  | SmoothWavesProps
  | MouseInteractionProps
  | CenterPulseProps
  | SeaWavesProps
  | PerlinFlowProps
  | DirectionalFlowProps
  | TangenteClasicaProps
  | LissajousProps
  | VortexProps
  | FlockingProps
  | RandomWalkProps
  | CustomProps;
// Recuerda añadir estos nuevos tipos a getDefaultPropsForType en animations.ts

// --- Estado de Animación para el Slice ---
export interface AnimationStateForExport {
  animationType: AnimationType;
  animationProps: AnimationProps;
  easingFactor: number;
  timeScale: number;
  dynamicLengthEnabled: boolean;
  dynamicWidthEnabled: boolean;
  dynamicIntensity: number;
  isPaused: boolean;
}

// -------------------- OTROS TIPOS (Grid, Vector, etc.) --------------------

// Basic 2D vector type
export interface Vector2D {
  x: number;
  y: number;
}

// Basic vector item for UI display
export interface UIVectorItem {
  id: string;
  x: number;
  y: number;
  angle?: number;
  length?: number;
  width?: number;
  opacity?: number;
  r?: number; // Row in grid
  c?: number; // Column in grid
  // Required base properties for AnimatedVectorItem compatibility
  baseX?: number;
  baseY?: number;
  baseAngle?: number;
  baseLength?: number;
  baseWidth?: number;
  baseOpacity?: number;
  // Additional properties for compatibility
  originalX?: number;
  originalY?: number;
  originalAngle?: number;
  originalLength?: number;
  originalColor?: string;
  color?: string;
  userData?: unknown;
  customData?: Record<string, unknown>;
  // Animation-related properties
  lengthFactor?: number;
  widthFactor?: number;
  intensityFactor?: number;
  initialAngle?: number;
  currentAngle?: number;
  previousAngle?: number;
  targetAngle?: number;
  animationState?: Record<string, unknown>;
  flockId?: string;
}

// Vector item for rendering
export interface RenderVectorItem {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  opacity: number;
  color: string;
  r?: number;
  c?: number;
}

// Vector event subscription interface
export interface VectorEventSubscription {
  unsubscribe: () => void;
}

// Return type for useVectorAnimation hook
export interface UseVectorAnimationReturn {
  animatedVectors: AnimatedVectorItem[];
  isPlaying: boolean;
  toggleAnimation: () => void;
  resetAnimation: () => void;
  updateAnimation: (newProps: Partial<AnimationProps>) => void;
}

export type VectorShape = 'line' | 'arrow' | 'triangle' | 'circle' | 'circle-wave' | 'curve' | 'dot' | 'custom';
export type StrokeLinecap = 'butt' | 'round' | 'square';
export type RotationOrigin = 'center' | 'start' | 'end' | 'tail';
export type VectorColorValue = string | { h: number; s: number; l: number; a?: number };

export interface VectorSettings {
  vectorShape: VectorShape;
  vectorLength: number;
  vectorWidth: number;
  vectorColor: VectorColorValue;
  strokeLinecap?: StrokeLinecap;
  rotationOrigin?: RotationOrigin;
  lengthMode?: 'uniform' | 'random' | 'mouse' | 'custom';
  widthMode?: 'uniform' | 'random' | 'mouse' | 'custom';
  intensityMode?: 'uniform' | 'random' | 'mouse' | 'custom';
  useGlobalSettingsForAllVectors?: boolean;
}

export interface GridSettings {
  rows: number;
  cols: number;
  spacing: number;
  margin: number;
  distributeItems?: boolean;
}

export interface VectorGridCoreProps {
  gridSettings: GridSettings;
  vectorSettings: VectorSettings;
  initialAngle?: number;
  defaultVectorColor?: VectorColorValue;
  animationType: AnimationType;
  animationProps: AnimationProps;
  easingFactor?: number;
  timeScale?: number;
  dynamicLengthEnabled?: boolean;
  dynamicWidthEnabled?: boolean;
  dynamicIntensity?: number;
  isPaused?: boolean;
  showGridLines?: boolean;
  showVectorIndices?: boolean;
  backgroundColor?: string;
  preserveAspectRatio?: boolean;
  width?: number;
  height?: number;
  throttleMs?: number;
  // Props añadidas para control de contenedor y depuración
  containerFluid?: boolean;
  externalContainerRef?: React.RefObject<HTMLDivElement>; // Asegúrate de importar React si no está ya
  debugMode?: boolean;
}

// Definiciones añadidas para VectorSvgRenderer

export interface FrameInfo {
  frameCount: number;
  timestamp: number; // Momento actual de la animación, p.ej., performance.now()
  deltaTime?: number; // Tiempo transcurrido desde el último frame
}

export interface AnimatedVectorItem {
  id: string;
  // Current position
  x: number;
  y: number;
  // Base position
  baseX: number;
  baseY: number;
  // Original position for animations
  originalX: number;
  originalY: number;
  // Current angle
  angle: number;
  currentAngle: number; // Alias for compatibility
  // Base and original angles
  baseAngle: number;
  originalAngle: number;
  initialAngle: number; // Alias for compatibility
  // Target angle for smooth transitions
  targetAngle?: number;
  previousAngle: number;
  // Current length
  length: number;
  // Base and original length
  baseLength: number;
  originalLength: number;
  // Current width
  width: number;
  // Base and original width
  baseWidth: number;
  // Current opacity
  opacity: number;
  // Base and original opacity
  baseOpacity: number;
  // Color properties
  color: string;
  originalColor: string;
  // Factor properties for animations
  lengthFactor: number;
  widthFactor: number;
  intensityFactor: number;
  // Grid position
  r?: number; // Fila en la cuadrícula
  c?: number; // Columna en la cuadrícula
  // Animation specific data
  animationData?: Record<string, unknown>;
  animationState?: Record<string, unknown>; // Alias for compatibility
  customData?: Record<string, unknown>;
  // Flocking data
  flockId?: string;
}

export interface VectorRenderProps {
  item: AnimatedVectorItem;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: string; // El color ya resuelto como string
  shape: VectorShape; // La forma base del vector
  id: string; // El ID del item
  opacity: number; // Opacidad del vector
  // Podrías añadir frameInfo aquí si el customRenderer lo necesita
  // frameInfo?: FrameInfo;
}

// Interfaz para el Ref de VectorGrid
export interface VectorGridRef {
  // Métodos originales
  triggerPulse: (centerX?: number, centerY?: number) => boolean;
  togglePause: () => boolean;
  getVectors: () => AnimatedVectorItem[];
  
  // Métodos de acceso a vectores por posición
  getVectorByPosition?: (r: number, c: number) => AnimatedVectorItem | undefined;
  getRow?: (r: number) => AnimatedVectorItem[];
  getColumn?: (c: number) => AnimatedVectorItem[];
  
  // Métodos de animación básicos
  triggerPulseByGrid?: (r: number, c: number) => boolean;
  triggerRowPulse?: (r: number) => boolean;
  triggerColumnPulse?: (c: number) => boolean;
  
  // Métodos de animación avanzados
  animatePattern?: (pattern: number[][], delayBetweenPoints?: number) => number;
  animateRect?: (startRow: number, startCol: number, endRow: number, endCol: number, animationDelay?: number) => number;
  animateRectBorder?: (startRow: number, startCol: number, endRow: number, endCol: number, animationDelay?: number) => number;
  animateWave?: (centerR: number, centerC: number, maxRadius?: number, animationDelay?: number) => number;
  
  // Métodos de conversión
  gridToCartesian?: (r: number, c: number) => { x: number; y: number };
  cartesianToGrid?: (x: number, y: number) => { r: number; c: number } | null;
  
  // Validación
  isValidGridPosition?: (r: number, c: number) => boolean;
  
  // Metadatos
  getGridDimensions?: () => { rows: number; cols: number; spacing: number };
}