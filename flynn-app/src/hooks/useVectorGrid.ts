'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCustomGradient } from '@/lib/customGradients';
import { GRADIENT_PRESETS } from '@/domain/color/ColorPresets';
import type { Vector } from '@/app/dev/FlynVectorGrid'; // Dependencia temporal

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
  dimensions: { width: number; height: number };
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
  dimensions,
}: UseVectorGridProps) => {
  const [vectors, setVectors] = useState<Vector[]>([]);

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
      return {
        mode: 'hybrid' as const,
        effectiveGridSize: Math.round(effectiveRows * effectiveCols),
        effectiveRows,
        effectiveCols,
        effectiveSpacing: spacing || baseSpacing,
        effectiveCanvasWidth: canvasWidth || dimensions.width,
        effectiveCanvasHeight: canvasHeight || dimensions.height,
      };
    }
  }, [gridSize, rows, cols, spacing, canvasWidth, canvasHeight, dimensions.width, dimensions.height]);
  
  const generateColor = useCallback((vectorIndex: number, totalVectors: number): string => {
    if (colorMode === 'gradient' && gradientPalette) {
      // Primero buscar en los presets predefinidos
      const presetGradient = GRADIENT_PRESETS[gradientPalette];
      if (presetGradient) {
        const stops = presetGradient.stops.sort((a, b) => a.offset - b.offset);
        if (stops.length === 0) return solidColor || '#000000';
        if (stops.length === 1) return stops[0].color;

        let factor = totalVectors > 1 ? vectorIndex / (totalVectors - 1) : 0;
        
        let startStop = stops[0];
        let endStop = stops[stops.length - 1];

        for (let i = 0; i < stops.length - 1; i++) {
          if (factor >= stops[i].offset && factor <= stops[i+1].offset) {
            startStop = stops[i];
            endStop = stops[i+1];
            break;
          }
        }
        
        const t = endStop.offset > startStop.offset 
          ? (factor - startStop.offset) / (endStop.offset - startStop.offset) 
          : 0;

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
        
        return lerpColor(startStop.color, endStop.color, t);
      }

      // Si no está en los presets, buscar en los gradientes personalizados
      const customGradient = getCustomGradient(gradientPalette);
      if (customGradient) {
        const stops = customGradient.gradient.stops.sort((a, b) => a.offset - b.offset);
        if (stops.length === 0) return solidColor || '#000000';
        if (stops.length === 1) return stops[0].color;

        let factor = totalVectors > 1 ? vectorIndex / (totalVectors - 1) : 0;
        
        let startStop = stops[0];
        let endStop = stops[stops.length - 1];

        for (let i = 0; i < stops.length - 1; i++) {
          if (factor >= stops[i].offset && factor <= stops[i+1].offset) {
            startStop = stops[i];
            endStop = stops[i+1];
            break;
          }
        }
        
        const t = endStop.offset > startStop.offset 
          ? (factor - startStop.offset) / (endStop.offset - startStop.offset) 
          : 0;

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
        
        return lerpColor(startStop.color, endStop.color, t);
      }
    }
    return solidColor || '#000000';
  }, [colorMode, solidColor, gradientPalette]);

  const generateVectors = useCallback((pattern: string, count: number) => {
    if (!count || count <= 0 || isNaN(count)) {
      return [];
    }

    const newVectors: Vector[] = [];
    const { effectiveRows = 0, effectiveCols = 0, effectiveSpacing, effectiveCanvasWidth: canvasW, effectiveCanvasHeight: canvasH } = hybridConfig;
    const padding = Math.max(lengthMax || 0, 50);
    const contentArea = {
      x: padding, y: padding, width: canvasW - 2 * padding, height: canvasH - 2 * padding,
      centerX: canvasW / 2, centerY: canvasH / 2
    };
    const gridWidth = (effectiveCols - 1) * effectiveSpacing;
    const gridHeight = (effectiveRows - 1) * effectiveSpacing;
    const gridStartX = contentArea.x + (contentArea.width - gridWidth) / 2;
    const gridStartY = contentArea.y + (contentArea.height - gridHeight) / 2;

    for (let i = 0; i < count; i++) {
      let x, y;
      switch (pattern) {
        case 'hexagonal':
          const row = Math.floor(i / effectiveCols);
          const col = i % effectiveCols;
          const offsetX = (row % 2) * (effectiveSpacing / 2);
          x = gridStartX + col * effectiveSpacing + offsetX;
          y = gridStartY + row * effectiveSpacing * 0.866;
          break;
        case 'fibonacci':
          if (count === 0) break;
          const goldenAngle = Math.PI * (3 - Math.sqrt(5));
          const fibRadius = Math.min(contentArea.width, contentArea.height) / 3 * Math.sqrt(i / count);
          const fibAngle = i * goldenAngle;
          x = contentArea.centerX + Math.cos(fibAngle) * fibRadius;
          y = contentArea.centerY + Math.sin(fibAngle) * fibRadius;
          break;
        case 'radial':
          if (count === 0) break;
          const numRings = Math.ceil(Math.sqrt(count / Math.PI));
          const ringIndex = Math.floor(Math.sqrt(i * Math.PI));
          const pointsInRing = Math.max(1, Math.round(2 * Math.PI * ringIndex));
          const angleInRing = (i % pointsInRing) * (2 * Math.PI / pointsInRing);
          const radiusInRing = (ringIndex / numRings) * Math.min(contentArea.width, contentArea.height) / 2.5;
          x = contentArea.centerX + Math.cos(angleInRing) * radiusInRing;
          y = contentArea.centerY + Math.sin(angleInRing) * radiusInRing;
          break;
        case 'staggered':
          const staggeredRow = Math.floor(i / effectiveCols);
          const staggeredCol = i % effectiveCols;
          const staggerOffset = (staggeredRow % 2) * (effectiveSpacing / 4);
          x = gridStartX + staggeredCol * effectiveSpacing + staggerOffset;
          y = gridStartY + staggeredRow * effectiveSpacing;
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
          const goldenRadius = Math.sqrt(i) * Math.min(contentArea.width, contentArea.height) / (2 * Math.sqrt(count));
          const goldenAnglePos = i * goldenAngleRad;
          x = contentArea.centerX + Math.cos(goldenAnglePos) * goldenRadius;
          y = contentArea.centerY + Math.sin(goldenAnglePos) * goldenRadius;
          break;
        case 'polar':
          const numRingsPolar = Math.ceil(Math.sqrt(count / 8));
          const numRadialLines = Math.ceil(count / numRingsPolar);
          const ringIndexPolar = Math.floor(i / numRadialLines);
          const radialIndexPolar = i % numRadialLines;
          const maxRadiusPolar = Math.min(contentArea.width, contentArea.height) / 2.2;
          const radiusPolar = (ringIndexPolar + 0.5) * (maxRadiusPolar / numRingsPolar);
          const anglePolar = (radialIndexPolar / numRadialLines) * 2 * Math.PI;
          x = contentArea.centerX + Math.cos(anglePolar) * radiusPolar;
          y = contentArea.centerY + Math.sin(anglePolar) * radiusPolar;
          break;
        case 'logSpiral':
          if (count === 0) break;
          const tightness = 0.2;
          const startRadius = 5;
          const numArms = 2;
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
        default: // regular
          const rowReg = Math.floor(i / effectiveCols);
          const colReg = i % effectiveCols;
          x = gridStartX + colReg * effectiveSpacing;
          y = gridStartY + rowReg * effectiveSpacing;
      }
      const finalX = Math.max(margin || 0, Math.min(canvasW - (margin || 0), x || 0));
      const finalY = Math.max(margin || 0, Math.min(canvasH - (margin || 0), y || 0));
      newVectors.push({
        id: `vector-${i}`, x: finalX, y: finalY, angle: i * 0.5,
        length: (lengthMin || 10) + ((lengthMax || 25) - (lengthMin || 10)) * 0.5,
        color: generateColor(i, count)
      });
    }
    return newVectors;
  }, [hybridConfig, margin, lengthMin, lengthMax, generateColor]);

  useEffect(() => {
    if(hybridConfig.effectiveGridSize > 0) {
      setVectors(generateVectors(gridPattern || 'regular', hybridConfig.effectiveGridSize));
    }
  }, [gridPattern, hybridConfig.effectiveGridSize, generateVectors]);

  return { vectors, hybridConfig };
}; 