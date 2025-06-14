// 🔥 ULTRA-SIMPLE: Hook que NO PUEDE tener loops infinitos
// Sin animaciones complejas, sin useEffect problemáticos, sin dependencias cambiantes

import { useState, useCallback, useMemo } from 'react';
import type { SimpleVector } from '../simple/simpleTypes';

interface StaticVectorGridProps {
  gridSize?: number;
  width: number;
  height: number;
  solidColor?: string;
  lengthMin?: number;
  lengthMax?: number;
  margin?: number;
}

export const useStaticVectorGrid = (props: StaticVectorGridProps) => {
  const {
    gridSize = 25,
    width,
    height,
    solidColor = '#00ff88',
    lengthMin = 10,
    lengthMax = 25,
    margin = 50
  } = props;

  // SOLO estado simple - sin tiempo, sin animación, sin complejidad
  const [rotationOffset, setRotationOffset] = useState(0);
  
  // Generar vectores - función estable que NUNCA cambia
  const vectors = useMemo(() => {
    const gridSide = Math.sqrt(gridSize);
    const contentWidth = width - (margin * 2);
    const contentHeight = height - (margin * 2);
    const cellWidth = contentWidth / gridSide;
    const cellHeight = contentHeight / gridSide;
    const startX = margin + cellWidth / 2;
    const startY = margin + cellHeight / 2;

    const result: SimpleVector[] = [];
    
    for (let i = 0; i < gridSize; i++) {
      const row = Math.floor(i / gridSide);
      const col = i % gridSide;
      
      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;
      const baseAngle = Math.random() * Math.PI * 2;
      const length = Math.random() * (lengthMax - lengthMin) + lengthMin;
      
      result.push({
        id: `vector-${i}`,
        x,
        y,
        originalX: x,
        originalY: y,
        angle: baseAngle + rotationOffset, // Solo rotación simple
        originalAngle: baseAngle,
        length,
        width: 2,
        color: solidColor,
        opacity: 1,
        gridRow: row,
        gridCol: col,
        rotationOrigin: 'start'
      });
    }
    
    return result;
  }, [gridSize, width, height, margin, lengthMin, lengthMax, solidColor, rotationOffset]);

  // Funciones simples - SIN setState en loops
  const rotate = useCallback(() => {
    setRotationOffset(prev => prev + 0.1);
  }, []);

  const randomize = useCallback(() => {
    setRotationOffset(Math.random() * Math.PI * 2);
  }, []);

  const reset = useCallback(() => {
    setRotationOffset(0);
  }, []);

  const generateStaticSVG = useCallback(() => {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#000000"/>
      <g id="vectors">
        ${vectors.map(vector => {
          const endX = vector.x + Math.cos(vector.angle) * vector.length;
          const endY = vector.y + Math.sin(vector.angle) * vector.length;
          return `<line x1="${vector.x}" y1="${vector.y}" x2="${endX}" y2="${endY}" stroke="${vector.color}" stroke-width="${vector.width}" stroke-linecap="round" opacity="${vector.opacity}" />`;
        }).join('')}
      </g>
    </svg>`;
  }, [vectors, width, height]);

  return {
    vectors,
    vectorCount: vectors.length,
    // Funciones que NO pueden causar loops
    rotate,
    randomize,
    reset,
    generateStaticSVG
  };
};