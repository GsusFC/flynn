import React from 'react';
// !!! AJUSTA LAS RUTAS DE IMPORTACIÓN SEGÚN TU ESTRUCTURA DE PROYECTO REAL !!!
import type {
    SimpleVector as AnimatedVectorItem,
    VectorShape,
    RotationOrigin,
    RotationTransition, // Importar el tipo para la nueva prop
} from '../../features/vector-grid/simple/simpleTypes';

// Backward compatibility types
type StrokeLinecap = 'butt' | 'round' | 'square';

// Definición más estricta para las props del customRenderer
interface VectorRenderProps {
  id: string; // Añadido para que coincida con el uso
  item: AnimatedVectorItem;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: string;
  opacity?: number;
  shape: VectorShape;
}
// RenderedVector component removed - using inline SVG
import { GradientDefs } from '../../features/vector-grid/components/GradientDefs';
import type { GradientConfig, ExtendedVectorColorValue, HSLColor } from '../../features/vector-grid/types/gradientTypes'; // HSLColor añadido
import { isGradientConfig, generateGradientId } from '../../features/vector-grid/types/gradientTypes'; // isHSLColor eliminado

// Interfaz para el resultado de calculateCoordsForOrigin
interface CalculatedCoords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// --- BUGFIX: Import path generation utilities ---
import { 
  generateWavePath, 
  generateBezierPath,
  generateSpiralPath,
  generateArcPath,
  generateOrganicPath
} from '@/app/dev/vector-path-utils';
import { SHAPE_REGISTRY } from '@/lib/shapeRegistry';

// Función auxiliar para calcular las coordenadas basadas en el origen de rotación
const calculateCoordsForOrigin = (
  itemX: number,
  itemY: number,
  length: number,
  angleRad: number,
  origin: RotationOrigin
): CalculatedCoords => {
  let startX = itemX;
  let startY = itemY;
  let endX = itemX;
  let endY = itemY;

  switch (origin) {
    case 'start':
    case 'tail': // 'tail' es tratado como 'start'
      endX = itemX + Math.cos(angleRad) * length;
      endY = itemY + Math.sin(angleRad) * length;
      break;
    case 'center':
      const halfLength = length / 2;
      startX = itemX - Math.cos(angleRad) * halfLength;
      startY = itemY - Math.sin(angleRad) * halfLength;
      endX = itemX + Math.cos(angleRad) * halfLength;
      endY = itemY + Math.sin(angleRad) * halfLength;
      break;
    case 'end': // 'head' se elimina, 'end' es el término correcto del tipo RotationOrigin
      startX = itemX - Math.cos(angleRad) * length;
      startY = itemY - Math.sin(angleRad) * length;
      break;
    default:
      // Este caso maneja cualquier valor de 'origin' que no sea uno de los literales esperados.
      // Esto podría ocurrir si 'origin' es de tipo 'any' o si hay un error en los datos.
      // TypeScript inferirá 'origin' como 'never' aquí si está correctamente tipado en la llamada,
      // pero mantenemos un fallback robusto.
      // console.warn(`Unexpected RotationOrigin value: ${origin}. Defaulting to 'center'.`);
      const defaultHalfLength = length / 2;
      startX = itemX - Math.cos(angleRad) * defaultHalfLength;
      startY = itemY - Math.sin(angleRad) * defaultHalfLength;
      endX = itemX + Math.cos(angleRad) * defaultHalfLength;
      endY = itemY + Math.sin(angleRad) * defaultHalfLength;
      break;
  }
  return { startX, startY, endX, endY };
};

export interface VectorSvgRendererProps {
    vectors: AnimatedVectorItem[];
    width: number;
    height: number;
    backgroundColor?: string;

