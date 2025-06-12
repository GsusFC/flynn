'use client';

import React from 'react';
import type { Vector } from './FlynVectorGrid'; 
import { VectorSvgRenderer } from '@/components/vector/renderers/VectorSvgRenderer';
import type { SimpleVector } from '@/components/features/vector-grid/simple/simpleTypes';

interface SvgRendererProps {
  vectors: Vector[];
  width: number;
  height: number;
  backgroundColor: string;
}

const SvgRenderer: React.FC<SvgRendererProps> = ({ vectors, width, height, backgroundColor }) => {

  const adaptedVectors: SimpleVector[] = vectors.map(v => ({
    id: v.id,
    x: v.x,
    y: v.y,
    angle: (v.angle * 180 / Math.PI), // Convert radians to degrees
    length: v.length,
    width: 1,
    color: v.color,
    opacity: 1,
    originalX: v.x,
    originalY: v.y,
    originalAngle: (v.angle * 180 / Math.PI),
    gridRow: 0,
    gridCol: 0,
    rotationOrigin: 'center',
    dynamicLength: v.length,
    dynamicWidth: 1,
  }));

  return (
    <VectorSvgRenderer
      vectors={adaptedVectors}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      baseVectorLength={1} // Base length is 1, actual length is controlled by dynamicLength
      baseVectorColor={'#000000'} // Base color is unused, controlled by vector's color property
      baseVectorWidth={1.5}
      baseVectorShape="line"
      baseRotationOrigin="center"
      frameInfo={{ frameCount: 0, timestamp: 0, deltaTime: 0 }} // Dummy frameInfo
      onVectorClick={(item) => console.log('Vector clicked:', item.id)}
    />
  );
};

export default SvgRenderer;
