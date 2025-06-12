// Tipos simplificados para el nuevo sistema VectorGrid
// Sin complejidad innecesaria, solo lo esencial

import type { ExtendedVectorColorValue } from '../types/gradientTypes';
import type { GlobalAnimationControls } from '../utils'; // Para AnimationContext

// Unified AnimationType - merges Hook + FlynVectorGrid animations
export type AnimationType = 
  // Original Hook animations
  | 'none'
  | 'smoothWaves'
  | 'mouseInteraction'
  | 'randomLoop'
  | 'centerPulse'
  | 'seaWaves'
  | 'tangenteClasica'
  | 'lissajous'
  | 'perlinFlow'
  | 'geometricPattern'
  | 'vortex'
  | 'pinwheels'
  | 'rippleEffect'
  | 'jitter'
  | 'flowField'
  | 'curlNoise'
  | 'gaussianGradient'
  | 'dipoleField'
  | 'testRotation'
  // FlynVectorGrid animations (aliases and new ones)
  | 'static'        // alias for 'none'
  | 'rotation'      // new FlynVectorGrid animation
  | 'wave'          // alias for 'smoothWaves'
  | 'spiral'        // new FlynVectorGrid animation
  | 'dipole'        // alias for 'dipoleField'
  | 'turbulence'    // new FlynVectorGrid animation
  | 'pulse'         // new FlynVectorGrid animation
  | 'pathFlow'      // new FlynVectorGrid animation  
  | 'flocking'      // new complex animation
  | 'cellularAutomata' // new complex animation
  | 'oceanCurrents' // new complex animation

// Unified VectorShape - supports both simple and complex shapes
export type VectorShape = 
  // Original Hook shapes
  | 'line' 
  | 'curve' 
  | 'circle' 
  | 'circle-wave'
  // FlynVectorGrid complex shapes
  | 'straight'   // alias for 'line'
  | 'wave'
  | 'bezier'
  | 'spiral'
  | 'arc'
  | 'organic';

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
  shape?: VectorShape; // Forma del vector (line, curve, etc.)
  // Posiciรณn original para animaciones
  originalX: number;
  originalY: number;
  originalAngle: number;
  // Posiciรณn en el grid
  gridRow: number;
  gridCol: number;
  // Propiedades dinámicas (reintroducidas para compatibilidad con lógica existente del hook)
  dynamicLength?: number;
  dynamicWidth?: number;
  intensity?: number;      // A menudo usado con dinámicas o calculado globalmente
  previousAngle?: number;  // Útil para calcular cambios o para ciertas animaciones
  // Optional properties for advanced shape rendering
  curvatureIntensity?: number;
  waveFrequency?: number;
  spiralTightness?: number;
  organicNoise?: number;
  rotationOrigin: RotationOrigin;
}

// Vector with all necessary fields for animation state
export interface AnimatedVectorItem {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  originalX: number;
  originalY: number;
  angle: number;
  currentAngle: number;
  baseAngle: number;
  originalAngle: number;
  initialAngle: number;
  previousAngle: number;
  length: number;
  baseLength: number;
  originalLength: number;
  width: number;
  baseWidth: number;
  opacity: number;
  baseOpacity: number;
  color: ExtendedVectorColorValue;
  originalColor: ExtendedVectorColorValue;
  lengthFactor: number;
  widthFactor: number;
  intensityFactor: number;
  r?: number;
  c?: number;
  animationData: Record<string, unknown>; // Changed from 'any' to 'unknown' for better type safety
}

// Unified GridConfig - supports both auto and manual modes
export interface GridConfig {
  // Basic grid properties
  rows: number;
  cols: number;
  spacing: number;
  margin: number;
  
  // === GRID CONTROL (from FlynVectorGrid) ===
  gridSize?: number;                    // Auto mode alternative
  canvasWidth?: number;
  canvasHeight?: number;
  gridPattern?: 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar';
  
  // === PHYSICS & INTERACTION (from FlynVectorGrid) ===
  mouseInfluence?: number;
  mouseMode?: 'attract' | 'repel' | 'stretch';
  physicsMode?: 'none' | 'velocity' | 'pressure' | 'field';
}

// Vector configuration - simple (now supports gradients, dynamics, and rotation)

export interface VectorConfig {
  // Basic vector properties
  shape: VectorShape;
  length: number;
  width: number;
  color: ExtendedVectorColorValue; // Now supports string, HSL, and gradients
  opacity?: number;
  rotationOrigin: RotationOrigin; // New property for rotation point
  strokeLinecap: 'butt' | 'round' | 'square'; // Line terminations
  
  // === UNIFIED COLOR SYSTEM (from FlynVectorGrid) ===
  colorMode?: 'solid' | 'gradient' | 'dynamic';
  solidColor?: string;
  gradientPalette?: 'flow' | 'rainbow' | 'cosmic' | 'pulse' | 'subtle' | 'sunset' | 'ocean' | string;
  colorIntensityMode?: 'field' | 'velocity' | 'distance' | 'angle';
  colorHueShift?: number;
  colorSaturation?: number;
  colorBrightness?: number;
  
