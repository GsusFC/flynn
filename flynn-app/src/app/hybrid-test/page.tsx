'use client';

import '../dev/dev.css';
import React, { useState, useCallback } from 'react';
import { HybridVectorGrid } from './HybridVectorGrid';

// 🧬 TIPOS HÍBRIDOS - Backward compatible + nuevas props
interface HybridGridConfig {
  // ✅ MANTENER - Props existentes (obligatorias)
  gridSize: number;
  gridPattern: 'regular' | 'hexagonal';
  animation: 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence';
  speed: number;
  intensity: number;
  
  // 🔴 NUEVAS - Props opcionales para modo híbrido
  rows?: number;
  cols?: number;
  spacing?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  margin?: number;
  
  // Resto de props de /dev
  lengthMin?: number;
  lengthMax?: number;
  oscillationFreq?: number;
  oscillationAmp?: number;
  physicsMode?: 'none' | 'velocity' | 'pressure' | 'field';
  spatialMode?: 'edge' | 'center' | 'mixed';
  vectorShape?: 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
  showArrowheads?: boolean;
}

// 🧠 DETECCIÓN AUTOMÁTICA - Sin toggle
function getGridMode(config: HybridGridConfig): 'auto' | 'hybrid' {
  return (config.rows || config.cols || config.spacing || config.canvasWidth) 
    ? 'hybrid' 
    : 'auto';
}

function calculateEffectiveGrid(config: HybridGridConfig) {
  const mode = getGridMode(config);
  
  if (mode === 'auto') {
    // 🟢 MODO AUTOMÁTICO - Como siempre funcionó
    const side = Math.sqrt(config.gridSize);
    return {
      mode: 'auto',
      rows: Math.round(side),
      cols: Math.round(side),
      totalVectors: config.gridSize,
      spacing: 'auto',
      canvas: 'auto',
      message: `Modo automático: ${Math.round(side)}×${Math.round(side)} = ${config.gridSize} vectores`
    };
  } else {
    // 🔴 MODO HÍBRIDO - Control total
    const rows = config.rows || Math.sqrt(config.gridSize);
    const cols = config.cols || Math.sqrt(config.gridSize);
    return {
      mode: 'hybrid',
      rows,
      cols,
      totalVectors: rows * cols,
      spacing: config.spacing || 15,
      canvas: { 
        width: config.canvasWidth || 800, 
        height: config.canvasHeight || 600 
      },
      message: `Modo híbrido: ${rows}×${cols} = ${rows * cols} vectores`
    };
  }
}

// 🎮 PRESETS DE TESTING
const TEST_PRESETS = {
  auto_current: {
    name: "🟢 Auto - Current (2500)",
    gridSize: 2500,
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5
  },
  auto_small: {
    name: "🟢 Auto - Small (25)",
    gridSize: 25,
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5
  },
  hybrid_clear_5x5: {
    name: "🔴 Híbrido - Clear 5×5",
    gridSize: 25,
    gridPattern: 'regular' as const,
    animation: 'static' as const,
    speed: 1,
    intensity: 0.5,
    rows: 5,
    cols: 5,
    spacing: 80,  // Spacing grande para ver claramente
    canvasWidth: 600,
    canvasHeight: 600
  },
  hybrid_tight_10x10: {
    name: "🔴 Híbrido - Tight 10×10",
    gridSize: 100,
    gridPattern: 'regular' as const,
    animation: 'static' as const,
    speed: 1,
    intensity: 0.5,
    rows: 10,
    cols: 10,
    spacing: 40,  // Spacing mediano
    canvasWidth: 600,
    canvasHeight: 600
  },
  hybrid_wide: {
    name: "🔴 Híbrido - Wide (100×25)",
    gridSize: 2500, // Base, pero se ignora por props híbridas
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5,
    rows: 100,
    cols: 25,
    spacing: 8,
    canvasWidth: 1200,
    canvasHeight: 400
  },
  hybrid_tall: {
    name: "🔴 Híbrido - Tall (20×100)",
    gridSize: 2500,
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5,
    rows: 20,
    cols: 100,
    spacing: 6,
    canvasWidth: 1000,
    canvasHeight: 800
  },
  hybrid_dense: {
    name: "🔴 Híbrido - Dense (75×75)",
    gridSize: 2500,
    gridPattern: 'regular' as const,
    animation: 'wave' as const,
    speed: 1,
    intensity: 0.5,
    rows: 75,
    cols: 75,
    spacing: 4,
    canvasWidth: 600,
    canvasHeight: 600
  }
};

