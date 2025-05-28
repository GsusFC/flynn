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
  // DynamicVectorConfig, // Eliminado
  // ExportConfig, // No se usa
  AnimationCycle,
  SimpleVectorGridRef,
  RotationOrigin, // Añadido para la transición
  RotationTransition // Añadido para la transición
  // ValidatedDynamicConfig, // Se importará desde ../utils
  // GlobalAnimationControls // Se importará desde ../utils
} from './simpleTypes';
import { applyAnimation } from './simpleAnimations';
import {
  updateVectorsWithDynamics,        // Desde ./vectorDynamicsUtils via ../utils
  calculateGlobalAnimationIntensity,  // Desde ./vectorDynamicsUtils via ../utils
  mergeGlobalControls,              // Desde ./globalAnimationControls via ../utils
  // DEFAULT_GLOBAL_CONTROLS, // No se usa directamente
  DEFAULT_DYNAMIC_FIELDS, // Renombrado desde DEFAULT_DYNAMIC_CONFIG
  // type ValidatedDynamicConfig, // No se usa directamente
  type GlobalAnimationControls       // Tipo desde ../utils
} from '../utils';
import { detectAnimationCycle } from '../utils/animationCycleUtils';
// Función para generar SVG estático
const generateStaticSVG = ({
  vectors,
  width,
  height,
  backgroundColor = '#000000', // Default to black, can be overridden
  vectorConfig,
}: {
  vectors: SimpleVector[];
  width: number;
  height: number;
  backgroundColor?: string;
  vectorConfig: VectorConfig;
}): { data: string; filename: string } => {
  const svgElements: string[] = [];

  // Add background rectangle if a color is specified and not transparent
  if (backgroundColor && backgroundColor !== 'transparent') {
    svgElements.push(
      `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`
    );
  }

  vectors.forEach((vector) => {
    const { x, y, angle, color, opacity } = vector;
    // Use dynamicLength and dynamicWidth if available, otherwise fallback to base config
    const currentLength = vector.dynamicLength ?? vectorConfig.length;
    const currentWidth = vector.dynamicWidth ?? vectorConfig.width;

    // Convert angle to radians for trigonometric functions
    const radAngle = angle * (Math.PI / 180);

    // Calculate end point of the vector
    const x2 = x + currentLength * Math.cos(radAngle);
    const y2 = y + currentLength * Math.sin(radAngle);

    // Define line attributes
    const attributes = [
      `x1="${x.toFixed(3)}"`, // Use toFixed for cleaner SVG output
      `y1="${y.toFixed(3)}"`, 
      `x2="${x2.toFixed(3)}"`, 
      `y2="${y2.toFixed(3)}"`, 
      `stroke="${color}"`, 
      `stroke-width="${currentWidth.toFixed(3)}"`, 
      `opacity="${opacity.toFixed(3)}"`, 
      `stroke-linecap="${vectorConfig.shape === 'curve' ? 'round' : 'butt'}"`, 
    ];

    svgElements.push(`<line ${attributes.join(' ')} />`);
  });

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${svgElements.join('\n  ')}
</svg>`;

  // Generate a somewhat unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `flynn-static-vectors-${timestamp}.svg`;
  return { data: svgContent.trim(), filename };
};

interface UseSimpleVectorGridProps {
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  animationProps: Record<string, unknown>;
  globalAnimationControlsProp?: Partial<GlobalAnimationControls>; // Modificado
  width: number;
  height: number;
  backgroundColor?: string; // Añadido para consistencia
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
  globalAnimationControlsProp, // Modificado
  width,
  height,
  isPaused = false,
  debugMode = false,
  onVectorCountChange,
  onPulseComplete,
  backgroundColor // Asegurar que se desestructura si se usa directamente en exportSVG
}: UseSimpleVectorGridProps) => {
  const [rotationTransition, setRotationTransition] = useState<RotationTransition | null>(null);
  const prevRotationOriginRef = useRef<RotationOrigin>(vectorConfig.rotationOrigin);
  // Estado principal - valores iniciales estáticos para evitar hidratación
  const [state, setState] = useState<VectorGridState>({
    vectors: [],
    mousePosition: { x: null, y: null },
    isPaused: false,
    pulseCenter: null,
    pulseStartTime: null,
    previousVectors: [], // Importante para dinámicas si se usan
    lastUpdateTime: Date.now(),
    isExporting: false,
    exportProgress: 0
    // La propiedad 'dynamicConfig' se elimina aquí si estaba presente,
    // ya que no pertenece a VectorGridState y causaba un error de TypeScript (18a0315a).
  });

  const animationFrameId = useRef<number | null>(null);

  // Efecto para manejar la transición del origen de rotación
  useEffect(() => {
    if (prevRotationOriginRef.current !== vectorConfig.rotationOrigin) {
      if (!state.isPaused) { // Solo transicionar si no está pausado
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
  }, [vectorConfig.rotationOrigin, state.isPaused]);
  
  // Ref para tracking de tiempo - solo se inicializa en cliente
  const timeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Ref para almacenar el último frame renderizado exacto
  const lastRenderedFrameRef = useRef<SimpleVector[]>([]);

  // Configuración de controles globales de animación, fusionados con defaults
  const currentGlobalControls = useMemo((): GlobalAnimationControls => {
    // globalAnimationControlsProp puede ser parcial, mergeGlobalControls aplica los defaults.
    return mergeGlobalControls(globalAnimationControlsProp || {});
  }, [globalAnimationControlsProp]);

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
        // if (debugMode && row < 2 && col < 5) {
        //   console.log(`🔍 Vector [${row},${col}] pos:(${x},${y}) bounds:(${margin}-${width-margin},${margin}-${height-margin}) → ${withinBounds}`);
        // }
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
    

    
    // Notificar cambio en el conteo de vectores
    if (onVectorCountChange) {
      onVectorCountChange(newVectors.length);
    }
    
    return newVectors;
  }, [gridConfig, vectorConfig, width, height, onVectorCountChange]);

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
    

  }, [vectorConfig.length, vectorConfig.width, vectorConfig.color, isClient, debugMode, state.vectors.length]);

  // Función de animación - solo funciona en cliente
  const animate = useCallback(() => {
    if (isPaused || !isClient) return;

    setState(prev => {
      const currentTime = timeRef.current;
      
      // Combinar animationType con animationProps para el sistema modular
      const combinedAnimationProps = { type: animationType, ...animationProps } as AnimationProps;
      
      // Debug logging for prop validation issues (controlled)
      if (debugMode && animationType === 'randomLoop') {
        console.log('🔧 [DEBUG] RandomLoop Props:', animationProps);
      }
      
      // Aplicar animaciones con dimensiones del canvas
      let currentRotationTransition = rotationTransition;
      if (currentRotationTransition?.isTransitioning) {
        const elapsedTime = Date.now() - currentRotationTransition.startTime;
        if (elapsedTime >= currentRotationTransition.duration) {
          setRotationTransition(prev => prev ? { ...prev, isTransitioning: false, progress: 1 } : null);
          currentRotationTransition = null; // Transición terminada para este frame
        }
      }

      let newVectors = applyAnimation(
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
      if (DEFAULT_DYNAMIC_FIELDS.enableDynamicLength || DEFAULT_DYNAMIC_FIELDS.enableDynamicWidth) {
        const globalIntensity = calculateGlobalAnimationIntensity(
          newVectors, 
          currentGlobalControls, 
          prev.previousVectors
        );
        
        newVectors = updateVectorsWithDynamics(
          newVectors,
          currentGlobalControls, 
          globalIntensity,
          prev.previousVectors 
        );
        
      }
      
      // Limpiar pulso si ha expirado
      let newPulseCenter = prev.pulseCenter;
      let newPulseStartTime = prev.pulseStartTime;
      
      if (animationProps.type === 'centerPulse' && prev.pulseStartTime) {
        const elapsed = currentTime - prev.pulseStartTime;
        
        // Calcular duración dinámica basada en las dimensiones del canvas y velocidad del pulso
        const maxDistance = Math.sqrt(width * width + height * height); // Diagonal del canvas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      lastRenderedFrameRef.current = newVectors;

      return {
        ...prev,
        vectors: newVectors,
        previousVectors: prev.vectors, // Guardar estado anterior para vectores dinámicos
        lastUpdateTime: currentTime,
        pulseCenter: newPulseCenter,
        pulseStartTime: newPulseStartTime,
        // dynamicConfig: currentGlobalControls, // Ya no es necesario en el estado, currentGlobalControls está en el scope del hook
      };
    });
  }, [isPaused, animationType, animationProps, isClient, width, height, currentGlobalControls, onPulseComplete, debugMode, vectorConfig, gridConfig, rotationTransition]);

  // Loop de animación - solo en cliente
  useEffect(() => {
    if (isPaused || !isClient) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const loop = () => {
      // Usar Date.now() para consistencia con animaciones (no timestamp de RAF)
      timeRef.current = Date.now();
      animate();
      animationFrameId.current = requestAnimationFrame(loop);
    };
    
    animationFrameId.current = requestAnimationFrame(loop);
    // Limpiar en desmontaje
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, isPaused, isClient, rotationTransition]);

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
    

  }, [generateGrid, debugMode, isClient]);

  // Función para alternar pausa
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);


  // Función para detectar ciclo de animación
  const detectAnimationCycleForExport = useCallback((): AnimationCycle => {
    return detectAnimationCycle(animationType as AnimationType);
  }, [animationType]);

  // Export functions (simplified)
  const exportSVG = useCallback(async (): Promise<string> => {
    const vectorsToExport = lastRenderedFrameRef.current && lastRenderedFrameRef.current.length > 0
      ? lastRenderedFrameRef.current
      : state.vectors; // Fallback si no hay frames renderizados

    if (!vectorsToExport || vectorsToExport.length === 0) {
      console.warn('No vectors available for SVG export.');
      // Considerar notificar al usuario a través de la UI
      return ''; // Retorna string vacío o maneja el error como prefieras
    }

    // Asegúrate que gridConfig y vectorConfig estén disponibles en el scope del hook
    // y sean las versiones actuales que se están usando para el renderizado.
    const { data } = generateStaticSVG({
      vectors: vectorsToExport,
      width: width, // Desde props del hook
      height: height, // Desde props del hook
      backgroundColor: backgroundColor, // Desde props del hook (asegurar que esté disponible)
      vectorConfig: vectorConfig, 
    });
    
    // En un entorno web, aquí es donde típicamente se simularía una descarga
    // Por ejemplo:
    // const blob = new Blob([data], { type: 'image/svg+xml' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
    // console.log(`SVG exportado como ${filename}`);

    return data; // Devolvemos el string SVG como pide la firma original
  }, [state.vectors, vectorConfig, lastRenderedFrameRef, width, height, backgroundColor]); // Asegúrate de incluir todas las dependencias necesarias

  const exportAnimatedSVG = useCallback(async (): Promise<string> => {
    // Placeholder implementation - Lógica para SVG animado irá aquí
    console.warn('Animated SVG export is not implemented yet.');
    // const { data, filename } = generateAnimatedSVG(...);
    // Similar al exportSVG, podrías manejar la descarga aquí o solo retornar los datos.
    return '<svg></svg>'; // Placeholder data
  }, []); // Añadir dependencias si es necesario

  const exportGIF = useCallback(async (): Promise<Blob> => {
    // Placeholder implementation - Lógica para GIF irá aquí
    console.warn('GIF export is not implemented yet.');
    // const gifDataUrl = await generateGIFFromVectors(...);
    return new Blob([], { type: 'image/gif' }); // Devuelve un Blob vacío para satisfacer la firma
  }, []); // Añadir dependencias si es necesario

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
      dynamicVectorsEnabled: DEFAULT_DYNAMIC_FIELDS.enableDynamicLength || DEFAULT_DYNAMIC_FIELDS.enableDynamicWidth, // Placeholder usando DEFAULT_DYNAMIC_FIELDS
      isExporting: state.isExporting,
      exportProgress: state.exportProgress
    };
  }, [gridConfig, state.vectors.length, state.isPaused, state.isExporting, state.exportProgress, width, height, animationProps.type, isPaused, isClient]);



  // Función para obtener vectores actuales con animación aplicada
  const getCurrentVectors = useCallback((): SimpleVector[] => {
    // Si tenemos un frame capturado (más preciso), usarlo
    if (lastRenderedFrameRef.current.length > 0) {
      return lastRenderedFrameRef.current;
    }
    // Fallback al estado actual
    return state.vectors;
  }, [state.vectors]);

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
    gridRef,
    rotationTransition // Retornar el estado de la transición
  }
}
