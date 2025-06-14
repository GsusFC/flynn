// Wave path generator
export const generateWavePath = (
    startX: number, 
    startY: number, 
    angle: number, 
    length: number, 
    time: number, 
    index: number,
    params: Record<string, number>
): string => {
  const { frequency = 2, amplitude = 1 } = params;
  const segments = Math.max(3, Math.floor(length / 10));
  let path = `M ${startX} ${startY}`;
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const baseX = startX + Math.cos(angle) * length * t;
    const baseY = startY + Math.sin(angle) * length * t;
    
    const waveAmplitude = amplitude * 3;
    const waveOffset = Math.sin(t * Math.PI * frequency + time * 2 + index * 0.1) * waveAmplitude;
    
    const perpAngle = angle + Math.PI / 2;
    const waveX = baseX + Math.cos(perpAngle) * waveOffset;
    const waveY = baseY + Math.sin(perpAngle) * waveOffset;
    
    path += ` L ${waveX} ${waveY}`;
  }
  
  return path;
};

// Bezier curve path generator
export const generateBezierPath = (
    startX: number, 
    startY: number, 
    angle: number, 
    length: number, 
    time: number, 
    index: number,
    params: Record<string, number>
): string => {
  const { curvature = 1, pulse = 0 } = params;
  const endX = startX + Math.cos(angle) * length;
  const endY = startY + Math.sin(angle) * length;
  
  const curveAmount = curvature * 0.5 * length;
  const midT = 0.5;
  const midX = startX + Math.cos(angle) * length * midT;
  const midY = startY + Math.sin(angle) * length * midT;
  
  const perpAngle = angle + Math.PI / 2;
  const pulseEffect = pulse > 0 ? Math.sin(time * pulse + index * 0.1) : 1;
  const timeOffset = curveAmount * pulseEffect;
  
  const ctrl1X = midX + Math.cos(perpAngle) * timeOffset;
  const ctrl1Y = midY + Math.sin(perpAngle) * timeOffset;
  
  return `M ${startX} ${startY} Q ${ctrl1X} ${ctrl1Y} ${endX} ${endY}`;
};

// Spiral path generator
export const generateSpiralPath = (
    startX: number, 
    startY: number, 
    angle: number, 
    length: number, 
    time: number, 
    index: number,
    params: Record<string, number>
): string => {
  const { turns = 2, tightness = 1 } = params;
  let path = `M ${startX} ${startY}`;
  const segments = 20;
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const currentAngle = angle + t * Math.PI * 2 * turns;
    const currentRadius = t * length * tightness * 0.5 * (1 + Math.sin(time + index * 0.2) * 0.1);
    const x = startX + Math.cos(currentAngle) * currentRadius;
    const y = startY + Math.sin(currentAngle) * currentRadius;
    path += ` L ${x} ${y}`;
  }
  return path;
};

// Arc path generator
export const generateArcPath = (
    startX: number,
    startY: number,
    angle: number,
    length: number,
    time: number,
    index: number,
    params: Record<string, number>
): string => {
    const { curvature = 1, pulse = 0 } = params;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    const pulseEffect = pulse > 0 ? Math.sin(time * pulse + index * 0.1) : 1;
    const finalCurvature = curvature * pulseEffect;

    const largeArcFlag = 0;
    const sweepFlag = finalCurvature > 0 ? 1 : 0;
    const radius = length / (Math.abs(finalCurvature) * 0.5 + 1e-6);

    if (finalCurvature === 0) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
};

// Organic path generator
export const generateOrganicPath = (
    startX: number,
    startY: number,
    angle: number,
    length: number,
    time: number,
    index: number,
    params: Record<string, number>
): string => {
    const { noise = 0.5, sinuosity = 1 } = params;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    const noiseAmount = noise * 25;
    const freq = sinuosity * 0.5;

    const ctrl1X = startX + (endX - startX) * 0.33 + Math.sin(time * freq + index) * noiseAmount;
    const ctrl1Y = startY + (endY - startY) * 0.33 + Math.cos(time * freq + index * 0.5) * noiseAmount;
    const ctrl2X = startX + (endX - startX) * 0.66 + Math.cos(time * freq + index * 0.2) * noiseAmount;
    const ctrl2Y = startY + (endY - startY) * 0.66 + Math.sin(time * freq + index * 0.7) * noiseAmount;

    return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
};

