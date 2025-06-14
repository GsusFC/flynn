'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { SimpleVectorGridRef, SimpleVector } from '@/components/features/vector-grid/simple/simpleTypes';
import { useVectorAnimation } from '@/hooks/useVectorAnimation';
import { useContainerDimensions } from '@/hooks/useContainerDimensions';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useVectorGrid } from '@/hooks/useVectorGrid';
import { FastSvgRenderer } from '@/components/vector/renderers/FastSvgRenderer';
import { useConfigStore } from '@/store/configStore';
import type { VectorShape } from '@/lib/shapeRegistry';
import { 
    generateWavePath, generateBezierPath, generateSpiralPath, 
    generateArcPath, generateOrganicPath, generateZigzagPath,
    generateDashPath, generateSpringPath, generateTriangleWavePath, generateDoublePath,
    calculateCoordsForOrigin
} from '@/app/dev/vector-path-utils';
import { isGradientConfig, generateGradientId, type GradientConfig, type ExtendedVectorColorValue } from '@/components/features/vector-grid/types/gradientTypes';

export interface Vector {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
  organicNoise?: number;
  // Animation Control
  isPaused?: boolean;
  // Vector Shape System
  vectorShape?: VectorShape;
  shapeParams?: Record<string, number>;
  rotationOrigin?: 'start' | 'center' | 'end';
}

export interface FlynVectorGridProps {
  canvasWidth?: number;
  canvasHeight?: number;
}

