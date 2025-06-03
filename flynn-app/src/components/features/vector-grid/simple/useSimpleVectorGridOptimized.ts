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
  AnimationCycle,
  SimpleVectorGridRef,
  RotationTransition, // 🔧 AÑADIDO para compatibilidad
  RotationOrigin // 🔧 AÑADIDO para compatibilidad
} from './simpleTypes';
// import { type AnimationProps as CorrectAnimationProps } from './animations/types';
import { applyAnimation } from './simpleAnimations';
// Imports de vectores dinámicos removidos
import { detectAnimationCycle } from '../utils/animationCycleUtils';
// SVG export functions moved inside hook to access vector state
const generateGIFFromVectors = async (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: {
    fps?: number;
    duration?: number;
    quality?: number;
    width?: number;
    height?: number;
    loop?: boolean;
  } = {}
): Promise<Blob> => {
  console.log('🚀 generateGIFFromVectors iniciado con opciones:', options);
  
  const {
    fps = 30,
    duration = 3000,
    quality = 10,
    width = 800,
    height = 600,
    loop = true
  } = options;

  console.log('📋 Configuración final:', { fps, duration, quality, width, height, loop });

  const canvas = canvasRef.current;
  console.log('🎨 Canvas disponible:', !!canvas, canvas?.width, canvas?.height);

  if (!canvas) {
    // No need to throw here, just reject the promise
    return Promise.reject(new Error('Canvas not available for GIF export'));
  }

  let GIF: any;
  let gifInstance: any;

  try {
    GIF = (await import('gif.js')).default;
    gifInstance = new GIF({
      workers: 2,
      quality,
      width,
      height,
      repeat: loop ? 0 : -1, // 0 = loop infinito, -1 = no loop
      dither: false,
    });
  } catch (error) {
    console.error('💥 Error importing or instantiating GIF.js:', error);
    return Promise.reject(error instanceof Error ? error : new Error('Failed to initialize GIF library'));
  }

  const frameCount = Math.ceil((duration / 1000) * fps);
  const frameDelay = 1000 / fps;

  return new Promise((resolve, reject) => {
    const gifStartTime = performance.now();
    let framesCaptured = 0;

    // Setup event handlers once
    gifInstance.on('finished', (blob: Blob) => {
      resolve(blob);
    });

    // It's good practice to also handle potential errors from the library if it emits them
    // gif.js documentation is sparse on this, but if an 'error' event exists, it should be handled.
    // For now, we'll rely on try/catch for synchronous errors during addFrame/render.

    gifInstance.on('progress', (progress: number) => {
      // This console.log matches the original behavior.
      // If onExportProgress from the hook needs to be involved here,
      // it would require passing it as an option to generateGIFFromVectors.
      console.log(`GIF generation progress: ${Math.round(progress * 100)}%`);
    });

    const captureFrameLoop = () => {
      try {
        if (framesCaptured >= frameCount) {
          gifInstance.render(); // Triggers the 'finished' event eventually
          return;
        }

        // Capture current frame from canvas
        gifInstance.addFrame(canvas, {
          delay: frameDelay, // Delay for GIF frame playback
          copy: true         // Recommended when adding a canvas element
        });

        framesCaptured++;
        
        // Calculate delay for the next setTimeout to maintain average FPS
        const expectedElapsedTime = framesCaptured * frameDelay;
        const actualElapsedTime = performance.now() - gifStartTime;
        const delayForNextTimeout = Math.max(0, expectedElapsedTime - actualElapsedTime);

        setTimeout(captureFrameLoop, delayForNextTimeout);
      } catch (error) {
        console.error('💥 Error during GIF frame capture or render:', error);
        reject(error instanceof Error ? error : new Error('Error processing GIF frame'));
      }
    };

    // Start the capture loop
    captureFrameLoop();
  });
};

interface UseSimpleVectorGridProps {
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  animationProps: Record<string, unknown>;
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // 🔧 ARREGLADO: permitir null
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
  canvasRef, // Added canvasRef
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
    time: 0, // 🔧 AÑADIDO para compatibilidad con VectorGridState
    frameCount: 0, // 🔧 AÑADIDO para compatibilidad con VectorGridState
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
  
