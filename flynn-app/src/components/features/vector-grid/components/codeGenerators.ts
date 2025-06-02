// Generadores de código para exportación
import type { SimpleVector, GridConfig, VectorConfig, SimpleVectorGridRef, AnimationType } from '../simple/simpleTypes';
import { isHSLColor, isGradientConfig, type GradientConfig, type HSLColor } from '../types/gradientTypes';

interface CodeGenerationData {
  vectors: SimpleVector[];
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: string;
  canvasWidth: number;
  canvasHeight: number;
  animationProps: Record<string, unknown>;
  nativeSVG?: string; // SVG generado por el sistema nativo
}

interface AppConfig {
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  canvasDimensions: { width: number; height: number };
  animationProps: Record<string, unknown>;
}

const calculateLinearGradientCoordinates = (angleInDegrees: number = 0): { x1: string; y1: string; x2: string; y2: string } => {
  // Para objectBoundingBox: el gradiente va de 0% a 100% en la dirección del ángulo
  // Ángulo 0° = horizontal hacia la derecha
  // Ángulo 90° = vertical hacia arriba
  // Ángulo 180° = horizontal hacia la izquierda
  // Ángulo 270° = vertical hacia abajo
  
  const angleRad = angleInDegrees * (Math.PI / 180);
  
  // Calcular vector de dirección
  const dirX = Math.cos(angleRad);
  const dirY = -Math.sin(angleRad); // Negativo porque SVG Y va hacia abajo
  
  // Para un gradiente en objectBoundingBox que vaya del inicio al final del vector
  // Necesitamos que el gradiente vaya de (0,0) a (100%, 100%) pero orientado
  
  // Punto inicial del gradiente (donde empieza el color)
  let x1 = 0;
  let y1 = 0;
  
  // Punto final del gradiente (donde termina el color)
  let x2 = 100;
  let y2 = 0;
  
  // Rotar según el ángulo - simplificado para objectBoundingBox
  if (Math.abs(dirX) > Math.abs(dirY)) {
    // Más horizontal
    x1 = dirX > 0 ? 0 : 100;
    x2 = dirX > 0 ? 100 : 0;
    y1 = 50;
    y2 = 50;
  } else {
    // Más vertical
    y1 = dirY > 0 ? 0 : 100;
    y2 = dirY > 0 ? 100 : 0;
    x1 = 50;
    x2 = 50;
  }

  return {
    x1: `${x1}%`,
    y1: `${y1}%`,
    x2: `${x2}%`,
    y2: `${y2}%`,
  };
};