  // === LENGTH DYNAMICS (from FlynVectorGrid) ===
  lengthMin?: number;
  lengthMax?: number;
  oscillationFreq?: number;
  oscillationAmp?: number;
  pulseSpeed?: number;
  spatialFactor?: number;
  spatialMode?: 'edge' | 'center' | 'mixed';
  
  // === COMPLEX SHAPE PROPERTIES (from FlynVectorGrid) ===
  showArrowheads?: boolean;
  curvatureIntensity?: number;
  waveFrequency?: number;
  spiralTightness?: number;
  organicNoise?: number;
}

// Validated configurations (currently alias, could evolve)
export type ValidatedGridConfig = GridConfig;
export type ValidatedVectorConfig = VectorConfig;

// Zoom configuration
export interface ZoomConfig {
  level: number;        // Current zoom factor (0.1 - 5.0)
  min: number;         // Minimum allowed zoom  
  max: number;         // Maximum allowed zoom
  step: number;        // Increment for +/- buttons
  presets: number[];   // Predefined levels (25%, 50%, 100%, etc.)
}

// ===============================
// SISTEMA DE CONFIGURACIONES GUARDADAS
// ===============================

// Complete saved configuration
export interface SavedAnimation {
  id: string;
  name: string;
  description: string;
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationConfig: {
    type: AnimationType;
    props: Record<string, unknown>;
  };
  zoomConfig: ZoomConfig;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  tags: string[];
}

// Configuration for saving animation
export interface AnimationConfig {
  type: AnimationType;
  props: Record<string, unknown>;
}

// Filters for public configurations
export interface ConfigFilters {
  search?: string;              // Search by name/description
  tags?: string[];              // Filter by tags
  animationType?: AnimationType; // Filter by animation type
  sortBy?: 'recent' | 'popular' | 'name'; // Sorting
  limit?: number;               // Result limit
  offset?: number;              // For pagination
}

// API response for public configurations
export interface PublicConfigsResponse {
  configs: SavedAnimation[];
  total: number;
  hasMore: boolean;
}

// Manager for configuration management
export interface ConfigManager {
  // ===== PRIVATE CONFIGURATIONS (localStorage) =====
  savePrivate(config: SavedAnimation): Promise<void>;
  loadPrivate(): SavedAnimation[];
  deletePrivate(id: string): Promise<void>;
  updatePrivate(id: string, updates: Partial<SavedAnimation>): Promise<void>;
  
  // ===== PUBLIC CONFIGURATIONS (Vercel KV) =====
  savePublic(config: SavedAnimation): Promise<string>; // Returns shareUrl
  loadPublic(filters?: ConfigFilters): Promise<PublicConfigsResponse>;
  loadByShareId(shareId: string): Promise<SavedAnimation | null>;
  incrementUsage(shareId: string): Promise<void>;
  
  // ===== UTILITIES =====
  exportToJSON(config: SavedAnimation): string;
  importFromJSON(json: string): SavedAnimation;
  generateShareId(): string;
  validateConfig(config: Partial<SavedAnimation>): boolean;
}

// Save modal state
export interface SaveConfigModalState {
  isOpen: boolean;
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  isLoading: boolean;
  error?: string;
}

// Props for configuration components
export interface SaveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Omit<SavedAnimation, 'id' | 'createdAt'>) => Promise<void>;
  currentState: {
    animationType: AnimationType;
    animationProps: AnimationProps;
    gridConfig: GridConfig;
    vectorConfig: VectorConfig;
    zoomConfig: ZoomConfig;
  };
}

export interface ConfigListProps {
  title: string;
  configs: SavedAnimation[];
  isLoading?: boolean;
  onLoad: (config: SavedAnimation) => void;
  onDelete?: (id: string) => void;
  showUsageCount?: boolean; // Only for public
  emptyMessage?: string;
}

// DynamicVectorConfig removed for simplification

// Props for animations - only the necessary ones (ELIMINATED THE SIN GRACIA)
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