  // 🚀 Sincronizar prop isPaused con estado interno
  useEffect(() => {
    setState(prev => ({ ...prev, isPaused }));
  }, [isPaused]);

  // 🔧 AÑADIDO: Estado de transición de rotación para compatibilidad
  const [rotationTransition, setRotationTransition] = useState<RotationTransition | null>(null);
  const prevRotationOriginRef = useRef<RotationOrigin>(vectorConfig.rotationOrigin);

  // 🚀 OPTIMIZACIÓN 3.5: Estabilizar animationProps para evitar recreaciones del useCallback
  const stableAnimationProps = useMemo(() => {
    return animationProps;
  }, [animationProps]);

  // 🚀 OPTIMIZACIÓN 4: Hash de configuración SOLO para posicionamiento (excluye vectorConfig.length)
  const configHash = useMemo(() => {
    return JSON.stringify({
      gridConfig, // rows, cols, spacing, margin
      canvasDimensions: { width, height }, // Solo dimensiones del canvas
      // 🔧 EXCLUIMOS vectorConfig.length para que el centrado sea estable
      vectorShape: vectorConfig.shape // Solo shape puede afectar posicionamiento
    });
  }, [gridConfig, width, height, vectorConfig.shape]);

  // 🚀 OPTIMIZACIÓN 5: Detección de cliente optimizada
  useEffect(() => {
    setIsClient(true);
    timeRef.current = Date.now(); // Usar Date.now() para consistencia con animaciones
  }, []);

  // 🔧 AÑADIDO: Efecto para manejar la transición del origen de rotación (compatibilidad)
  useEffect(() => {
    if (prevRotationOriginRef.current !== vectorConfig.rotationOrigin) {
      if (!isPaused) { // Solo transicionar si no está pausado
        setRotationTransition({
          isTransitioning: true,
          fromOrigin: prevRotationOriginRef.current,
          toOrigin: vectorConfig.rotationOrigin,
          startTime: Date.now(),
          duration: 300, // ms
          progress: 0,
        });
      } else {
        setRotationTransition(null); // Si está pausado, cambio instantáneo
      }
    }
    prevRotationOriginRef.current = vectorConfig.rotationOrigin;
  }, [vectorConfig.rotationOrigin, isPaused]);

  // 🚀 OPTIMIZACIÓN 6: Grid generator con cache inteligente + sistema de centrado moderno
  const generateGrid = useCallback(() => {
    // Verificar si podemos usar cache
    if (gridCacheRef.current && configHashRef.current === configHash) {
      return gridCacheRef.current;
    }

    const { rows, cols, spacing, margin } = gridConfig;
    const { length, width: vectorWidth, color } = vectorConfig;

    // 📐 SISTEMA DE CENTRADO MODERNO - Completamente independiente de vector length
    // 🔧 ARREGLADO: Padding FIJO para centrado estable independiente de Length Max
    const padding = Math.max(margin, 50); // Padding fijo de 50px (no depende de vector length)
    
    // Área de contenido disponible (una sola fuente de verdad)
    const contentArea = {
      x: padding,
      y: padding,
      width: width - 2 * padding,
      height: height - 2 * padding,
      centerX: width / 2,
      centerY: height / 2
    };
    
    // 🚀 Dimensiones del grid optimizadas para el contenido disponible
    const gridWidth = (cols - 1) * spacing;
    const gridHeight = (rows - 1) * spacing;
    
    // 🚀 Centrado automático perfecto dentro del área de contenido
    const startX = contentArea.x + (contentArea.width - gridWidth) / 2;
    const startY = contentArea.y + (contentArea.height - gridHeight) / 2;
    
    // 🔧 DEEP DEBUG: Rastrear exactamente qué causa el desplazamiento
    if (debugMode) {
      console.log('🔍 [MOVEMENT DEBUG] Tracking coordinate changes:', {
        trigger: 'generateGrid called',
        vectorLength: length,
        margin: margin,
        padding: padding,
        canvasSize: { width, height },
        contentArea: {
          x: contentArea.x,
          y: contentArea.y, 
          width: contentArea.width,
          height: contentArea.height
        },
        gridDimensions: { gridWidth, gridHeight },
        gridStart: { startX, startY },
        calculationCheck: {
          'padding_formula': `max(${margin}, 50) = ${padding}`,
          'contentArea_y': `${padding} (should be constant)`,
          'startY_formula': `${contentArea.y} + (${contentArea.height} - ${gridHeight}) / 2 = ${startY}`,
          'ISSUE': 'If startY changes, one of these values is changing when length changes'
        }
      });
    }
    
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
  }, [gridConfig, width, height, isClient, debugMode, onVectorCountChange, configHash, 
      vectorConfig.width, vectorConfig.color, vectorConfig.shape]); // 🔧 Solo props que afectan generación inicial

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