    baseVectorLength: number | ((item: AnimatedVectorItem, frameInfo: { frameCount: number; timestamp: number; deltaTime: number }) => number);
    baseVectorColor?: ExtendedVectorColorValue | ((item: AnimatedVectorItem, frameInfo: { frameCount: number; timestamp: number; deltaTime: number }) => ExtendedVectorColorValue);
    baseVectorWidth: number | ((item: AnimatedVectorItem, frameInfo: { frameCount: number; timestamp: number; deltaTime: number }) => number);

    baseStrokeLinecap?: StrokeLinecap;
    baseVectorShape: VectorShape;
    baseRotationOrigin: RotationOrigin; // Added baseRotationOrigin prop


    customRenderer?: (renderProps: VectorRenderProps, item: AnimatedVectorItem) => React.ReactNode;

    userSvgString?: string;
    userSvgPreserveAspectRatio?: string;

    onVectorClick?: (item: AnimatedVectorItem, event: React.MouseEvent<SVGElement>) => void;
    onVectorHover?: (item: AnimatedVectorItem | null, event: React.MouseEvent<SVGElement>) => void;

    frameInfo: { frameCount: number; timestamp: number; deltaTime: number };

    interactionEnabled?: boolean;
    debugMode?: boolean;
    viewBox?: string;
    preserveAspectRatio?: string;

    // Propiedades para el área de la cuadrícula
    gridStartX?: number;
    gridStartY?: number;
    gridWidth?: number;
    gridHeight?: number;
    rotationTransition?: RotationTransition | null; // Prop para la transición
}

