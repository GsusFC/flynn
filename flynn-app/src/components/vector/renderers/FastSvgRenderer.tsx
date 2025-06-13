import React, { useEffect, useRef } from 'react';
import type { SimpleVector as VectorItem, VectorShape, RotationOrigin } from '@/components/features/vector-grid/simple/simpleTypes';
import { 
    generateWavePath, generateBezierPath, generateSpiralPath, 
    generateArcPath, generateOrganicPath, generateZigzagPath,
    generateDashPath, generateSpringPath, generateTriangleWavePath, generateDoublePath
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

// Helper to compute start/end given rotation origin
function calculateCoordsForOrigin(
  x: number,
  y: number,
  length: number,
  angleRad: number,
  origin: RotationOrigin
) {
  let startX = x;
  let startY = y;
  let endX = x;
  let endY = y;
  switch (origin) {
    case 'start':
      endX = x + Math.cos(angleRad) * length;
      endY = y + Math.sin(angleRad) * length;
      break;
    case 'center':
      const half = length / 2;
      startX = x - Math.cos(angleRad) * half;
      startY = y - Math.sin(angleRad) * half;
      endX = x + Math.cos(angleRad) * half;
      endY = y + Math.sin(angleRad) * half;
      break;
    case 'end':
      startX = x - Math.cos(angleRad) * length;
      startY = y - Math.sin(angleRad) * length;
      break;
  }
  return { startX, startY, endX, endY };
}

export const FastSvgRenderer: React.FC<FastSvgRendererProps> = ({
  vectors,
  width,
  height,
  backgroundColor = '#000000',
  baseVectorWidth,
  baseRotationOrigin,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<SVGPathElement[]>([]);
  const prevCountRef = useRef(0);
  const defsRef = useRef<SVGDefsElement | null>(null);
  const gradientMapRef = useRef<Map<string, string>>(new Map()); // key(serialized) -> id

  // (Re)build the DOM elements if count changes
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!defsRef.current) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.appendChild(defs);
      defsRef.current = defs;
    }

    if (prevCountRef.current !== vectors.length) {
      svg.querySelectorAll('path').forEach(n => n.remove());
      // Background rect stays first child (0), defs second (1). Append paths after.
      pathRefs.current = [];
      vectors.forEach(() => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke-linecap', 'round');
        svg.appendChild(p);
        pathRefs.current.push(p);
      });
      prevCountRef.current = vectors.length;
    }
  }, [vectors.length, backgroundColor]);

  // Ensure gradients exist
  const ensureGradients = (color: GradientConfig, vectorId: string): string => {
    const key = JSON.stringify(color);
    const map = gradientMapRef.current;
    if (map.has(key)) return map.get(key)!;
    const defs = defsRef.current;
    if (!defs) return '#ffffff';
    const gradId = generateGradientId(vectorId);
    let gradEl: SVGGradientElement;
    if (color.type === 'linear') {
      const linear = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      linear.setAttribute('id', gradId);
      linear.setAttribute('gradientUnits', 'userSpaceOnUse');
      const angle = color.angle ?? 0;
      linear.setAttribute('gradientTransform', `rotate(${angle})`);
      color.colors.forEach(stop => {
        const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopEl.setAttribute('offset', (stop.offset * 100) + '%');
        stopEl.setAttribute('stop-color', stop.color);
        linear.appendChild(stopEl);
      });
      gradEl = linear;
    } else {
      const radial = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      radial.setAttribute('id', gradId);
      radial.setAttribute('gradientUnits', 'userSpaceOnUse');
      radial.setAttribute('cx', String((color.centerX ?? 0.5) * 100) + '%');
      radial.setAttribute('cy', String((color.centerY ?? 0.5) * 100) + '%');
      radial.setAttribute('r', String((color.radius ?? 0.5) * 100) + '%');
      color.colors.forEach(stop => {
        const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopEl.setAttribute('offset', (stop.offset * 100) + '%');
        stopEl.setAttribute('stop-color', stop.color);
        radial.appendChild(stopEl);
      });
      gradEl = radial;
    }
    defs.appendChild(gradEl);
    map.set(key, gradId);
    return gradId;
  };

  // Update attributes every render
  useEffect(() => {
    const paths = pathRefs.current;
    vectors.forEach((v, i) => {
      const p = paths[i];
      if (!p) return;
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
      p.setAttribute('d', d);

      let stroke: string;
      if (isGradientConfig(v.color as ExtendedVectorColorValue)) {
        const gradId = ensureGradients(v.color as GradientConfig, v.id);
        stroke = `url(#${gradId})`;
      } else if (typeof v.color === 'string') {
        stroke = v.color;
      } else {
        stroke = '#ffffff';
      }

      p.setAttribute('stroke', stroke);
      p.setAttribute('stroke-width', String(baseVectorWidth));
      p.setAttribute('opacity', String(v.opacity ?? 1));
    });
  });

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    />
  );
}; 