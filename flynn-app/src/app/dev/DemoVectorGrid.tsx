'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getCustomGradient } from '@/lib/customGradients';

interface Vector {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
}

interface DemoVectorGridProps {
  gridSize?: number;
  gridPattern?: 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar';
  animation?: 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence' | 'pinwheels' | 'seaWaves' | 'geometricPattern' | 'flowField' | 'curlNoise' | 'rippleEffect' | 'perlinFlow' | 'gaussianGradient';
  // 🔴 HYBRID SYSTEM - Advanced grid control
  rows?: number;
  cols?: number;
  spacing?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  margin?: number;
  speed?: number;
  intensity?: number;
  // New Color System
  colorMode?: 'solid' | 'gradient' | 'dynamic';
  solidColor?: string;
  gradientPalette?: 'flow' | 'rainbow' | 'cosmic' | 'pulse' | 'subtle' | 'sunset' | 'ocean' | string; // string para custom gradients
  // Dynamic Color Modulation
  colorIntensityMode?: 'field' | 'velocity' | 'distance' | 'angle';
  colorHueShift?: number;
  colorSaturation?: number;
  colorBrightness?: number;
  // Length Dynamics
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
  // Vector Shape System
  vectorShape?: 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
  showArrowheads?: boolean;
  curvatureIntensity?: number;
  waveFrequency?: number;
  spiralTightness?: number;
  organicNoise?: number;
  // Animation Control
  isPaused?: boolean;

}