  // 🚀 OPTIMIZACIÓN 8: Actualización de propiedades SIN afectar posiciones
  useEffect(() => {
    if (!isClient) return;
    
    if (debugMode) {
      console.log('🔍 [VECTOR UPDATE DEBUG] Length changed, updating vector properties:', {
        trigger: 'vectorConfig.length changed',
        newLength: vectorConfig.length,
        note: 'This should NOT move the grid, only update visual properties'
      });
    }
    
    setState(prev => {
      const updatedVectors = prev.vectors.map(vector => ({
        ...vector,
        // 🔧 MANTENER posiciones originales, solo actualizar propiedades de render
        length: vectorConfig.length,
        width: vectorConfig.width,
        color: vectorConfig.color,
        // Asegurar que x,y NO cambien
        x: vector.originalX || vector.x,
        y: vector.originalY || vector.y
      }));
      
      if (debugMode && prev.vectors.length > 0) {
        const firstVector = prev.vectors[0];
        const updatedFirstVector = updatedVectors[0];
        console.log('🔍 [POSITION CHECK] First vector position comparison:', {
          before: { x: firstVector.x, y: firstVector.y, originalX: firstVector.originalX, originalY: firstVector.originalY },
          after: { x: updatedFirstVector.x, y: updatedFirstVector.y },
          positionChanged: firstVector.x !== updatedFirstVector.x || firstVector.y !== updatedFirstVector.y
        });
      }
      
      return {
        ...prev,
        vectors: updatedVectors
      };
    });
  }, [vectorConfig.length, vectorConfig.width, vectorConfig.color, isClient, debugMode]);