const FlynVectorGrid = forwardRef<SimpleVectorGridRef, FlynVectorGridProps>(({ 
  canvasWidth,
  canvasHeight,
}, ref) => {
  // Selectores individuales para máxima optimización y seguridad de tipos
  const gridSize = useConfigStore(state => state.gridSize);
  const rows = useConfigStore(state => state.rows);
  const cols = useConfigStore(state => state.cols);
  const spacing = useConfigStore(state => state.spacing);
  const gridScale = useConfigStore(state => state.gridScale ?? 1);
  const gridPattern = useConfigStore(state => state.gridPattern);
  const colorMode = useConfigStore(state => state.colorMode);
  const solidColor = useConfigStore(state => state.solidColor);
  const gradientPalette = useConfigStore(state => state.gradientPalette);
  const lengthMin = useConfigStore(state => state.lengthMin);
  const lengthMax = useConfigStore(state => state.lengthMax);
  const isPaused = useConfigStore(state => state.isPaused);
  const animation = useConfigStore(state => state.animation);
  const speed = useConfigStore(state => state.speed);
  const intensity = useConfigStore(state => state.intensity);
  const oscillationFreq = useConfigStore(state => state.oscillationFreq);
  const oscillationAmp = useConfigStore(state => state.oscillationAmp);
  const spatialFactor = useConfigStore(state => state.spatialFactor);
  const spatialMode = useConfigStore(state => state.spatialMode);
  const mouseInfluence = useConfigStore(state => state.mouseInfluence);
  const mouseMode = useConfigStore(state => state.mouseMode);
  const physicsMode = useConfigStore(state => state.physicsMode);
  const colorIntensityMode = useConfigStore(state => state.colorIntensityMode);
  const colorHueShift = useConfigStore(state => state.colorHueShift);
  const colorSaturation = useConfigStore(state => state.colorSaturation);
  const colorBrightness = useConfigStore(state => state.colorBrightness);
  const shapeParams = useConfigStore(state => state.shapeParams);
  const rotationOrigin = useConfigStore(state => state.rotationOrigin);
  const backgroundColor = useConfigStore(state => state.backgroundColor);
  const vectorShape = useConfigStore(state => state.vectorShape);

  // Estado local para gestionar el evento del pulso
  const [pulseState, setPulseState] = useState({ active: false, startTime: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useContainerDimensions(containerRef, canvasWidth, canvasHeight);
  const mousePos = useMousePosition(containerRef);

  const { vectors, hybridConfig } = useVectorGrid({
    gridSize, rows, cols, spacing, dimensions, gridPattern,
    margin: 20,
    gridScale,
    colorMode, solidColor, gradientPalette, lengthMin, lengthMax,
  });
  
  const animatedVectors = useVectorAnimation({
    vectors, dimensions, mousePos, isPaused, animation, speed, intensity,
    lengthMin, lengthMax, oscillationFreq, oscillationAmp,
    pulseSpeed: 1, 
    spatialFactor, spatialMode, mouseInfluence, mouseMode, physicsMode,
    colorMode, colorIntensityMode, colorHueShift, colorSaturation,
    colorBrightness, gradientPalette, shapeParams,
    pulseState, // Pasamos el estado del pulso a la animación
  });

  const adaptedVectors: SimpleVector[] = animatedVectors.map((v, i) => {
    const angleInDegrees = (v.angle * 180 / Math.PI);
    return {
      id: v.id,
      x: v.x,
      y: v.y,
      angle: angleInDegrees,
      color: v.color,
      opacity: 1,
      length: v.length,
      dynamicLength: v.length,
      width: 1.5,
      dynamicWidth: 1.5,
      originalX: v.x,
      originalY: v.y,
      lengthFactor: v.length / lengthMax,
      widthFactor: 1,
      rotationOrigin,
      shape: vectorShape,
      originalAngle: angleInDegrees, 
      gridRow: Math.floor(i / (hybridConfig.effectiveCols > 0 ? hybridConfig.effectiveCols : 1)),
      gridCol: i % (hybridConfig.effectiveCols > 0 ? hybridConfig.effectiveCols : 1),
      ...shapeParams
    };
  });

  const lastRenderedFrameRef = useRef<SimpleVector[]>([]);
  useEffect(() => {
    lastRenderedFrameRef.current = animatedVectors as SimpleVector[];
  }, [animatedVectors]);

  const globalSetConfig = useConfigStore.getState().setConfig;

  // Función para activar el pulso
  const triggerPulseOnce = () => {
    if (animation !== 'pulse') return;
    setPulseState({ active: true, startTime: Date.now() / 1000 });
  };

  // useEffect para desactivar el pulso después de un tiempo
  useEffect(() => {
    if (pulseState.active) {
      const DURATION = 2000; // El pulso vive por 2 segundos
      const timer = setTimeout(() => {
        setPulseState({ active: false, startTime: 0 });
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [pulseState]);

  useImperativeHandle(ref, () => ({
    triggerPulse: triggerPulseOnce,
    togglePause: () => {},
    getVectors: () => vectors.map(v => ({...v} as SimpleVector)),
    getCurrentVectors: () => lastRenderedFrameRef.current,
    resetVectors: () => {},
    exportSVG: async () => {
      if (!svgRef.current) {
        return { data: '', filename: 'error.svg' };
      }
      const svgContent = new XMLSerializer().serializeToString(svgRef.current);
      return { data: svgContent, filename: 'flynn-grid.svg' };
    },
    exportAnimatedSVG: async () => ({ data: '<svg></svg>', filename: 'animated.svg' }),
    exportGIF: async () => new Blob(),
    detectAnimationCycle: () => ({ duration: 1000, frameCount: 60, isDetected: false })
  }), [vectors, animatedVectors, hybridConfig, backgroundColor, rotationOrigin, vectorShape, shapeParams, animation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: backgroundColor || '#000000' }}
    >
      <FastSvgRenderer
        ref={svgRef}
        vectors={adaptedVectors}
        width={hybridConfig.effectiveCanvasWidth}
        height={hybridConfig.effectiveCanvasHeight}
        backgroundColor={backgroundColor || '#000000'}
        baseVectorWidth={1.5}
        baseRotationOrigin={rotationOrigin}
      />
    </div>
  );
});

FlynVectorGrid.displayName = 'FlynVectorGrid';

export default FlynVectorGrid;