export default function DemoVectorGrid({ 
  gridSize = 25,
  gridPattern = 'regular',
  animation = 'rotation',
  speed = 1,
  intensity = 0.5,
  // New Color System defaults
  colorMode = 'solid',
  solidColor = '#3b82f6',
  gradientPalette = 'flow',
  // Dynamic Color Modulation defaults
  colorIntensityMode = 'field',
  colorHueShift = 1,
  colorSaturation = 80,
  colorBrightness = 60,
  // Length Dynamics defaults
  lengthMin = 10,
  lengthMax = 25,
  oscillationFreq = 1,
  oscillationAmp = 0.3,
  pulseSpeed = 1,
  spatialFactor = 0.2,
  spatialMode = 'edge',
  mouseInfluence = 0,
  mouseMode = 'attract',
  physicsMode = 'none',
  // Vector Shape defaults
  vectorShape = 'straight',
  showArrowheads = true,
  curvatureIntensity = 1,
  waveFrequency = 2,
  spiralTightness = 1,
  organicNoise = 0.5,
  // Animation Control defaults
  isPaused = false,
  // Hybrid System defaults
  rows,
  cols,
  spacing,
  canvasWidth,
  canvasHeight,
  margin = 20
}: DemoVectorGridProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [animationTime, setAnimationTime] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prevValuesRef = useRef<{[key: string]: number}>({});
  const animationRef = useRef<number | undefined>(undefined);
  
  // Simple noise function for advanced animations
  const simpleNoise = useCallback((x: number, y: number, z: number) => {
    // Simple hash-based noise function
    const hash = (Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;
    return (hash - 0.5) * 2; // Return value between -1 and 1
  }, []);

  // 🧠 HYBRID SYSTEM - Automatic mode detection
  const hybridConfig = useMemo(() => {
    const hasHybridProps = !!(rows || cols || spacing || canvasWidth || canvasHeight);
    
    // 🎯 BASE SPACING: Usar container real para evitar bucle circular
    const containerSize = Math.min(800, 600); // Fallback seguro
    const baseSpacing = containerSize / (Math.sqrt(gridSize) + 1);
    
    if (!hasHybridProps) {
      // 🟢 AUTOMATIC MODE - Use base spacing, not calculated dimensions
      return {
        mode: 'auto' as const,
        effectiveGridSize: gridSize,
        effectiveRows: Math.sqrt(gridSize),
        effectiveCols: Math.sqrt(gridSize),
        effectiveSpacing: baseSpacing,
        effectiveCanvasWidth: dimensions.width,
        effectiveCanvasHeight: dimensions.height,
        info: {
          mode: '🟢 Automatic',
          description: `Using gridSize: ${gridSize}`,
          calculation: `${Math.sqrt(gridSize).toFixed(1)}×${Math.sqrt(gridSize).toFixed(1)} grid`
        }
      };
    } else {
      // 🔴 HYBRID MODE - Calculate effective grid from hybrid props
      const effectiveRows = rows || Math.sqrt(gridSize);
      const effectiveCols = cols || Math.sqrt(gridSize);
      const effectiveGridSize = Math.round(effectiveRows * effectiveCols);
      const effectiveSpacing = spacing || baseSpacing;
      const effectiveCanvasWidth = canvasWidth || dimensions.width;
      const effectiveCanvasHeight = canvasHeight || dimensions.height;
      
      return {
        mode: 'hybrid' as const,
        effectiveGridSize,
        effectiveRows,
        effectiveCols,
        effectiveSpacing,
        effectiveCanvasWidth,
        effectiveCanvasHeight,
        info: {
          mode: '🔴 Hybrid',
          description: `Custom ${effectiveRows}×${effectiveCols} grid`,
          calculation: `${effectiveSpacing.toFixed(0)}px spacing, ${effectiveCanvasWidth}×${effectiveCanvasHeight}px canvas`
        }
      };
    }
  }, [gridSize, rows, cols, spacing, canvasWidth, canvasHeight, dimensions.width, dimensions.height]);

  // DEBUG: Log props to verify they're being received (commented out to reduce console spam)
  // console.log('🎛️ Length Dynamics Props:', {
  //   lengthMin,
  //   lengthMax,
  //   oscillationFreq,
  //   oscillationAmp,
  //   pulseSpeed,
  //   spatialFactor,
  //   spatialMode,
  //   mouseInfluence,
  //   mouseMode,
  //   physicsMode,
  //   vectorShape,
  //   showArrowheads,
  //   curvatureIntensity,
  //   waveFrequency,
  //   spiralTightness,
  //   organicNoise
  // });

  // Update dimensions when container changes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.w-\\[70\\%\\]');
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({ 
          width: rect.width - 40, // padding
          height: window.innerHeight - 40 
        });
      } else {
        // Fallback dimensions if container not found yet
        setDimensions({ 
          width: window.innerWidth * 0.7 - 40, 
          height: window.innerHeight - 40 
        });
      }
    };

    // Delay initial measurement to ensure DOM is ready
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Generate color based on colorMode  
  const generateColor = useCallback((vectorIndex: number, x: number, y: number, time: number = 0): string => {
    const { width, height } = dimensions;
    
    // Handle new gradient system
    if (colorMode === 'gradient') {
      switch (gradientPalette) {
        case 'flow':
          const distance = Math.sqrt((x - width/2) ** 2 + (y - height/2) ** 2);
          const flowHue = (distance * 0.5 + time * 30 + vectorIndex * 45) % 360;
          return `hsl(${flowHue}, 80%, 55%)`;
        case 'rainbow':
          const hue = (vectorIndex * 137.5 + time * 50) % 360;
          return `hsl(${hue}, 70%, 60%)`;
        case 'cosmic':
          const cosmicAngle = Math.atan2(y - height/2, x - width/2);
          const cosmicHue = (cosmicAngle * 180 / Math.PI + 180 + time * 20) % 360;
          return `hsl(${cosmicHue}, 85%, 65%)`;
        case 'pulse':
          const pulseHue = (time * 100 + vectorIndex * 20) % 360;
          const pulseLightness = 50 + Math.sin(time * 5 + vectorIndex * 0.1) * 20;
          return `hsl(${pulseHue}, 90%, ${pulseLightness}%)`;
        case 'subtle':
          const subtleHue = (vectorIndex * 20 + time * 5) % 360;
          return `hsl(${subtleHue}, 40%, 70%)`;
        case 'sunset':
          const sunsetFactor = (x / width + y / height) / 2;
          const sunsetHue = 15 + sunsetFactor * 60 + time * 10;
          return `hsl(${sunsetHue}, 80%, 60%)`;
        case 'ocean':
          const oceanFactor = y / height;
          const oceanHue = 200 + oceanFactor * 60 + time * 5;
          return `hsl(${oceanHue}, 70%, 55%)`;
        default:
          // Handle custom gradients
          const customGradient = getCustomGradient(gradientPalette);
          if (customGradient) {
            // Para gradientes personalizados, usamos una interpolación basada en posición
            const normalizedX = x / width;
            const normalizedY = y / height;
            
            // Determinar factor de interpolación basado en el tipo de gradiente
            let factor = 0;
            if (customGradient.gradient.variant === 'radial') {
              // Para gradientes radiales, usar distancia desde el centro
              const centerDistance = Math.sqrt((normalizedX - 0.5) ** 2 + (normalizedY - 0.5) ** 2);
              factor = Math.min(centerDistance * 2, 1); // Normalizar a [0,1]
            } else {
              // Para gradientes lineales, usar el ángulo del gradiente
              const angle = (customGradient.gradient.angle || 90) * Math.PI / 180;
              factor = (normalizedX * Math.cos(angle) + normalizedY * Math.sin(angle) + 1) / 2;
              factor = Math.max(0, Math.min(1, factor)); // Clamp a [0,1]
            }
            
            // Interpolación entre color stops
            const stops = customGradient.gradient.stops.sort((a, b) => a.offset - b.offset);
            
            // Encontrar los dos stops más cercanos
            let startStop = stops[0];
            let endStop = stops[stops.length - 1];
            
            for (let i = 0; i < stops.length - 1; i++) {
              if (factor >= stops[i].offset && factor <= stops[i + 1].offset) {
                startStop = stops[i];
                endStop = stops[i + 1];
                break;
              }
            }
            
            // Interpolación simple entre colores (por ahora retornamos el color más cercano)
            const t = (factor - startStop.offset) / (endStop.offset - startStop.offset);
            return t < 0.5 ? startStop.color : endStop.color;
          }
          break;
      }
    }
    
    // Default to solid color
    return solidColor;
  }, [colorMode, solidColor, dimensions, gradientPalette]);

  // Generate initial vectors based on pattern
  const generateVectors = useCallback((pattern: string, count: number) => {
    const vectors: Vector[] = [];
    
    // 🧠 HYBRID SYSTEM - Use hybrid config for grid calculations
    const effectiveRows = hybridConfig.effectiveRows;
    const effectiveCols = hybridConfig.effectiveCols;
    const effectiveSpacing = hybridConfig.effectiveSpacing;
    const canvasW = hybridConfig.effectiveCanvasWidth;
    const canvasH = hybridConfig.effectiveCanvasHeight;
    
    // 🎯 SISTEMA DE COORDENADAS UNIFICADO
    const maxVectorLength = Math.max(lengthMax, 50);
    const padding = maxVectorLength; // Marco fijo del tamaño del vector
    
    // 📐 ÁREA DE CONTENIDO ESTÁNDAR - Una sola fuente de verdad
    const contentArea = {
      x: padding,
      y: padding,
      width: canvasW - 2 * padding,
      height: canvasH - 2 * padding,
      centerX: canvasW / 2,
      centerY: canvasH / 2
    };
    
    // Grid dimensions para patrones regulares
    const gridWidth = (effectiveCols - 1) * effectiveSpacing;
    const gridHeight = (effectiveRows - 1) * effectiveSpacing;
    
    // Grid positioning centrado en contentArea
    const gridStartX = contentArea.x + (contentArea.width - gridWidth) / 2;
    const gridStartY = contentArea.y + (contentArea.height - gridHeight) / 2;
    
    // 🐛 DEBUG: Log calculations para entender el problema
    if (pattern === 'regular' && count > 2000) {
      console.log('🔍 DEBUG CENTERING:', {
        canvasW, canvasH,
        padding,
        contentArea,
        effectiveSpacing,
        effectiveCols, effectiveRows,
        gridWidth, gridHeight,
        gridStartX, gridStartY,
        'gridFitsInContent': gridWidth <= contentArea.width && gridHeight <= contentArea.height
      });
    }
    
    for (let i = 0; i < count; i++) {
      let x, y;
      
      switch (pattern) {
        case 'hexagonal':
          const row = Math.floor(i / effectiveCols);
          const col = i % effectiveCols;
          const offsetX = (row % 2) * (effectiveSpacing / 2);
          x = gridStartX + col * effectiveSpacing + offsetX;
          y = gridStartY + row * effectiveSpacing * 0.866;
          break;
          
        case 'fibonacci':
          const goldenAngle = Math.PI * (3 - Math.sqrt(5));
          const radius = Math.min(contentArea.width, contentArea.height) / 3 * Math.sqrt(i / count);
          const angle = i * goldenAngle;
          x = contentArea.centerX + Math.cos(angle) * radius;
          y = contentArea.centerY + Math.sin(angle) * radius;
          break;
          
        case 'radial':
          const numRings = Math.ceil(Math.sqrt(count / Math.PI));
          const ringIndex = Math.floor(Math.sqrt(i * Math.PI));
          const pointsInRing = Math.max(1, Math.round(2 * Math.PI * ringIndex));
          const angleInRing = (i % pointsInRing) * (2 * Math.PI / pointsInRing);
          const radiusInRing = (ringIndex / numRings) * Math.min(contentArea.width, contentArea.height) / 2.5;
          x = contentArea.centerX + Math.cos(angleInRing) * radiusInRing;
          y = contentArea.centerY + Math.sin(angleInRing) * radiusInRing;
          break;
          
        case 'staggered':
          const staggeredRow = Math.floor(i / effectiveCols);
          const staggeredCol = i % effectiveCols;
          const staggerOffset = (staggeredRow % 2) * (effectiveSpacing / 4);
          x = gridStartX + staggeredCol * effectiveSpacing + staggerOffset;
          y = gridStartY + staggeredRow * effectiveSpacing;
          break;
          
        case 'triangular':
          const triRow = Math.floor((-1 + Math.sqrt(1 + 8 * i)) / 2);
          const triCol = i - (triRow * (triRow + 1)) / 2;
          const triSpacingX = contentArea.width / (triRow + 2);
          const triSpacingY = contentArea.height / Math.ceil(Math.sqrt(count));
          x = contentArea.x + triCol * triSpacingX + (triRow % 2) * triSpacingX / 2 + triSpacingX;
          y = contentArea.y + triRow * triSpacingY + triSpacingY;
          break;
          
        case 'voronoi':
          // Pseudo-random but deterministic positioning dentro de contentArea
          const seed1 = (i * 73 + 37) % 997;
          const seed2 = (i * 179 + 83) % 991;
          x = contentArea.x + (seed1 / 997) * contentArea.width;
          y = contentArea.y + (seed2 / 991) * contentArea.height;
          break;
          
        case 'golden':
          const goldenRatio = (1 + Math.sqrt(5)) / 2;
          const goldenAngleRad = 2 * Math.PI / goldenRatio;
          const goldenRadius = Math.sqrt(i) * Math.min(contentArea.width, contentArea.height) / (2 * Math.sqrt(count));
          const goldenAnglePos = i * goldenAngleRad;
          x = contentArea.centerX + Math.cos(goldenAnglePos) * goldenRadius;
          y = contentArea.centerY + Math.sin(goldenAnglePos) * goldenRadius;
          break;
          
        default: // regular
          const rowReg = Math.floor(i / effectiveCols);
          const colReg = i % effectiveCols;
          x = gridStartX + colReg * effectiveSpacing;
          y = gridStartY + rowReg * effectiveSpacing;
      }
      
      const finalX = Math.max(margin, Math.min(canvasW - margin, x));
      const finalY = Math.max(margin, Math.min(canvasH - margin, y));
      
      vectors.push({
        id: `vector-${i}`,
        x: finalX,
        y: finalY,
        angle: i * 0.5,
        length: lengthMin + (lengthMax - lengthMin) * 0.5, // Base length between min/max
        color: generateColor(i, finalX, finalY)
      });
    }
    
    return vectors;
  }, [hybridConfig, margin, lengthMin, lengthMax, generateColor]);

  // Initialize vectors
  useEffect(() => {
    setVectors(generateVectors(gridPattern, hybridConfig.effectiveGridSize));
  }, [gridPattern, hybridConfig.effectiveGridSize, dimensions, colorMode, solidColor, lengthMin, lengthMax, generateVectors, hybridConfig]);

  // Mouse tracking - Fixed to use SVG coordinates
  const svgRef = useRef<SVGSVGElement>(null);
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, []);

  useEffect(() => {
    if (mouseInfluence > 0 && svgRef.current) {
      const svg = svgRef.current;
      svg.addEventListener('mousemove', handleMouseMove);
      return () => svg.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mouseInfluence, handleMouseMove]);

  // Handle container resize for responsive canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // 🎯 CANVAS ADAPTATIVO: Usa mismos cálculos que contentArea
        const maxVectorLength = Math.max(lengthMax, 50);
        const padding = maxVectorLength; // Padding en ambos lados
        
        // Usar exactamente los mismos cálculos que hybridConfig
        const gridDimension = Math.sqrt(gridSize);
        const baseSpacing = Math.min(rect.width, rect.height) / (gridDimension + 1);
        
        // Fórmula: Canvas mínimo = gridSpace + padding en ambos lados  
        const gridRequiredWidth = baseSpacing * (gridDimension - 1);
        const gridRequiredHeight = baseSpacing * (gridDimension - 1);
        const minRequiredWidth = gridRequiredWidth + (padding * 2);
        const minRequiredHeight = gridRequiredHeight + (padding * 2);
        
        // Usar el espacio disponible pero garantizar el mínimo
        const availableWidth = rect.width - 40; // Margen mínimo del contenedor
        const availableHeight = rect.height - 40;
        
        const newWidth = Math.max(minRequiredWidth, availableWidth, 400);
        const newHeight = Math.max(minRequiredHeight, availableHeight, 300);
        
        setDimensions(prev => {
          // Solo actualizar si hay cambio significativo
          if (Math.abs(prev.width - newWidth) > 20 || Math.abs(prev.height - newHeight) > 20) {
            return { width: newWidth, height: newHeight };
          }
          return prev;
        });
      }
    };

    // Actualizar al montar
    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [lengthMax, spacing, gridSize]);

  // Animation loop
  useEffect(() => {
    if (animation === 'static' || isPaused) return;

    const animate = () => {
      setAnimationTime(prev => prev + 0.02 * speed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animation, speed, isPaused]);

  // Smooth interpolation helper
  const smoothLerp = (current: number, target: number, factor: number = 0.1): number => {
    return current + (target - current) * factor;
  };

  // Vector path generation functions
  const generateVectorPath = (vector: Vector, animatedLength: number, animatedAngle: number, time: number, index: number): string => {
    const startX = vector.x;
    const startY = vector.y;
    
    switch (vectorShape) {
      case 'straight':
        const endX = startX + Math.cos(animatedAngle) * animatedLength;
        const endY = startY + Math.sin(animatedAngle) * animatedLength;
        return `M ${startX} ${startY} L ${endX} ${endY}`;
        
      case 'wave':
        return generateWavePath(startX, startY, animatedAngle, animatedLength, time, index);
        
      case 'bezier':
        return generateBezierPath(startX, startY, animatedAngle, animatedLength, time, index);
        
      case 'spiral':
        return generateSpiralPath(startX, startY, animatedAngle, animatedLength, time, index);
        
      case 'arc':
        return generateArcPath(startX, startY, animatedAngle, animatedLength, time, index);
        
      case 'organic':
        return generateOrganicPath(startX, startY, animatedAngle, animatedLength, time, index);
        
      default:
        const defaultEndX = startX + Math.cos(animatedAngle) * animatedLength;
        const defaultEndY = startY + Math.sin(animatedAngle) * animatedLength;
        return `M ${startX} ${startY} L ${defaultEndX} ${defaultEndY}`;
    }
  };

  // Wave path generator
  const generateWavePath = (startX: number, startY: number, angle: number, length: number, time: number, index: number): string => {
    const segments = Math.max(3, Math.floor(length / 10));
    let path = `M ${startX} ${startY}`;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = startX + Math.cos(angle) * length * t;
      const baseY = startY + Math.sin(angle) * length * t;
      
      // Wave oscillation perpendicular to the main direction
      const waveAmplitude = curvatureIntensity * 3;
      const waveOffset = Math.sin(t * Math.PI * waveFrequency + time * 2 + index * 0.1) * waveAmplitude;
      
      const perpAngle = angle + Math.PI / 2;
      const waveX = baseX + Math.cos(perpAngle) * waveOffset;
      const waveY = baseY + Math.sin(perpAngle) * waveOffset;
      
      path += ` L ${waveX} ${waveY}`;
    }
    
    return path;
  };

  // Bezier curve path generator
  const generateBezierPath = (startX: number, startY: number, angle: number, length: number, time: number, index: number): string => {
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Control points for smooth curve
    const curvature = curvatureIntensity * 0.5 * length;
    const midT = 0.5;
    const midX = startX + Math.cos(angle) * length * midT;
    const midY = startY + Math.sin(angle) * length * midT;
    
    // Perpendicular offset for control points
    const perpAngle = angle + Math.PI / 2;
    const timeOffset = Math.sin(time + index * 0.1) * curvature;
    
    const ctrl1X = midX + Math.cos(perpAngle) * timeOffset;
    const ctrl1Y = midY + Math.sin(perpAngle) * timeOffset;
    
    return `M ${startX} ${startY} Q ${ctrl1X} ${ctrl1Y} ${endX} ${endY}`;
  };

  // Spiral path generator
  const generateSpiralPath = (startX: number, startY: number, angle: number, length: number, time: number, index: number): string => {
    const turns = spiralTightness * 2;
    const segments = Math.max(8, Math.floor(length / 5));
    let path = `M ${startX} ${startY}`;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const currentLength = length * t;
      const spiralAngle = angle + t * turns * 2 * Math.PI + time * 0.5;
      
      const x = startX + Math.cos(spiralAngle) * currentLength;
      const y = startY + Math.sin(spiralAngle) * currentLength;
      
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  // Arc path generator
  const generateArcPath = (startX: number, startY: number, angle: number, length: number, time: number, index: number): string => {
    const arcAngle = curvatureIntensity * Math.PI * 0.5;
    const radius = length;
    
    // Calculate arc end point
    const endAngle = angle + arcAngle;
    const endX = startX + Math.cos(endAngle) * radius;
    const endY = startY + Math.sin(endAngle) * radius;
    
    // Arc flags
    const largeArcFlag = Math.abs(arcAngle) > Math.PI ? 1 : 0;
    const sweepFlag = arcAngle > 0 ? 1 : 0;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
  };

  // Organic path generator
  const generateOrganicPath = (startX: number, startY: number, angle: number, length: number, time: number, index: number): string => {
    const segments = Math.max(5, Math.floor(length / 8));
    let path = `M ${startX} ${startY}`;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = startX + Math.cos(angle) * length * t;
      const baseY = startY + Math.sin(angle) * length * t;
      
      // Organic noise-based deformation
      const noiseX = Math.sin(time * 1.3 + index * 0.2 + t * 5) * organicNoise * 5;
      const noiseY = Math.cos(time * 0.8 + index * 0.3 + t * 7) * organicNoise * 5;
      
      // Secondary noise for more complexity
      const noise2X = Math.sin(time * 2.1 + index * 0.15 + t * 3) * organicNoise * 2;
      const noise2Y = Math.cos(time * 1.7 + index * 0.25 + t * 4) * organicNoise * 2;
      
      const finalX = baseX + noiseX + noise2X;
      const finalY = baseY + noiseY + noise2Y;
      
      path += ` L ${finalX} ${finalY}`;
    }
    
    return path;
  };

  // Calculate dynamic length with all factors and smooth transitions
  const calculateDynamicLength = (vector: Vector, time: number, index: number): number => {
    const { width, height } = dimensions;

    // DEBUG: Log to verify function is being called (commented out to reduce console spam)
    // if (index === 0) {
    //   console.log('🔧 calculateDynamicLength called with:', { lengthMin, lengthMax, oscillationFreq, time });
    // }

    // 1. Start with base length mapped to our range
    const length = lengthMin + ((lengthMax - lengthMin) * 0.5);

    // 2. Enhanced oscillation with spatial patterns
    const basePhase = index * 0.1;
    const spatialPhaseX = vector.x * 0.01;
    const spatialPhaseY = vector.y * 0.01;
    const combinedPhase = basePhase + spatialPhaseX + spatialPhaseY;
    
    // Multiple oscillation waves for complex patterns
    const wave1 = Math.sin(time * oscillationFreq + combinedPhase);
    const wave2 = Math.sin(time * oscillationFreq * 1.618 + combinedPhase * 0.5) * 0.3; // Golden ratio
    const wave3 = Math.cos(time * oscillationFreq * 0.7 + combinedPhase * 1.5) * 0.2;
    const complexOscillation = (wave1 + wave2 + wave3) * oscillationAmp * (lengthMax - lengthMin);
    
    // 3. Pulse waves (global breathing effect)
    const pulse = Math.sin(time * pulseSpeed) * 0.3 + 1;
    
    // 4. Enhanced bidirectional spatial factor
    const centerX = width / 2;
    const centerY = height / 2;
    const distanceFromCenter = Math.sqrt((vector.x - centerX) ** 2 + (vector.y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const normalizedDistance = distanceFromCenter / maxDistance;
    
    let spatialModifier = 1;
    switch (spatialMode) {
      case 'edge':
        // Original behavior: edge vectors longer
        spatialModifier = 1 + normalizedDistance * spatialFactor;
        break;
      case 'center':
        // Reverse: center vectors longer
        spatialModifier = 1 + (1 - normalizedDistance) * spatialFactor;
        break;
      case 'mixed':
        // Sine wave pattern from center to edge
        spatialModifier = 1 + Math.sin(normalizedDistance * Math.PI * 2) * spatialFactor * 0.5;
        break;
    }

    // 5. Enhanced mouse influence with different modes
    let mouseModifier = 1;
    if (mouseInfluence > 0) {
      const mouseDistance = Math.sqrt((vector.x - mousePos.x) ** 2 + (vector.y - mousePos.y) ** 2);
      const maxMouseDistance = Math.sqrt(width ** 2 + height ** 2);
      const normalizedMouseDistance = mouseDistance / maxMouseDistance;
      
      switch (mouseMode) {
        case 'attract':
          // Vectors near mouse grow larger
          mouseModifier = 1 + (1 - normalizedMouseDistance) * mouseInfluence * 2;
          break;
        case 'repel':
          // Vectors near mouse shrink
          mouseModifier = 1 - (1 - normalizedMouseDistance) * mouseInfluence * 0.8;
          break;
        case 'stretch':
          // Dynamic stretching based on mouse movement
          const stretchFactor = Math.sin(normalizedMouseDistance * Math.PI) * mouseInfluence;
          mouseModifier = 1 + stretchFactor * 1.5;
          break;
      }
      
      // Ensure modifier stays positive
      mouseModifier = Math.max(0.1, mouseModifier);
    }

    // 6. Enhanced Physics-based modulation
    let physicsModifier = 1;
    switch (physicsMode) {
      case 'velocity':
        // Improved velocity simulation with directional flow
        const flowX = Math.sin(time * 0.8 + vector.x * 0.02);
        const flowY = Math.cos(time * 1.2 + vector.y * 0.02);
        const velocityMagnitude = Math.sqrt(flowX * flowX + flowY * flowY);
        physicsModifier = 0.6 + velocityMagnitude * 0.7;
        break;
      case 'pressure':
        // Enhanced pressure waves with multiple sources
        const wave1 = Math.sin(time * 1.5 + distanceFromCenter * 0.02);
        const wave2 = Math.sin(time * 2.1 + Math.sqrt((vector.x - width*0.3)**2 + (vector.y - height*0.7)**2) * 0.015);
        const wave3 = Math.sin(time * 0.9 + Math.sqrt((vector.x - width*0.8)**2 + (vector.y - height*0.2)**2) * 0.018);
        physicsModifier = 0.7 + (wave1 + wave2 + wave3) * 0.15;
        break;
      case 'field':
        // Enhanced electromagnetic field with interference patterns
        const fieldX = Math.sin(vector.x * 0.02 + time * 1.3) * Math.cos(vector.y * 0.015 + time * 0.8);
        const fieldY = Math.cos(vector.x * 0.018 + time * 0.9) * Math.sin(vector.y * 0.022 + time * 1.1);
        const interferencePattern = fieldX * fieldY;
        physicsModifier = 0.5 + Math.abs(interferencePattern) * 1.2 + (interferencePattern * 0.3);
        break;
    }

    // Combine all factors and apply intensity
    const targetLength = (length + complexOscillation) * pulse * spatialModifier * mouseModifier * physicsModifier * intensity;
    
    // Clamp to our min/max range
    const clampedTarget = Math.max(lengthMin, Math.min(lengthMax, targetLength));
    
    // Apply smooth interpolation for fluid transitions
    const key = `length_${index}`;
    const currentValue = prevValuesRef.current[key] || clampedTarget;
    const smoothedLength = smoothLerp(currentValue, clampedTarget, 0.15);
    
    // Update previous values for next frame
    prevValuesRef.current[key] = smoothedLength;
    
    // DEBUG: Log final result for first vector (commented out to reduce console spam)
    // if (index === 0) {
    //   console.log('🎯 Final length calculation:', {
    //     baseLength: length,
    //     complexOscillation,
    //     pulse,
    //     spatialModifier,
    //     mouseModifier,
    //     physicsModifier,
    //     intensity,
    //     targetLength,
    //     smoothedLength
    //   });
    // }
    
    return smoothedLength;
  };

  // Dynamic color calculation function
  const calculateDynamicColor = (vector: Vector, time: number, animationData: any = {}) => {
    if (colorMode !== 'dynamic') return colorMode === 'solid' ? solidColor : generateColor(0, vector.x, vector.y, time);
    
    let intensity = 0;
    
    switch (colorIntensityMode) {
      case 'field':
        // Use field strength if available (from dipole, turbulence, etc)
        if (animationData.fieldStrength !== undefined) {
          intensity = Math.min(100, animationData.fieldStrength * 500);
        } else {
          // Fallback: distance from center
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          const distFromCenter = Math.sqrt((vector.x - centerX) ** 2 + (vector.y - centerY) ** 2);
          const maxDist = Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2) / 2;
          intensity = (distFromCenter / maxDist) * 100;
        }
        break;
        
      case 'velocity':
        // Use magnitude of movement
        intensity = (animationData.velocity || 0) * 50;
        break;
        
      case 'distance':
        // Distance from center
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const distFromCenter = Math.sqrt((vector.x - centerX) ** 2 + (vector.y - centerY) ** 2);
        const maxDist = Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2) / 2;
        intensity = (distFromCenter / maxDist) * 100;
        break;
        
      case 'angle':
        // Based on angle
        intensity = ((vector.angle % 360) / 360) * 100;
        break;
        
      default:
        intensity = 50;
    }
    
    const hue = (time * colorHueShift + intensity * 2) % 360;
    const saturation = colorSaturation;
    const lightness = Math.max(20, Math.min(100, colorBrightness + intensity * 0.3));
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Calculate animated properties - Fixed to respect Length Dynamics
  const getAnimatedVector = (vector: Vector, time: number, index: number) => {
    let animatedAngle = vector.angle;
    const dynamicLength = calculateDynamicLength(vector, time, index);
    let animatedLength = dynamicLength;
    let animatedColor = colorMode === 'solid' ? solidColor : generateColor(index, vector.x, vector.y, time);
    const animationData: any = {};
    const { width, height } = dimensions;

    switch (animation) {
      case 'rotation':
        animatedAngle = vector.angle + time;
        break;
        
      case 'wave':
        const waveOffset = Math.sin(time * 2 + vector.x * 0.01 + vector.y * 0.01) * 0.5;
        animatedAngle = vector.angle + waveOffset;
        // Combine wave effect with Length Dynamics instead of overriding
        const waveModifier = 1 + Math.sin(time * 3 + vector.x * 0.02) * 0.3;
        animatedLength = dynamicLength * waveModifier;
        
        // Set animation data for dynamic coloring
        animationData.velocity = Math.abs(waveOffset) * 2;
        break;
        
      case 'spiral':
        const distance = Math.sqrt(Math.pow(vector.x - width/2, 2) + Math.pow(vector.y - height/2, 2));
        animatedAngle = vector.angle + time + distance * 0.01;
        
        // Set animation data for dynamic coloring
        animationData.fieldStrength = distance * 0.01;
        
        const hueShift = (time * 50 + distance * 0.5) % 360;
        animatedColor = `hsl(${hueShift}, 70%, 60%)`;
        break;
        
      case 'dipole':
        // Dipole field simulation - respects Length Dynamics
        const centerX = width / 2;
        const centerY = height / 2;
        const separation = Math.min(width, height) * 0.2; // Distance between charges
        
        // Positive charge position
        const x1 = centerX + Math.cos(time * 0.5) * separation;
        const y1 = centerY + Math.sin(time * 0.5) * separation;
        
        // Negative charge position  
        const x2 = centerX - Math.cos(time * 0.5) * separation;
        const y2 = centerY - Math.sin(time * 0.5) * separation;
        
        // Calculate field at vector position
        const dx1 = vector.x - x1;
        const dy1 = vector.y - y1;
        const dx2 = vector.x - x2;
        const dy2 = vector.y - y2;
        
        const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 1; // +1 to avoid division by zero
        const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 1;
        
        // Electric field components (simplified)
        const Ex = (dx1 / (r1 * r1 * r1)) - (dx2 / (r2 * r2 * r2));
        const Ey = (dy1 / (r1 * r1 * r1)) - (dy2 / (r2 * r2 * r2));
        
        animatedAngle = Math.atan2(Ey, Ex);
        // Combine dipole field strength with Length Dynamics
        const fieldStrengthModifier = 0.5 + Math.sqrt(Ex * Ex + Ey * Ey) * 30;
        animatedLength = dynamicLength * fieldStrengthModifier;
        
        // Set animation data for dynamic coloring
        const fieldStrength = Math.sqrt(Ex * Ex + Ey * Ey);
        animationData.fieldStrength = fieldStrength;
        break;
        
      case 'vortex':
        // Multiple vortex centers creating chaotic flow
        const vortexCenters = [
          { x: width * 0.3, y: height * 0.3, strength: 1 },
          { x: width * 0.7, y: height * 0.7, strength: -1 },
          { x: width * 0.7, y: height * 0.3, strength: 0.5 },
          { x: width * 0.3, y: height * 0.7, strength: -0.5 }
        ];
        
        let vx = 0, vy = 0;
        vortexCenters.forEach(center => {
          const dx = vector.x - center.x;
          const dy = vector.y - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const strength = center.strength * Math.sin(time + dist * 0.01);
          
          vx += -dy * strength / (dist * dist);
          vy += dx * strength / (dist * dist);
        });
        
        animatedAngle = Math.atan2(vy, vx) + time * 0.1;
        animatedLength = vector.length * (0.8 + Math.sqrt(vx * vx + vy * vy) * 2);
        
        // Set animation data for dynamic coloring
        const vortexVelocity = Math.sqrt(vx * vx + vy * vy);
        animationData.velocity = vortexVelocity;
        animationData.fieldStrength = vortexVelocity * 0.5;
        
        const vortexHue = (Math.atan2(vy, vx) * 180 / Math.PI + 180 + time * 50) % 360;
        animatedColor = `hsl(${vortexHue}, 90%, 65%)`;
        break;
        
      case 'turbulence':
        // Chaotic turbulent flow with multiple scales
        const scales = [0.005, 0.01, 0.02, 0.04];
        let turbX = 0, turbY = 0;
        
        scales.forEach((scale, i) => {
          const freq = scale * (i + 1);
          const phase = time * (i + 1) * 0.3;
          
          turbX += Math.sin(vector.x * freq + phase) * Math.cos(vector.y * freq * 1.3 + phase);
          turbY += Math.cos(vector.x * freq * 1.1 + phase) * Math.sin(vector.y * freq + phase);
        });
        
        // Add some curl
        const curlX = -Math.sin(vector.y * 0.008 + time * 0.2);
        const curlY = Math.sin(vector.x * 0.008 + time * 0.2);
        
        turbX += curlX * 0.5;
        turbY += curlY * 0.5;
        
        animatedAngle = Math.atan2(turbY, turbX);
        // Combine turbulence with Length Dynamics
        const turbulenceModifier = 0.6 + Math.abs(turbX + turbY) * 0.8;
        animatedLength = dynamicLength * turbulenceModifier;
        
        // Set animation data for dynamic coloring
        const turbulenceIntensity = Math.sqrt(turbX * turbX + turbY * turbY);
        animationData.velocity = turbulenceIntensity;
        animationData.fieldStrength = turbulenceIntensity * 2;
        
        const turbHue = (time * 20 + turbulenceIntensity * 100 + vector.x * 0.1) % 360;
        animatedColor = `hsl(${turbHue}, 85%, ${50 + turbulenceIntensity * 20}%)`;
        break;
        
      case 'pinwheels':
        // Pinwheels animation - multiple rotating centers
        const pinwheelCount = 4;
        const rotationSpeed = 2;
        const influenceRadius = Math.min(width, height) * 0.15;
        
        // Calculate pinwheel centers
        const pinwheelCenters = [];
        for (let i = 0; i < pinwheelCount; i++) {
          const pinwheelAngle = (i / pinwheelCount) * Math.PI * 2 + time * 0.3;
          const radius = Math.min(width, height) * 0.25;
          const pinCenterX = width * 0.5 + Math.cos(pinwheelAngle) * radius;
          const pinCenterY = height * 0.5 + Math.sin(pinwheelAngle) * radius;
          pinwheelCenters.push({ x: pinCenterX, y: pinCenterY });
        }
        
        // Find closest pinwheel and calculate influence
        let closestDist = Infinity;
        let influenceAngle = 0;
        
        pinwheelCenters.forEach((center, i) => {
          const dx = vector.x - center.x;
          const dy = vector.y - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < closestDist) {
            closestDist = dist;
            const pinwheelRotation = time * rotationSpeed + i * Math.PI * 0.5;
            const influence = Math.max(0, 1 - dist / influenceRadius);
            influenceAngle = Math.atan2(dy, dx) + pinwheelRotation * influence;
          }
        });
        
        animatedAngle = vector.angle + influenceAngle * 0.3;
        
        // Set animation data for dynamic coloring
        const pinwheelVelocity = Math.min(1, influenceRadius / (closestDist + 1));
        animationData.velocity = pinwheelVelocity;
        
        const pinwheelHue = (time * 30 + closestDist * 0.5) % 360;
        animatedColor = `hsl(${pinwheelHue}, 80%, 60%)`;
        break;
        
      case 'seaWaves':
        // Sea waves animation - organic wave patterns
        const baseFrequency = 0.8;
        const rippleFrequency = 2.5;
        const choppiness = 0.4;
        const spatialFactor = 0.005;
        
        // Multiple wave layers for realistic ocean effect
        const wave1 = Math.sin(time * baseFrequency + vector.x * spatialFactor);
        const wave2 = Math.sin(time * baseFrequency * 1.3 + vector.y * spatialFactor * 0.8) * 0.7;
        const ripple1 = Math.sin(time * rippleFrequency + (vector.x + vector.y) * spatialFactor * 2) * 0.3;
        const ripple2 = Math.cos(time * rippleFrequency * 0.9 + vector.x * spatialFactor * 1.5) * 0.2;
        
        const waveHeight = wave1 + wave2 + ripple1 + ripple2;
        const waveGradientX = Math.cos(time * baseFrequency + vector.x * spatialFactor) * spatialFactor;
        const waveGradientY = Math.cos(time * baseFrequency * 1.3 + vector.y * spatialFactor * 0.8) * spatialFactor * 0.8;
        
        // Calculate wave normal for realistic water behavior
        const waveAngle = Math.atan2(waveGradientY, waveGradientX);
        animatedAngle = waveAngle + Math.sin(time + vector.x * 0.01) * choppiness;
        
        // Combine with Length Dynamics for organic length variation
        const seaWaveModifier = 0.7 + Math.abs(waveHeight) * 0.6;
        animatedLength = dynamicLength * seaWaveModifier;
        
        // Set animation data for dynamic coloring
        animationData.velocity = Math.abs(waveHeight);
        animationData.fieldStrength = Math.sqrt(waveGradientX * waveGradientX + waveGradientY * waveGradientY);
        
        const seaHue = 180 + Math.sin(time * 0.5 + waveHeight * 2) * 30; // Blue-green range
        animatedColor = `hsl(${seaHue}, 70%, ${45 + Math.abs(waveHeight) * 20}%)`;
        break;
        
      case 'geometricPattern':
        // Geometric pattern animation - mathematical precision
        const rotSpeed = 1.5;
        
        const geoCenterX = width * 0.5;
        const geoCenterY = height * 0.5;
        const distFromCenter = Math.sqrt((vector.x - geoCenterX) ** 2 + (vector.y - geoCenterY) ** 2);
        const angleFromCenter = Math.atan2(vector.y - geoCenterY, vector.x - geoCenterX);
        
        // Default to radial pattern (could be made configurable later)
        const spokeCount = 8;
        const spokeAngle = Math.round(angleFromCenter / (Math.PI * 2 / spokeCount)) * (Math.PI * 2 / spokeCount);
        animatedAngle = spokeAngle + time * rotSpeed + Math.sin(distFromCenter * 0.01) * 0.3;
        
        // Set animation data for dynamic coloring
        const geometricVelocity = Math.abs(Math.sin(time + distFromCenter * 0.02));
        animationData.velocity = geometricVelocity;
        animationData.fieldStrength = distFromCenter * 0.01;
        
        const geoHue = (angleFromCenter * 180 / Math.PI + 180 + time * 20) % 360;
        animatedColor = `hsl(${geoHue}, 75%, 65%)`;
        break;
        
      case 'flowField':
        // Flow field using layered noise for organic movement
        const flowTimeScale = time * 0.001;
        const flowSpatialScale = 0.005;
        
        // Three noise layers with different frequencies
        const flowNoise1 = simpleNoise(vector.x * flowSpatialScale, vector.y * flowSpatialScale, flowTimeScale) * 0.5;
        const flowNoise2 = simpleNoise(vector.x * flowSpatialScale * 2, vector.y * flowSpatialScale * 2, flowTimeScale * 1.5) * 0.25;
        const flowNoise3 = simpleNoise(vector.x * flowSpatialScale * 4, vector.y * flowSpatialScale * 4, flowTimeScale * 0.8) * 0.125;
        
        const flowNoiseValue = flowNoise1 + flowNoise2 + flowNoise3;
        const flowCoherence = intensity; // Use intensity as coherence factor
        animatedAngle = flowNoiseValue * Math.PI * flowCoherence;
        
        // Length modulation based on noise
        const flowLengthMultiplier = 0.6 + Math.abs(flowNoiseValue) * 0.8;
        animatedLength = vector.length * flowLengthMultiplier;
        
        // Animation data for dynamic coloring
        animationData.velocity = Math.abs(flowNoiseValue);
        animationData.fieldStrength = Math.abs(flowLengthMultiplier - 1);
        
        const flowHue = 200 + flowNoiseValue * 60; // Blue-cyan-green range
        animatedColor = `hsl(${flowHue}, 65%, 50%)`;
        break;
        
      case 'curlNoise':
        // Curl noise for divergence-free turbulent flow
        const curlTimeScale = time * 0.0008;
        const curlSpatialScale = 0.004;
        const epsilon = 1.0; // Finite difference step
        
        // Calculate curl using finite differences
        const curlP_x_pos = simpleNoise((vector.x + epsilon) * curlSpatialScale, vector.y * curlSpatialScale, curlTimeScale);
        const curlP_x_neg = simpleNoise((vector.x - epsilon) * curlSpatialScale, vector.y * curlSpatialScale, curlTimeScale);
        const curlP_y_pos = simpleNoise(vector.x * curlSpatialScale, (vector.y + epsilon) * curlSpatialScale, curlTimeScale);
        const curlP_y_neg = simpleNoise(vector.x * curlSpatialScale, (vector.y - epsilon) * curlSpatialScale, curlTimeScale);
        
        // Curl = (∂P/∂y, -∂P/∂x)
        const curlDpDy = (curlP_y_pos - curlP_y_neg) / (2 * epsilon);
        const curlDpDx = (curlP_x_pos - curlP_x_neg) / (2 * epsilon);
        
        // Multi-octave turbulence
        const curlTurbulence1 = simpleNoise(vector.x * curlSpatialScale * 2, vector.y * curlSpatialScale * 2, curlTimeScale * 1.3) * 0.5;
        const curlTurbulence2 = simpleNoise(vector.x * curlSpatialScale * 4, vector.y * curlSpatialScale * 4, curlTimeScale * 0.7) * 0.25;
        
        const curlVectorX = curlDpDy + curlTurbulence1;
        const curlVectorY = -curlDpDx + curlTurbulence2;
        
        animatedAngle = Math.atan2(curlVectorY, curlVectorX);
        
        const curlMagnitude = Math.sqrt(curlVectorX * curlVectorX + curlVectorY * curlVectorY);
        animatedLength = vector.length * (0.5 + Math.min(curlMagnitude, 1.5));
        
        // Animation data
        animationData.velocity = curlMagnitude;
        animationData.fieldStrength = Math.abs(curlTurbulence1 + curlTurbulence2);
        
        const curlHue = 280 + curlMagnitude * 80; // Purple-pink range
        animatedColor = `hsl(${curlHue}, 70%, 55%)`;
        break;
        
      case 'rippleEffect':
        // Radial wave propagation from center
        const rippleCenterX = width * 0.5;
        const rippleCenterY = height * 0.5;
        const rippleDistance = Math.sqrt((vector.x - rippleCenterX) ** 2 + (vector.y - rippleCenterY) ** 2);
        
        const rippleWaveLength = 50 * intensity; // Configurable wavelength
        const rippleWaveSpeed = 2.0;
        const ripplePhase = (rippleDistance / rippleWaveLength - time * rippleWaveSpeed * 0.001) * 2 * Math.PI;
        const rippleAmplitude = Math.sin(ripplePhase) * Math.exp(-rippleDistance * 0.002); // Decay with distance
        
        // Base radial angle
        const rippleBaseAngle = Math.atan2(vector.y - rippleCenterY, vector.x - rippleCenterX);
        animatedAngle = rippleBaseAngle + rippleAmplitude * Math.PI * 0.5;
        
        // Length modulation
        const rippleLengthMod = 0.7 + Math.abs(rippleAmplitude) * 0.6;
        animatedLength = vector.length * rippleLengthMod;
        
        // Animation data
        animationData.velocity = Math.abs(rippleAmplitude);
        animationData.fieldStrength = rippleDistance * 0.001;
        
        const rippleHue = 180 + rippleAmplitude * 40; // Blue-teal range
        animatedColor = `hsl(${rippleHue}, 75%, 60%)`;
        break;
        
      case 'perlinFlow':
        // Multi-octave Perlin noise for organic flow
        const perlinTimeScale = time * 0.0006;
        const perlinSpatialScale = 0.003;
        const perlinOctaves = 4;
        const perlinPersistence = 0.6;
        const perlinAngleMultiplier = 2.5;
        
        let perlinNoiseValue = 0;
        let perlinAmplitude = 1;
        let perlinFrequency = 1;
        
        // Sum multiple octaves
        for (let i = 0; i < perlinOctaves; i++) {
          perlinNoiseValue += simpleNoise(
            vector.x * perlinSpatialScale * perlinFrequency,
            vector.y * perlinSpatialScale * perlinFrequency,
            perlinTimeScale * perlinFrequency
          ) * perlinAmplitude;
          perlinAmplitude *= perlinPersistence;
          perlinFrequency *= 2;
        }
        
        const perlinBaseAngle = Math.atan2(vector.y - height * 0.5, vector.x - width * 0.5);
        animatedAngle = perlinBaseAngle + perlinNoiseValue * perlinAngleMultiplier * Math.PI;
        
        // Length based on noise intensity
        const perlinLengthMod = 0.6 + Math.abs(perlinNoiseValue) * 0.7;
        animatedLength = vector.length * perlinLengthMod;
        
        // Animation data
        animationData.velocity = Math.abs(perlinNoiseValue);
        animationData.fieldStrength = perlinLengthMod;
        
        const perlinHue = 120 + perlinNoiseValue * 60; // Green-yellow range
        animatedColor = `hsl(${perlinHue}, 65%, 55%)`;
        break;
        
      case 'gaussianGradient':
        // Gaussian field with temporal pulsing
        const gaussCenterX = width * 0.5;
        const gaussCenterY = height * 0.5;
        const gaussDistance = Math.sqrt((vector.x - gaussCenterX) ** 2 + (vector.y - gaussCenterY) ** 2);
        
        const gaussSigma = Math.max(width, height) * 0.3; // Gaussian width
        const gaussStrength = intensity * 2;
        const gaussPulse = 1 + Math.sin(time * 0.003) * 0.7; // Temporal pulsing
        
        // Gaussian function with pulsing
        const gaussGaussian = Math.exp(-(gaussDistance * gaussDistance) / (2 * gaussSigma * gaussSigma)) * gaussPulse;
        
        // Radial gradient direction (attract or repel based on config)
        const gaussDx = vector.x - gaussCenterX;
        const gaussDy = vector.y - gaussCenterY;
        const gaussMode = 1; // 1 for attract, -1 for repel
        
        animatedAngle = Math.atan2(gaussMode * gaussDy, gaussMode * gaussDx);
        
        // Length based on Gaussian intensity
        const gaussIntensity = Math.min(gaussGaussian * gaussStrength * 3, 5.0);
        animatedLength = vector.length * (0.3 + gaussIntensity * 0.4);
        
        // Animation data
        animationData.velocity = gaussIntensity;
        animationData.fieldStrength = gaussGaussian;
        
        const gaussHue = 300 + gaussIntensity * 30; // Purple-magenta range
        animatedColor = `hsl(${gaussHue}, 80%, 60%)`;
        break;
    }

    // Apply dynamic coloring if enabled
    if (colorMode === 'dynamic') {
      animatedColor = calculateDynamicColor(vector, time, animationData);
    }

    return { ...vector, angle: animatedAngle, length: animatedLength, color: animatedColor };
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
      <svg 
        ref={svgRef}
        width={hybridConfig.effectiveCanvasWidth} 
        height={hybridConfig.effectiveCanvasHeight} 
        viewBox={`0 0 ${hybridConfig.effectiveCanvasWidth} ${hybridConfig.effectiveCanvasHeight}`}
        className="bg-black"
        style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Vectors */}
        {vectors.map((vector, index) => {
          const animatedVector = getAnimatedVector(vector, animationTime, index);
          const pathData = generateVectorPath(animatedVector, animatedVector.length, animatedVector.angle, animationTime, index);
          
          return (
            <g key={vector.id}>
              {vectorShape === 'straight' ? (
                // Render as line for straight vectors (better performance)
                <>
                  <line
                    x1={animatedVector.x}
                    y1={animatedVector.y}
                    x2={animatedVector.x + Math.cos(animatedVector.angle) * animatedVector.length}
                    y2={animatedVector.y + Math.sin(animatedVector.angle) * animatedVector.length}
                    stroke={animatedVector.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  {showArrowheads && (
                    <>
                      <circle
                        cx={animatedVector.x + Math.cos(animatedVector.angle) * animatedVector.length}
                        cy={animatedVector.y + Math.sin(animatedVector.angle) * animatedVector.length}
                        r="2.5"
                        fill={animatedVector.color}
                        opacity="1"
                      />
                      <circle
                        cx={animatedVector.x}
                        cy={animatedVector.y}
                        r="1.5"
                        fill="#ffffff"
                        opacity="0.7"
                      />
                    </>
                  )}
                </>
              ) : (
                // Render as path for curved vectors
                <path
                  d={pathData}
                  stroke={animatedVector.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
              )}
            </g>
          );
        })}
      </svg>
      

    </div>
  );
}