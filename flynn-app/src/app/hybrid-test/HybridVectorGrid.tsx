'use client';

import React from 'react';
import DemoVectorGrid from '../dev/DemoVectorGrid';
import HybridGridRenderer from './HybridGridRenderer';

// 🧬 INTERFAZ HÍBRIDA - Extiende DemoVectorGrid exactamente
interface DemoVectorGridProps {
  gridSize?: number;
  gridPattern?: 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden';
  animation?: 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence';
  speed?: number;
  intensity?: number;
  colorMode?: 'solid' | 'gradient' | 'dynamic';
  solidColor?: string;
  gradientPalette?: 'flow' | 'rainbow' | 'cosmic' | 'pulse' | 'subtle' | 'sunset' | 'ocean';
  colorIntensityMode?: 'field' | 'velocity' | 'distance' | 'angle';
  colorHueShift?: number;
  colorSaturation?: number;
  colorBrightness?: number;
  lengthMin?: number;
  lengthMax?: number;
  oscillationFreq?: number;
  oscillationAmp?: number;
  pulseSpeed?: number;
  spatialFactor?: number;
  spatialMode?: 'edge' | 'center' | 'mixed';
  mouseInfluence?: number;
  mouseMode?: 'attract' | 'repel' | 'stretch';
  physicsMode?: 'none' | 'velocity' | 'pressure' | 'field';
  vectorShape?: 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
  showArrowheads?: boolean;
  curvatureIntensity?: number;
  waveFrequency?: number;
  spiralTightness?: number;
  organicNoise?: number;
}

interface HybridVectorGridProps extends DemoVectorGridProps {
  // 🔴 NUEVAS - Props híbridas opcionales
  rows?: number;
  cols?: number;
  spacing?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  margin?: number;
}

// 🧠 LÓGICA HÍBRIDA - Detección automática sin toggle
function processHybridConfig(props: HybridVectorGridProps) {
  const hasHybridProps = !!(props.rows || props.cols || props.spacing || props.canvasWidth || props.canvasHeight);
  
  if (!hasHybridProps) {
    // 🟢 MODO AUTOMÁTICO - Usar props originales sin cambios
    return {
      mode: 'auto' as const,
      processedProps: {
        ...props,
        // No modificar nada, usar gridSize tal como está
      },
      info: {
        mode: 'Automático',
        description: `Usando gridSize: ${props.gridSize || 25}`,
        gridCalculation: 'sqrt(gridSize)'
      }
    };
  } else {
    // 🔴 MODO HÍBRIDO - Calcular gridSize efectivo
    const rows = props.rows || Math.sqrt(props.gridSize || 25);
    const cols = props.cols || Math.sqrt(props.gridSize || 25);
    const effectiveGridSize = Math.round(rows * cols);
    
    return {
      mode: 'hybrid' as const,
      processedProps: {
        ...props,
        // 🔧 OVERRIDE: Usar gridSize calculado desde rows×cols
        gridSize: effectiveGridSize,
        // TODO: Aquí necesitaremos modificar DemoVectorGrid para que use spacing y canvas custom
      },
      info: {
        mode: 'Híbrido',
        description: `${rows}×${cols} = ${effectiveGridSize} vectores`,
        gridCalculation: 'rows × cols',
        spacing: props.spacing || 'auto',
        canvas: props.canvasWidth ? `${props.canvasWidth}×${props.canvasHeight}` : 'auto'
      }
    };
  }
}

export function HybridVectorGrid(props: HybridVectorGridProps) {
  const { processedProps, info } = processHybridConfig(props);
  
  return (
    <div className="hybrid-vector-grid">
      {/* 📊 Debug Info */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-600/30">
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-2 py-1 rounded text-xs font-mono ${
            info.mode === 'Automático' 
              ? 'bg-green-900/30 text-green-300 border border-green-500/30'
              : 'bg-red-900/30 text-red-300 border border-red-500/30'
          }`}>
            {info.mode}
          </span>
          <span className="text-gray-300">{info.description}</span>
          <span className="text-gray-400 text-xs">({info.gridCalculation})</span>
          {info.spacing && (
            <span className="text-purple-300 text-xs">spacing: {info.spacing}</span>
          )}
          {info.canvas && (
            <span className="text-orange-300 text-xs">canvas: {info.canvas}</span>
          )}
        </div>
      </div>
      
      {/* 🎨 Vector Grid Renderizado */}
      <div className="hybrid-grid-container">
        {info.mode === 'Híbrido' ? (
          <HybridGridRenderer
            rows={props.rows || Math.sqrt(props.gridSize || 25)}
            cols={props.cols || Math.sqrt(props.gridSize || 25)}
            spacing={props.spacing || 50}
            canvasWidth={props.canvasWidth || 600}
            canvasHeight={props.canvasHeight || 600}
            animation={props.animation === 'static' || props.animation === 'rotation' || props.animation === 'wave' ? props.animation : 'static'}
            showGrid={true}
          />
        ) : (
          <DemoVectorGrid {...processedProps} />
        )}
      </div>
    </div>
  );
}

// 📝 TODO: Para implementación completa necesitaremos:
// 1. Modificar DemoVectorGrid para aceptar spacing y canvas custom
// 2. O crear lógica de grid completamente nueva que use rows×cols directamente
// 3. Por ahora funciona con detección automática y gridSize calculado

export default HybridVectorGrid;