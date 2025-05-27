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
      
      case 'hsl':
        return this.processHSLColor(color, context);
      
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
   * Procesa colores HSL animados
   */
  private processHSLColor(
    color: HSLColor,
    context: ColorContext
  ): ProcessedColor {
    const { time, vectorIndex, totalVectors } = context;
    
    let hue: number;
    
    switch (color.variant) {
      case 'rainbow':
        // Arcoiris basado en posición
        hue = (vectorIndex / totalVectors) * 360;
        break;
        
      case 'flow':
        // Flujo temporal
        hue = (time * color.speed + (vectorIndex / totalVectors) * 360) % 360;
        break;
        
      case 'cycle':
        // Ciclo temporal uniforme
        hue = (time * color.speed + (color.offset || 0)) % 360;
        break;
        
      default:
        hue = 0;
    }

    const hslColor = `hsl(${hue}, ${color.saturation}%, ${color.lightness}%)`;
    
    return {
      fill: hslColor,
      opacity: 1
    };
  }

  /**
   * Procesa colores dinámicos (responden a intensidad de animación)
   */
  private processDynamicColor(
    color: DynamicColor,
    context: ColorContext
  ): ProcessedColor {
    const baseResult = this.processColor(color.baseColor, context);
    const intensity = context.animationIntensity || 0;
    
    // Modular color basado en intensidad
    const modulatedColor = this.modulateColorByIntensity(
      baseResult.fill, 
      intensity, 
      color.intensityResponse,
      color.blendMode
    );
    
    return {
      ...baseResult,
      fill: modulatedColor
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
   * Modula color basado en intensidad de animación
   */
  private modulateColorByIntensity(
    baseColor: string,
    intensity: number,
    response: number,
    blendMode: DynamicColor['blendMode']
  ): string {
    // Implementación básica - se puede expandir
    const factor = 1 + (intensity * response);
    
    // Para colores hex, ajustar brillo
    if (baseColor.startsWith('#')) {
      return this.adjustColorBrightness(baseColor, factor);
    }
    
    // Para HSL, ajustar lightness
    if (baseColor.startsWith('hsl')) {
      return this.adjustHSLBrightness(baseColor, factor);
    }
    
    return baseColor;
  }

  /**
   * Ajusta brillo de color hex
   */
  private adjustColorBrightness(hexColor: string, factor: number): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Ajusta brillo de color HSL
   */
  private adjustHSLBrightness(hslColor: string, factor: number): string {
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return hslColor;
    
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = Math.min(100, Math.max(0, Math.floor(parseInt(match[3]) * factor)));
    
    return `hsl(${h}, ${s}%, ${l}%)`;
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