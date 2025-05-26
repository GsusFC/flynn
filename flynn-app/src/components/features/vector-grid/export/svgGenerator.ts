// Generador de SVG estático y animado
// Para exportar el Vector Grid como SVG

import type { SimpleVector, ExportConfig, AnimationCycle } from '../simple/simpleTypes';
import type { ExtendedVectorColorValue, GradientConfig } from '../types/gradientTypes';
import { isGradientConfig } from '../types/gradientTypes';

/**
 * Convierte un color extendido a string SVG
 */
const colorToSvgString = (color: ExtendedVectorColorValue): string => {
  if (typeof color === 'string') {
    return color;
  }
  
  if ('h' in color) {
    // HSL color
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }
  
  if (isGradientConfig(color)) {
    // Para gradientes, usar el primer color como fallback
    return color.colors[0]?.color || '#00ff00';
  }
  
  return '#00ff00'; // Fallback
};

/**
 * Genera definiciones de gradientes para SVG
 */
const generateGradientDefs = (vectors: SimpleVector[]): string => {
  const gradients = new Set<string>();
  const gradientDefs: string[] = [];
  
  vectors.forEach((vector, index) => {
    const color = vector.color;
    if (isGradientConfig(color)) {
      const gradientId = `gradient-${index}`;
      
      if (!gradients.has(gradientId)) {
        gradients.add(gradientId);
        
        const stops = color.colors.map((stop, stopIndex) => {
          const offset = stop.offset * 100;
          return `<stop offset="${offset}%" stop-color="${stop.color}" />`;
        }).join('');
        
        if (color.type === 'linear') {
          const angle = color.angle || 0;
          const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180);
          const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180);
          const x2 = 50 - 50 * Math.cos((angle - 90) * Math.PI / 180);
          const y2 = 50 - 50 * Math.sin((angle - 90) * Math.PI / 180);
          
          gradientDefs.push(`
            <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
              ${stops}
            </linearGradient>
          `);
        } else {
          // Radial gradient
          const cx = (color.centerX || 0.5) * 100;
          const cy = (color.centerY || 0.5) * 100;
          const r = (color.radius || 0.5) * 100;
          
          gradientDefs.push(`
            <radialGradient id="${gradientId}" cx="${cx}%" cy="${cy}%" r="${r}%">
              ${stops}
            </radialGradient>
          `);
        }
      }
    }
  });
  
  return gradientDefs.length > 0 ? `<defs>${gradientDefs.join('')}</defs>` : '';
};

/**
 * Genera un path SVG para un vector individual
 */
const generateVectorPath = (vector: SimpleVector, useArrowHead: boolean = true, vectorIndex?: number): string => {
  const { x, y, angle, dynamicLength, dynamicWidth, length, width, opacity } = vector;
  
  // Usar longitud y grosor dinámicos si están disponibles
  const finalLength = dynamicLength || length;
  const finalWidth = dynamicWidth || width;
  
  // Convertir ángulo a radianes
  const angleRad = (angle * Math.PI) / 180;
  
  // Calcular punto final del vector
  const endX = x + Math.cos(angleRad) * finalLength;
  const endY = y + Math.sin(angleRad) * finalLength;
  
  // Generar color
  const color = vector.color;
  let strokeColor = colorToSvgString(color);
  const fillColor = 'none';
  
  if (isGradientConfig(color) && vectorIndex !== undefined) {
    strokeColor = `url(#gradient-${vectorIndex})`;
  }
  
  let pathData = `M ${x} ${y} L ${endX} ${endY}`;
  
  // Añadir punta de flecha si está habilitada
  if (useArrowHead) {
    const arrowLength = Math.min(finalLength * 0.3, 8);
    const arrowAngle = 0.5; // radianes
    
    const arrowX1 = endX - Math.cos(angleRad - arrowAngle) * arrowLength;
    const arrowY1 = endY - Math.sin(angleRad - arrowAngle) * arrowLength;
    const arrowX2 = endX - Math.cos(angleRad + arrowAngle) * arrowLength;
    const arrowY2 = endY - Math.sin(angleRad + arrowAngle) * arrowLength;
    
    pathData += ` M ${endX} ${endY} L ${arrowX1} ${arrowY1} M ${endX} ${endY} L ${arrowX2} ${arrowY2}`;
  }
  
  return `<path d="${pathData}" stroke="${strokeColor}" stroke-width="${finalWidth}" fill="${fillColor}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`;
};

/**
 * Genera SVG estático
 */
