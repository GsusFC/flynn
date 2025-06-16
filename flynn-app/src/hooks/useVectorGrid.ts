'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getCustomGradient } from '@/lib/customGradients';
import { GRADIENT_PRESETS } from '@/domain/color/ColorPresets';
import type { ExtendedVectorColorValue } from '@/components/features/vector-grid/types/gradientTypes';
import type { Vector } from '../animations/types';

// Las props que el hook necesita del componente principal
interface UseVectorGridProps {
  gridSize?: number;
  gridPattern?: 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar' | 'logSpiral' | 'concentricSquares';
  rows?: number;
  cols?: number;
  spacing?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  margin?: number;
  colorMode?: 'solid' | 'gradient' | 'dynamic';
  solidColor?: string;
  gradientPalette?: string;
  lengthMin?: number;
  lengthMax?: number;
  gridScale?: number;
  dimensions: { width: number; height: number };
  
  // Pattern-specific parameters
  fibonacciDensity?: number;
  fibonacciRadius?: number;
  fibonacciAngle?: number;
  radialRings?: number;
  radialVectorsPerRing?: number;
  radialMaxRadius?: number;
  polarRadialLines?: number;
  polarRings?: number;
  polarDistribution?: 'uniform' | 'logarithmic';
  goldenExpansion?: number;
  goldenRotation?: number;
  goldenCompression?: number;
  spiralTightness?: number;
  spiralArms?: number;
  spiralStartRadius?: number;
  hexagonalSpacing?: number;
  hexagonalOffset?: number;
}

