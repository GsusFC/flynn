'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Vector {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
}

interface HybridGridRendererProps {
  rows: number;
  cols: number;
  spacing: number;
  canvasWidth: number;
  canvasHeight: number;
  animation?: 'static' | 'rotation' | 'wave';
  showGrid?: boolean;
}

export function HybridGridRenderer({
  rows,
  cols,
  spacing,
  canvasWidth,
  canvasHeight,
  animation = 'static',
  showGrid = true
}: HybridGridRendererProps) {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [time, setTime] = useState(0);
  const animationFrameRef = useRef<number>(0);

  // 🎯 GENERAR GRID HÍBRIDO - Control total de posición
  const generateHybridGrid = useCallback(() => {
    const newVectors: Vector[] = [];
    
    // Calcular el área de contenido (dejando márgenes)
    const margin = 50;
    const contentWidth = canvasWidth - (margin * 2);
    const contentHeight = canvasHeight - (margin * 2);
    
    // Calcular posición inicial para centrar el grid
    const totalGridWidth = (cols - 1) * spacing;
    const totalGridHeight = (rows - 1) * spacing;
    const startX = margin + (contentWidth - totalGridWidth) / 2;
    const startY = margin + (contentHeight - totalGridHeight) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        
        newVectors.push({
          id: `vector-${row}-${col}`,
          x,
          y,
          angle: Math.random() * Math.PI * 2,
          length: 20,
          color: `hsl(${(row * cols + col) * 137.5 % 360}, 70%, 60%)`
        });
      }
    }
    
    setVectors(newVectors);
  }, [rows, cols, spacing, canvasWidth, canvasHeight]);

  // Generar grid inicial
  useEffect(() => {
    generateHybridGrid();
  }, [generateHybridGrid]);

  // Animación
  useEffect(() => {
    if (animation === 'static') return;

    const animate = () => {
      setTime(prev => prev + 0.01);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animation]);

  // Aplicar animaciones
  const animatedVectors = vectors.map((vector, index) => {
    let animatedAngle = vector.angle;
    
    switch (animation) {
      case 'rotation':
        animatedAngle = vector.angle + time * 2;
        break;
      case 'wave':
        animatedAngle = vector.angle + Math.sin(time * 3 + index * 0.1) * 0.5;
        break;
      default:
        break;
    }

    return { ...vector, angle: animatedAngle };
  });

  return (
    <div className="hybrid-grid-renderer">
      {/* Información del Grid */}
      <div className="mb-4 p-3 bg-gray-700/30 rounded border border-gray-600/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Grid:</span> 
            <span className="text-white font-mono ml-2">{rows}×{cols} = {rows * cols} vectores</span>
          </div>
          <div>
            <span className="text-gray-400">Spacing:</span> 
            <span className="text-orange-400 font-mono ml-2">{spacing}px</span>
          </div>
          <div>
            <span className="text-gray-400">Canvas:</span> 
            <span className="text-blue-400 font-mono ml-2">{canvasWidth}×{canvasHeight}</span>
          </div>
          <div>
            <span className="text-gray-400">Animation:</span> 
            <span className="text-green-400 font-mono ml-2">{animation}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        width={canvasWidth}
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="border border-gray-600 bg-gray-900 rounded"
      >
        {/* Grid Lines (opcional) */}
        {showGrid && (
          <g className="grid-lines" opacity="0.2">
            {/* Líneas verticales */}
            {Array.from({ length: cols }, (_, i) => {
              const x = 50 + (canvasWidth - 100 - (cols - 1) * spacing) / 2 + i * spacing;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={50}
                  x2={x}
                  y2={canvasHeight - 50}
                  stroke="#444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
            {/* Líneas horizontales */}
            {Array.from({ length: rows }, (_, i) => {
              const y = 50 + (canvasHeight - 100 - (rows - 1) * spacing) / 2 + i * spacing;
              return (
                <line
                  key={`h-${i}`}
                  x1={50}
                  y1={y}
                  x2={canvasWidth - 50}
                  y2={y}
                  stroke="#444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
          </g>
        )}

        {/* Vectores */}
        {animatedVectors.map((vector) => {
          const endX = vector.x + Math.cos(vector.angle) * vector.length;
          const endY = vector.y + Math.sin(vector.angle) * vector.length;

          return (
            <g key={vector.id}>
              {/* Vector line */}
              <line
                x1={vector.x}
                y1={vector.y}
                x2={endX}
                y2={endY}
                stroke={vector.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Arrowhead */}
              <circle
                cx={endX}
                cy={endY}
                r="3"
                fill={vector.color}
              />
              {/* Base point */}
              <circle
                cx={vector.x}
                cy={vector.y}
                r="2"
                fill={vector.color}
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* Grid Info Overlay */}
        <text
          x={canvasWidth - 10}
          y={canvasHeight - 10}
          textAnchor="end"
          fill="#666"
          fontSize="12"
          fontFamily="monospace"
        >
          {rows}×{cols} @ {spacing}px
        </text>
      </svg>

      {/* Controles rápidos */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => generateHybridGrid()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          🔄 Regenerar
        </button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => {
              // Necesitaríamos pasar este estado desde el parent
              console.log('Toggle grid lines:', e.target.checked);
            }}
            className="rounded"
          />
          Mostrar líneas de grid
        </label>
      </div>
    </div>
  );
}

export default HybridGridRenderer;