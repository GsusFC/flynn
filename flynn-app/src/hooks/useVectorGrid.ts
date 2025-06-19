'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getCustomGradient } from '@/lib/customGradients';
import { GRADIENT_PRESETS } from '@/domain/color/ColorPresets';
import type { ExtendedVectorColorValue } from '@/components/features/vector-grid/types/gradientTypes';
import type { Vector } from '../animations/types';
import { generateGridLayout } from '@/gridEngine/engine';
import type { GridRequest, LayoutResult } from '@/gridEngine/types';

// Las props que el hook necesita del componente principal
interface UseVectorGridProps {
  gridMode?: 'basic' | 'math';
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
  radialPatternBias?: number;
  radialMaxRadius?: number;
  polarDistribution?: 'uniform' | 'logarithmic';
  polarRadialBias?: number;
  goldenExpansion?: number;
  goldenRotation?: number;
  goldenCompression?: number;
  spiralTightness?: number;
  spiralArms?: number;
  spiralStartRadius?: number;
  hexagonalSpacing?: number;
  hexagonalOffset?: number;
  concentricSquaresNumSquares?: number;
  concentricSquaresRotation?: number;
  voronoiSeed?: number;
}

export const useVectorGrid = ({
  gridMode = 'math',
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
  radialPatternBias,
  radialMaxRadius,
  polarDistribution,
  polarRadialBias,
  goldenExpansion,
  goldenRotation,
  goldenCompression,
  spiralTightness,
  spiralArms,
  spiralStartRadius,
  hexagonalSpacing,
  hexagonalOffset,
  concentricSquaresNumSquares,
  concentricSquaresRotation,
  voronoiSeed,
}: UseVectorGridProps) => {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [layoutInfo, setLayoutInfo] = useState<LayoutResult | null>(null);

  const hybridConfig = useMemo(() => {
    const hasHybridProps = !!(rows || cols || spacing || canvasWidth || canvasHeight);
    
    const containerSize = Math.min(dimensions.width, dimensions.height);
    
    const fallbackDim = gridSize ? Math.round(Math.sqrt(gridSize)) : 0;
    
    const baseSpacing = fallbackDim > 0 ? containerSize / (fallbackDim + 1) : containerSize;

    // Debug log to see what's happening with hybrid config
    console.log('🔧 useVectorGrid hybridConfig:', {
      gridSize,
      hasHybridProps,
      fallbackDim,
      rows,
      cols,
      spacing,
      canvasWidth,
      canvasHeight
    });
    
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

  const gradientStops = useMemo(() => {
    if (colorMode !== 'gradient' || !gradientPalette) return null;
    
    let stops = GRADIENT_PRESETS[gradientPalette]?.stops;
    if (!stops) {
      const custom = getCustomGradient(gradientPalette);
      if (custom) {
        stops = custom.gradient.stops;
      }
    }
    return stops ? [...stops].sort((a, b) => a.offset - b.offset) : null;
  }, [colorMode, gradientPalette]);

  const generateColor = useCallback((vectorIndex: number, totalVectors: number): string => {
    if (colorMode === 'gradient' && gradientStops) {
      const factor = totalVectors > 1 ? vectorIndex / (totalVectors - 1) : 0;
      let start = gradientStops[0];
      let end = gradientStops[gradientStops.length - 1];
      for (let i = 0; i < gradientStops.length - 1; i++) {
        if (factor >= gradientStops[i].offset && factor <= gradientStops[i + 1].offset) {
          start = gradientStops[i];
          end = gradientStops[i + 1];
          break;
        }
      }
      const t = end.offset > start.offset ? (factor - start.offset) / (end.offset - start.offset) : 0;
      return lerpColor(start.color, end.color, t);
    }
    return solidColor || '#000000';
  }, [colorMode, solidColor, gradientStops]);

  // helper to apply gridScale around center
  const centerX = hybridConfig.effectiveCanvasWidth / 2;
  const centerY = hybridConfig.effectiveCanvasHeight / 2;
  const scalePt = (pt: {x:number;y:number}) => ({
    x: centerX + (pt.x - centerX) * (gridScale ?? 1),
    y: centerY + (pt.y - centerY) * (gridScale ?? 1),
  });

  useEffect(() => {
    const { effectiveRows, effectiveCols, effectiveGridSize, effectiveCanvasWidth, effectiveCanvasHeight, effectiveSpacing } = hybridConfig;
    
    const isBasicMode = gridMode === 'basic';
    const isMathMode = gridMode === 'math';

    if (!isBasicMode && !isMathMode) {
      setVectors([]);
      return;
    }
    
    let req: GridRequest;

    if (isBasicMode) {
        req = {
            mode: 'basic',
            rows: effectiveRows,
            cols: effectiveCols,
            spacingOverride: effectiveSpacing * (gridScale ?? 1),
            container: { width: effectiveCanvasWidth, height: effectiveCanvasHeight, margin },
            pattern: gridPattern as string,
        };
    } else { // isMathMode
        let patternParams: Record<string, unknown> = {};
        switch(gridPattern) {
            case 'fibonacci':
                patternParams = { density: fibonacciDensity, radiusFactor: fibonacciRadius, angleDeg: fibonacciAngle };
                break;
            case 'hexagonal':
                patternParams = { spacingMultiplier: hexagonalSpacing, offsetFactor: hexagonalOffset };
                break;
            case 'radial':
                patternParams = { radialBias: radialPatternBias, maxRadiusFactor: radialMaxRadius };
                break;
            case 'polar':
                patternParams = { distribution: polarDistribution, radialBias: polarRadialBias };
                break;
            case 'golden':
                patternParams = { expansion: goldenExpansion, rotation: goldenRotation, compression: goldenCompression };
                break;
            case 'logSpiral':
                patternParams = { tightness: spiralTightness, arms: spiralArms, startRadius: spiralStartRadius };
                break;
            case 'triangular':
                // No specific params
                break;
            case 'concentricSquares':
                patternParams = { numSquares: concentricSquaresNumSquares, rotation: concentricSquaresRotation };
                break;
            case 'voronoi':
                patternParams = { seed: voronoiSeed };
                break;
        }

        req = {
            mode: 'math',
            count: effectiveGridSize,
            pattern: gridPattern as string,
            patternParams,
            container: { width: effectiveCanvasWidth, height: effectiveCanvasHeight, margin },
        };
    }

    const layout = generateGridLayout(req);

    const newVectors: Vector[] = layout.points.map((p, idx) => {
        const finalPoint = scalePt(p);
        const length = (lengthMin ?? 10) + Math.random() * ((lengthMax ?? 25) - (lengthMin ?? 10));
        return {
            id: `${gridPattern}-${idx}`,
            x: finalPoint.x,
            y: finalPoint.y,
            row: p.row,
            col: p.col,
            ring: p.ring,
            line: p.line,
            arm: p.arm,
            initialAngle: Math.atan2(finalPoint.y - centerY, finalPoint.x - centerX) + Math.PI / 2,
            angle: Math.atan2(finalPoint.y - centerY, finalPoint.x - centerX) + Math.PI / 2,
            length,
            initialLength: length,
            color: generateColor(idx, layout.points.length),
        };
    });

    setVectors(newVectors);
    setLayoutInfo(layout);

  }, [hybridConfig, gridPattern, gridScale, lengthMin, lengthMax, margin, solidColor, gradientStops, fibonacciDensity, fibonacciRadius, fibonacciAngle, radialPatternBias, radialMaxRadius, polarDistribution, polarRadialBias, goldenExpansion, goldenRotation, goldenCompression, spiralTightness, spiralArms, spiralStartRadius, hexagonalSpacing, hexagonalOffset, concentricSquaresNumSquares, concentricSquaresRotation, voronoiSeed, gridMode]);

  return { vectors, hybridConfig, layoutInfo };
}; 