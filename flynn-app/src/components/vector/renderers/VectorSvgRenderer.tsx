import React from 'react';
// !!! AJUSTA LAS RUTAS DE IMPORTACIÓN SEGÚN TU ESTRUCTURA DE PROYECTO REAL !!!
import type {
  AnimatedVectorItem,
  VectorRenderProps, // Asumiendo que este tipo existe para customRenderer
  VectorShape,
  StrokeLinecap,
  FrameInfo,
} from '../../features/vector-grid/core/types'; // RUTA TENTATIVA, AJÚSTALA!
import { RenderedVector } from '../../features/vector-grid/RenderedVector'; // RUTA TENTATIVA, AJÚSTALA!
import { GradientDefs } from '../../features/vector-grid/components/GradientDefs';
import type { GradientConfig, ExtendedVectorColorValue } from '../../features/vector-grid/types/gradientTypes';
import { isGradientConfig, generateGradientId } from '../../features/vector-grid/types/gradientTypes';

export interface VectorSvgRendererProps {
  vectors: AnimatedVectorItem[];
  width: number;
  height: number;
  backgroundColor?: string;

  baseVectorLength: number | ((item: AnimatedVectorItem, frameInfo: FrameInfo) => number);
  baseVectorColor: ExtendedVectorColorValue | ((item: AnimatedVectorItem, frameInfo: FrameInfo) => ExtendedVectorColorValue);
  baseVectorWidth: number | ((item: AnimatedVectorItem, frameInfo: FrameInfo) => number);
  
  baseStrokeLinecap?: StrokeLinecap;
  baseVectorShape: VectorShape;
 
  
  customRenderer?: (renderProps: VectorRenderProps) => React.ReactNode;
  
  userSvgString?: string; 
  userSvgPreserveAspectRatio?: string;

  onVectorClick?: (item: AnimatedVectorItem, event: React.MouseEvent<SVGElement>) => void;
  onVectorHover?: (item: AnimatedVectorItem | null, event: React.MouseEvent<SVGElement>) => void;

  frameInfo: FrameInfo; 

  interactionEnabled?: boolean;
  debugMode?: boolean;
  viewBox?: string;
  preserveAspectRatio?: string; 
  
  // Propiedades para el área de la cuadrícula
  gridStartX?: number;
  gridStartY?: number;
  gridWidth?: number;
  gridHeight?: number;
}

