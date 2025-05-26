// Índice de exportación para todas las utilidades de exportación
// Punto único de acceso para SVG, GIF y utilidades relacionadas

// Generadores SVG
export {
  generateStaticSVG,
  generateAnimatedSVG,
  optimizeSVG,
  estimateSVGSize,
  validateSVGConfig
} from './svgGenerator';

// Generadores GIF
export {
  captureAnimationFrames,
  generateAnimatedGIF,
  generateGIFFromVectors,
  optimizeGIFConfig,
  estimateGIFSize,
  validateGIFConfig,
  downloadBlob
} from './gifGenerator';

// Utilidades de ciclos de animación
export {
  detectAnimationCycle,
  calculateOptimalStartTime,
  generateFrameTimestamps,
  areAnimationStatesSimilar,
  autoDetectAnimationCycle,
  optimizeCycleForFormat,
  calculateCaptureProgress,
  generateCycleMetadata,
  validateCycle
} from '../utils/animationCycleUtils';

// Re-exportar tipos importantes
export type {
  ExportConfig,
  ExportFormat,
  AnimationCycle,
  ExportFrame
} from '../simple/simpleTypes';