// Props for the new animations
export interface GeometricPatternProps {
  rotationSpeed: number;
  patternType: 'radial' | 'tangential' | 'spiral';
  spiralIntensity?: number;
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

export interface FlowFieldProps {
  scale: number;
  strength: number;
  timeScale: number;
  coherence: number;
}

export interface CurlNoiseProps {
  scale: number;
  strength: number;
  timeScale: number;
  turbulence: number;
  persistence: number;
  octaves?: number;
}

export interface GaussianGradientProps {
  centerX: number;
  centerY: number;
  sigma: number;
  strength: number;
  mode: 'repel' | 'attract';
}

export interface DipoleFieldProps {
  separation: number;
  strength: number;
  rotation: number;
}

export interface TestRotationProps {
  speed: number;
}

// Union type for animation props - EXPANDED WITH NEW ANIMATIONS
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
  | ({ type: 'geometricPattern' } & GeometricPatternProps)
  | ({ type: 'vortex' } & VortexProps)
  | ({ type: 'pinwheels' } & PinwheelsProps)
  | ({ type: 'rippleEffect' } & RippleEffectProps)
  | ({ type: 'jitter' } & JitterProps)
  | ({ type: 'flowField' } & FlowFieldProps)
  | ({ type: 'curlNoise' } & CurlNoiseProps)
  | ({ type: 'gaussianGradient' } & GaussianGradientProps)
  | ({ type: 'dipoleField' } & DipoleFieldProps);

// Types for exportation (new)
export type ExportFormat = 'svg' | 'animated-svg' | 'gif';

export interface ExportConfig {
  format: ExportFormat;
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high' | 'maximum';
  // For GIF and animated SVG
  duration?: number;
  fps?: number;
  loop?: boolean;
  // For GIF specifically
  dithering?: boolean;
  colorPalette?: 'adaptive' | 'web-safe' | 'grayscale';
  // For SVG specifically
  precision?: number;
  optimize?: boolean;
}

// Options for GIF export
export interface ExportGIFOptions {
  fps?: number;
  duration?: number; // in seconds
  quality?: number; // Lower is better for gif.js (1-30, default 10)
  gifWidth?: number;
  gifHeight?: number;
  loop?: boolean; // true for infinite loop
  onProgress?: (progress: number) => void; // Optional progress callback (0-1)
  // gifJsPath?: string; // Path to gif.worker.js if not default
}

export interface AnimationCycle {
  duration: number;        // Duration of complete cycle in ms
  frameCount: number;      // Frames needed for perfect loop
  startOffset?: number;    // Offset to start at optimal point
  isDetected: boolean;     // If cycle was detected automatically
}

export interface ExportFrame {
  timestamp: number;
  vectors: SimpleVector[];
  canvasData?: ImageData;
}

// Main props for component (expanded)
export interface SimpleVectorGridProps {
  // Grid configuration
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  
  // Animation configuration
  animationType: AnimationType;
  animationProps: AnimationProps;
  currentGlobalControlsProp?: Partial<GlobalAnimationControls>; // Added for direct global controls
  
  // New dynamic vector configuration
  // dynamicVectorConfig removed
  
  // Canvas configuration
  width: number;
  height: number;
  backgroundColor?: string;
  
  // States
  isPaused?: boolean;
  debugMode?: boolean;
  
  // Optional callbacks
  onVectorCountChange?: (count: number) => void;
  onPulseComplete?: () => void;
  onExportProgress?: (progress: number) => void;
  pulseDurationMs?: number; // Duration of the pulse effect in milliseconds
}

// Ref for component for external control (expanded)
export interface SimpleVectorGridRef {
  triggerPulse: (x?: number, y?: number) => void;
  togglePause: () => void;
  getVectors: () => SimpleVector[];
  getCurrentVectors: () => SimpleVector[]; // Vectors with current state of animation
  resetVectors: () => void;
  // Export functions (simplified) - 🔧 ARREGLADO consistency of types
  exportSVG: () => Promise<{ data: string; filename: string; }>;
  exportAnimatedSVG: () => Promise<{ data: string; filename: string; }>;
  exportGIF: (options?: {
    fps?: number;
    duration?: number;
    quality?: number;
    width?: number;
    height?: number;
    loop?: boolean;
  }) => Promise<Blob>;
  detectAnimationCycle: () => AnimationCycle;
}

// Mouse position
export interface MousePosition {
  x: number | null;
  y: number | null;
}

// Internal state of hook (expanded with rotation)
export interface VectorGridState {
  vectors: SimpleVector[];
  mousePosition: MousePosition;
  isPaused: boolean;
  time: number; // Current animation time (accumulated)
  frameCount: number; // Current animation frame count
  lastUpdateTime: number; // Timestamp of the last update (performance.now())
  pulseCenter: { x: number; y: number } | null;
  pulseStartTime: number | null;
  // New states for dynamic vectors
  previousVectors?: SimpleVector[];
  // dynamicConfig removed
  // States for exportation
  isExporting?: boolean;
  exportProgress?: number;
  capturedFrames?: ExportFrame[];
  // State for rotation transitions (new)
  rotationTransition?: RotationTransition;
}

// Pulse state
export interface PulseStatus {
  center: { x: number; y: number };
  startTime: number;
  progress: number; // 0-1, based on pulse duration
  duration: number; // Configurable pulse duration
}

// Context provided to each animation function
export interface AnimationContext {
  time: number; // Current animation time in ms (from performance.now())
  deltaTime: number; // Time elapsed since last frame in ms
  width: number; // Canvas width
  height: number; // Canvas height
  mousePosition: MousePosition; // Current mouse position
  gridConfig: GridConfig; // Current grid configuration
  vectorConfig: VectorConfig; // Current vector configuration
  globalAnimationControls: GlobalAnimationControls; // Global animation controls
  // Pulse information if active
  pulseStatus?: PulseStatus;
  // Rotation transition information if active
  rotationTransition?: RotationTransition | null;
}
