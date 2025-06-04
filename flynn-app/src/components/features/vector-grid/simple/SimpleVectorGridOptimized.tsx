/**
 * ⚠️ DEPRECATED: SimpleVectorGridOptimized
 * 
 * 🚨 THIS COMPONENT IS DEPRECATED - DO NOT USE
 * Uses deprecated useSimpleVectorGridOptimized hook with infinite loop issues
 * 
 * ✅ Use instead: FlynnHookTest or create new component with useFlynnHook
 * @deprecated Since 2025-01-04
 */

'use client';

import React, { forwardRef, useImperativeHandle, useCallback, useRef, useState } from 'react';
import { throttle } from 'lodash';
// import { useSimpleVectorGrid } from './useSimpleVectorGrid'; // Hook básico (ROLLBACK disponible)
import { useSimpleVectorGridOptimized } from './useSimpleVectorGridOptimized'; // ⚠️ DEPRECATED HOOK
import { HybridRenderer } from '../renderers/HybridRenderer';
// Performance monitor removed - using simplified type
type RenderMode = 'svg' | 'canvas' | 'hybrid';
import type { 
  SimpleVectorGridProps, 
  SimpleVectorGridRef,
  SimpleVector
  // RotationTransition // No se usa directamente en este archivo, rotationTransition prop ya está tipada por el hook
} from './simpleTypes';

// Adaptador para convertir SimpleVector al formato que espera HybridRenderer
const adaptVectorForRenderer = (vector: SimpleVector) => ({
  id: vector.id,
  x: vector.x,
  y: vector.y,
  angle: vector.angle,
  length: vector.dynamicLength || vector.length,
  width: vector.dynamicWidth || vector.width,
  color: vector.color,
  opacity: vector.opacity,
  // Propiedades originales para animaciones
  originalX: vector.originalX,
  originalY: vector.originalY,
  originalAngle: vector.originalAngle,
  // Propiedades del grid
  gridRow: vector.gridRow,
  gridCol: vector.gridCol,
  // Propiedades dinámicas opcionales
  intensity: vector.intensity || 1,
  previousAngle: vector.previousAngle || vector.originalAngle
});

