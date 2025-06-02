// Tipos simplificados para el nuevo sistema VectorGrid
// Sin complejidad innecesaria, solo lo esencial

import type { ExtendedVectorColorValue } from '../types/gradientTypes';
import type { GlobalAnimationControls } from '../utils'; // Para AnimationContext

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
  | 'geometricPattern'
  | 'vortex'
  | 'pinwheels'
  | 'rippleEffect'
  | 'jitter'
  | 'flowField'
| 'curlNoise'
| 'gaussianGradient'
| 'dipoleField';

export type VectorShape = 'line' | 'curve' | 'circle' | 'circle-wave';

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
}

// Vector con todos los campos necesarios para el estado interno de la animación
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
  animationData: Record<string, unknown>; // Cambiado de 'any' a 'unknown' para mayor seguridad de tipos
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
  // TODO: Considerar si ValidatedVectorConfig debe tener campos opcionales como requeridos
  // o si debe fusionarse con otros tipos. Por ahora, es un alias.

  shape: VectorShape;
  length: number;
  width: number;
  color: ExtendedVectorColorValue; // Ahora soporta string, HSL y degradados
  opacity?: number;
  rotationOrigin: RotationOrigin; // Nueva propiedad para punto de rotaciรณn
  strokeLinecap: 'butt' | 'round' | 'square'; // Terminaciones de línea
}

// Configuraciones validadas (actualmente alias, podrían evolucionar)
export type ValidatedGridConfig = GridConfig;
export type ValidatedVectorConfig = VectorConfig;

// Configuración de Zoom
export interface ZoomConfig {
  level: number;        // Factor de zoom actual (0.1 - 5.0)
  min: number;         // Zoom mínimo permitido  
  max: number;         // Zoom máximo permitido
  step: number;        // Incremento para botones +/-
  presets: number[];   // Niveles predefinidos (25%, 50%, 100%, etc.)
}

// ===============================
// SISTEMA DE CONFIGURACIONES GUARDADAS
// ===============================

// Configuración completa guardada
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

// Configuración de animación para guardar
export interface AnimationConfig {
  type: AnimationType;
  props: Record<string, unknown>;
}

// Filtros para configuraciones públicas
export interface ConfigFilters {
  search?: string;              // Búsqueda por nombre/descripción
  tags?: string[];              // Filtrar por tags
  animationType?: AnimationType; // Filtrar por tipo de animación
  sortBy?: 'recent' | 'popular' | 'name'; // Ordenamiento
  limit?: number;               // Límite de resultados
  offset?: number;              // Para paginación
}

// Respuesta del API para configuraciones públicas
export interface PublicConfigsResponse {
  configs: SavedAnimation[];
  total: number;
  hasMore: boolean;
}

// Manager para gestión de configuraciones
export interface ConfigManager {
  // ===== CONFIGURACIONES PRIVADAS (localStorage) =====
  savePrivate(config: SavedAnimation): Promise<void>;
  loadPrivate(): SavedAnimation[];
  deletePrivate(id: string): Promise<void>;
  updatePrivate(id: string, updates: Partial<SavedAnimation>): Promise<void>;
  
  // ===== CONFIGURACIONES PÚBLICAS (Vercel KV) =====
  savePublic(config: SavedAnimation): Promise<string>; // Retorna shareUrl
  loadPublic(filters?: ConfigFilters): Promise<PublicConfigsResponse>;
  loadByShareId(shareId: string): Promise<SavedAnimation | null>;
  incrementUsage(shareId: string): Promise<void>;
  
  // ===== UTILIDADES =====
  exportToJSON(config: SavedAnimation): string;
  importFromJSON(json: string): SavedAnimation;
  generateShareId(): string;
  validateConfig(config: Partial<SavedAnimation>): boolean;
}

// Estados del modal de guardado
export interface SaveConfigModalState {
  isOpen: boolean;
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  isLoading: boolean;
  error?: string;
}

// Props para componentes de configuraciones
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
  showUsageCount?: boolean; // Solo para públicas
  emptyMessage?: string;
}

// DynamicVectorConfig removido para simplificar

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



// Props para las nuevas animaciones
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
  | ({ type: 'geometricPattern' } & GeometricPatternProps)
  | ({ type: 'vortex' } & VortexProps)
  | ({ type: 'pinwheels' } & PinwheelsProps)
  | ({ type: 'rippleEffect' } & RippleEffectProps)
  | ({ type: 'jitter' } & JitterProps)
  | ({ type: 'flowField' } & FlowFieldProps)
  | ({ type: 'curlNoise' } & CurlNoiseProps)
  | ({ type: 'gaussianGradient' } & GaussianGradientProps)
  | ({ type: 'dipoleField' } & DipoleFieldProps);

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
  currentGlobalControlsProp?: Partial<GlobalAnimationControls>; // Añadido para controles globales directos
  
  // Configuraciรณn de vectores dinรกmicos (nueva)
  // dynamicVectorConfig removido
  
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
  pulseDurationMs?: number; // Duration of the pulse effect in milliseconds
}

// Ref del componente para control externo (expandido)
export interface SimpleVectorGridRef {
  triggerPulse: (x?: number, y?: number) => void;
  togglePause: () => void;
  getVectors: () => SimpleVector[];
  getCurrentVectors: () => SimpleVector[]; // Vectores con estado actual de animación
  resetVectors: () => void;
  // Funciones de exportaciรณn (simplificadas) - 🔧 ARREGLADO consistencia de tipos
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
  time: number; // Current animation time (accumulated)
  frameCount: number; // Current animation frame count
  lastUpdateTime: number; // Timestamp of the last update (performance.now())
  pulseCenter: { x: number; y: number } | null;
  pulseStartTime: number | null;
  // Nuevos estados para vectores dinรกmicos
  previousVectors?: SimpleVector[];
  // dynamicConfig removido
  // Estados para exportaciรณn
  isExporting?: boolean;
  exportProgress?: number;
  capturedFrames?: ExportFrame[];
  // Estado para transiciones de rotaciรณn (nuevo)
  rotationTransition?: RotationTransition;
}

// Estado del pulso
export interface PulseStatus {
  center: { x: number; y: number };
  startTime: number;
  progress: number; // 0-1, basado en la duración del pulso
  duration: number; // Duración configurable del pulso
}

// Contexto proporcionado a cada función de animación
export interface AnimationContext {
  time: number; // Tiempo actual de la animación en ms (desde performance.now())
  deltaTime: number; // Tiempo transcurrido desde el último fotograma en ms
  width: number; // Ancho del canvas
  height: number; // Alto del canvas
  mousePosition: MousePosition; // Posición actual del ratón
  gridConfig: GridConfig; // Configuración actual del grid
  vectorConfig: VectorConfig; // Configuración actual de los vectores
  globalAnimationControls: GlobalAnimationControls; // Controles globales de animación
  // Información del pulso si está activo
  pulseStatus?: PulseStatus;
  // Información de la transición de rotación si está activa
  rotationTransition?: RotationTransition | null;
}
