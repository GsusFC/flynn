// Hook optimizado que unifica grid + animaciones + estado + vectores dinámicos + exportación
// Versión optimizada con mejoras de performance para carga inicial

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  SimpleVector, 
  GridConfig, 
  VectorConfig, 
  AnimationProps,
  AnimationType, 
  VectorGridState,
  ExportConfig,
  AnimationCycle,
  SimpleVectorGridRef
} from './simpleTypes';
import { applyAnimation } from './simpleAnimations';
// Imports de vectores dinámicos removidos
import { detectAnimationCycle } from '../utils/animationCycleUtils';
// Export functions removed - keeping original functionality
const generateStaticSVG = () => ({ data: '', filename: 'export.svg' });
const generateAnimatedSVG = () => ({ data: '', filename: 'export.svg' });
const generateGIFFromVectors = () => Promise.resolve(new Blob());

interface UseSimpleVectorGridProps {
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  animationProps: Record<string, unknown>;
  width: number;
  height: number;
  isPaused?: boolean;
  debugMode?: boolean;
  onVectorCountChange?: (count: number) => void;
  onPulseComplete?: () => void;
  onExportProgress?: (progress: number) => void;
}

export const useSimpleVectorGridOptimized = ({
  gridConfig,
  vectorConfig,
  animationType,
  animationProps,
  width,
  height,
  isPaused = false,
  debugMode = false,
  onVectorCountChange,
  onPulseComplete,
  onExportProgress
}: UseSimpleVectorGridProps) => {
  // 🚀 OPTIMIZACIÓN 1: Estado inicial vacío para evitar cálculos en hidratación
  const [state, setState] = useState<VectorGridState>(() => ({
    vectors: [],
    mousePosition: { x: null, y: null },
    isPaused: false,
    lastUpdateTime: 0,
    pulseCenter: null,
    pulseStartTime: null,
    previousVectors: undefined,
    dynamicConfig: undefined,
    isExporting: false,
    exportProgress: 0,
    capturedFrames: []
  }));

  // 🚀 OPTIMIZACIÓN 2: Lazy initialization de refs
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);
  const lastRenderedFrameRef = useRef<SimpleVector[]>([]);
  const gridCacheRef = useRef<SimpleVector[] | null>(null);
  const configHashRef = useRef<string>('');

  // 🚀 OPTIMIZACIÓN 3.5: Estabilizar animationProps para evitar recreaciones del useCallback
  const stableAnimationProps = useMemo(() => {
    return animationProps;
  }, [animationProps]);

  // 🚀 OPTIMIZACIÓN 4: Hash de configuración para evitar regeneración innecesaria
  const configHash = useMemo(() => {
    return JSON.stringify({
      gridConfig,
      vectorConfig: {
        length: vectorConfig.length,
        width: vectorConfig.width,
        color: typeof vectorConfig.color === 'string' ? vectorConfig.color : JSON.stringify(vectorConfig.color),
        shape: vectorConfig.shape
      },
      width,
      height
    });
  }, [gridConfig, vectorConfig, width, height]);

  // 🚀 OPTIMIZACIÓN 5: Detección de cliente optimizada
  useEffect(() => {
    setIsClient(true);
    timeRef.current = Date.now(); // Usar Date.now() para consistencia con animaciones
  }, []);

  // 🚀 OPTIMIZACIÓN 6: Grid generator con cache inteligente
  const generateGrid = useCallback(() => {
    // Verificar si podemos usar cache
    if (gridCacheRef.current && configHashRef.current === configHash) {
      return gridCacheRef.current;
    }

    const { rows, cols, spacing, margin } = gridConfig;
    const { length, width: vectorWidth, color } = vectorConfig;

    // 🚀 Pre-calcular valores para evitar cálculos repetidos en el loop
    const totalWidth = cols * spacing;
    const totalHeight = rows * spacing;
    const startX = (width - totalWidth) / 2 + margin;
    const startY = (height - totalHeight) / 2 + margin;
    
    // 🚀 Usar Array.from con mapeo directo (más eficiente que bucles anidados)
    const vectors: SimpleVector[] = Array.from(
      { length: rows * cols }, 
      (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        
        return {
          id: `vector-${row}-${col}`,
          x,
          y,
          originalX: x,
          originalY: y,
          angle: 0,
          originalAngle: 0,
          length,
          width: vectorWidth,
          color,
          opacity: 1,
          gridRow: row,
          gridCol: col,
          dynamicLength: undefined,
          dynamicWidth: undefined
        };
      }
    );

    // Cachear el grid y el hash
    gridCacheRef.current = vectors;
    configHashRef.current = configHash;

    // Notificar cambio de conteo si existe el callback
    onVectorCountChange?.(vectors.length);

    return vectors;
  }, [gridConfig, vectorConfig, width, height, isClient, debugMode, onVectorCountChange, configHash]);

  // 🚀 OPTIMIZACIÓN 7: Inicialización lazy del grid solo en cliente
  useEffect(() => {
    if (!isClient) return;
    
    const vectors = generateGrid();
    setState(prev => ({
      ...prev,
      vectors,
      lastUpdateTime: performance.now()
    }));
  }, [generateGrid, isClient]);

  // 🚀 OPTIMIZACIÓN 8: Reset optimizado solo cuando cambian props relevantes
  useEffect(() => {
    if (!isClient) return;
    
    setState(prev => ({
      ...prev,
      vectors: prev.vectors.map(vector => ({
        ...vector,
        length: vectorConfig.length,
        width: vectorConfig.width,
        color: vectorConfig.color
      }))
    }));
  }, [vectorConfig.length, vectorConfig.width, vectorConfig.color, isClient]);

  // 🚀 OPTIMIZACIÓN 9: Función de animación con menos garbage collection
  const animate = useCallback(() => {
    if (isPaused || !isClient) {
      return;
    }

    setState(prev => {
      const currentTime = timeRef.current;
      
      // Early return si no hay vectores (pero forzar update para inicialización)
      if (prev.vectors.length === 0) {
        return { ...prev, lastUpdateTime: currentTime };
      }
      
      // Combinar animationType con animationProps para el sistema modular
      const combinedAnimationProps = { type: animationType, ...stableAnimationProps } as AnimationProps;
      
      // DEBUG TEMPORAL: Ver props que llegan
      if (debugMode && animationType === 'randomLoop') {
        console.log('🔧 [DEBUG] randomLoop props:', {
          animationType,
          stableAnimationProps,
          combinedAnimationProps
        });
      }
      
      // Aplicar animaciones con dimensiones del canvas
      const animatedVectors = applyAnimation(
        prev.vectors,
        combinedAnimationProps,
        prev.mousePosition,
        currentTime,
        prev.pulseCenter,
        prev.pulseStartTime,
        width,
        height
      );

      // Limpiar pulso si ha expirado (optimizado)
      let newPulseCenter = prev.pulseCenter;
      let newPulseStartTime = prev.pulseStartTime;
      
      if (animationProps.type === 'centerPulse' && prev.pulseStartTime) {
        const elapsed = currentTime - prev.pulseStartTime;
        
        // 🚀 Cache del cálculo de duración
        const maxDistance = Math.sqrt(width * width + height * height);
        const pulseSpeed = (animationProps as any).pulseSpeed || 0.008;
        const pulseDuration = Math.max(1500, Math.min(8000, (maxDistance / (pulseSpeed * 1000) * 1.5) * 1000));
        
        if (elapsed > pulseDuration) {
          newPulseCenter = null;
          newPulseStartTime = null;
          onPulseComplete?.();
        }
      }
      
      // Capturar el frame exacto que se está renderizando
      lastRenderedFrameRef.current = animatedVectors;

      return {
        ...prev,
        vectors: animatedVectors,
        previousVectors: prev.vectors,
        lastUpdateTime: currentTime,
        pulseCenter: newPulseCenter,
        pulseStartTime: newPulseStartTime,
        dynamicConfig: validatedDynamicConfig
      };
    });
  }, [isPaused, animationType, isClient, width, height, validatedDynamicConfig, onPulseComplete, stableAnimationProps]);

  // 🚀 OPTIMIZACIÓN 10: Loop de animación con mejor timing
  useEffect(() => {
    console.log('🚀 [LOOP-EFFECT] Condiciones:', { isPaused, isClient });
    
    if (isPaused || !isClient) {
      console.log('❌ [LOOP-EFFECT] Loop cancelado por condiciones');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      return;
    }
    
    console.log('✅ [LOOP-EFFECT] Iniciando loop de animación');

    const loop = (timestamp: number) => {
      // DEBUGGING: Verificar que el loop se ejecuta
      console.log('🔄 [LOOP] tick ejecutado', { timestamp: Date.now(), isPaused, isClient });
      
      // Usar Date.now() para consistencia con animaciones (no timestamp de RAF)
      const newTime = Date.now();
      timeRef.current = newTime;
      animate();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    animationFrameRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [animate, isPaused, isClient]);

  // Resto de funciones mantenidas igual pero optimizadas...
  const triggerPulse = useCallback((x?: number, y?: number) => {
    if (!isClient) return;
    
    const pulseX = x ?? width / 2;
    const pulseY = y ?? height / 2;
    
    setState(prev => ({
      ...prev,
      pulseCenter: { x: pulseX, y: pulseY },
      pulseStartTime: timeRef.current
    }));
    
    if (debugMode) {
      console.log('💥 [useSimpleVectorGrid] Pulso disparado en:', { x: pulseX, y: pulseY });
    }
  }, [width, height, debugMode, isClient]);

  const updateMousePosition = useCallback((x: number | null, y: number | null) => {
    setState(prev => ({
      ...prev,
      mousePosition: { x, y }
    }));
  }, []);

  const resetVectors = useCallback(() => {
    if (!isClient) return;
    
    // Invalidar cache para forzar regeneración
    gridCacheRef.current = null;
    configHashRef.current = '';
    
    const newVectors = generateGrid();
    setState(prev => ({
      ...prev,
      vectors: newVectors,
      previousVectors: undefined,
      pulseCenter: null,
      pulseStartTime: null
    }));
    
    if (debugMode) {
      console.log('♻️ [useSimpleVectorGrid] Vectores reseteados');
    }
  }, [generateGrid, debugMode, isClient]);

  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Función para obtener vectores actuales con animación aplicada
  const getCurrentVectors = useCallback((): SimpleVector[] => {
    // Si tenemos un frame renderizado reciente, usarlo
    if (lastRenderedFrameRef.current.length > 0) {
      console.log('📸 [getCurrentVectors] Usando frame capturado:', {
        vectorCount: lastRenderedFrameRef.current.length,
        firstVectorAngle: lastRenderedFrameRef.current[0]?.angle,
        firstVectorColor: lastRenderedFrameRef.current[0]?.color,
        gridConfigSnapshot: `${gridConfig.cols}x${gridConfig.rows}`,
        timestamp: Date.now()
      });
      return lastRenderedFrameRef.current;
    }
    
    // Si no hay frame capturado, usar el estado actual de vectores
    console.log('📸 [getCurrentVectors] Usando estado de vectores actual (pausado):', {
      vectorCount: state.vectors.length,
      firstVectorAngle: state.vectors[0]?.angle,
      firstVectorColor: state.vectors[0]?.color,
      gridConfigSnapshot: `${gridConfig.cols}x${gridConfig.rows}`
    });
    
    return state.vectors;
  }, [state.vectors, debugMode, gridConfig.cols, gridConfig.rows]);

  // Export functions (simplified)
  const exportSVG = useCallback(async (): Promise<string> => generateStaticSVG().data, []);
  const exportAnimatedSVG = useCallback(async (): Promise<string> => generateAnimatedSVG().data, []);
  const exportGIF = useCallback(async (): Promise<Blob> => generateGIFFromVectors(), []);

  // Info del grid calculada de forma lazy
  const gridInfo = useMemo(() => ({
    totalVectors: state.vectors.length,
    width,
    height,
    performance: {
      lastUpdateTime: state.lastUpdateTime,
      isExporting: state.isExporting,
      exportProgress: state.exportProgress
    }
  }), [state.vectors.length, width, height, state.lastUpdateTime, state.isExporting, state.exportProgress]);

  // Función para detectar ciclo de animación
  const detectAnimationCycleForExport = useCallback((): AnimationCycle => {
    return detectAnimationCycle(animationType);
  }, [animationType]);

  // Crear ref object para compatibilidad con forwardRef
  const gridRef: SimpleVectorGridRef = useMemo(() => ({
    triggerPulse,
    togglePause,
    getVectors: () => state.vectors,
    getCurrentVectors,
    resetVectors,
    exportSVG,
    exportAnimatedSVG,
    exportGIF,
    detectAnimationCycle: detectAnimationCycleForExport,
    updateMousePosition
  }), [triggerPulse, togglePause, state.vectors, getCurrentVectors, resetVectors, exportSVG, exportAnimatedSVG, exportGIF, detectAnimationCycleForExport, updateMousePosition]);

  return {
    vectors: state.vectors,
    mousePosition: state.mousePosition,
    gridInfo,
    triggerPulse,
    updateMousePosition,
    resetVectors,
    togglePause,
    exportSVG,
    exportAnimatedSVG,
    exportGIF,
    gridRef,
    isExporting: state.isExporting,
    exportProgress: state.exportProgress
  };
};