export const SimpleVectorGridOptimized = forwardRef<SimpleVectorGridRef, SimpleVectorGridProps>(
  ({
    gridConfig,
    vectorConfig,
    animationType,
    animationProps,
    width,
    height,
    backgroundColor = '#000000',
    isPaused = false,
    debugMode = false,
    onVectorCountChange
  }, ref) => {
    // console.log('🎬 [COMPONENT] SimpleVectorGridOptimized montado');
    
    // Refs para el contenedor y canvas
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Estados para el control de performance
    const [forceMode, setForceMode] = useState<RenderMode | undefined>(undefined);
    const [showPerformancePanel, setShowPerformancePanel] = useState(debugMode);
    
    // 🚀 Usar el hook optimizado ACTIVADO
    const {
      vectors,
      gridInfo,
      triggerPulse,
      updateMousePosition,
      // resetVectors, // No se usa
      togglePause,
      mousePosition,
      gridRef: hookGridRef,
      rotationTransition // Recibir el estado de transición del hook
    } = useSimpleVectorGridOptimized({
      gridConfig,
      vectorConfig,
      animationType,
      animationProps: animationProps as Record<string, unknown>,
      width,
      height,
      canvasRef, // 🚀 NUEVO: Pasar canvasRef al hook optimizado
      isPaused,
      debugMode,
      onVectorCountChange // 🚀 NUEVO: Hook optimizado soporta este callback
    });

    // console.log('🕵️ [SimpleVectorGridOptimized] Debugging Props & GridInfo:', {
    //   receivedWidth: width,
    //   receivedHeight: height,
    //   receivedGridConfig: gridConfig,
    //   hookGridInfo: gridInfo
    // });

    // Throttled mouse move handler
    const handleMouseMove = useCallback(
      throttle((event: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        
        try {
          const rect = containerRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          updateMousePosition(x, y);
        } catch (error) {
          console.warn('Error al obtener posición del mouse:', error);
        }
      }, 16),
      [updateMousePosition]
    );

    // Mouse leave handler
    const handleMouseLeave = useCallback(() => {
      updateMousePosition(null, null);
    }, [updateMousePosition]);

    // Key handlers
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerPulse();
      } else if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        togglePause();
      } else if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        setShowPerformancePanel(!showPerformancePanel);
      }
    }, [triggerPulse, togglePause, showPerformancePanel]);

    // Handler para cambios de modo de renderizado
    const handleModeSwitch = useCallback((mode: RenderMode, reason: string) => {
      if (debugMode) {
        console.log(`🔄 Cambio automático de modo: ${mode} (${reason})`);
      }
    }, [debugMode]);

    // Exponer métodos a través de ref (usar los del hook que son los reales)
    useImperativeHandle(ref, () => ({
      ...hookGridRef,
      // Métodos adicionales para control de performance
      forceRenderMode: setForceMode,
      togglePerformancePanel: () => setShowPerformancePanel(!showPerformancePanel)
    }), [hookGridRef, setForceMode, showPerformancePanel]);

    // Callback para cambios en el número de vectores
    React.useEffect(() => {
      if (onVectorCountChange) {
        onVectorCountChange(vectors.length);
      }
    }, [vectors.length, onVectorCountChange]);

    // Adaptar vectores para el renderer
    const adaptedVectors = React.useMemo(() => {
      return vectors.map(adaptVectorForRenderer);
    }, [vectors]);



    // Debug overlay
    const DebugOverlay = () => {
      if (!debugMode) return null;
      
      return (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-green-500/50 z-40">
          <div className="absolute top-2 left-2 text-xs p-2 rounded bg-black/70 text-white font-mono whitespace-pre-wrap">
            <p>Canvas: {width}x{height} | Grid: {gridConfig.rows}x{gridConfig.cols}</p>
            <p>Vectores: {gridInfo.totalVectors}/{gridInfo.expectedVectors} | Mouse: {mousePosition.x !== null && mousePosition.y !== null ? `${mousePosition.x.toFixed(0)},${mousePosition.y.toFixed(0)}` : 'N/A'}</p>
            <p>Animación: {gridInfo.isPaused ? 'Pausada' : 'Activa'} ({String(gridInfo.animationType)})</p>
            <p>Spacing: {gridConfig.spacing}px | Margin: {gridConfig.margin}px</p>
            <p className="text-yellow-400">Presiona &apos;H&apos; para panel de performance</p>
          </div>
        </div>
      );
    };



    return (
      <div 
        ref={containerRef}
        className="simple-vector-grid-optimized relative flex items-center justify-center w-full h-full box-border overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          backgroundColor 
        }}
        aria-label={`Grid de vectores optimizado con ${vectors.length} elementos. ${isPaused ? 'Animación pausada.' : 'Animación activa.'}`}
        aria-live="polite"
      >
        {vectors.length > 0 ? (
          <HybridRenderer
            vectors={adaptedVectors as any}
            width={width}
            height={height}
            backgroundColor="transparent"
            baseVectorLength={vectorConfig.length}
            baseVectorColor={vectorConfig.color as any}
            baseVectorWidth={vectorConfig.width}
            baseStrokeLinecap={vectorConfig.strokeLinecap}
            baseVectorShape={vectorConfig.shape === "curve" ? "circle-wave" : vectorConfig.shape}
            baseRotationOrigin={vectorConfig.rotationOrigin}
            interactionEnabled={!isPaused}
            debugMode={debugMode}
            frameInfo={{ frameCount: 0, timestamp: performance.now(), deltaTime: 0 }}
            gridStartX={0}
            gridStartY={0}
            gridWidth={gridInfo.gridDimensions.width}
            gridHeight={gridInfo.gridDimensions.height}
            animationType={animationType}
            onModeSwitch={handleModeSwitch}
            forceMode={forceMode}
            rotationTransition={rotationTransition} // Pasar la transición al renderer
          />
        ) : debugMode ? (
          <div className="flex items-center justify-center w-full h-full text-red-500 bg-gray-900/80 text-sm">
            No hay vectores para renderizar. Verifica la configuración del grid.
          </div>
        ) : null}
        
        <DebugOverlay />
        
        {/* Performance Panel - se renderiza desde el HybridRenderer */}
      </div>
    );
  }
);

SimpleVectorGridOptimized.displayName = 'SimpleVectorGridOptimized';