  // 🚀 OPTIMIZACIÓN 9: Función de animación con menos garbage collection
  const animate = useCallback(() => {
    if (state.isPaused || !isClient) {
      return;
    }

    setState(prev => {
      const currentTime = timeRef.current;
      
      // Early return si no hay vectores (pero forzar update para inicialización)
      if (prev.vectors.length === 0) {
        return { ...prev, lastUpdateTime: currentTime };
      }
      
      // Combinar animationType con animationProps para el sistema modular
      // Asegurar que tenemos un tipo válido antes de continuar
      if (!animationType || typeof animationType !== 'string') {
        console.error('AnimationType inválido:', animationType);
        return { ...prev, lastUpdateTime: currentTime };
      }

      const combinedAnimationProps = { 
        type: animationType, 
        ...stableAnimationProps 
      } as AnimationProps;
      
      // DEBUG TEMPORAL: Ver props que llegan - con más detalle
      if (debugMode) {
        console.log('🔧 [DEBUG] Animation props construction:', {
          animationType,
          stableAnimationProps,
          combinedAnimationProps,
          hasType: typeof combinedAnimationProps.type === 'string',
          typeValue: combinedAnimationProps.type
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
        pulseStartTime: newPulseStartTime
        // dynamicConfig: validatedDynamicConfig, // Eliminado ya que validatedDynamicConfig no existe
      };
    });
  }, [state.isPaused, animationType, isClient, width, height, onPulseComplete, stableAnimationProps, debugMode]);

  // 🚀 OPTIMIZACIÓN 10: Loop de animación con mejor timing
  useEffect(() => {
    if (debugMode) {
      console.log('🚀 [LOOP-EFFECT] Condiciones:', { isPaused: state.isPaused, isClient });
    }
    
    if (state.isPaused || !isClient) {
      if (debugMode) {
        console.log('❌ [LOOP-EFFECT] Loop cancelado por condiciones');
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      return;
    }
    
    if (debugMode) {
      console.log('✅ [LOOP-EFFECT] Iniciando loop de animación');
    }

    const loop = () => {
      // Usar Date.now() para consistencia con animaciones
      const newTime = Date.now();
      timeRef.current = newTime;
      animate();
      
      if (!state.isPaused && isClient) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [animate, state.isPaused, isClient, debugMode]);

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

  // Static SVG export implementation
  const generateStaticSVG = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `flynn-vectors-${timestamp}.svg`;
    
    // Get current vectors with applied animations
    const currentVectors = getCurrentVectors();
    const gridSize = Math.sqrt(currentVectors.length);
    const svgWidth = 800;
    const svgHeight = 800;
    const cellWidth = svgWidth / gridSize;
    const cellHeight = svgHeight / gridSize;
    
    // Calculate vector scale based on cell size
    const vectorScale = Math.min(cellWidth, cellHeight) * 0.3;
    
    // Generate SVG header
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" 
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#000000"/>
  <g id="vectors">`;

    // Generate vectors
    currentVectors.forEach((vector, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Calculate center position of this grid cell
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      
      // Calculate vector endpoint using angle and length
      const endX = centerX + Math.cos(vector.angle) * vector.length * vectorScale;
      const endY = centerY + Math.sin(vector.angle) * vector.length * vectorScale;
      
      // Generate color - use vector.color if available, fallback to computed color
      const color = vector.color || `hsl(${(vector.angle * 180 / Math.PI + 180) % 360}, 70%, 50%)`;
      
      // Create vector as line with arrowhead
      const strokeWidth = Math.max(1, vector.length * 2);
      
      svgContent += `
    <line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" 
          stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
      
      // Add arrowhead if vector is long enough
      if (vector.length > 0.1) {
        const arrowLength = vectorScale * 0.2;
        const arrowAngle = Math.PI / 6;
        
        const arrow1X = endX - arrowLength * Math.cos(vector.angle - arrowAngle);
        const arrow1Y = endY - arrowLength * Math.sin(vector.angle - arrowAngle);
        const arrow2X = endX - arrowLength * Math.cos(vector.angle + arrowAngle);
        const arrow2Y = endY - arrowLength * Math.sin(vector.angle + arrowAngle);
        
        svgContent += `
    <polygon points="${endX},${endY} ${arrow1X},${arrow1Y} ${arrow2X},${arrow2Y}" 
             fill="${color}"/>`;
      }
    });
    
    // Close SVG
    svgContent += `
  </g>
</svg>`;
    
    return { data: svgContent, filename };
  }, [getCurrentVectors]);

  // Animated SVG export implementation using SMIL animations
  const generateAnimatedSVG = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `flynn-vectors-animated-${timestamp}.svg`;
    
    // Get current vectors and animation config
    const currentVectors = getCurrentVectors();
    const gridSize = Math.sqrt(currentVectors.length);
    const svgWidth = 800;
    const svgHeight = 800;
    const cellWidth = svgWidth / gridSize;
    const cellHeight = svgHeight / gridSize;
    const vectorScale = Math.min(cellWidth, cellHeight) * 0.3;
    
    // Animation parameters
    const animationDuration = '4s';
    
    // Generate SVG header with animation support
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" 
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#000000"/>
  <g id="vectors">`;

    // Generate animated vectors
    currentVectors.forEach((vector, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      
      // Calculate base endpoint for initial position
      const baseEndX = centerX + Math.cos(vector.angle) * vector.length * vectorScale;
      const baseEndY = centerY + Math.sin(vector.angle) * vector.length * vectorScale;
      const baseColor = vector.color || `hsl(${(vector.angle * 180 / Math.PI + 180) % 360}, 70%, 50%)`;
      
      const strokeWidth = Math.max(1, vector.length * 2);
      
      // Create animated line element with simple rotation
      svgContent += `
    <line x1="${centerX}" y1="${centerY}" x2="${baseEndX}" y2="${baseEndY}" 
          stroke="${baseColor}" stroke-width="${strokeWidth}" stroke-linecap="round">
      <animateTransform attributeName="transform" 
                        type="rotate" 
                        values="0 ${centerX} ${centerY};360 ${centerX} ${centerY}" 
                        dur="${animationDuration}" 
                        repeatCount="indefinite"/>
      <animate attributeName="stroke" 
               values="${baseColor};hsl(${(index * 30) % 360}, 70%, 50%);${baseColor}" 
               dur="${animationDuration}" 
               repeatCount="indefinite"/>
    </line>`;
      
      // Add animated arrowhead if vector is long enough
      if (vector.length > 0.1) {
        const arrowLength = vectorScale * 0.2;
        const arrowAngle = Math.PI / 6;
        
        const arrow1X = baseEndX - arrowLength * Math.cos(vector.angle - arrowAngle);
        const arrow1Y = baseEndY - arrowLength * Math.sin(vector.angle - arrowAngle);
        const arrow2X = baseEndX - arrowLength * Math.cos(vector.angle + arrowAngle);
        const arrow2Y = baseEndY - arrowLength * Math.sin(vector.angle + arrowAngle);
        
        svgContent += `
    <polygon points="${baseEndX},${baseEndY} ${arrow1X},${arrow1Y} ${arrow2X},${arrow2Y}" 
             fill="${baseColor}">
      <animateTransform attributeName="transform" 
                        type="rotate" 
                        values="0 ${centerX} ${centerY};360 ${centerX} ${centerY}" 
                        dur="${animationDuration}" 
                        repeatCount="indefinite"/>
      <animate attributeName="fill" 
               values="${baseColor};hsl(${(index * 30) % 360}, 70%, 50%);${baseColor}" 
               dur="${animationDuration}" 
               repeatCount="indefinite"/>
    </polygon>`;
      }
    });
    
    // Close SVG
    svgContent += `
  </g>
</svg>`;
    
    return { data: svgContent, filename };
  }, [getCurrentVectors]);

  // Export functions (simplified) - 🔧 ARREGLADO tipos para compatibilidad
  const exportSVG = useCallback(async (): Promise<{ data: string; filename: string }> => generateStaticSVG(), [generateStaticSVG]);
  const exportAnimatedSVG = useCallback(async (): Promise<{ data: string; filename: string }> => generateAnimatedSVG(), [generateAnimatedSVG]);
  const exportGIF = useCallback(async (options?: {
    fps?: number;
    duration?: number;
    quality?: number;
    width?: number;
    height?: number;
    loop?: boolean;
  }): Promise<Blob> => {
    return generateGIFFromVectors(canvasRef, {
      width,
      height,
      ...options
    });
  }, [width, height, canvasRef]); // Added canvasRef to dependencies

  // Info del grid calculada de forma lazy - COMPATIBILIDAD con hook básico
  const gridInfo = useMemo(() => {
    const { rows, cols, spacing } = gridConfig;
    return {
      totalVectors: state.vectors.length,
      expectedVectors: rows * cols, // 🔧 AÑADIDO
      gridDimensions: { // 🔧 AÑADIDO
        width: cols * spacing,
        height: rows * spacing
      },
      canvasDimensions: { width, height }, // 🔧 AÑADIDO
      animationType, // 🔧 AÑADIDO
      isPaused: isPaused, // 🔧 AÑADIDO
      isClient, // 🔧 AÑADIDO
      dynamicVectorsEnabled: false, // 🔧 AÑADIDO - Placeholder por ahora
      isExporting: state.isExporting,
      exportProgress: state.exportProgress,
      // Mantener campos originales para compatibilidad
      width,
      height,
      performance: {
        lastUpdateTime: state.lastUpdateTime,
        isExporting: state.isExporting,
        exportProgress: state.exportProgress
      }
    };
  }, [gridConfig, state.vectors.length, state.lastUpdateTime, state.isExporting, state.exportProgress, width, height, animationType, isPaused, isClient]);

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
    // Vectores y estados principales
    vectors: state.vectors,
    mousePosition: state.mousePosition,
    gridInfo,
    
    // Funciones de control
    triggerPulse,
    updateMousePosition,
    resetVectors,
    togglePause,
    
    // Funciones de exportación  
    exportSVG,
    exportAnimatedSVG,
    exportGIF,
    detectAnimationCycle: detectAnimationCycleForExport, // 🔧 AÑADIDO
    
    // Referencias y estados adicionales
    gridRef,
    isExporting: state.isExporting,
    exportProgress: state.exportProgress,
    isPaused: isPaused, // 🔧 AÑADIDO para compatibilidad
    isClient, // 🔧 AÑADIDO para compatibilidad
    rotationTransition // 🔧 AÑADIDO para compatibilidad
  };
};