/**
 * HybridRenderer - Renderizador híbrido SVG/Canvas para Flynn Vector Grid
 * Usa SVG para pocos vectores y Canvas para alta densidad (900+)
 */

import React, { useRef, useEffect } from 'react';
import { FastSvgRenderer } from '@/components/vector/renderers/FastSvgRenderer';
import type { RotationOrigin, SimpleVector } from '@/components/features/vector-grid/simple/simpleTypes';
import { isGradientConfig, type GradientConfig } from '@/components/features/vector-grid/types/gradientTypes';

interface HybridRendererProps {
  vectors: SimpleVector[];
  width: number;
  height: number;
  onPerformanceUpdate?: (metrics: any) => void;
  debugMode?: boolean;
  baseVectorWidth?: number;
  baseRotationOrigin?: RotationOrigin;
  // Otros props que se pasan a SVG renderer
  [key: string]: any;
}

const CANVAS_THRESHOLD = 900;

const CanvasVectorRenderer: React.FC<
  HybridRendererProps & { debugMode?: boolean }
> = ({ vectors, width, height, debugMode, backgroundColor, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas para alta resolución
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);

    // Configuración de renderizado
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Renderizar vectores
    const startTime = performance.now();
    
    vectors.forEach((vector) => {
      // Extraer propiedades (compatible con SimpleVector y Vector)
      const x = vector.x;
      const y = vector.y;
      const angle = vector.angle; // ahora en radianes directamente
      const length = vector.dynamicLength ?? vector.length;
      const color = vector.color;
      
      // Calcular posición final del vector
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      // Configurar estilo
      if (isGradientConfig(color)) {
        const gradConfig = color as GradientConfig;
        if (gradConfig.type === 'linear') {
          const gradAngle = (gradConfig.angle ?? 0) * Math.PI / 180;
          const gradLength = length / 2;
          const gX0 = x + Math.cos(gradAngle) * -gradLength;
          const gY0 = y + Math.sin(gradAngle) * -gradLength;
          const gX1 = x + Math.cos(gradAngle) * gradLength;
          const gY1 = y + Math.sin(gradAngle) * gradLength;
          const gradient = ctx.createLinearGradient(gX0, gY0, gX1, gY1);
          gradConfig.colors.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
          ctx.strokeStyle = gradient;
        } else { // radial
          const centerX = x + (gradConfig.centerX ?? 0.5) - 0.5;
          const centerY = y + (gradConfig.centerY ?? 0.5) - 0.5;
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, (gradConfig.radius ?? 0.5) * length);
          gradConfig.colors.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
          ctx.strokeStyle = gradient;
        }
      } else {
        ctx.strokeStyle = color as string;
      }
      ctx.lineWidth = vector.dynamicWidth ?? vector.width ?? 1.5;

      // Dibujar línea
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Opcional: dibujar punta de flecha para vectores largos
      if (length > 15) {
        const arrowLength = Math.min(length * 0.2, 8);
        const arrowAngle = 0.5;

        // Línea izquierda de la flecha
        const leftX = endX - Math.cos(angle - arrowAngle) * arrowLength;
        const leftY = endY - Math.sin(angle - arrowAngle) * arrowLength;
        
        // Línea derecha de la flecha
        const rightX = endX - Math.cos(angle + arrowAngle) * arrowLength;
        const rightY = endY - Math.sin(angle + arrowAngle) * arrowLength;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(leftX, leftY);
        ctx.moveTo(endX, endY);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();
      }
    });

    const renderTime = performance.now() - startTime;
    
    if (debugMode) {
      console.log(`[Canvas Renderer] Rendered ${vectors.length} vectors in ${renderTime.toFixed(2)}ms`);
    }

  }, [vectors, width, height, debugMode, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ 
        imageRendering: 'auto'
      }}
    />
  );
};

export const HybridRenderer: React.FC<HybridRendererProps> = (props) => {
  const { vectors = [], width, height, debugMode, onPerformanceUpdate } = props;
  
  const vectorCount = vectors.length;
  const useCanvas = vectorCount >= CANVAS_THRESHOLD;

  // Reportar modo de renderizado para debug
  useEffect(() => {
    if (debugMode) {
      console.log(`[HybridRenderer] Using ${useCanvas ? 'Canvas' : 'SVG'} rendering for ${vectorCount} vectors`);
    }
    
    // Actualizar métricas de performance
    if (onPerformanceUpdate) {
      onPerformanceUpdate({
        vectorCount,
        renderMode: useCanvas ? 'canvas' : 'svg',
        timestamp: Date.now()
      });
    }
  }, [useCanvas, vectorCount, debugMode, onPerformanceUpdate, props.backgroundColor]);

  if (useCanvas) {
    return (
      <div className="relative w-full h-full">
        <CanvasVectorRenderer {...props} />
        {debugMode && (
          <div className="absolute top-2 right-2 bg-green-950/80 text-green-400 text-xs px-2 py-1 rounded">
            🖥️ Canvas ({vectorCount} vectors)
          </div>
        )}
      </div>
    );
  }

  // Usar SVG renderer para baja densidad
  return (
    <div className="relative w-full h-full">
      <FastSvgRenderer
        vectors={props.vectors}
        width={props.width}
        height={props.height}
        backgroundColor={props.backgroundColor}
        baseVectorWidth={props.baseVectorWidth ?? 1.5}
        baseRotationOrigin={props.baseRotationOrigin ?? 'start'}
      />
      {debugMode && (
        <div className="absolute top-2 right-2 bg-blue-950/80 text-blue-400 text-xs px-2 py-1 rounded">
          📊 SVG ({vectorCount} vectors)
        </div>
      )}
    </div>
  );
};