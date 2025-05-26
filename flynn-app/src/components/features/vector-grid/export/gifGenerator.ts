// Generador de GIF animado
// Para exportar el Vector Grid como GIF con bucles perfectos

import type { SimpleVector, ExportConfig, AnimationCycle, ExportFrame } from '../simple/simpleTypes';
import type GIF from 'gif.js';

// Importar gif.js dinámicamente
let GIFConstructor: typeof GIF | null = null;

// Función para cargar gif.js dinámicamente
const loadGIF = async (): Promise<typeof GIF> => {
  if (GIFConstructor) return GIFConstructor;
  
  try {
    const gifModule = await import('gif.js');
    GIFConstructor = gifModule.default || gifModule;
    return GIFConstructor;
  } catch (error) {
    console.error('Error cargando gif.js:', error);
    throw new Error('No se pudo cargar gif.js. Asegúrate de que esté instalado.');
  }
};

/**
 * Renderiza vectores en un canvas
 */
const renderVectorsToCanvas = (
  vectors: SimpleVector[],
  width: number,
  height: number,
  backgroundColor: string = '#000000'
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto 2D del canvas');
  }
  
  // Limpiar canvas con color de fondo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Configurar estilos de línea
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Renderizar cada vector
  vectors.forEach(vector => {
    const { x, y, angle, dynamicLength, dynamicWidth, length, width: vectorWidth, color, opacity } = vector;
    
    // Usar propiedades dinámicas si están disponibles
    const finalLength = dynamicLength || length;
    const finalWidth = dynamicWidth || vectorWidth;
    
    // Convertir ángulo a radianes
    const angleRad = (angle * Math.PI) / 180;
    
    // Calcular punto final del vector
    const endX = x + Math.cos(angleRad) * finalLength;
    const endY = y + Math.sin(angleRad) * finalLength;
    
    // Configurar color y opacidad
    let strokeColor = '#00ff00'; // Fallback
    
    if (typeof color === 'string') {
      strokeColor = color;
    } else if (color && typeof color === 'object' && 'h' in color) {
      strokeColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    } else if (color && typeof color === 'object' && 'type' in color) {
      // Para gradientes, usar el primer color como aproximación
      strokeColor = color.colors?.[0]?.color || '#00ff00';
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = finalWidth;
    ctx.globalAlpha = opacity;
    
    // Dibujar línea principal
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Dibujar punta de flecha
    const arrowLength = Math.min(finalLength * 0.3, 8);
    const arrowAngle = 0.5; // radianes
    
    const arrowX1 = endX - Math.cos(angleRad - arrowAngle) * arrowLength;
    const arrowY1 = endY - Math.sin(angleRad - arrowAngle) * arrowLength;
    const arrowX2 = endX - Math.cos(angleRad + arrowAngle) * arrowLength;
    const arrowY2 = endY - Math.sin(angleRad + arrowAngle) * arrowLength;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.stroke();
  });
  
  // Restaurar alpha global
  ctx.globalAlpha = 1.0;
  
  return canvas;
};

/**
 * Captura frames de animación
 */
export const captureAnimationFrames = async (
  getVectorsAtTime: (time: number) => SimpleVector[],
  cycle: AnimationCycle,
  config: Partial<ExportConfig> = {},
  onProgress?: (progress: number) => void
): Promise<ExportFrame[]> => {
  const {
    width = 1200,
    height = 600,
    fps = 30
  } = config;
  
  const frames: ExportFrame[] = [];
  const frameInterval = 1000 / fps; // ms por frame
  const totalFrames = Math.ceil((cycle.duration / 1000) * fps);
  
  for (let i = 0; i < totalFrames; i++) {
    const timestamp = i * frameInterval;
    const vectors = getVectorsAtTime(timestamp);
    
    // Renderizar frame a canvas
    const canvas = renderVectorsToCanvas(vectors, width, height);
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, width, height);
    
    frames.push({
      timestamp,
      vectors,
      canvasData: imageData
    });
    
    // Reportar progreso
    if (onProgress) {
      onProgress((i + 1) / totalFrames);
    }
    
    // Permitir que el navegador respire entre frames
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return frames;
};

/**
 * Genera GIF animado usando GIF.js
 */