export const VectorSvgRenderer: React.FC<VectorSvgRendererProps> = React.memo(({
    vectors,
    width,
    height,
    backgroundColor,
    preserveAspectRatio = 'xMidYMid meet',
    baseVectorLength,
    baseVectorColor = '#000000',
    baseVectorWidth,
    baseStrokeLinecap,
    baseVectorShape,
    baseRotationOrigin, // Destructure baseRotationOrigin without default

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
    rotationTransition, // Desestructurar la nueva prop
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

            // --- BUGFIX: Prioritize individual vector color over base color ---
            // If the incoming vector item has its own color, use it. Otherwise, fall back to the resolved base color.
            const finalResolvedColor = item.color || resolvedColor;

            // Support both lengthFactor (AnimatedVectorItem) and dynamicLength (SimpleVector)
            const itemAny = item as any;
            const lengthMultiplier = itemAny.lengthFactor ??
                (itemAny.dynamicLength ? (itemAny.dynamicLength / resolvedBaseLength) : 1);
            const widthMultiplier = itemAny.widthFactor ??
                (itemAny.dynamicWidth ? (itemAny.dynamicWidth / resolvedBaseWidth) : 1);

            const actualLength = resolvedBaseLength * lengthMultiplier;
            const actualWidth = resolvedBaseWidth * widthMultiplier;

            // Procesar color (puede ser string, HSL o degradado)
            let finalColor: string;

            if (isGradientConfig(finalResolvedColor)) {
                // Es un degradado
                const gradientId = generateGradientId(item.id);
                gradientsMap.set(gradientId, {
                    id: gradientId,
                    config: finalResolvedColor
                });
                finalColor = `url(#${gradientId})`;
            } else if (typeof finalResolvedColor === 'object' && finalResolvedColor !== null && 'h' in finalResolvedColor) {
                // Es HSLColor
                const { h, s, l, a = 1 } = finalResolvedColor as HSLColor;
                finalColor = `hsla(${h}, ${s}%, ${l}%, ${a})`;
            } else {
                // Es un string de color
                finalColor = finalResolvedColor as string;
            }

            const angleRad = (item.angle * Math.PI) / 180;
            const { startX, startY, endX, endY } = calculateCoordsForOrigin(
                item.x, item.y, actualLength, angleRad, item.rotationOrigin || baseRotationOrigin
            );
            
            const shapeParams = itemAny.shapeParams || {};
            let pathData = `M ${startX} ${startY} L ${endX} ${endY}`; // Default to straight line

            // Determinar la forma y generar la ruta
            const shape: VectorShape = item.shape || baseVectorShape;

            switch(shape) {
                case 'wave':
                    pathData = generateWavePath(startX, startY, angleRad, actualLength, frameInfo.timestamp, item.gridRow * 100 + item.gridCol, shapeParams);
                    break;
                case 'bezier':
                    pathData = generateBezierPath(startX, startY, angleRad, actualLength, frameInfo.timestamp, item.gridRow * 100 + item.gridCol, shapeParams);
                    break;
                case 'spiral':
                    pathData = generateSpiralPath(startX, startY, angleRad, actualLength, frameInfo.timestamp, item.gridRow * 100 + item.gridCol, shapeParams);
                    break;
                case 'arc':
                    pathData = generateArcPath(startX, startY, angleRad, actualLength, frameInfo.timestamp, item.gridRow * 100 + item.gridCol, shapeParams);
                    break;
                case 'organic':
                    pathData = generateOrganicPath(startX, startY, angleRad, actualLength, frameInfo.timestamp, item.gridRow * 100 + item.gridCol, shapeParams);
                    break;
                case 'straight':
                default:
                    // pathData is already a straight line
                    break;
            }

            const commonProps = {
                'data-id': item.id,
                onClick: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorClick?.(item, e),
                onMouseEnter: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorHover?.(item, e),
                onMouseLeave: (e: React.MouseEvent<SVGElement>) => interactionEnabled && onVectorHover?.(null, e),
            };

            if (customRenderer) {
                const renderProps = {
                    id: item.id,
                    item,
                    x: item.x,
                    y: item.y,
                    angle: item.angle,
                    length: actualLength,
                    width: actualWidth,
                    color: finalColor,
                    shape: baseVectorShape,
                };
                return customRenderer(renderProps, item);
            }

            if (userSvgString) {
                return (
                    <g
                        key={item.id}
                        transform={`translate(${item.x}, ${item.y}) rotate(${item.angle})`}
                        {...commonProps}
                    >
                        <g dangerouslySetInnerHTML={{ __html: userSvgString }} />
                    </g>
                );
            }

            if (shape === 'straight') {
                 return (
                    <line
                        {...commonProps}
                        key={item.id}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke={finalColor}
                        strokeWidth={actualWidth}
                        strokeLinecap={baseStrokeLinecap || 'butt'}
                        opacity={item.opacity ?? 1}
                    />
                );
            } else {
                return (
                    <path
                        {...commonProps}
                        key={item.id}
                        d={pathData}
                        stroke={finalColor}
                        strokeWidth={actualWidth}
                        fill="none"
                        strokeLinecap={baseStrokeLinecap || 'round'}
                        opacity={item.opacity ?? 1}
                    />
                );
            }
        });

        return {
            renderedVectorElements: elements,
            gradients: Array.from(gradientsMap.values())
        };
    }, [
        vectors, baseVectorLength, baseVectorWidth, baseVectorColor, baseVectorShape,
        baseStrokeLinecap, frameInfo, customRenderer, userSvgString, interactionEnabled,
        onVectorClick, onVectorHover, baseRotationOrigin, rotationTransition, // Añadir rotationTransition a las dependencias
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
                <text x="10" y="20" fontSize="12" fill="currentColor" style={{ filter: 'contrast(200%) drop-shadow(0 0 1px white)' }}>
                    Frame: {frameInfo.frameCount}, Time: {frameInfo.timestamp.toFixed(2)}
                </text>
            )}

            {/* Debug Mode: Panel con información de dimensiones en la esquina inferior derecha */}
            {debugMode && (
                <text x={width - 10} y={height - 10} fontSize="12" fill="currentColor" textAnchor="end" style={{ filter: 'contrast(200%) drop-shadow(0 0 1px white)' }}>
                    SVG: {width}x{height} | Grid: {gridWidth}x{gridHeight} | Start: {gridStartX},{gridStartY}
                </text>
            )}
        </svg>
    );
});

VectorSvgRenderer.displayName = 'VectorSvgRenderer';