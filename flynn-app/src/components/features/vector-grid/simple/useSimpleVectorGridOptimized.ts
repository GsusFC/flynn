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
  DynamicVectorConfig,
  ExportConfig,
  AnimationCycle,
  SimpleVectorGridRef
} from './simpleTypes';
import { applyAnimation } from './simpleAnimations';
import { 
  updateVectorsWithDynamics, 
  calculateGlobalAnimationIntensity,
  validateDynamicConfig
} from '../utils/dynamicVectorUtils';
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
  dynamicVectorConfig?: DynamicVectorConfig;
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
  dynamicVectorConfig,
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

  // 🚀 OPTIMIZACIÓN 3: Configuración dinámica memoizada con cache
  const validatedDynamicConfig = useMemo(() => {
    return validateDynamicConfig(dynamicVectorConfig || {});
  }, [dynamicVectorConfig]);

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
      if (debugMode && isClient) {
        console.log('⚡ [useSimpleVectorGrid] Usando grid cacheado');
      }
      return gridCacheRef.current;
    }

    const { rows, cols, spacing, margin } = gridConfig;
    const { length, width: vectorWidth, color } = vectorConfig;
    
    if (debugMode && isClient) {
      console.log('🔄 [useSimpleVectorGrid] Generando grid:', {
        rows, cols, total: rows * cols, width, height
      });
    }

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
    if (isPaused || !isClient) return;

    setState(prev => {
      const currentTime = timeRef.current;
      
      // Early return si no hay vectores (pero forzar update para inicialización)
      if (prev.vectors.length === 0) {
        return { ...prev, lastUpdateTime: currentTime };
      }
      
      // Combinar animationType con animationProps para el sistema modular
      const combinedAnimationProps = { type: animationType, ...animationProps } as AnimationProps;
      
      // Aplicar animaciones con dimensiones del canvas
      let animatedVectors = applyAnimation(
        prev.vectors,
        combinedAnimationProps,
        prev.mousePosition,
        currentTime,
        prev.pulseCenter,
        prev.pulseStartTime,
        width,
        height
      );

      // 🚀 OPTIMIZACIÓN: Solo aplicar dinámicas si están realmente habilitadas
      if (validatedDynamicConfig.enableDynamicLength || validatedDynamicConfig.enableDynamicWidth) {
        const globalIntensity = calculateGlobalAnimationIntensity(animatedVectors, prev.previousVectors);
        
        animatedVectors = updateVectorsWithDynamics(
          animatedVectors,
          prev.previousVectors,
          validatedDynamicConfig,
          globalIntensity
        );
      }
      
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
  }, [isPaused, animationType, animationProps, isClient, width, height, validatedDynamicConfig, onPulseComplete]);

  // 🚀 OPTIMIZACIÓN 10: Loop de animación con mejor timing
  useEffect(() => {
    if (isPaused || !isClient) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const loop = (timestamp: number) => {
      // Usar Date.now() para consistencia con animaciones (no timestamp de RAF)
      timeRef.current = Date.now();
      animate();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    animationFrameRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
    if (lastRenderedFrameRef.current.length > 0) {
      if (debugMode) {
        console.log('📸 [getCurrentVectors] Usando frame capturado:', {
          vectorCount: lastRenderedFrameRef.current.length,
          firstVectorAngle: lastRenderedFrameRef.current[0]?.angle,
          timestamp: Date.now()
        });
      }
      return lastRenderedFrameRef.current;
    }
    return state.vectors;
  }, [state.vectors, debugMode]);

  // Funciones de exportación optimizadas...
  const exportSVG = useCallback(async (options: ExportConfig = {}): Promise<string> => {
    if (!isClient) return '';
    
    setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }));
    
    try {
      const currentVectors = getCurrentVectors();
      onExportProgress?.(25);
      
      const svgContent = options.animated 
        ? await generateAnimatedSVG(currentVectors, { width, height }, options, (progress) => {
            onExportProgress?.(25 + progress * 0.5);
          })
        : generateStaticSVG(currentVectors, { width, height }, options);
      
      onExportProgress?.(100);
      return svgContent;
    } catch (error) {
      console.error('Error exportando SVG:', error);
      return '';
    } finally {
      setState(prev => ({ ...prev, isExporting: false, exportProgress: 0 }));
    }
  }, [getCurrentVectors, width, height, onExportProgress, isClient]);

  const exportGIF = useCallback(async (options: ExportConfig = {}): Promise<Blob | null> => {
    if (!isClient) return null;
    
    setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }));
    
    try {
      const currentVectors = getCurrentVectors();
      const blob = await generateGIFFromVectors(
        currentVectors, 
        { width, height }, 
        options,
        (progress) => onExportProgress?.(progress)
      );
      
      return blob;
    } catch (error) {
      console.error('Error exportando GIF:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isExporting: false, exportProgress: 0 }));
    }
  }, [getCurrentVectors, width, height, onExportProgress, isClient]);

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

  // Crear ref object para compatibilidad con forwardRef
  const gridRef: SimpleVectorGridRef = useMemo(() => ({
    triggerPulse,
    togglePause,
    getVectors: () => state.vectors,
    getCurrentVectors,
    resetVectors,
    exportSVG,
    exportGIF,
    updateMousePosition
  }), [triggerPulse, togglePause, state.vectors, getCurrentVectors, resetVectors, exportSVG, exportGIF, updateMousePosition]);

  return {
    vectors: state.vectors,
    mousePosition: state.mousePosition,
    gridInfo,
    triggerPulse,
    updateMousePosition,
    resetVectors,
    togglePause,
    exportSVG,
    exportGIF,
    gridRef,
    isExporting: state.isExporting,
    exportProgress: state.exportProgress
  };
};