export default function HybridTestPage() {
  // 🎯 Estado inicial - Compatible con /dev actual
  const [config, setConfig] = useState<HybridGridConfig>({
    gridSize: 2500,
    gridPattern: 'regular',
    animation: 'wave',
    speed: 1,
    intensity: 0.5,
    lengthMin: 10,
    lengthMax: 25,
    oscillationFreq: 1,
    oscillationAmp: 0.3,
    physicsMode: 'none',
    spatialMode: 'edge',
    vectorShape: 'straight',
    showArrowheads: true
  });

  const gridInfo = calculateEffectiveGrid(config);

  const handlePresetLoad = useCallback((preset: typeof TEST_PRESETS[keyof typeof TEST_PRESETS]) => {
    setConfig(prev => ({ ...prev, ...preset }));
  }, []);

  const handleManualUpdate = useCallback((updates: Partial<HybridGridConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="dev-environment">
      <div className="container mx-auto p-6">
        {/* 🧪 Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Hybrid Grid System Test</h1>
          <p className="dev-muted">
            Testing automatic detection between classic mode and hybrid mode
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 📊 Status Panel */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Current Mode */}
            <div className="dev-panel rounded-lg p-4">
              <h3 className="dev-section-title">📊 Current Mode</h3>
              <div className={`p-3 rounded border ${gridInfo.mode === 'auto' ? 'dev-performance-good border-green-500/30 bg-green-900/20' : 'dev-performance-bad border-red-500/30 bg-red-900/20'}`}>
                <div className="dev-value text-sm">
                  {gridInfo.mode === 'auto' ? '🟢 AUTO' : '🔴 HYBRID'}
                </div>
                <div className="dev-muted text-sm mt-1">
                  {gridInfo.message}
                </div>
              </div>
            </div>

            {/* Grid Details */}
            <div className="dev-panel rounded-lg p-4">
              <h3 className="dev-section-title">🔧 Grid Details</h3>
              <div className="space-y-2 text-sm">
                <div className="dev-muted">Rows: <span className="dev-value text-blue-400">{gridInfo.rows}</span></div>
                <div className="dev-muted">Cols: <span className="dev-value text-blue-400">{gridInfo.cols}</span></div>
                <div className="dev-muted">Total: <span className="dev-value dev-performance-good">{gridInfo.totalVectors}</span></div>
                <div className="dev-muted">Spacing: <span className="dev-value text-purple-400">{gridInfo.spacing}</span></div>
                <div className="dev-muted">Canvas: <span className="dev-value text-orange-400">
                  {typeof gridInfo.canvas === 'string' ? gridInfo.canvas : `${gridInfo.canvas.width}×${gridInfo.canvas.height}`}
                </span></div>
              </div>
            </div>

            {/* Test Presets */}
            <div className="dev-panel rounded-lg p-4">
              <h3 className="dev-section-title">🎮 Test Presets</h3>
              <div className="space-y-2">
                {Object.entries(TEST_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetLoad(preset)}
                    className="dev-button secondary w-full text-left p-2 rounded text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Controls */}
            <div className="dev-panel rounded-lg p-4">
              <h3 className="dev-section-title">⚙️ Manual Controls</h3>
              
              <div className="space-y-3">
                {/* Base Grid Size */}
                <div>
                  <label className="block dev-muted text-sm font-medium mb-1">Base Grid Size</label>
                  <input
                    type="number"
                    value={config.gridSize}
                    onChange={(e) => handleManualUpdate({ gridSize: parseInt(e.target.value) })}
                    className="dev-input w-full rounded px-2 py-1 text-sm"
                  />
                </div>

                {/* Hybrid Props */}
                <div className="dev-separator">
                  <div className="dev-muted text-sm mb-2">Hybrid Props (optional)</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block dev-muted text-xs mb-1">Rows</label>
                      <input
                        type="number"
                        value={config.rows || ''}
                        onChange={(e) => handleManualUpdate({ rows: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="auto"
                        className="dev-input w-full rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block dev-muted text-xs mb-1">Cols</label>
                      <input
                        type="number"
                        value={config.cols || ''}
                        onChange={(e) => handleManualUpdate({ cols: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="auto"
                        className="dev-input w-full rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block dev-muted text-xs mb-1">Spacing</label>
                    <input
                      type="number"
                      value={config.spacing || ''}
                      onChange={(e) => handleManualUpdate({ spacing: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="auto"
                      className="dev-input w-full rounded px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block dev-muted text-xs mb-1">Canvas W</label>
                      <input
                        type="number"
                        value={config.canvasWidth || ''}
                        onChange={(e) => handleManualUpdate({ canvasWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="auto"
                        className="dev-input w-full rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block dev-muted text-xs mb-1">Canvas H</label>
                      <input
                        type="number"
                        value={config.canvasHeight || ''}
                        onChange={(e) => handleManualUpdate({ canvasHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="auto"
                        className="dev-input w-full rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => handleManualUpdate({ 
                    rows: undefined, 
                    cols: undefined, 
                    spacing: undefined, 
                    canvasWidth: undefined, 
                    canvasHeight: undefined 
                  })}
                  className="dev-button destructive w-full rounded px-3 py-2 text-sm"
                >
                  Clear Hybrid Props
                </button>
              </div>
            </div>

          </div>

          {/* 🎨 Vector Grid Display */}
          <div className="lg:col-span-3">
            <div className="dev-panel rounded-lg p-4">
              <h3 className="dev-section-title">🎨 Vector Grid Preview</h3>
              
              {/* Grid will be rendered here */}
              <div className="dev-sidebar border rounded-lg p-4 min-h-[400px]">
                <HybridVectorGrid {...config} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}