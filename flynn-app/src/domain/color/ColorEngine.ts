// Color Engine - Motor principal del sistema de colores
// Responsable de procesar y aplicar colores a vectores

import type { 
  VectorColor, 
  ColorContext, 
  ProcessedColor,
  SolidColor,
  GradientColor,
  HSLColor,
  DynamicColor
} from './types';

export class ColorEngine {
  private gradientCache = new Map<string, string>();

  /**
   * Procesa un color vectorial y devuelve el color final aplicable
   */
  processColor(
    color: VectorColor, 
    context: ColorContext
  ): ProcessedColor {
    switch (color.type) {
      case 'solid':
        return this.processSolidColor(color, context);
      
      case 'gradient':
        return this.processGradientColor(color, context);
      
      case 'dynamic':
        return this.processDynamicColor(color, context);
      
      default:
        console.warn('[ColorEngine] Tipo de color desconocido:', (color as any).type);
        return { fill: '#10b981', opacity: 1 };
    }
  }

  /**
   * Procesa colores sólidos
   */
  private processSolidColor(
    color: SolidColor, 
    context: ColorContext
  ): ProcessedColor {
    return {
      fill: color.value,
      opacity: 1
    };
  }

  /**
   * Procesa gradientes
   */
  private processGradientColor(
    color: GradientColor,
    context: ColorContext
  ): ProcessedColor {
    const gradientId = this.generateGradientId(color, context);
    
    return {
      fill: `url(#${gradientId})`,
      opacity: 1,
      gradientId
    };
  }

  /**
   * Procesa colores dinámicos (responden a intensidad de animación)
   */
  private processDynamicColor(
    color: DynamicColor,
    context: ColorContext
  ): ProcessedColor {
    const intensity = context.animationIntensity || 0;
    
    let { hue, saturation, lightness } = color;

    const modulation = intensity * color.intensityResponse;

    switch (color.effect) {
      case 'hue':
        hue = (hue + modulation * 360) % 360;
        break;
      case 'saturation':
        saturation = Math.max(0, Math.min(100, saturation + modulation * 100));
        break;
      case 'lightness':
        lightness = Math.max(0, Math.min(100, lightness + modulation * 100));
        break;
    }
    
    const hslColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    return {
      fill: hslColor,
      opacity: 1
    };
  }

  /**
   * Genera ID único para gradientes
   */
  private generateGradientId(color: GradientColor, context: ColorContext): string {
    const key = JSON.stringify({
      type: color.variant,
      angle: color.angle,
      stops: color.stops,
      vector: context.vectorIndex
    });
    
    if (!this.gradientCache.has(key)) {
      const id = `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.gradientCache.set(key, id);
    }
    
    return this.gradientCache.get(key)!;
  }

  /**
   * Limpia cache de gradientes
   */
  clearCache(): void {
    this.gradientCache.clear();
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.gradientCache.size,
      keys: Array.from(this.gradientCache.keys())
    };
  }
}