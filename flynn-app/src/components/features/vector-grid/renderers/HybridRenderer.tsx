/**
 * Renderer Híbrido que cambia automáticamente entre SVG y Canvas
 * basado en métricas de rendimiento
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { VectorSvgRenderer } from '../../../vector/renderers/VectorSvgRenderer';
import { performanceMonitor, RenderMode, QualityLevel } from '../performance/PerformanceMonitor';
import type { VectorShape, RotationOrigin, AnimatedVectorItem } from '../core/types';

export interface HybridRendererProps {
  vectors: AnimatedVectorItem[];
  width: number;
  height: number;
  backgroundColor?: string;
  baseVectorLength: number;
  baseVectorColor: string;
  baseVectorWidth: number;
  baseStrokeLinecap?: 'butt' | 'round' | 'square';
  baseVectorShape: VectorShape;
  baseRotationOrigin?: RotationOrigin;
  interactionEnabled?: boolean;
  debugMode?: boolean;
  frameInfo: {
    frameCount: number;
    timestamp: number;
    deltaTime: number;
  };
  gridStartX: number;
  gridStartY: number;
  gridWidth: number;
  gridHeight: number;
  animationType?: string;
  onModeSwitch?: (mode: RenderMode, reason: string) => void;
  forceMode?: RenderMode;
}

interface CanvasVectorData {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: string;
  opacity: number;
  shape: VectorShape;
}

interface QualitySettings {
  skipVectors: number;
  showArrowHeads: boolean;
  curveDetail: boolean;
  usePath2D: boolean;
  antiAlias: boolean;
}

export const HybridRenderer: React.FC<HybridRendererProps> = ({
  vectors,
  width,
  height,
  backgroundColor = 'transparent',
  baseVectorLength,
  baseVectorColor,
  baseVectorWidth,
  baseStrokeLinecap = 'round',
  baseVectorShape,
  baseRotationOrigin = 'center',
  interactionEnabled = true,
  debugMode = false,
  frameInfo,
  gridStartX,
  gridStartY,
  gridWidth,
  gridHeight,
  animationType = 'smoothWaves',
  onModeSwitch,
  forceMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMode, setCurrentMode] = useState<RenderMode>(forceMode || RenderMode.SVG);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(QualityLevel.HIGH);
  const renderStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Configuraciones de calidad
  const getQualitySettings = useCallback((quality: QualityLevel): QualitySettings => {
    switch (quality) {
      case QualityLevel.ULTRA:
        return {
          skipVectors: 0,
          showArrowHeads: true,
          curveDetail: true,
          usePath2D: true,
          antiAlias: true
        };
      case QualityLevel.HIGH:
        return {
          skipVectors: 0,
          showArrowHeads: true,
          curveDetail: true,
          usePath2D: true,
          antiAlias: true
        };
      case QualityLevel.MEDIUM:
        return {
          skipVectors: 0,
          showArrowHeads: false,
          curveDetail: false,
          usePath2D: true,
          antiAlias: true
        };
      case QualityLevel.PERFORMANCE:
        return {
          skipVectors: 0,
          showArrowHeads: false,
          curveDetail: false,
          usePath2D: false,
          antiAlias: false
        };
      default:
        return {
          skipVectors: 0,
          showArrowHeads: true,
          curveDetail: true,
          usePath2D: true,
          antiAlias: true
        };
    }
  }, []);

  // Funciones de renderizado por forma
  const renderArrow = useCallback((ctx: CanvasRenderingContext2D, length: number, settings: QualitySettings) => {
    const halfLength = length / 2;
    
    // Línea principal
    ctx.beginPath();
    ctx.moveTo(-halfLength, 0);
    ctx.lineTo(halfLength, 0);
    ctx.stroke();
    
    // Punta de flecha (solo en alta calidad)
    if (settings.showArrowHeads && length > 10) {
      const headSize = Math.min(length * 0.3, 8);
      ctx.beginPath();
      ctx.moveTo(halfLength, 0);
      ctx.lineTo(halfLength - headSize, -headSize * 0.5);
      ctx.moveTo(halfLength, 0);
      ctx.lineTo(halfLength - headSize, headSize * 0.5);
      ctx.stroke();
    }
  }, []);

  const renderLine = useCallback((ctx: CanvasRenderingContext2D, length: number) => {
    const halfLength = length / 2;
    ctx.beginPath();
    ctx.moveTo(-halfLength, 0);
    ctx.lineTo(halfLength, 0);
    ctx.stroke();
  }, []);

  const renderCurve = useCallback((ctx: CanvasRenderingContext2D, length: number, settings: QualitySettings) => {
    const halfLength = length / 2;
    const curveHeight = settings.curveDetail ? length * 0.2 : length * 0.1;
    
    ctx.beginPath();
    ctx.moveTo(-halfLength, 0);
    ctx.quadraticCurveTo(0, -curveHeight, halfLength, 0);
    ctx.stroke();
  }, []);

  const renderCircle = useCallback((ctx: CanvasRenderingContext2D, radius: number) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const renderDot = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Renderizar un vector individual
  const renderSingleVector = useCallback((ctx: CanvasRenderingContext2D, vector: CanvasVectorData, settings: QualitySettings) => {
    const { x, y, angle, length, width, color, opacity, shape } = vector;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    switch (shape) {
      case 'arrow':
        renderArrow(ctx, length, settings);
        break;
      case 'line':
        renderLine(ctx, length);
        break;
      case 'circle-wave':
        renderCurve(ctx, length, settings);
        break;
      case 'circle':
        renderCircle(ctx, length / 2);
        break;
      case 'dot':
        renderDot(ctx, width);
        break;
      default:
        renderLine(ctx, length);
    }
    
    ctx.restore();
  }, [renderArrow, renderLine, renderCurve, renderCircle, renderDot]);

  // Añadir vector a Path2D
  const addVectorToPath = useCallback((path: Path2D, vector: CanvasVectorData) => {
    const { x, y, angle, length } = vector;
    const halfLength = length / 2;
    
    // Calcular puntos del vector
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const startX = x - halfLength * cos;
    const startY = y - halfLength * sin;
    const endX = x + halfLength * cos;
    const endY = y + halfLength * sin;
    
    path.moveTo(startX, startY);
    path.lineTo(endX, endY);
  }, []);

  // Renderizado directo (más simple, mejor para pocos vectores)
  const renderDirect = useCallback((ctx: CanvasRenderingContext2D, vectors: CanvasVectorData[], settings: QualitySettings) => {
    for (let i = 0; i < vectors.length; i += settings.skipVectors + 1) {
      const vector = vectors[i];
      renderSingleVector(ctx, vector, settings);
    }
  }, [renderSingleVector]);

  // Renderizado con Path2D (más eficiente para muchos vectores)
  const renderWithPath2D = useCallback((ctx: CanvasRenderingContext2D, vectors: CanvasVectorData[], settings: QualitySettings) => {
    // Agrupar vectores por color para batch rendering
    const vectorsByColor = new Map<string, CanvasVectorData[]>();
    
    for (let i = 0; i < vectors.length; i += settings.skipVectors + 1) {
      const vector = vectors[i];
      const colorKey = `${vector.color}-${vector.width}`;
      
      if (!vectorsByColor.has(colorKey)) {
        vectorsByColor.set(colorKey, []);
      }
      vectorsByColor.get(colorKey)!.push(vector);
    }

    // Renderizar por grupos de color
    vectorsByColor.forEach((groupVectors, colorKey) => {
      const [color, width] = colorKey.split('-');
      ctx.strokeStyle = color;
      ctx.lineWidth = parseFloat(width);
      
      const path = new Path2D();
      groupVectors.forEach(vector => {
        addVectorToPath(path, vector);
      });
      
      ctx.stroke(path);
    });
  }, [addVectorToPath]);

  // Memoizar datos de vectores para Canvas
  const canvasVectors = useMemo((): CanvasVectorData[] => {
    return vectors.map(vector => ({
      x: vector.x,
      y: vector.y,
      angle: vector.angle,
      length: vector.length,
      width: vector.width,
      color: vector.color,
      opacity: vector.opacity || 1,
      shape: baseVectorShape
    }));
  }, [vectors, baseVectorShape]);

  // Función para renderizar en Canvas
  const renderCanvas = useCallback((ctx: CanvasRenderingContext2D, vectors: CanvasVectorData[], quality: QualityLevel) => {
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configurar calidad basada en rendimiento
    const qualitySettings = getQualitySettings(quality);
    
    // Aplicar configuraciones de calidad
    ctx.lineCap = baseStrokeLinecap;
    ctx.lineJoin = 'round';
    
    // Optimización: usar Path2D para mejor rendimiento
    if (qualitySettings.usePath2D && vectors.length > 100) {
      renderWithPath2D(ctx, vectors, qualitySettings);
    } else {
      renderDirect(ctx, vectors, qualitySettings);
    }
  }, [width, height, baseStrokeLinecap, getQualitySettings, renderWithPath2D, renderDirect]);

  // Efecto para monitorear rendimiento y cambiar modo
  useEffect(() => {
    renderStartTimeRef.current = performance.now();
    
    // Actualizar métricas de rendimiento
    performanceMonitor.updateMetrics(vectors.length, animationType, renderStartTimeRef.current);
    
    // Verificar si necesitamos cambiar de modo (solo si no está forzado)
    if (!forceMode) {
      const switchRecommendation = performanceMonitor.shouldSwitchRenderMode();
      if (switchRecommendation && switchRecommendation.mode !== currentMode) {
        setCurrentMode(switchRecommendation.mode);
        performanceMonitor.setRenderMode(switchRecommendation.mode);
        
        if (onModeSwitch) {
          onModeSwitch(switchRecommendation.mode, switchRecommendation.reason);
        }
        
        if (debugMode) {
          console.log(`🔄 Cambio de modo: ${currentMode} → ${switchRecommendation.mode}`, switchRecommendation.reason);
        }
      }
    }

    // Actualizar calidad
    const optimalQuality = performanceMonitor.getOptimalQuality();
    if (optimalQuality !== currentQuality) {
      setCurrentQuality(optimalQuality);
      performanceMonitor.setQuality(optimalQuality);
    }

    frameCountRef.current++;
  }, [vectors, animationType, currentMode, currentQuality, forceMode, onModeSwitch, debugMode]);

  // Efecto para renderizar Canvas
  useEffect(() => {
    if (currentMode === RenderMode.CANVAS && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        renderCanvas(ctx, canvasVectors, currentQuality);
      }
    }
  }, [currentMode, canvasVectors, currentQuality, renderCanvas]);

  // Efecto para forzar modo si se especifica
  useEffect(() => {
    if (forceMode && forceMode !== currentMode) {
      setCurrentMode(forceMode);
      performanceMonitor.setRenderMode(forceMode);
    }
  }, [forceMode, currentMode]);

  // Debug info
  const debugInfo = useMemo(() => {
    if (!debugMode) return null;
    
    const metrics = performanceMonitor.getMetrics();
    return (
      <div className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
        <div>Modo: {currentMode.toUpperCase()}</div>
        <div>Calidad: {currentQuality.toUpperCase()}</div>
        <div>FPS: {metrics.fps}</div>
        <div>Vectores: {vectors.length}</div>
        <div>Complejidad: {(metrics.complexity * 100).toFixed(0)}%</div>
        <div>Memoria: {metrics.memoryUsage.toFixed(1)}MB</div>
      </div>
    );
  }, [debugMode, currentMode, currentQuality, vectors.length]);

  // Renderizar según el modo actual
  if (currentMode === RenderMode.CANVAS) {
    return (
      <div className="relative" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor
          }}
        />
        {debugInfo}
      </div>
    );
  }

  // Modo SVG (por defecto)
  return (
    <div className="relative">
      <VectorSvgRenderer
        vectors={vectors}
        width={width}
        height={height}
        backgroundColor={backgroundColor}
        baseVectorLength={baseVectorLength}
        baseVectorColor={baseVectorColor}
        baseVectorWidth={baseVectorWidth}
        baseStrokeLinecap={baseStrokeLinecap}
        baseVectorShape={baseVectorShape}

        interactionEnabled={interactionEnabled}
        debugMode={false} // Evitar debug duplicado
        frameInfo={frameInfo}
        gridStartX={gridStartX}
        gridStartY={gridStartY}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
      />
      {debugInfo}
    </div>
  );
};

export default HybridRenderer;