export const VectorSvgRenderer: React.FC<VectorSvgRendererProps> = React.memo(({
  vectors,
  width,
  height,
  backgroundColor,
  preserveAspectRatio = 'xMidYMid meet', 
  baseVectorLength,
  baseVectorColor,
  baseVectorWidth,
  baseStrokeLinecap,
  baseVectorShape,
  
  customRenderer,
  userSvgString,
  onVectorClick,
  onVectorHover,
  frameInfo,
  interactionEnabled = true,
  debugMode = false,
  viewBox,
  gridStartX = 0,
  gridStartY = 0,
  gridWidth = 0,
  gridHeight = 0,
}) => {

  // Procesar degradados y generar elementos renderizados
  const { renderedVectorElements, gradients } = React.useMemo(() => {
    const gradientsMap = new Map<string, { id: string; config: GradientConfig }>();
    
    const elements = vectors.map((item) => {
      const resolvedBaseLength = typeof baseVectorLength === 'function'
        ? baseVectorLength(item, frameInfo)
        : baseVectorLength;
      
      const resolvedBaseWidth = typeof baseVectorWidth === 'function'
        ? baseVectorWidth(item, frameInfo)
        : baseVectorWidth;

      const resolvedColor = typeof baseVectorColor === 'function'
        ? baseVectorColor(item, frameInfo)
        : baseVectorColor;

      const actualLength = resolvedBaseLength * (item.lengthFactor ?? 1);
      const actualWidth = resolvedBaseWidth * (item.widthFactor ?? 1);

      // Procesar color (puede ser string, HSL o degradado)
      let finalColor: string;
      
      if (isGradientConfig(resolvedColor)) {
        // Es un degradado
        const gradientId = generateGradientId(item.id);
        gradientsMap.set(gradientId, {
          id: gradientId,
          config: resolvedColor
        });
        finalColor = `url(#${gradientId})`;
      } else if (typeof resolvedColor === 'object' && 'h' in resolvedColor) {
        // Es un color HSL
        const { h, s, l, a = 1 } = resolvedColor;
        finalColor = `hsla(${h}, ${s}%, ${l}%, ${a})`;
      } else {
        // Es un string de color
        finalColor = resolvedColor as string;
      }

      const commonEventHandlers = {
        onClick: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorClick?.(item, e),
        onMouseEnter: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorHover?.(item, e),
        onMouseLeave: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorHover?.(null, e),
      };

      if (baseVectorShape === 'custom') {
        if (customRenderer) {
          const renderProps: VectorRenderProps = {
            item,
            x: item.baseX,
            y: item.baseY,
            angle: item.currentAngle,
            length: actualLength,
            width: actualWidth,
            color: finalColor,
            shape: baseVectorShape,
                     id: item.id,
            opacity: item.opacity,
          };
          return <g key={item.id} {...commonEventHandlers}>{customRenderer(renderProps)}</g>;
        }
        if (userSvgString) {
          return (
            <g 
              key={item.id} 
              transform={`translate(${item.baseX}, ${item.baseY}) rotate(${item.currentAngle})`}
              {...commonEventHandlers}
            >
              <g dangerouslySetInnerHTML={{ __html: userSvgString }} />
            </g>
          );
        }
      }

      return (
        <g key={item.id} {...(interactionEnabled ? commonEventHandlers : {})}>
            <RenderedVector
                id={item.id} 
                baseX={item.baseX}
                baseY={item.baseY}
                currentAngle={item.currentAngle}
                length={actualLength}
                width={actualWidth}
                color={finalColor}
                shape={baseVectorShape} 
                strokeLinecap={baseStrokeLinecap}
                rotationOrigin="center"
            />
        </g>
      );
    });

    return {
      renderedVectorElements: elements,
      gradients: Array.from(gradientsMap.values())
    };
  }, [
    vectors, baseVectorLength, baseVectorWidth, baseVectorColor, baseVectorShape,
    baseStrokeLinecap, frameInfo, customRenderer, userSvgString, interactionEnabled, 
    onVectorClick, onVectorHover, 
  ]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox || `0 0 ${width} ${height}`}
      preserveAspectRatio={preserveAspectRatio}
      style={{ display: 'block', backgroundColor: backgroundColor || 'transparent' }}
    >
      {/* Definiciones de degradados */}
      <GradientDefs gradients={gradients} />
      
      {/* Debug Mode: Rectángulo rojo para representar el área total SVG */}
      {debugMode && (
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill="rgba(255, 0, 0, 0.1)" 
          stroke="red" 
          strokeWidth="1"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Debug Mode: Rectángulo verde para representar el área de la cuadrícula calculada */}
      {debugMode && gridWidth > 0 && gridHeight > 0 && (
        <rect 
          x={gridStartX} 
          y={gridStartY} 
          width={gridWidth} 
          height={gridHeight} 
          fill="rgba(0, 255, 0, 0.1)" 
          stroke="green" 
          strokeWidth="1"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      <g className="vector-grid-svg-content">
        {renderedVectorElements}
      </g>
      
      {/* Debug Mode: Panel con información del frame en la esquina superior izquierda */}
      {debugMode && frameInfo && (
        <text x="10" y="20" fontSize="12" fill="currentColor" style={{ filter: 'contrast(200%) drop-shadow(0 0 1px white)'}}>
          Frame: {frameInfo.frameCount}, Time: {frameInfo.timestamp.toFixed(2)}
        </text>
      )}
      
      {/* Debug Mode: Panel con información de dimensiones en la esquina inferior derecha */}
      {debugMode && (
        <text x={width - 10} y={height - 10} fontSize="12" fill="currentColor" textAnchor="end" style={{ filter: 'contrast(200%) drop-shadow(0 0 1px white)'}}>
          SVG: {width}x{height} | Grid: {gridWidth}x{gridHeight} | Start: {gridStartX},{gridStartY}
        </text>
      )}
    </svg>
  );
});

VectorSvgRenderer.displayName = 'VectorSvgRenderer';