export const useVectorGrid = ({
  gridSize = 25,
  gridPattern = 'regular',
  rows,
  cols,
  spacing,
  canvasWidth,
  canvasHeight,
  margin = 20,
  colorMode = 'solid',
  solidColor = '#3b82f6',
  gradientPalette = 'flow',
  lengthMin = 10,
  lengthMax = 25,
  gridScale = 1,
  dimensions,
  fibonacciDensity,
  fibonacciRadius,
  fibonacciAngle,
  radialRings,
  radialVectorsPerRing,
  radialMaxRadius,
  polarRadialLines,
  polarRings,
  polarDistribution,
  goldenExpansion,
  goldenRotation,
  goldenCompression,
  spiralTightness,
  spiralArms,
  spiralStartRadius,
  hexagonalSpacing,
  hexagonalOffset,
}: UseVectorGridProps) => {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const prevCountRef = useRef<number>(0);

  const hybridConfig = useMemo(() => {
    const hasHybridProps = !!(rows || cols || spacing || canvasWidth || canvasHeight);
    
    const containerSize = Math.min(dimensions.width, dimensions.height);
    
    const fallbackDim = gridSize ? Math.round(Math.sqrt(gridSize)) : 0;
    
    const baseSpacing = fallbackDim > 0 ? containerSize / (fallbackDim + 1) : containerSize;
    
    if (!hasHybridProps) {
      return {
        mode: 'auto' as const,
        effectiveGridSize: gridSize,
        effectiveRows: fallbackDim,
        effectiveCols: fallbackDim,
        effectiveSpacing: baseSpacing,
        effectiveCanvasWidth: dimensions.width,
        effectiveCanvasHeight: dimensions.height,
      };
    } else {
      const effectiveRows = rows || fallbackDim;
      const effectiveCols = cols || fallbackDim;
      const calculatedSpacing = spacing && spacing > 0 ? spacing : (containerSize / (Math.max(effectiveRows, effectiveCols) + 1));
      return {
        mode: 'hybrid' as const,
        effectiveGridSize: Math.round(effectiveRows * effectiveCols),
        effectiveRows,
        effectiveCols,
        effectiveSpacing: calculatedSpacing,
        effectiveCanvasWidth: canvasWidth || dimensions.width,
        effectiveCanvasHeight: canvasHeight || dimensions.height,
      };
    }
  }, [gridSize, rows, cols, spacing, canvasWidth, canvasHeight, dimensions.width, dimensions.height]);
  
  // Helper de interpolación de color a nivel de módulo (evita reinstanciar)
  const lerpColor = (colorA: string, colorB: string, amount: number): string => {
    const from = parseInt(colorA.slice(1), 16);
    const to = parseInt(colorB.slice(1), 16);
    const ar = (from >> 16) & 0xff, ag = (from >> 8) & 0xff, ab = from & 0xff;
    const br = (to >> 16) & 0xff, bg = (to >> 8) & 0xff, bb = to & 0xff;
    const rr = Math.round(ar + (br - ar) * amount);
    const rg = Math.round(ag + (bg - ag) * amount);
    const rb = Math.round(ab + (bb - ab) * amount);
    return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1).padStart(6, '0')}`;
  };

  const generateColor = useCallback((vectorIndex: number, totalVectors: number): string => {
    if(colorMode==='gradient' && gradientPalette){
      // Get fresh gradient data each time to avoid dependency issues
      let currentStops = null;
      if (GRADIENT_PRESETS[gradientPalette]) {
        currentStops = [...GRADIENT_PRESETS[gradientPalette].stops].sort((a,b)=>a.offset-b.offset);
      } else {
        const custom = getCustomGradient(gradientPalette);
        if (custom) {
          currentStops = [...custom.gradient.stops].sort((a,b)=>a.offset-b.offset);
        }
      }
      
      if (currentStops) {
        const factor = totalVectors>1 ? vectorIndex/(totalVectors-1) : 0;
        let start=currentStops[0];
        let end=currentStops[currentStops.length-1];
        for(let i=0;i<currentStops.length-1;i++){
          if(factor>=currentStops[i].offset && factor<=currentStops[i+1].offset){
            start=currentStops[i]; end=currentStops[i+1]; break;
          }
        }
        const t=end.offset>start.offset? (factor-start.offset)/(end.offset-start.offset):0;
        return lerpColor(start.color,end.color,t);
      }
    }
    return solidColor || '#000000';
  }, [colorMode, gradientPalette, solidColor]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Debug] useVectorGrid effect triggered');
    }
    const count = hybridConfig.effectiveGridSize;
    if (!count || count <= 0 || isNaN(count)) {
      if (typeof window !== 'undefined') console.log('[Debug] Early exit: invalid count', count);
      setVectors([]);
      return;
    }
    
    if (count === prevCountRef.current && vectors.length > 0) {
      if (typeof window !== 'undefined') console.log('[Debug] Early exit: count unchanged', {count, vectorsLen: vectors.length});
      return;
    }
    if (typeof window !== 'undefined') console.log('[Debug] Generating new vectors', {count, prevCount: prevCountRef.current, vectorsLen: vectors.length});
    prevCountRef.current = count;

    const newVectors: Vector[] = [];
    const { effectiveRows = 0, effectiveCols = 0, effectiveSpacing, effectiveCanvasWidth: canvasW, effectiveCanvasHeight: canvasH } = hybridConfig;
    const spacingScaled = effectiveSpacing * (gridScale ?? 1);
    const padding = Math.max(lengthMax ?? 0, 50);
    const contentArea = {
      x: padding, y: padding, width: canvasW - 2 * padding, height: canvasH - 2 * padding,
      centerX: canvasW / 2, centerY: canvasH / 2
    };
    const gridWidth = (effectiveCols - 1) * spacingScaled;
    const gridHeight = (effectiveRows - 1) * spacingScaled;
    const gridStartX = contentArea.x + (contentArea.width - gridWidth) / 2;
    const gridStartY = contentArea.y + (contentArea.height - gridHeight) / 2;

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0;
      
      switch (gridPattern) {
        case 'regular':
          x = gridStartX + (i % effectiveCols) * spacingScaled;
          y = gridStartY + Math.floor(i / effectiveCols) * spacingScaled;
          break;
        
        case 'fibonacci':
          const n = i + 1;
          const angle = n * (fibonacciAngle ?? 137.5) * (Math.PI / 180);
          const radius = (fibonacciDensity ?? 1.0) * Math.sqrt(n) * ((contentArea.width / Math.sqrt(count)) / 2);
          const maxR = contentArea.width / 2 * (fibonacciRadius ?? 0.8);
          if (radius <= maxR) {
            x = contentArea.centerX + Math.cos(angle) * radius;
            y = contentArea.centerY + Math.sin(angle) * radius;
          }
          break;

        case 'hexagonal':
          const row = Math.floor(i / effectiveCols);
          const col = i % effectiveCols;
          const hexSpacing = spacingScaled * (hexagonalSpacing ?? 1.0);
          const hexOffset = (hexagonalOffset ?? 0.5);
          const offsetX = (row % 2) * (hexSpacing * hexOffset);
          x = gridStartX + col * hexSpacing + offsetX;
          y = gridStartY + row * hexSpacing * 0.866;
          break;

        case 'radial':
          if (count === 0) break;
          const numRingsRadial = radialRings ?? Math.ceil(Math.sqrt(count / Math.PI));
          const vectorsPerRing = radialVectorsPerRing ?? Math.max(1, Math.round(2 * Math.PI * (Math.floor(i / numRingsRadial) + 1)));
          const ringIndex = Math.floor(i / vectorsPerRing) % numRingsRadial;
          const pointsInRing = vectorsPerRing;
          const angleInRing = (i % pointsInRing) * (2 * Math.PI / pointsInRing);
          const maxRadiusRadial = Math.min(contentArea.width, contentArea.height) / 2.5 * (radialMaxRadius ?? 0.9);
          const radiusInRing = ((ringIndex + 1) / numRingsRadial) * maxRadiusRadial;
          x = contentArea.centerX + Math.cos(angleInRing) * radiusInRing;
          y = contentArea.centerY + Math.sin(angleInRing) * radiusInRing;
          break;

        case 'staggered':
          const staggeredRow = Math.floor(i / effectiveCols);
          const staggeredCol = i % effectiveCols;
          const staggerOffset = (staggeredRow % 2) * (spacingScaled / 4);
          x = gridStartX + staggeredCol * spacingScaled + staggerOffset;
          y = gridStartY + staggeredRow * spacingScaled;
          break;

        case 'triangular':
          const triCols = Math.ceil(Math.sqrt(count * 1.2));
          const triRowIndex = Math.floor(i / triCols);
          const triColIndex = i % triCols;
          const triSpacingX = contentArea.width / (triCols + 1);
          const triSpacingY = triSpacingX * Math.sqrt(3) / 2;
          const rowOffset = (triRowIndex % 2) * triSpacingX / 2;
          x = contentArea.x + triSpacingX + triColIndex * triSpacingX + rowOffset;
          y = contentArea.y + triSpacingY + triRowIndex * triSpacingY;
          break;

        case 'voronoi':
          const seed1 = (i * 73 + 37) % 997;
          const seed2 = (i * 179 + 83) % 991;
          x = contentArea.x + (seed1 / 997) * contentArea.width;
          y = contentArea.y + (seed2 / 991) * contentArea.height;
          break;

        case 'golden':
          if (count === 0) break;
          const goldenRatio = (1 + Math.sqrt(5)) / 2;
          const goldenAngleRad = 2 * Math.PI / goldenRatio;
          const expansionFactor = goldenExpansion ?? 1.0;
          const rotationOffset = (goldenRotation ?? 0) * Math.PI / 180;
          const compressionFactor = goldenCompression ?? 1.0;
          const goldenRadius = Math.sqrt(i) * Math.min(contentArea.width, contentArea.height) / (2 * Math.sqrt(count)) * expansionFactor * compressionFactor;
          const goldenAnglePos = i * goldenAngleRad + rotationOffset;
          x = contentArea.centerX + Math.cos(goldenAnglePos) * goldenRadius;
          y = contentArea.centerY + Math.sin(goldenAnglePos) * goldenRadius;
          break;

        case 'polar':
          const numRingsPolar = polarRings ?? Math.ceil(Math.sqrt(count / 8));
          const numRadialLines = polarRadialLines ?? Math.ceil(count / numRingsPolar);
          const ringIndexPolar = Math.floor(i / numRadialLines);
          const radialIndexPolar = i % numRadialLines;
          const maxRadiusPolar = Math.min(contentArea.width, contentArea.height) / 2.2;
          let radiusPolar;
          if (polarDistribution === 'logarithmic') {
            radiusPolar = maxRadiusPolar * Math.pow((ringIndexPolar + 1) / numRingsPolar, 1.5);
          } else {
            radiusPolar = (ringIndexPolar + 0.5) * (maxRadiusPolar / numRingsPolar);
          }
          const anglePolar = (radialIndexPolar / numRadialLines) * 2 * Math.PI;
          x = contentArea.centerX + Math.cos(anglePolar) * radiusPolar;
          y = contentArea.centerY + Math.sin(anglePolar) * radiusPolar;
          break;

        case 'logSpiral':
          if (count === 0) break;
          const tightness = spiralTightness ?? 0.2;
          const startRadius = spiralStartRadius ?? 5;
          const numArms = spiralArms ?? 2;
          const spiralProgress = i / count;
          const totalAngle = spiralProgress * 8 * Math.PI;
          const armOffset = (i % numArms) * (2 * Math.PI / numArms);
          const spiralAngle = totalAngle + armOffset;
          const spiralRadius = startRadius * Math.exp(tightness * spiralAngle);
          const maxRadius = Math.min(contentArea.width, contentArea.height) / 2.2;
          const normalizedRadius = Math.min(spiralRadius, maxRadius);
          x = contentArea.centerX + Math.cos(spiralAngle) * normalizedRadius;
          y = contentArea.centerY + Math.sin(spiralAngle) * normalizedRadius;
          break;

        case 'concentricSquares':
          if (count === 0) break;
          const maxSquareSize = Math.min(contentArea.width, contentArea.height) / 2.2;
          const numSquares = Math.ceil(Math.sqrt(count / 4));
          const vectorsPerSquare = Math.ceil(count / numSquares);
          const squareIndex = Math.floor(i / vectorsPerSquare);
          const positionInSquare = i % vectorsPerSquare;
          const squareSize = (squareIndex + 1) * (maxSquareSize / numSquares);
          const halfSize = squareSize / 2;
          const perimeter = 8 * halfSize;
          const sideLength = 2 * halfSize;
          const progress = (positionInSquare / vectorsPerSquare) * perimeter;
          let squareX = 0, squareY = 0;
          if (progress <= sideLength) {
            squareX = -halfSize + progress; squareY = -halfSize;
          } else if (progress <= 2 * sideLength) {
            squareX = halfSize; squareY = -halfSize + (progress - sideLength);
          } else if (progress <= 3 * sideLength) {
            squareX = halfSize - (progress - 2 * sideLength); squareY = halfSize;
          } else {
            squareX = -halfSize; squareY = halfSize - (progress - 3 * sideLength);
          }
          x = contentArea.centerX + squareX;
          y = contentArea.centerY + squareY;
          break;

        default:
          x = gridStartX + (i % effectiveCols) * spacingScaled;
          y = gridStartY + Math.floor(i / effectiveCols) * spacingScaled;
          break;
      }

      if (x > 0 && y > 0) {
        const length = (lengthMin ?? 10) + Math.random() * ((lengthMax ?? 25) - (lengthMin ?? 10));
        newVectors.push({
          id: `${gridPattern}-${i}`,
          x,
          y,
          initialAngle: Math.random() * 360,
          angle: 0,
          length,
          initialLength: length,
          color: generateColor(i, count),
        });
      }
    }

    // --- Ajuste final: centrar el bounding box de los vectores en el área de contenido ---
    if (newVectors.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const v of newVectors) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      }
      const bboxCenterX = (minX + maxX) / 2;
      const bboxCenterY = (minY + maxY) / 2;
      const offsetX = contentArea.centerX - bboxCenterX;
      const offsetY = contentArea.centerY - bboxCenterY;
      if (offsetX !== 0 || offsetY !== 0) {
        for (const v of newVectors) {
          v.x += offsetX;
          v.y += offsetY;
        }
      }
    }

    setVectors(newVectors);
  }, [
    gridPattern,
    hybridConfig.effectiveGridSize, hybridConfig.effectiveRows, hybridConfig.effectiveCols,
    hybridConfig.effectiveSpacing, hybridConfig.effectiveCanvasWidth, hybridConfig.effectiveCanvasHeight,
    gridScale, lengthMin, lengthMax,
    fibonacciAngle, fibonacciDensity, fibonacciRadius,
    radialRings, radialVectorsPerRing, radialMaxRadius,
    polarRadialLines, polarRings, polarDistribution,
    goldenExpansion, goldenRotation, goldenCompression,
    spiralTightness, spiralArms, spiralStartRadius,
    hexagonalSpacing, hexagonalOffset,
    solidColor, colorMode, gradientPalette
  ]);

  return { vectors, hybridConfig };
}; 