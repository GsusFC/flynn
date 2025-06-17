import type { GridRequest, LayoutResult } from './types';
import { generateRegular } from './patterns/regular';
import { generateStaggeredPattern } from './patterns/staggered';
import { centerPoints } from './utils';
import { generateFibonacci } from './patterns/fibonacci';
import { generateHexagonal } from './patterns/hexagonal';
import { generateRadial } from './patterns/radial';
import { generatePolar } from './patterns/polar';
import { generateGolden } from './patterns/golden';
import { generateLogSpiral } from './patterns/logSpiral';
import { generateTriangular } from './patterns/triangular';
import { generateConcentricSquares } from './patterns/concentricSquares';
import { generateVoronoiPattern } from './patterns/voronoi';

/**
 * Genera el layout de la cuadrícula según la petición.
 * De momento soporta únicamente:
 *  - modo basic con patrón 'regular'
 */
export function generateGridLayout(req: GridRequest): LayoutResult {
  const { container } = req;
  let pts: ReturnType<typeof generateRegular> = [];
  let rows: number | undefined;
  let cols: number | undefined;
  let spacing: number | undefined;

  if (req.mode === 'basic') {
    const r = req.rows ?? 1;
    const c = req.cols ?? 1;
    
    const availableWidth = container.width - 2 * (container.margin ?? 0);
    const availableHeight = container.height - 2 * (container.margin ?? 0);
    
    const spacingX = c > 1 ? availableWidth / (c - 1) : availableWidth;
    const spacingY = r > 1 ? availableHeight / (r - 1) : availableHeight;
    const baseSpacing = req.spacingOverride ?? Math.min(spacingX, spacingY);

    switch (req.pattern) {
      case 'regular':
        pts = generateRegular({
          rows: r,
          cols: c,
          spacing: baseSpacing,
        });
        break;
      case 'staggered':
        pts = generateStaggeredPattern({
          rows: r,
          cols: c,
          spacing: baseSpacing,
        });
        break;
      default:
        // fallback a regular
        pts = generateRegular({
          rows: r,
          cols: c,
          spacing: baseSpacing,
        });
        break;
    }

    rows = r;
    cols = c;
    spacing = baseSpacing;
    
  } else if (req.mode === 'math') {
    const cnt = req.count ?? 0;
    if (req.pattern === 'fibonacci') {
      pts = generateFibonacci({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        density: req.patternParams?.density as number | undefined,
        radiusFactor: req.patternParams?.radiusFactor as number | undefined,
        angleDeg: req.patternParams?.angleDeg as number | undefined,
      });
    } else if (req.pattern === 'hexagonal') {
      pts = generateHexagonal({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        spacingMultiplier: req.patternParams?.spacingMultiplier as number | undefined,
        offsetFactor: req.patternParams?.offsetFactor as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'radial') {
      pts = generateRadial({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        radialBias: req.patternParams?.radialBias as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'polar') {
      pts = generatePolar({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        distribution: req.patternParams?.distribution as any,
        radialBias: req.patternParams?.radialBias as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'golden') {
      pts = generateGolden({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        expansion: req.patternParams?.expansion as number | undefined,
        rotation: req.patternParams?.rotation as number | undefined,
        compression: req.patternParams?.compression as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'logSpiral') {
      pts = generateLogSpiral({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        tightness: req.patternParams?.tightness as number | undefined,
        arms: req.patternParams?.arms as number | undefined,
        startRadius: req.patternParams?.startRadius as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'triangular') {
      pts = generateTriangular({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        margin: container.margin,
      });
    } else if (req.pattern === 'concentricSquares') {
      pts = generateConcentricSquares({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        numSquares: req.patternParams?.numSquares as number | undefined,
        rotation: req.patternParams?.rotation as number | undefined,
        margin: container.margin,
      });
    } else if (req.pattern === 'voronoi') {
      pts = generateVoronoiPattern({
        count: cnt,
        containerWidth: container.width,
        containerHeight: container.height,
        margin: container.margin,
        seed: req.patternParams?.seed as number | undefined,
      });
    } else {
      console.warn('[gridEngine] patrón math no soportado aún:', req.pattern);
    }
  } else {
    // modo math aún no implementado en motor nuevo
    console.warn('[gridEngine] patrón no soportado aún:', req.pattern);
  }

  // Asegurar centrado definitivo (por si el patrón no lo hiciera)
  const centered = centerPoints(pts, container.width, container.height);

  // Extraer información estructural para devolverla
  const layoutInfo: Partial<LayoutResult> = {};
  if (pts[0]) {
    if (pts[0].row !== undefined) layoutInfo.rows = Math.max(...pts.map(p => p.row!)) + 1;
    if (pts[0].col !== undefined) layoutInfo.cols = Math.max(...pts.map(p => p.col!)) + 1;
    if (pts[0].ring !== undefined) layoutInfo.rings = Math.max(...pts.map(p => p.ring!)) + 1;
    if (pts[0].line !== undefined) layoutInfo.lines = Math.max(...pts.map(p => p.line!)) + 1;
    if (pts[0].arm !== undefined) layoutInfo.arms = Math.max(...pts.map(p => p.arm!)) + 1;
  }
  if (spacing) layoutInfo.spacing = spacing;

  return { points: centered, ...layoutInfo };
} 