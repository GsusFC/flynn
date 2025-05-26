import type { ExtendedVectorColorValue } from '../types/gradientTypes';
import { isGradientConfig } from '../types/gradientTypes';

/**
 * Convierte un ExtendedVectorColorValue a string para uso en SimpleVector
 * Los degradados se convierten a un color sólido representativo
 */
export function convertColorToString(color: ExtendedVectorColorValue): string {
  if (typeof color === 'string') {
    return color;
  }
  
  if (isGradientConfig(color)) {
    // Para degradados, usar el primer color como representativo
    return color.colors[0]?.color || '#ffffff';
  }
  
  // Es un color HSL
  if (typeof color === 'object' && 'h' in color) {
    const { h, s, l, a = 1 } = color;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
  
  // Fallback
  return '#ffffff';
}

/**
 * Verifica si un color necesita procesamiento especial (degradados)
 */
export function needsSpecialColorProcessing(color: ExtendedVectorColorValue): boolean {
  return isGradientConfig(color);
}

/**
 * Obtiene el color original para el renderer (puede ser degradado)
 */
export function getOriginalColor(color: ExtendedVectorColorValue): ExtendedVectorColorValue {
  return color;
}
