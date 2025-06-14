import React, { useRef, forwardRef } from 'react';
import type { SimpleVector as VectorItem, VectorShape, RotationOrigin } from '@/components/features/vector-grid/simple/simpleTypes';
import { 
    generateWavePath, generateBezierPath, generateSpiralPath, 
    generateArcPath, generateOrganicPath, generateZigzagPath,
    generateDashPath, generateSpringPath, generateTriangleWavePath, generateDoublePath,
    calculateCoordsForOrigin
} from '@/app/dev/vector-path-utils';
import type { GradientConfig, ExtendedVectorColorValue } from '@/components/features/vector-grid/types/gradientTypes';
import { isGradientConfig, generateGradientId } from '@/components/features/vector-grid/types/gradientTypes';

interface FastSvgRendererProps {
  vectors: VectorItem[];
  width: number;
  height: number;
  backgroundColor?: string;
  baseVectorWidth: number;
  baseRotationOrigin: RotationOrigin;
}

export const FastSvgRenderer = forwardRef<SVGSVGElement, FastSvgRendererProps>(({
  vectors,
  width,
  height,
  backgroundColor = '#000000',
  baseVectorWidth,
  baseRotationOrigin,
}, ref) => {
  const gradients: JSX.Element[] = [];
  const gradientMap = new Map<string, string>();

  const paths = vectors.map((v, i) => {
    const angleRad = (v.angle * Math.PI) / 180;
    const { startX, startY, endX, endY } = calculateCoordsForOrigin(v.x, v.y, v.length, angleRad, baseRotationOrigin);
    let d = '';
    const vecShape = (v.shape ?? 'straight') as VectorShape;
    const params = v as any;
    switch (vecShape) {
      case 'wave':
        d = generateWavePath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'bezier':
        d = generateBezierPath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'spiral':
        d = generateSpiralPath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'arc':
        d = generateArcPath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'organic':
        d = generateOrganicPath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'zigzag':
        d = generateZigzagPath(startX, startY, angleRad, v.length, 0, i, params);
        break;
      case 'dash':
        d = generateDashPath(startX, startY, angleRad, v.length, params);
        break;
      case 'spring':
        d = generateSpringPath(startX, startY, angleRad, v.length, params);
        break;
      case 'triangleWave':
        d = generateTriangleWavePath(startX, startY, angleRad, v.length, params);
        break;
      case 'double':
        d = generateDoublePath(startX, startY, angleRad, v.length, params);
        break;
      default:
        d = `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    let stroke: string;
    if (isGradientConfig(v.color as ExtendedVectorColorValue)) {
      const color = v.color as GradientConfig;
      const key = JSON.stringify(color);
      let gradId = gradientMap.get(key);
      if (!gradId) {
        gradId = generateGradientId(v.id);
        gradientMap.set(key, gradId);
        if (color.type === 'linear') {
          gradients.push(
            <linearGradient key={gradId} id={gradId} gradientUnits="userSpaceOnUse" gradientTransform={`rotate(${color.angle ?? 0})`}>
              {color.colors.map(stop => (
                <stop key={stop.offset} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
              ))}
            </linearGradient>
          );
        } else {
          gradients.push(
            <radialGradient
              key={gradId}
              id={gradId}
              gradientUnits="userSpaceOnUse"
              cx={`${(color.centerX ?? 0.5) * 100}%`}
              cy={`${(color.centerY ?? 0.5) * 100}%`}
              r={`${(color.radius ?? 0.5) * 100}%`}
            >
              {color.colors.map(stop => (
                <stop key={stop.offset} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
              ))}
            </radialGradient>
          );
        }
      }
      stroke = `url(#${gradId})`;
    } else if (typeof v.color === 'string') {
      stroke = v.color;
    } else {
      stroke = '#ffffff';
    }

    return (
      <path
        key={v.id}
        d={d}
        stroke={stroke}
        strokeWidth={String(baseVectorWidth)}
        opacity={String(v.opacity ?? 1)}
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill={backgroundColor} />
      <defs>{gradients}</defs>
      {paths}
    </svg>
  );
});

FastSvgRenderer.displayName = 'FastSvgRenderer'; 