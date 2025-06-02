import type { SimpleVector } from '../simple/simpleTypes'; // DynamicVectorConfig removido
import type { GlobalAnimationControls } from './globalAnimationControls';
import type { ExtendedVectorColorValue, HSLColor } from '../types/gradientTypes';

// ValidatedDynamicConfig ahora es un alias para GlobalAnimationControls,
// ya que DynamicVectorConfig fue eliminado de simpleTypes.
// Las propiedades "dinámicas" específicas (como enableDynamicLength)
// se manejarán a través de DEFAULT_DYNAMIC_FIELDS y la lógica interna de updateVectorsWithDynamics.
export type ValidatedDynamicConfig = GlobalAnimationControls;

// Valores por defecto para campos que antes estaban en DynamicVectorConfig.
// updateVectorsWithDynamics puede usar estos si no se especifican en GlobalAnimationControls
// o para complementar la lógica.
export const DEFAULT_DYNAMIC_FIELDS = {
  enableDynamicLength: false,
  // baseLength: 10, // Considerar si esto debe venir de VectorConfig en el hook
  lengthMultiplier: 1.0,
  minLength: 1,
  maxLength: 100,
  enableDynamicWidth: false,
  // baseWidth: 2, // Considerar si esto debe venir de VectorConfig en el hook
  widthMultiplier: 1.0,
  minWidth: 0.5,
  maxWidth: 20,
  // Podríamos añadir más campos como enableDynamicAngle, angleOffsetMultiplier, etc.
};

/**
 * Calcula la intensidad global de la animación basada en cambios entre frames.
 * La intensidad refleja qué tan activa está la animación en este momento.
 * @param currentVectors - Los vectores del frame actual.
 * @param config - Configuración global de animación para pesos y sensibilidad.
 * @param previousVectors - Los vectores del frame anterior (opcional).
 * @returns Un número entre 0.1 y 2.0 representando la intensidad global.
 */
