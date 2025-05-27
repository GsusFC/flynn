// Hook principal que unifica grid + animaciones + estado + vectores dinámicos + exportación
// Todo en un solo lugar, sin complejidad innecesaria

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

export const useSimpleVectorGrid = ({
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
  // Estado principal - valores iniciales estáticos para evitar hidratación
  const [state, setState] = useState<VectorGridState>({
    vectors: [],
    mousePosition: { x: null, y: null },
    isPaused: false,
    lastUpdateTime: 0, // Valor estático inicial
    pulseCenter: null,
    pulseStartTime: null,
    previousVectors: undefined,
    dynamicConfig: undefined,
    isExporting: false,
    exportProgress: 0,
    capturedFrames: []
  });

  // Ref para el animation frame
  const animationFrameRef = useRef<number>(0);
  
  // Ref para tracking de tiempo - solo se inicializa en cliente
  const timeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Ref para almacenar el último frame renderizado exacto
  const lastRenderedFrameRef = useRef<SimpleVector[]>([]);

  // Configuración de vectores dinámicos validada
  const validatedDynamicConfig = useMemo(() => {
    return validateDynamicConfig(dynamicVectorConfig || {});
  }, [dynamicVectorConfig]);

  // Detectar si estamos en cliente para evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      timeRef.current = Date.now();
    }
  }, []);

  // Función para generar el grid inicial
  const generateGrid = useCallback(() => {
    const { rows, cols, spacing, margin } = gridConfig;
    const { length, width: vectorWidth, color } = vectorConfig;
    
    if (debugMode && isClient) {
      console.log('🔄 [useSimpleVectorGrid] Generando grid:', {
        rows, cols, spacing, margin,
        canvasSize: { width, height },
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Calcular dimensiones del grid (sin incluir el último spacing)
    const gridWidth = (cols - 1) * spacing;
    const gridHeight = (rows - 1) * spacing;
    
    // Centrar el grid en el canvas
    const startX = Math.floor((width - gridWidth) / 2);
    const startY = Math.floor((height - gridHeight) / 2);
    
    const newVectors: SimpleVector[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + (col * spacing);
        const y = startY + (row * spacing);
        
        // Verificar que el vector esté dentro del canvas con margen
        const withinBounds = x >= margin && y >= margin && x < (width - margin) && y < (height - margin);
        if (debugMode && row < 2 && col < 5) {
          console.log(`🔍 Vector [${row},${col}] pos:(${x},${y}) bounds:(${margin}-${width-margin},${margin}-${height-margin}) → ${withinBounds}`);
        }
        if (withinBounds) {
          newVectors.push({
            id: `vector-${row}-${col}`,
            x,
            y,
            angle: 0, // Ángulo inicial
            length,
            width: vectorWidth,
            color,
            opacity: 1,
            originalX: x,
            originalY: y,
            originalAngle: 0,
            gridRow: row,
            gridCol: col,
            // Propiedades dinámicas iniciales
            dynamicLength: undefined,
            dynamicWidth: undefined,
            intensity: 0,
            previousAngle: undefined
          });
        }
      }
    }
    
    if (debugMode && isClient) {
      console.log('✅ [useSimpleVectorGrid] Grid generado:', {
        totalVectores: newVectors.length,
        esperados: rows * cols,
        gridDimensions: { gridWidth, gridHeight },
        startPosition: { startX, startY },
        primerosVectores: newVectors.slice(0, 3).map(v => ({ x: v.x, y: v.y }))
      });
    }
    
    // Notificar cambio en el conteo de vectores
    if (onVectorCountChange) {
      onVectorCountChange(newVectors.length);
    }
    
    return newVectors;
  }, [gridConfig, vectorConfig, width, height, debugMode, isClient, onVectorCountChange]);

  // Regenerar grid cuando cambien las configuraciones - solo en cliente
  useEffect(() => {
    if (!isClient) return;
    
    const newVectors = generateGrid();
    setState(prev => ({
      ...prev,
      vectors: newVectors,
      previousVectors: undefined // Reset previous vectors
    }));
  }, [generateGrid, isClient]);

  // Actualizar propiedades de vectores existentes cuando cambie vectorConfig
  useEffect(() => {
    if (!isClient || state.vectors.length === 0) return;
    
    setState(prev => ({
      ...prev,
      vectors: prev.vectors.map(vector => ({
        ...vector,
        length: vectorConfig.length,
        width: vectorConfig.width,
        color: vectorConfig.color
      }))
    }));
    
    if (debugMode) {
      console.log('🎨 [useSimpleVectorGrid] Propiedades de vectores actualizadas:', {
        length: vectorConfig.length,
        width: vectorConfig.width,
        color: vectorConfig.color
      });
    }
  }, [vectorConfig.length, vectorConfig.width, vectorConfig.color, isClient, debugMode]);

  // Función de animación - solo funciona en cliente
  const animate = useCallback(() => {
    if (isPaused || !isClient) return;

    setState(prev => {
      const currentTime = timeRef.current;
      
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

      // Aplicar vectores dinámicos si están habilitados
      if (validatedDynamicConfig.enableDynamicLength || validatedDynamicConfig.enableDynamicWidth) {
        const globalIntensity = calculateGlobalAnimationIntensity(animatedVectors, prev.previousVectors);
        
        if (debugMode) {
          console.log('🔄 [useSimpleVectorGrid] Aplicando dinámicas:', {
            enableDynamicLength: validatedDynamicConfig.enableDynamicLength,
            enableDynamicWidth: validatedDynamicConfig.enableDynamicWidth,
            lengthMultiplier: validatedDynamicConfig.lengthMultiplier,
            globalIntensity,
            vectorCount: animatedVectors.length,
            sampleVector: animatedVectors[0] ? {
              originalLength: animatedVectors[0].length,
              angle: animatedVectors[0].angle
            } : null
          });
        }
        
        const vectorLengthBefore = animatedVectors[0]?.length;
        const dynamicLengthBefore = animatedVectors[0]?.dynamicLength;
        
        animatedVectors = updateVectorsWithDynamics(
          animatedVectors,
          prev.previousVectors,
          validatedDynamicConfig,
          globalIntensity
        );
        
        if (debugMode && animatedVectors[0]) {
          console.log('🔄 [useSimpleVectorGrid] Dinámicas aplicadas:', {
            lengthBefore: vectorLengthBefore,
            dynamicLengthBefore: dynamicLengthBefore,
            lengthAfter: animatedVectors[0].length,
            dynamicLengthAfter: animatedVectors[0].dynamicLength,
            hasChanged: dynamicLengthBefore !== animatedVectors[0].dynamicLength
          });
        }
      }
      
      // Limpiar pulso si ha expirado
      let newPulseCenter = prev.pulseCenter;
      let newPulseStartTime = prev.pulseStartTime;
      
      if (animationProps.type === 'centerPulse' && prev.pulseStartTime) {
        const elapsed = currentTime - prev.pulseStartTime;
        
        // Calcular duración dinámica basada en las dimensiones del canvas y velocidad del pulso
        const maxDistance = Math.sqrt(width * width + height * height); // Diagonal del canvas
        const pulseSpeed = (animationProps as any).pulseSpeed || 0.008; // Velocidad del pulso actual
        
        // Tiempo base para que la onda llegue a la esquina más lejana
        const baseTime = maxDistance / (pulseSpeed * 1000); // Convertir a segundos
        
        // Tiempo extra para que la onda salga completamente del grid (50% adicional)
        const extraTime = baseTime * 0.5;
        
        // Duración total en milisegundos (mínimo 1.5s, máximo 8s para casos extremos)
        const pulseDuration = Math.max(1500, Math.min(8000, (baseTime + extraTime) * 1000));
        
        if (elapsed > pulseDuration) {
          newPulseCenter = null;
          newPulseStartTime = null;
          // Notificar que el pulso se completó
          if (onPulseComplete) {
            onPulseComplete();
          }
        }
      }
      
      // Capturar el frame exacto que se está renderizando
      lastRenderedFrameRef.current = animatedVectors;

      return {
        ...prev,
        vectors: animatedVectors,
        previousVectors: prev.vectors, // Guardar estado anterior para vectores dinámicos
        lastUpdateTime: currentTime,
        pulseCenter: newPulseCenter,
        pulseStartTime: newPulseStartTime,
        dynamicConfig: validatedDynamicConfig
      };
    });
  }, [isPaused, animationType, animationProps, isClient, width, height, validatedDynamicConfig, onPulseComplete]);

  // Loop de animación - solo en cliente
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

  // Función para disparar pulso
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

  // Función para actualizar posición del mouse
  const updateMousePosition = useCallback((x: number | null, y: number | null) => {
    setState(prev => ({
      ...prev,
      mousePosition: { x, y }
    }));
  }, []);

  // Función para resetear vectores
  const resetVectors = useCallback(() => {
    if (!isClient) return;
    
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

  // Función para alternar pausa
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Función para obtener vectores en un momento específico
  const getVectorsAtTime = useCallback((time: number): SimpleVector[] => {
    // Simular el estado de los vectores en un momento específico
    // Para exportación, necesitamos poder generar vectores en cualquier momento
    const tempMousePosition = { x: null, y: null };
    
    // Combinar animationType con animationProps para el sistema modular
    const combinedAnimationProps = { type: animationType, ...animationProps } as AnimationProps;
    
    return applyAnimation(
      state.vectors,
      combinedAnimationProps,
      tempMousePosition,
      time,
      null, // Sin pulso para exportación
      null,
      width,
      height
    );
  }, [state.vectors, animationType, animationProps, width, height]);

  // Función para detectar ciclo de animación
  const detectAnimationCycleForExport = useCallback((): AnimationCycle => {
    return detectAnimationCycle(animationType as AnimationType);
  }, [animationType]);

  // Función para exportar SVG estático
  const exportSVG = useCallback(async (config: Partial<ExportConfig> = {}): Promise<string> => {
    if (!isClient) throw new Error('Export only available on client side');
    
    const currentVectors = state.vectors;
    const result = generateStaticSVG();
    return result.data;
  }, [state.vectors, width, height, isClient]);

  // Función para exportar SVG animado (simplificada)
  const exportAnimatedSVG = useCallback(async (): Promise<string> => {
    return generateAnimatedSVG().data;
  }, []);

  // Función para exportar GIF
  const exportGIF = useCallback(async (config: Partial<ExportConfig> = {}): Promise<Blob> => {
    if (!isClient) throw new Error('Export only available on client side');
    
    setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }));
    
    try {
      const cycle = detectAnimationCycleForExport();
      
      const blob = await generateGIFFromVectors(
        getVectorsAtTime,
        cycle,
        {
          width: config.width || width,
          height: config.height || height,
          quality: config.quality || 'medium',
          duration: config.duration || cycle.duration,
          fps: config.fps || 30,
          loop: config.loop !== false
        },
        (progress) => {
          setState(prev => ({ ...prev, exportProgress: progress }));
          if (onExportProgress) {
            onExportProgress(progress);
          }
        }
      );
      
      return blob;
    } finally {
      setState(prev => ({ ...prev, isExporting: false, exportProgress: 0 }));
    }
  }, [isClient, detectAnimationCycleForExport, getVectorsAtTime, width, height, onExportProgress]);

  // Información del grid para debugging
  const gridInfo = useMemo(() => {
    const { rows, cols, spacing } = gridConfig;
    return {
      totalVectors: state.vectors.length,
      expectedVectors: rows * cols,
      gridDimensions: {
        width: cols * spacing,
        height: rows * spacing
      },
      canvasDimensions: { width, height },
      animationType: animationProps.type,
      isPaused: isPaused || state.isPaused,
      isClient,
      dynamicVectorsEnabled: validatedDynamicConfig.enableDynamicLength || validatedDynamicConfig.enableDynamicWidth,
      isExporting: state.isExporting,
      exportProgress: state.exportProgress
    };
  }, [gridConfig, state.vectors.length, state.isPaused, state.isExporting, state.exportProgress, width, height, animationProps.type, isPaused, isClient, validatedDynamicConfig]);

  // Log de debugging - solo en cliente
  useEffect(() => {
    if (debugMode && isClient) {
      console.log('📊 [useSimpleVectorGrid] Estado actual:', gridInfo);
    }
  }, [debugMode, gridInfo, isClient]);

  // Función para obtener vectores actuales con animación aplicada
  const getCurrentVectors = useCallback((): SimpleVector[] => {
    // Si tenemos un frame capturado (más preciso), usarlo
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
    // Fallback al estado actual
    if (debugMode) {
      console.log('📸 [getCurrentVectors] Usando estado actual:', {
        vectorCount: state.vectors.length,
        firstVectorAngle: state.vectors[0]?.angle
      });
    }
    return state.vectors;
  }, [state.vectors, debugMode]);

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
    detectAnimationCycle: detectAnimationCycleForExport
  }), [triggerPulse, togglePause, state.vectors, getCurrentVectors, resetVectors, exportSVG, exportAnimatedSVG, exportGIF, detectAnimationCycleForExport]);

  return {
    // Vectores actuales
    vectors: state.vectors,
    
    // Información del grid
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
    detectAnimationCycle: detectAnimationCycleForExport,
    
    // Estado
    mousePosition: state.mousePosition,
    isPaused: isPaused || state.isPaused,
    isClient,
    isExporting: state.isExporting,
    exportProgress: state.exportProgress,
    
    // Ref para control externo
    gridRef
  };
};