export const generateAnimatedGIF = async (
  frames: ExportFrame[],
  cycle: AnimationCycle,
  config: Partial<ExportConfig> = {},
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Cargar gif.js dinámicamente
      const GIFClass = await loadGIF();
      
      const {
        width = 1200,
        height = 600,
        quality = 'medium',
        fps = 30,
        loop = true,
        dithering = true
      } = config;
      
      // Mapear calidad a valores numéricos
      const qualityMap = {
        low: 20,
        medium: 10,
        high: 5,
        maximum: 1
      };
      
      const gifQuality = qualityMap[quality as keyof typeof qualityMap] || 10;
      
      // Configurar GIF
      const gif = new GIFClass({
        workers: 2,
        quality: gifQuality,
        width,
        height,
        background: '#000000',
        dither: dithering,
        repeat: loop ? 0 : -1, // 0 = infinito, -1 = una vez
        globalPalette: true
      });
      
      // Calcular delay entre frames
      const frameDelay = Math.round(1000 / fps);
      
      // Añadir frames al GIF
      frames.forEach((frame, index) => {
        if (frame.canvasData) {
          // Crear canvas temporal para este frame
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.putImageData(frame.canvasData, 0, 0);
            gif.addFrame(canvas, { delay: frameDelay });
          }
        }
        
        // Reportar progreso de adición de frames
        if (onProgress) {
          const addProgress = (index + 1) / frames.length * 0.3; // 30% del progreso total
          onProgress(addProgress);
        }
      });
      
      // Manejar eventos del GIF
      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });
      
      gif.on('progress', (progress: number) => {
        if (onProgress) {
          // El progreso de renderizado es el 70% restante
          const renderProgress = 0.3 + (progress * 0.7);
          onProgress(renderProgress);
        }
      });
      
      // Iniciar renderizado
      gif.render();
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera GIF directamente desde vectores animados
 */
export const generateGIFFromVectors = async (
  getVectorsAtTime: (time: number) => SimpleVector[],
  cycle: AnimationCycle,
  config: Partial<ExportConfig> = {},
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  // Capturar frames (50% del progreso)
  const frames = await captureAnimationFrames(
    getVectorsAtTime,
    cycle,
    config,
    (progress) => onProgress?.(progress * 0.5)
  );
  
  // Generar GIF (50% restante del progreso)
  return generateAnimatedGIF(
    frames,
    cycle,
    config,
    (progress) => onProgress?.(0.5 + progress * 0.5)
  );
};

/**
 * Optimiza la configuración para reducir el tamaño del GIF
 */
export const optimizeGIFConfig = (
  config: Partial<ExportConfig>,
  targetSizeMB: number = 5
): Partial<ExportConfig> => {
  const optimized = { ...config };
  
  // Reducir calidad si el tamaño objetivo es pequeño
  if (targetSizeMB < 2) {
    optimized.quality = 'low';
    optimized.fps = Math.min(optimized.fps || 30, 15);
  } else if (targetSizeMB < 5) {
    optimized.quality = 'medium';
    optimized.fps = Math.min(optimized.fps || 30, 24);
  }
  
  // Reducir resolución si es necesario
  if (targetSizeMB < 1) {
    optimized.width = Math.min(optimized.width || 1200, 800);
    optimized.height = Math.min(optimized.height || 600, 400);
  }
  
  return optimized;
};

/**
 * Estima el tamaño del GIF resultante
 */
export const estimateGIFSize = (
  frameCount: number,
  width: number,
  height: number,
  quality: string = 'medium'
): number => {
  // Estimación base por pixel por frame
  const qualityMultipliers = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
    maximum: 2.0
  };
  
  const multiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers] || 1.0;
  const pixelsPerFrame = width * height;
  const bytesPerPixel = 0.5 * multiplier; // Estimación con compresión
  
  return frameCount * pixelsPerFrame * bytesPerPixel;
};

/**
 * Valida la configuración de exportación GIF
 */
export const validateGIFConfig = (config: Partial<ExportConfig>): boolean => {
  const { width, height, fps, duration } = config;
  
  if (width && (width < 100 || width > 2000)) {
    console.warn('GIF width should be between 100 and 2000 pixels');
    return false;
  }
  
  if (height && (height < 100 || height > 2000)) {
    console.warn('GIF height should be between 100 and 2000 pixels');
    return false;
  }
  
  if (fps && (fps < 5 || fps > 60)) {
    console.warn('GIF FPS should be between 5 and 60');
    return false;
  }
  
  if (duration && (duration < 1000 || duration > 30000)) {
    console.warn('GIF duration should be between 1 and 30 seconds');
    return false;
  }
  
  // Verificar que el número total de frames no sea excesivo
  if (fps && duration) {
    const totalFrames = Math.ceil((duration / 1000) * fps);
    if (totalFrames > 300) {
      console.warn('Total frames exceeds 300, this may cause performance issues');
      return false;
    }
  }
  
  return true;
};

/**
 * Descarga un blob como archivo
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
