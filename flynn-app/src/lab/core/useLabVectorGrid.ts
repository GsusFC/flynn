"use client";

import { useState, useEffect, useMemo } from 'react';
import { LabVector } from './types';
import { createNoise3D } from 'simplex-noise';
import { generateGridLayout } from '@/gridEngine/engine';
import { GridRequest } from '@/gridEngine/types';

const noise3D = createNoise3D();

// Aceptamos todas las props de los controles de Leva
export interface UseLabVectorGridProps {
  rows: number;
  cols: number;
  spacing: number;
  pattern: string;
  depthAmplitude: number;
  noiseScale: number;
  fibonacciDensity?: number;
  radialBias?: number;
  spiralTightness?: number;
  spiralArms?: number;
  voronoiSeed?: number;
}

export const useLabVectorGrid = (props: UseLabVectorGridProps) => {
  const { 
    rows, cols, spacing, pattern, depthAmplitude, noiseScale, 
    fibonacciDensity, radialBias, spiralTightness, spiralArms, voronoiSeed
  } = props;

  const [vectors, setVectors] = useState<LabVector[]>([]);

  // Memoizamos los parámetros del patrón para evitar re-renders innecesarios
  const patternParams = useMemo(() => ({
    density: fibonacciDensity,
    radialBias: radialBias,
    tightness: spiralTightness,
    arms: spiralArms,
    seed: voronoiSeed,
  }), [fibonacciDensity, radialBias, spiralTightness, spiralArms, voronoiSeed]);

  useEffect(() => {
    const container = { width: 600, height: 600, margin: 20 };
    const count = rows * cols;

    // Log temporal para debug
    console.log('[useLabVectorGrid] Pattern selected:', pattern);
    console.log('[useLabVectorGrid] Grid params:', { rows, cols, spacing });

    let req: GridRequest;

    if (pattern === 'regular' || pattern === 'hexagonal') {
      req = {
        mode: 'basic',
        rows,
        cols,
        spacingOverride: spacing,
        container,
        pattern,
      };
    } else {
      req = {
        mode: 'math',
        count,
        pattern,
        patternParams,
        container,
      };
    }

    console.log('[useLabVectorGrid] Generating layout with request:', req);
    const layout = generateGridLayout(req);
    console.log('[useLabVectorGrid] Layout generated:', layout);
    
    // Normalizamos y centramos las coordenadas para Three.js
    // El gridEngine genera coordenadas en el rango [0, 600], las convertimos a [-10, 10]
    const scale = 20 / 600; // 20 unidades totales (de -10 a +10) dividido por 600 píxeles
    const offset = 10; // Para centrar (restar 10 después de escalar)
    
    const newVectors: LabVector[] = layout.points.map((p, idx) => {
      // Transformamos las coordenadas del grid a coordenadas de Three.js
      const normalizedX = (p.x * scale) - offset;
      const normalizedY = (p.y * scale) - offset;
      const z = noise3D(p.x * noiseScale, p.y * noiseScale, 0) * depthAmplitude;
      
      // Log temporal para verificar la transformación (solo el primer vector)
      if (idx === 0) {
        console.log(`[useLabVectorGrid] Coordinate transformation: original (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) -> normalized (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})`);
      }
      
      // Log adicional para ver los primeros 5 vectores y verificar distribución
      if (idx < 5) {
        console.log(`[useLabVectorGrid] Vector ${idx}: original (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) -> normalized (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})`);
      }
      
      // Log para verificar vectores de diferentes filas (cada 20 vectores)
      if (idx % 20 === 0 && idx < 100) {
        console.log(`[useLabVectorGrid] Row ${idx/20} Vector ${idx}: original (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) -> normalized (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})`);
      }
      
      return { 
        id: `${pattern}-${idx}`, 
        x: normalizedX, 
        y: normalizedY, 
        z 
      };
    });

    console.log(`[useLabVectorGrid] Created ${newVectors.length} vectors.`);
    setVectors(newVectors);

  }, [rows, cols, spacing, pattern, depthAmplitude, noiseScale, patternParams]);

  return { vectors };
}; 