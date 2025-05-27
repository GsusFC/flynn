// React Hook para el sistema de colores
// Interfaz entre React y el ColorEngine

import { useMemo, useCallback } from 'react';
import { 
  ColorEngine, 
  type VectorColor, 
  type ColorContext, 
  type ProcessedColor,
  getAllColorPresets,
  getPresetsByCategory,
  DEFAULT_COLOR
} from '@/domain/color';

interface UseColorSystemProps {
  debugMode?: boolean;
}

export const useColorSystem = ({ debugMode = false }: UseColorSystemProps = {}) => {
  // Instancia del motor de colores (memoizada)
  const colorEngine = useMemo(() => new ColorEngine(), []);

  // Función para procesar color de vector
  const processVectorColor = useCallback((
    color: VectorColor,
    context: ColorContext
  ): ProcessedColor => {
    const result = colorEngine.processColor(color, context);
    
    if (debugMode) {
      console.log('🎨 [ColorSystem] Procesando color:', {
        input: color,
        context: {
          time: context.time,
          vectorIndex: context.vectorIndex,
          animationIntensity: context.animationIntensity
        },
        output: result
      });
    }
    
    return result;
  }, [colorEngine, debugMode]);

  // Función para procesar múltiples colores
  const processVectorColors = useCallback((
    colors: VectorColor[],
    contexts: ColorContext[]
  ): ProcessedColor[] => {
    if (colors.length !== contexts.length) {
      console.warn('[ColorSystem] Colors y contexts deben tener la misma longitud');
      return [];
    }
    
    return colors.map((color, index) => 
      processVectorColor(color, contexts[index])
    );
  }, [processVectorColor]);

  // Obtener todos los presets disponibles
  const presets = useMemo(() => getAllColorPresets(), []);

  // Obtener presets por categoría
  const getPresets = useCallback((category: 'solid' | 'gradient' | 'hsl') => {
    return getPresetsByCategory(category);
  }, []);

  // Limpiar cache del motor
  const clearCache = useCallback(() => {
    colorEngine.clearCache();
  }, [colorEngine]);

  // Estadísticas del cache
  const getCacheStats = useCallback(() => {
    return colorEngine.getCacheStats();
  }, [colorEngine]);

  // Crear contexto base para un vector
  const createColorContext = useCallback((
    time: number,
    vectorIndex: number,
    vectorPosition: { x: number; y: number },
    totalVectors: number,
    canvasDimensions: { width: number; height: number },
    animationIntensity?: number
  ): ColorContext => {
    return {
      time,
      vectorIndex,
      vectorPosition,
      totalVectors,
      canvasDimensions,
      animationIntensity
    };
  }, []);

  return {
    // Funciones principales
    processVectorColor,
    processVectorColors,
    createColorContext,
    
    // Presets y configuración
    presets,
    getPresets,
    defaultColor: DEFAULT_COLOR,
    
    // Gestión del motor
    clearCache,
    getCacheStats,
    
    // Motor directo (para casos avanzados)
    colorEngine
  };
};