export const generateStaticSVG = (
  vectors: SimpleVector[],
  config: Partial<ExportConfig> = {}
): string => {
  const {
    width = 1200,
    height = 600
  } = config;
  
  // Generar definiciones de gradientes
  const gradientDefs = generateGradientDefs(vectors);
  
  // Generar paths de vectores
  const vectorPaths = vectors.map((vector, index) => 
    generateVectorPath(vector, true, index)
  ).join('\n  ');
  
  // Generar metadatos
  const metadata = `
    <!-- Vector Grid Export -->
    <!-- Generated: ${new Date().toISOString()} -->
    <!-- Vectors: ${vectors.length} -->
  `;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${metadata}
  ${gradientDefs}
  <rect width="100%" height="100%" fill="#000000" />
  ${vectorPaths}
</svg>`;
};

/**
 * Genera SVG animado usando SMIL
 */
export const generateAnimatedSVG = (
  vectorFrames: SimpleVector[][],
  cycle: AnimationCycle,
  config: Partial<ExportConfig> = {}
): string => {
  const {
    width = 1200,
    height = 600,
    loop = true
  } = config;
  
  if (vectorFrames.length === 0) {
    return generateStaticSVG([], config);
  }
  
  // Usar el primer frame para generar la estructura base
  const baseVectors = vectorFrames[0];
  const gradientDefs = generateGradientDefs(baseVectors);
  
  // Generar animaciones para cada vector
  const animatedVectors = baseVectors.map((baseVector, vectorIndex) => {
    const vectorId = `vector-${vectorIndex}`;
    
    // Recopilar valores de animación para este vector
    const angles: number[] = [];
    const lengths: number[] = [];
    const widths: number[] = [];
    const opacities: number[] = [];
    
    vectorFrames.forEach(frame => {
      const vector = frame[vectorIndex];
      if (vector) {
        angles.push(vector.angle);
        lengths.push(vector.dynamicLength || vector.length);
        widths.push(vector.dynamicWidth || vector.width);
        opacities.push(vector.opacity);
      }
    });
    
    // Generar keyframes para la animación
    const duration = cycle.duration / 1000; // Convertir a segundos
    const repeatCount = loop ? 'indefinite' : '1';
    
    // Crear path base
    const basePath = generateVectorPath(baseVector, true, vectorIndex);
    
    // Generar animaciones SMIL
    const animations = [];
    
    // Animación de rotación si hay cambios de ángulo
    if (angles.some(angle => angle !== angles[0])) {
      const angleValues = angles.join(';');
      animations.push(`
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="${angleValues}"
          dur="${duration}s"
          repeatCount="${repeatCount}"
        />
      `);
    }
    
    // Animación de opacidad si hay cambios
    if (opacities.some(opacity => opacity !== opacities[0])) {
      const opacityValues = opacities.join(';');
      animations.push(`
        <animate
          attributeName="opacity"
          values="${opacityValues}"
          dur="${duration}s"
          repeatCount="${repeatCount}"
        />
      `);
    }
    
    return `
      <g id="${vectorId}">
        ${basePath}
        ${animations.join('')}
      </g>
    `;
  }).join('\n  ');
  
  // Generar metadatos
  const metadata = `
    <!-- Animated Vector Grid Export -->
    <!-- Generated: ${new Date().toISOString()} -->
    <!-- Vectors: ${baseVectors.length} -->
    <!-- Frames: ${vectorFrames.length} -->
    <!-- Duration: ${cycle.duration}ms -->
    <!-- Loop: ${loop} -->
  `;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${metadata}
  ${gradientDefs}
  <rect width="100%" height="100%" fill="#000000" />
  ${animatedVectors}
</svg>`;
};

/**
 * Optimiza un SVG reduciendo precisión decimal
 */
export const optimizeSVG = (svgContent: string, precision: number = 2): string => {
  // Reducir precisión de números decimales
  const numberRegex = /(\d+\.\d{3,})/g;
  return svgContent.replace(numberRegex, (match) => {
    const num = parseFloat(match);
    return num.toFixed(precision);
  });
};

/**
 * Calcula el tamaño estimado del SVG
 */
export const estimateSVGSize = (vectorCount: number, isAnimated: boolean = false): number => {
  // Estimación base por vector (en bytes)
  const baseSize = vectorCount * 150; // ~150 bytes por vector estático
  
  if (isAnimated) {
    return baseSize * 3; // Las animaciones triplican aproximadamente el tamaño
  }
  
  return baseSize;
};

/**
 * Valida la configuración de exportación SVG
 */
export const validateSVGConfig = (config: Partial<ExportConfig>): boolean => {
  const { width, height, precision } = config;
  
  if (width && (width < 100 || width > 8000)) {
    console.warn('SVG width should be between 100 and 8000 pixels');
    return false;
  }
  
  if (height && (height < 100 || height > 8000)) {
    console.warn('SVG height should be between 100 and 8000 pixels');
    return false;
  }
  
  if (precision && (precision < 0 || precision > 6)) {
    console.warn('SVG precision should be between 0 and 6 decimal places');
    return false;
  }
  
  return true;
};
