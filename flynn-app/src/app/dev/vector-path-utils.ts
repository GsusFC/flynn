import type { Vector } from './FlynVectorGrid';

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