// Zigzag path generator
export const generateZigzagPath = (
    startX: number,
    startY: number,
    angle: number,
    length: number,
    time: number,
    index: number,
    params: Record<string, number>
): string => {
    const { segments = 8, amplitude = 1 } = params;
    const segs = Math.max(2, Math.floor(segments));
    const segLength = length / segs;
    let path = `M ${startX} ${startY}`;
    for (let i = 1; i <= segs; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      const offset = amplitude * 3 * dir;
      const baseX = startX + Math.cos(angle) * segLength * i;
      const baseY = startY + Math.sin(angle) * segLength * i;
      const perpAngle = angle + Math.PI / 2;
      const zigX = baseX + Math.cos(perpAngle) * offset;
      const zigY = baseY + Math.sin(perpAngle) * offset;
      path += ` L ${zigX} ${zigY}`;
    }
    return path;
};

// Dash path generator
export const generateDashPath = (startX: number, startY: number, angle: number, length: number, params: Record<string, number>): string => {
    const { segments = 10, gap = 0.3 } = params;
    const dashLen = length / segments * (1 - gap);
    const gapLen = length / segments * gap;
    let path = '';
    for (let i = 0; i < segments; i++) {
      const t0 = i * (dashLen + gapLen);
      const t1 = t0 + dashLen;
      const p0x = startX + Math.cos(angle) * t0;
      const p0y = startY + Math.sin(angle) * t0;
      const p1x = startX + Math.cos(angle) * t1;
      const p1y = startY + Math.sin(angle) * t1;
      path += ` M ${p0x} ${p0y} L ${p1x} ${p1y}`;
    }
    return path;
};

// Spring path generator
export const generateSpringPath = (startX: number, startY: number, angle: number, length: number, params: Record<string, number>): string => {
    const { coils = 8, radius = 0.5 } = params;
    const segments = coils * 10;
    let path = `M ${startX} ${startY}`;
    const perpAngle = angle + Math.PI / 2;
    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const base_x = startX + Math.cos(angle) * length * t;
        const base_y = startY + Math.sin(angle) * length * t;
        const coilAngle = t * Math.PI * 2 * coils;
        const coilRadius = radius * 4;
        const x = base_x + Math.cos(perpAngle) * Math.sin(coilAngle) * coilRadius;
        const y = base_y + Math.sin(perpAngle) * Math.sin(coilAngle) * coilRadius;
        path += ` L ${x} ${y}`;
    }
    return path;
};

// Triangle Wave path generator
export const generateTriangleWavePath = (startX: number, startY: number, angle: number, length: number, params: Record<string, number>): string => {
    const { frequency = 4, amplitude = 1 } = params;
    const segments = Math.floor(frequency * 2);
    const segLength = length / segments;
    let path = `M ${startX} ${startY}`;
    for (let i = 1; i <= segments; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        const offset = amplitude * 4 * dir;
        const baseX = startX + Math.cos(angle) * segLength * i;
        const baseY = startY + Math.sin(angle) * segLength * i;
        const perpAngle = angle + Math.PI / 2;
        const waveX = baseX + Math.cos(perpAngle) * offset;
        const waveY = baseY + Math.sin(perpAngle) * offset;
        path += ` L ${waveX} ${waveY}`;
    }
    return path;
};

// Double Line path generator
export const generateDoublePath = (startX: number, startY: number, angle: number, length: number, params: Record<string, number>): string => {
    const { gap = 3 } = params;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    const perpAngle = angle + Math.PI / 2;
    const offsetX = Math.cos(perpAngle) * gap / 2;
    const offsetY = Math.sin(perpAngle) * gap / 2;
    return `M ${startX - offsetX} ${startY - offsetY} L ${endX - offsetX} ${endY - offsetY}` +
           ` M ${startX + offsetX} ${startY + offsetY} L ${endX + offsetX} ${endY + offsetY}`;
};

export function calculateCoordsForOrigin(
  x: number,
  y: number,
  length: number,
  angleRad: number,
  origin: 'start' | 'center' | 'end' | 'global' | 'local'
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