export const calculateGlobalAnimationIntensity = (
  currentVectors: SimpleVector[],
  config: GlobalAnimationControls,
  previousVectors?: SimpleVector[]
): number => {
  // Si no hay vectores previos, usar intensidad base
  if (!previousVectors || previousVectors.length === 0 || previousVectors.length !== currentVectors.length) {
    return Math.max(0.5, config.globalSpeed || 1.0);
  }

  let totalAngleChange = 0;
  let totalLengthChange = 0;
  let totalColorChange = 0;
  let validComparisons = 0;

  currentVectors.forEach((current, i) => {
    const previous = previousVectors[i];
    if (previous) {
      // Calcular cambio en ángulo (normalizado a rango 0-π)
      let angleDiff = Math.abs(current.angle - previous.angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff; // Shortest path
      totalAngleChange += angleDiff;

      // Calcular cambio en longitud
      const lengthDiff = Math.abs(current.length - previous.length);
      totalLengthChange += lengthDiff;

      // Calcular cambio en color (si existe información HSL)
      if (current.color && previous.color) {
        // Aproximación simple para cambio de color HSL
        const currentHue = extractHueFromColor(current.color);
        const previousHue = extractHueFromColor(previous.color);
        if (currentHue !== null && previousHue !== null) {
          let hueDiff = Math.abs(currentHue - previousHue);
          if (hueDiff > 180) hueDiff = 360 - hueDiff; // Shortest path en círculo de color
          totalColorChange += hueDiff / 360; // Normalizar a 0-1
        }
      }

      validComparisons++;
    }
  });

  if (validComparisons === 0) {
    return Math.max(0.5, config.globalSpeed || 1.0);
  }

  // Normalizar cambios por número de vectores válidos
  const avgAngleChange = totalAngleChange / validComparisons;
  const avgLengthChange = totalLengthChange / validComparisons;
  const avgColorChange = totalColorChange / validComparisons;

  // Combinar métricas con pesos (ángulo es más importante)
  const weightedIntensity = 
    (avgAngleChange / Math.PI) * 0.6 +        // Peso 60% para cambio de ángulo
    (Math.min(avgLengthChange, 1.0)) * 0.3 +  // Peso 30% para cambio de longitud
    avgColorChange * 0.1;                     // Peso 10% para cambio de color

  // Aplicar multiplicador de velocidad global y acotar resultado
  const baseIntensity = Math.max(0.1, Math.min(2.0, weightedIntensity));
  const globalSpeedMultiplier = Math.max(0.1, config.globalSpeed || 1.0);
  
  return Math.max(0.1, Math.min(2.0, baseIntensity * globalSpeedMultiplier));
};

/**
 * Extrae el valor de hue de un color extendido (string HSL o objeto HSLColor).
 * @param color - Color en cualquier formato soportado
 * @returns Hue value (0-360) o null si no se puede parsear
 */
function extractHueFromColor(color: ExtendedVectorColorValue): number | null {
  if (typeof color === 'string') {
    const hslMatch = color.match(/hsl\((\d+(?:\.\d+)?)/);
    if (hslMatch && hslMatch[1]) {
      return parseFloat(hslMatch[1]);
    }
  } else if (typeof color === 'object' && color !== null && 'h' in color) {
    // Es un objeto HSLColor
    return (color as HSLColor).h;
  }
  return null;
}

/**
 * Actualiza los vectores aplicando propiedades dinámicas basadas en la intensidad de animación.
 * Modifica longitud, saturación de color y otras propiedades según la configuración.
 * @param vectors - Los vectores a actualizar.
 * @param config - La configuración global de animación con valores de intensidad y speed.
 * @param globalIntensity - La intensidad global calculada (0.1 - 2.0).
 * @param previousVectors - Los vectores del frame anterior (opcional, para cálculos de momentum).
 * @returns Un nuevo array de vectores con las propiedades dinámicas aplicadas.
 */
export const updateVectorsWithDynamics = (
  vectors: SimpleVector[],
  config: GlobalAnimationControls, 
  globalIntensity: number,
  previousVectors?: SimpleVector[]
): SimpleVector[] => {
  // Usar defaults si faltan configuraciones
  const dynamicConfig = { ...DEFAULT_DYNAMIC_FIELDS };
  
  return vectors.map((vector, index) => {
    const newVector = { ...vector };
    
    // 1. Dinámicas de longitud basadas en intensidad
    if (dynamicConfig.enableDynamicLength) {
      const baseLength = (vector as any).originalLength || vector.length;
      const intensityMultiplier = 0.8 + (globalIntensity * 0.4); // Rango 0.8 - 1.2
      const lengthMultiplier = dynamicConfig.lengthMultiplier * intensityMultiplier;
      
      newVector.length = Math.max(
        dynamicConfig.minLength,
        Math.min(dynamicConfig.maxLength, baseLength * lengthMultiplier)
      );
    }
    
    // 2. Dinámicas de color basadas en intensidad (aumentar saturación)
    if (newVector.color && globalIntensity > 1.0) {
      const intensityBoost = Math.min(1.5, globalIntensity);
      newVector.color = enhanceColorSaturation(newVector.color, intensityBoost);
    }
    
    // 3. Dinámicas de grosor/ancho basadas en intensidad
    if (dynamicConfig.enableDynamicWidth && (newVector as any).width !== undefined) {
      const baseWidth = (vector as any).originalWidth || (newVector as any).width || 1;
      const intensityMultiplier = 0.7 + (globalIntensity * 0.6); // Rango 0.7 - 1.3
      const widthMultiplier = dynamicConfig.widthMultiplier * intensityMultiplier;
      
      (newVector as any).width = Math.max(
        dynamicConfig.minWidth,
        Math.min(dynamicConfig.maxWidth, baseWidth * widthMultiplier)
      );
    }
    
    // 4. Momentum y suavizado basado en frame anterior
    if (previousVectors && previousVectors[index]) {
      const previousVector = previousVectors[index];
      const momentum = 0.1; // Factor de inercia
      
      // Suavizar cambios de ángulo para animaciones más fluidas
      if (Math.abs(newVector.angle - previousVector.angle) > 0.1) {
        const angleDiff = newVector.angle - previousVector.angle;
        newVector.angle = previousVector.angle + (angleDiff * (1 - momentum));
      }
      
      // Suavizar cambios de longitud
      if (Math.abs(newVector.length - previousVector.length) > 0.1) {
        const lengthDiff = newVector.length - previousVector.length;
        newVector.length = previousVector.length + (lengthDiff * (1 - momentum));
      }
    }
    
    // 5. Añadir micro-variaciones aleatorias para mayor organicidad
    if (globalIntensity > 1.2) {
      const noiseIntensity = (globalIntensity - 1.0) * 0.02; // Variación muy sutil
      const angleNoise = (Math.random() - 0.5) * noiseIntensity;
      const lengthNoise = (Math.random() - 0.5) * noiseIntensity * 0.1;
      
      newVector.angle += angleNoise;
      newVector.length = Math.max(0.1, newVector.length + lengthNoise);
    }
    
    return newVector;
  });
};

/**
 * Mejora la saturación de un color basado en un factor de intensidad.
 * Soporta string HSL y objetos HSLColor.
 * @param color - Color en cualquier formato soportado
 * @param intensityFactor - Factor de intensidad (1.0 = sin cambio, >1.0 = más saturado)
 * @returns Color modificado en el mismo formato
 */
function enhanceColorSaturation(color: ExtendedVectorColorValue, intensityFactor: number): ExtendedVectorColorValue {
  if (typeof color === 'string') {
    const hslMatch = color.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
    
    if (!hslMatch) return color; // Si no se puede parsear, devolver original
    
    const hue = parseFloat(hslMatch[1]);
    const saturation = parseFloat(hslMatch[2]);
    const lightness = parseFloat(hslMatch[3]);
    
    // Incrementar saturación basado en intensidad, pero no exceder 100%
    const enhancedSaturation = Math.min(100, saturation * Math.min(1.5, intensityFactor));
    
    return `hsl(${hue}, ${enhancedSaturation.toFixed(1)}%, ${lightness}%)`;
  } else if (typeof color === 'object' && color !== null && 'h' in color) {
    // Es un objeto HSLColor
    const hslColor = color as HSLColor;
    const enhancedSaturation = Math.min(100, hslColor.s * Math.min(1.5, intensityFactor));
    
    return {
      ...hslColor,
      s: enhancedSaturation
    };
  }
  
  // Para gradientes u otros tipos, devolver sin modificar
  return color;
}