const getGradientSvgId = (gradConfig: GradientConfig, vectorIndex?: number): string => {
  const relevantProps = {
    type: gradConfig.type,
    colors: gradConfig.colors,
    angle: gradConfig.angle,
    centerX: gradConfig.centerX,
    centerY: gradConfig.centerY,
    radius: gradConfig.radius,
    vectorIndex: vectorIndex // Incluir índice del vector para gradientes únicos
  };
  const stableString = JSON.stringify(relevantProps);
  let hash = 0;
  for (let i = 0; i < stableString.length; i++) {
    const char = stableString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `grad-${gradConfig.type}-${Math.abs(hash).toString(36)}`;
};

// Obtener datos del grid ref con configuración real de la app
export const extractGridData = async (
  gridRef: React.RefObject<SimpleVectorGridRef | null>,
  appConfig: AppConfig
): Promise<CodeGenerationData | null> => {
  if (!gridRef.current) {
    console.error('❌ [extractGridData] No hay gridRef.current');
    return null;
  }
  
  try {
    // Obtener vectores con estado actual de animación
    const vectors = gridRef.current.getCurrentVectors();
    
    // También podemos obtener el SVG nativo si es necesario
    // const svgString = await gridRef.current.exportSVG();
    
    const result = {
      vectors,
      gridConfig: appConfig.gridConfig,
      vectorConfig: appConfig.vectorConfig,
      animationType: appConfig.animationType,
      canvasWidth: appConfig.canvasDimensions.width,
      canvasHeight: appConfig.canvasDimensions.height,
      animationProps: appConfig.animationProps
      // nativeSVG: svgString // Agregar el SVG nativo si lo necesitamos
    };
    
    return result;
  } catch (error) {
    console.error('❌ [extractGridData] Error extrayendo datos del grid:', error);
    return null;
  }
};

// Generar código SVG real con la configuración exacta
export const generateSVGCode = (data: CodeGenerationData): string => {
  const { vectors, canvasWidth, canvasHeight, vectorConfig, gridConfig, animationType, nativeSVG } = data;
  
  // Si tenemos SVG nativo del sistema, usarlo (es más preciso)
  if (nativeSVG) {
    return nativeSVG;
  }

  const uniqueGradientConfigs = new Map<string, {gradConfig: GradientConfig, vector?: SimpleVector, vectorIndex?: number}>();
  
  // Collect gradients from individual vectors - cada vector con degradado necesita su propio gradiente
  vectors.forEach((vector, index) => {
    if (isGradientConfig(vector.color)) {
      const svgId = getGradientSvgId(vector.color, index);
      uniqueGradientConfigs.set(svgId, { gradConfig: vector.color, vector, vectorIndex: index });
    }
  });
  
  // Also collect gradient from vectorConfig.color if it's a gradient (para vectores sin degradado específico)
  if (isGradientConfig(vectorConfig.color)) {
    const svgId = getGradientSvgId(vectorConfig.color);
    uniqueGradientConfigs.set(svgId, { gradConfig: vectorConfig.color });
  }

  let gradientDefsString = '';
  if (uniqueGradientConfigs.size > 0) {
    gradientDefsString = '<defs>\n';
    uniqueGradientConfigs.forEach((gradData, id) => {
      const { gradConfig, vector } = gradData;
      
      if (gradConfig.type === 'linear') {
        let gradientElement = '';
        
        if (vector) {
          // Gradiente específico para este vector - usar coordenadas del vector
          const { x, y, angle, length } = vector;
          const actualLength = length || vectorConfig.length;
          
          // Calcular coordenadas del inicio y final del vector según rotationOrigin
          let startX = x;
          let startY = y;
          let endX = x;
          let endY = y;
          
          switch (vectorConfig.rotationOrigin) {
            case 'start':
              endX = x + Math.cos(angle * Math.PI / 180) * actualLength;
              endY = y + Math.sin(angle * Math.PI / 180) * actualLength;
              break;
            case 'center':
              const halfLength = actualLength / 2;
              startX = x - Math.cos(angle * Math.PI / 180) * halfLength;
              startY = y - Math.sin(angle * Math.PI / 180) * halfLength;
              endX = x + Math.cos(angle * Math.PI / 180) * halfLength;
              endY = y + Math.sin(angle * Math.PI / 180) * halfLength;
              break;
            case 'end':
              startX = x - Math.cos(angle * Math.PI / 180) * actualLength;
              startY = y - Math.sin(angle * Math.PI / 180) * actualLength;
              endX = x;
              endY = y;
              break;
            default: // center por defecto
              const defaultHalf = actualLength / 2;
              startX = x - Math.cos(angle * Math.PI / 180) * defaultHalf;
              startY = y - Math.sin(angle * Math.PI / 180) * defaultHalf;
              endX = x + Math.cos(angle * Math.PI / 180) * defaultHalf;
              endY = y + Math.sin(angle * Math.PI / 180) * defaultHalf;
          }
          
          gradientElement = `  <linearGradient id="${id}" x1="${startX.toFixed(2)}" y1="${startY.toFixed(2)}" x2="${endX.toFixed(2)}" y2="${endY.toFixed(2)}" gradientUnits="userSpaceOnUse">\n`;
        } else {
          // Gradiente genérico - usar objectBoundingBox
          const coords = calculateLinearGradientCoordinates(gradConfig.angle || 0);
          gradientElement = `  <linearGradient id="${id}" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">\n`;
        }
        
        gradientDefsString += gradientElement;
        gradConfig.colors.forEach((stop: any) => {
          gradientDefsString += `    <stop offset="${stop.offset * 100}%" stop-color="${stop.color}" />\n`;
        });
        gradientDefsString += '  </linearGradient>\n';
        
      } else if (gradConfig.type === 'radial') {
        // Basic radialGradient with cx, cy, r is implemented.
        // Future enhancements could include support for focus point (fx, fy, fr) if required.
        const cx = gradConfig.centerX !== undefined ? `${gradConfig.centerX * 100}%` : '50%';
        const cy = gradConfig.centerY !== undefined ? `${gradConfig.centerY * 100}%` : '50%';
        const r = gradConfig.radius !== undefined ? `${gradConfig.radius * 100}%` : '50%';

        gradientDefsString += `  <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">\n`;
        gradConfig.colors.forEach((stop: any) => {
          gradientDefsString += `    <stop offset="${stop.offset * 100}%" stop-color="${stop.color}" />\n`;
        });
        gradientDefsString += '  </radialGradient>\n';
      }
    });
    gradientDefsString += '</defs>\n';
  }
  
  const vectorElements = vectors.map((vector, index) => {
    const { x, y, angle, length, width, color } = vector;
    
    // Usar configuración actual del vector
    const actualLength = length || vectorConfig.length;
    const actualWidth = width || vectorConfig.width;
    
    // Determinar color real del vector
    let vectorColorValue: string;
    if (typeof color === 'string') {
      vectorColorValue = color;
    } else if (isHSLColor(color)) {
      vectorColorValue = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    } else if (isGradientConfig(color)) {
      const svgId = getGradientSvgId(color, index);
      vectorColorValue = `url(#${svgId})`;
    } else {
      // Fallback al color por defecto de vectorConfig o un color genérico
      const defaultConfigColor = vectorConfig.color;
      if (typeof defaultConfigColor === 'string') {
        vectorColorValue = defaultConfigColor;
      } else if (isHSLColor(defaultConfigColor)) {
        vectorColorValue = `hsl(${defaultConfigColor.h}, ${defaultConfigColor.s}%, ${defaultConfigColor.l}%)`;
      } else if (isGradientConfig(defaultConfigColor)) {
        const svgId = getGradientSvgId(defaultConfigColor);
        // Assuming that if defaultConfigColor is a gradient, it has been added to uniqueGradientConfigs
        // and its definition will be generated. Its ID is obtained via getGradientSvgId.
        vectorColorValue = `url(#${svgId})`;
        // The previous version of this block was correct, re-instating it to ensure no regression.
        // The error 15dabc2b-c739-4a38-aeb2-85249e5d314d was likely a misinterpretation of the previous state
        // or an issue with the diff. The getGradientSvgId call was already correctly in place for defaultConfigColor.
      } else {
        vectorColorValue = '#10b981'; // Último recurso
      }
    }
    
    // Calcular posición final basada en el punto de rotación
    let startX = x;
    let startY = y;
    let endX = x;
    let endY = y;
    
    switch (vectorConfig.rotationOrigin) {
      case 'start':
        endX = x + Math.cos(angle * Math.PI / 180) * actualLength;
        endY = y + Math.sin(angle * Math.PI / 180) * actualLength;
        break;
      case 'center':
        const halfLength = actualLength / 2;
        startX = x - Math.cos(angle * Math.PI / 180) * halfLength;
        startY = y - Math.sin(angle * Math.PI / 180) * halfLength;
        endX = x + Math.cos(angle * Math.PI / 180) * halfLength;
        endY = y + Math.sin(angle * Math.PI / 180) * halfLength;
        break;
      case 'end':
        startX = x - Math.cos(angle * Math.PI / 180) * actualLength;
        startY = y - Math.sin(angle * Math.PI / 180) * actualLength;
        endX = x;
        endY = y;
        break;
      default: // center por defecto
        const defaultHalf = actualLength / 2;
        startX = x - Math.cos(angle * Math.PI / 180) * defaultHalf;
        startY = y - Math.sin(angle * Math.PI / 180) * defaultHalf;
        endX = x + Math.cos(angle * Math.PI / 180) * defaultHalf;
        endY = y + Math.sin(angle * Math.PI / 180) * defaultHalf;
    }
    
    // Generar elemento SVG según la forma del vector
    switch (vectorConfig.shape) {
      case 'curve':
        const controlX = (startX + endX) / 2 + Math.cos((angle + 90) * Math.PI / 180) * actualLength * 0.3;
        const controlY = (startY + endY) / 2 + Math.sin((angle + 90) * Math.PI / 180) * actualLength * 0.3;
        return `  <path id="vector-${index}" 
    d="M ${startX.toFixed(2)} ${startY.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}" 
    fill="none" stroke="${vectorColorValue}" stroke-width="${actualWidth}" stroke-linecap="${vectorConfig.strokeLinecap}"/>`;
    
      case 'circle':
        const circleRadius = actualLength * 0.15;
        return `  <circle id="vector-${index}" 
    cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${circleRadius.toFixed(2)}" 
    fill="${vectorColorValue}"/>`;
    
      case 'line':
      default:
        return `  <line id="vector-${index}" 
    x1="${startX.toFixed(2)}" y1="${startY.toFixed(2)}" 
    x2="${endX.toFixed(2)}" y2="${endY.toFixed(2)}" 
    stroke="${vectorColorValue}" stroke-width="${actualWidth}" stroke-linecap="${vectorConfig.strokeLinecap}"/>`;
    }
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
     width="${canvasWidth}" 
     height="${canvasHeight}">
  
  <!-- Flynn Vector Grid Export -->
${gradientDefsString}
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Animation: ${animationType} -->
  <!-- Grid: ${gridConfig.rows}×${gridConfig.cols} = ${vectors.length} vectors -->
  <!-- Canvas: ${canvasWidth}×${canvasHeight} -->
  
  <defs>
    <style>
      .vector-grid {
        background-color: #0a0a0a;
      }
    </style>
  </defs>
  
  <rect width="100%" height="100%" fill="#0a0a0a" class="vector-grid"/>
  
  <!-- Vector Elements (Current State) -->
${vectorElements}
  
</svg>`;
};

// Generar código JavaScript real
export const generateJSCode = (data: CodeGenerationData): string => {
  const { vectors, gridConfig, vectorConfig, animationType, canvasWidth, canvasHeight } = data;
  
  // Preparar datos de vectores para serialización
  const vectorsData = vectors.slice(0, 10).map(v => ({
    x: Math.round(v.x),
    y: Math.round(v.y),
    angle: Math.round(v.angle * 100) / 100,
    length: Math.round(v.length),
    originalX: Math.round(v.originalX),
    originalY: Math.round(v.originalY)
  }));
  
  return `// Flynn Vector Grid Animation - JavaScript Export
// Generated: ${new Date().toLocaleString()}
// Original grid: ${gridConfig.rows}×${gridConfig.cols} = ${vectors.length} vectors
// Animation: ${animationType}

class VectorGrid {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    
    // Configuración
    this.config = {
      width: ${canvasWidth},
      height: ${canvasHeight},
      vectorColor: ${isGradientConfig(vectorConfig.color) ? JSON.stringify(vectorConfig.color) : `'${vectorConfig.color}'`},
      vectorLength: ${vectorConfig.length},
      vectorWidth: ${vectorConfig.width},
      animationType: '${animationType}',
      gridRows: ${gridConfig.rows},
      gridCols: ${gridConfig.cols},
      spacing: ${gridConfig.spacing},
      strokeLinecap: '${vectorConfig.strokeLinecap}'
    };
    
    // Inicializar vectores
    this.vectors = [];
    this.initVectors();
    
    // Configurar canvas
    this.setupCanvas();
  }
  
  setupCanvas() {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.backgroundColor = '#0a0a0a';
  }
  
  initVectors() {
    // Ejemplo de vectores extraídos del grid actual
    const sampleVectors = ${JSON.stringify(vectorsData, null, 4)};
    
    // Generar grid completo basado en configuración
    for (let row = 0; row < this.config.gridRows; row++) {
      for (let col = 0; col < this.config.gridCols; col++) {
        this.vectors.push({
          x: col * this.config.spacing + this.config.spacing / 2,
          y: row * this.config.spacing + this.config.spacing / 2,
          originalX: col * this.config.spacing + this.config.spacing / 2,
          originalY: row * this.config.spacing + this.config.spacing / 2,
          angle: 0,
          length: this.config.vectorLength,
          phase: row * col * 0.1 // Para variación en animación
        });
      }
    }
  }
  
  updateVectors() {
    const time = Date.now() * 0.001; // Tiempo en segundos
    
    this.vectors.forEach((vector, index) => {
      switch (this.config.animationType) {
        case 'smoothWaves':
          vector.angle = Math.sin(time + vector.originalX * 0.01) * 30;
          break;
          
        case 'centerPulse':
          const centerX = this.config.width / 2;
          const centerY = this.config.height / 2;
          const distance = Math.sqrt(
            Math.pow(vector.originalX - centerX, 2) + 
            Math.pow(vector.originalY - centerY, 2)
          );
          vector.angle = Math.sin(time * 2 - distance * 0.02) * 45;
          break;
          
        case 'vortex':
          const vortexCenterX = this.config.width / 2;
          const vortexCenterY = this.config.height / 2;
          const vortexAngle = Math.atan2(
            vector.originalY - vortexCenterY, 
            vector.originalX - vortexCenterX
          );
          vector.angle = (vortexAngle * 180 / Math.PI) + time * 50;
          break;
          
        case 'perlinFlow':
          // Simulación simple de Perlin noise
          vector.angle = (
            Math.sin(vector.originalX * 0.02 + time) * 
            Math.cos(vector.originalY * 0.02 + time * 1.5)
          ) * 180;
          break;
          
        case 'randomLoop':
          vector.angle = Math.sin(time + vector.phase) * 360;
          break;
          
        default: // none o cualquier otra
          vector.angle += 0.5; // Rotación simple
      }
    });
  }
  
  drawVectors() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    
    this.vectors.forEach(vector => {
      this.ctx.save();
      
      // Posicionar y rotar
      this.ctx.translate(vector.x, vector.y);
      this.ctx.rotate(vector.angle * Math.PI / 180);
      
      // Estilo
      this.ctx.strokeStyle = this.config.vectorColor;
      this.ctx.lineWidth = this.config.vectorWidth;
      this.ctx.lineCap = this.config.strokeLinecap;
      
      // Dibujar línea
      this.ctx.beginPath();
      this.ctx.moveTo(-vector.length / 2, 0);
      this.ctx.lineTo(vector.length / 2, 0);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }
  
  animate() {
    this.updateVectors();
    this.drawVectors();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  start() {
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Uso:
// const grid = new VectorGrid('vectorCanvas');
// grid.start();

// HTML necesario:
// <canvas id="vectorCanvas"></canvas>`;
};

// Generar componente React real
export const generateReactCode = (data: CodeGenerationData): string => {
  const { vectors, gridConfig, vectorConfig, animationType, canvasWidth, canvasHeight } = data;
  
  return `import React, { useEffect, useRef, useCallback } from 'react';

interface VectorGridProps {
  width?: number;
  height?: number;
  vectorColor?: string;
  animationType?: string;
  strokeLinecap?: string;
  className?: string;
}

// Tipo para vectores internos
interface Vector {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  angle: number;
  length: number;
  phase: number;
}

export const VectorGrid: React.FC<VectorGridProps> = ({
  width = ${canvasWidth},
  height = ${canvasHeight},
  vectorColor = '${vectorConfig.color}',
  animationType = '${animationType}',
  strokeLinecap = '${vectorConfig.strokeLinecap}',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const vectorsRef = useRef<Vector[]>([]);
  
  // Configuración extraída del grid original
  const config = {
    gridRows: ${gridConfig.rows},
    gridCols: ${gridConfig.cols},
    spacing: ${gridConfig.spacing},
    vectorLength: ${vectorConfig.length},
    vectorWidth: ${vectorConfig.width}
  };
  
  // Inicializar vectores
  const initVectors = useCallback(() => {
    const vectors: Vector[] = [];
    
    for (let row = 0; row < config.gridRows; row++) {
      for (let col = 0; col < config.gridCols; col++) {
        const x = col * config.spacing + config.spacing / 2;
        const y = row * config.spacing + config.spacing / 2;
        
        vectors.push({
          x,
          y,
          originalX: x,
          originalY: y,
          angle: 0,
          length: config.vectorLength,
          phase: row * col * 0.1
        });
      }
    }
    
    vectorsRef.current = vectors;
  }, [config.gridRows, config.gridCols, config.spacing, config.vectorLength]);
  
  // Actualizar animación de vectores
  const updateVectors = useCallback((time: number) => {
    const t = time * 0.001; // Convertir a segundos
    
    vectorsRef.current.forEach((vector, index) => {
      switch (animationType) {
        case 'smoothWaves':
          vector.angle = Math.sin(t + vector.originalX * 0.01) * 30;
          break;
          
        case 'centerPulse':
          const centerX = width / 2;
          const centerY = height / 2;
          const distance = Math.sqrt(
            Math.pow(vector.originalX - centerX, 2) + 
            Math.pow(vector.originalY - centerY, 2)
          );
          vector.angle = Math.sin(t * 2 - distance * 0.02) * 45;
          break;
          
        case 'vortex':
          const vortexAngle = Math.atan2(
            vector.originalY - height / 2, 
            vector.originalX - width / 2
          );
          vector.angle = (vortexAngle * 180 / Math.PI) + t * 50;
          break;
          
        case 'perlinFlow':
          vector.angle = (
            Math.sin(vector.originalX * 0.02 + t) * 
            Math.cos(vector.originalY * 0.02 + t * 1.5)
          ) * 180;
          break;
          
        default:
          vector.angle += 0.5;
      }
    });
  }, [animationType, width, height]);
  
  // Dibujar vectores
  const drawVectors = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);
    
    vectorsRef.current.forEach(vector => {
      ctx.save();
      
      // Posicionar y rotar
      ctx.translate(vector.x, vector.y);
      ctx.rotate(vector.angle * Math.PI / 180);
      
      // Estilo
      ctx.strokeStyle = vectorColor;
      ctx.lineWidth = config.vectorWidth;
      ctx.lineCap = strokeLinecap;
      
      // Dibujar
      ctx.beginPath();
      ctx.moveTo(-vector.length / 2, 0);
      ctx.lineTo(vector.length / 2, 0);
      ctx.stroke();
      
      ctx.restore();
    });
  }, [width, height, vectorColor, config.vectorWidth, strokeLinecap]);
  
  // Loop de animación
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    updateVectors(time);
    drawVectors(ctx);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [updateVectors, drawVectors]);
  
  // Efecto principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Inicializar
    initVectors();
    
    // Iniciar animación
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, initVectors, animate]);
  
  return (
    <canvas 
      ref={canvasRef}
      className={\`bg-gray-900 \${className}\`}
      style={{ 
        border: '1px solid #374151',
        borderRadius: '8px'
      }}
    />
  );
};

// Uso:
// <VectorGrid 
//   width={1200} 
//   height={800}
//   animationType="smoothWaves"
//   vectorColor="#10b981"
// />

// Flynn Vector Grid - Exportado desde ${new Date().toLocaleDateString()}
// Vectores originales: ${vectors.length}
// Configuración: ${gridConfig.rows}×${gridConfig.cols}, animación ${animationType}`;
};