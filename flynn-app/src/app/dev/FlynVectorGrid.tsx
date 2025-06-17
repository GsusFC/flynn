'use client';

import { useMemo, useRef, forwardRef, Ref } from 'react';
import { useConfigStore } from '@/store/configStore';
import { useVectorGrid } from '@/hooks/useVectorGrid';
import type { Vector } from '@/animations/types';
import { useContainerDimensions } from '@/hooks/useContainerDimensions';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useVectorAnimation } from '@/hooks/useVectorAnimation';
import { FastSvgRenderer } from '@/components/vector/renderers/FastSvgRenderer';
import type { SimpleVector } from '@/components/features/vector-grid/simple/simpleTypes';

export type FlynVectorGridRef = HTMLDivElement;

export interface FlynVectorGridProps {
  className?: string;
}

const FlynVectorGrid = forwardRef<FlynVectorGridRef, FlynVectorGridProps>(({
  className,
}, ref: Ref<FlynVectorGridRef>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useContainerDimensions(containerRef);
  const mousePos = useMousePosition(containerRef);

  const config = useConfigStore();
  const { width = 0, height = 0 } = dimensions;

  const memoizedDimensions = useMemo(() => ({ width, height }), [width, height]);
  const memoizedMousePos = useMemo(() => mousePos, [mousePos.x, mousePos.y]);
  const shapeParams = useMemo(() => config.shapeParams, [JSON.stringify(config.shapeParams)]);

  const { vectors, hybridConfig, layoutInfo } = useVectorGrid({
    dimensions: memoizedDimensions,
    gridSize: config.gridSize,
    gridPattern: config.gridPattern,
    rows: config.rows,
    cols: config.cols,
    spacing: config.spacing,
    gridScale: config.gridScale,
    fibonacciDensity: config.fibonacciDensity,
    fibonacciRadius: config.fibonacciRadius,
    fibonacciAngle: config.fibonacciAngle,
    radialPatternBias: config.radialPatternBias,
    radialMaxRadius: config.radialMaxRadius,
    polarDistribution: config.polarDistribution,
    polarRadialBias: config.polarRadialBias,
    goldenExpansion: config.goldenExpansion,
    goldenRotation: config.goldenRotation,
    goldenCompression: config.goldenCompression,
    spiralTightness: config.spiralTightness,
    spiralArms: config.spiralArms,
    spiralStartRadius: config.spiralStartRadius,
    hexagonalSpacing: config.hexagonalSpacing,
    hexagonalOffset: config.hexagonalOffset,
    concentricSquaresNumSquares: config.concentricSquaresNumSquares,
    concentricSquaresRotation: config.concentricSquaresRotation,
    voronoiSeed: config.voronoiSeed,
  });

  const animatedVectors = useVectorAnimation({
    vectors,
    layout: layoutInfo,
    dimensions: memoizedDimensions,
    mousePos: memoizedMousePos,
    ...config, 
    shapeParams,
  });

  const adaptedVectors = useMemo((): SimpleVector[] => {
    return animatedVectors.map((v: Vector) => ({
      id: v.id,
      x: v.x,
      y: v.y,
      angle: v.angle,
      length: v.length,
      width: shapeParams.strokeWidth || 1,
      color: v.color,
      opacity: 1, // Default opacity
      shape: config.vectorShape,
      originalX: v.x,
      originalY: v.y,
      originalAngle: v.initialAngle,
      gridRow: 0, 
      gridCol: 0,
      rotationOrigin: config.rotationOrigin,
    }));
  }, [animatedVectors, shapeParams, config.vectorShape, config.rotationOrigin]);


  if (!width || !height) {
    return <div ref={containerRef} className="w-full h-full" style={{ backgroundColor: config.backgroundColor }} />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center overflow-hidden ${className || ''}`}
      style={{ backgroundColor: config.backgroundColor || '#000000' }}
    >
      <FastSvgRenderer
        vectors={adaptedVectors}
        width={hybridConfig.effectiveCanvasWidth}
        height={hybridConfig.effectiveCanvasHeight}
        backgroundColor={config.backgroundColor || '#000000'}
        baseVectorWidth={shapeParams.strokeWidth || 1}
        baseRotationOrigin={config.rotationOrigin || 'start'}
      />
    </div>
  );
});

FlynVectorGrid.displayName = 'FlynVectorGrid';

export { FlynVectorGrid };

export default FlynVectorGrid;
