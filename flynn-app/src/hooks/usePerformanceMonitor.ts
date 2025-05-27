// Performance Monitor Hook - Monitoreo de performance y optimización automática
// Separado para mejor control de recursos y análisis

import { useCallback, useEffect, useRef, useState } from 'react';
import { useVectorGridStore } from '@/stores/vectorGridStore';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  vectorCount: number;
  canvasArea: number;
  renderMode: 'svg' | 'canvas' | 'hybrid';
  averageFrameTime: number;
  frameDrops: number;
  cpuUsage: number;
}

interface PerformanceThresholds {
  minFPS: number;
  maxRenderTime: number;
  maxMemoryMB: number;
  autoOptimize: boolean;
}

interface UsePerformanceMonitorProps {
  enabled?: boolean;
  sampleInterval?: number; // ms
  thresholds?: Partial<PerformanceThresholds>;
  onPerformanceIssue?: (issue: string, metrics: PerformanceMetrics) => void;
  debugMode?: boolean;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFPS: 30,
  maxRenderTime: 33, // ~30fps
  maxMemoryMB: 100,
  autoOptimize: true
};

export const usePerformanceMonitor = ({
  enabled = true,
  sampleInterval = 1000,
  thresholds = {},
  onPerformanceIssue,
  debugMode = false
}: UsePerformanceMonitorProps = {}) => {
  
  // =============== STATE ===============
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 16,
    memoryUsage: 0,
    vectorCount: 0,
    canvasArea: 0,
    renderMode: 'svg',
    averageFrameTime: 16,
    frameDrops: 0,
    cpuUsage: 0
  });

  // =============== REFS ===============
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // =============== MERGED THRESHOLDS ===============
  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // =============== STORE CONNECTION ===============
  const { 
    vectorCount, 
    canvasDimensions, 
    renderMode,
    updatePerformance 
  } = useVectorGridStore(state => ({
    vectorCount: state.vectors.length,
    canvasDimensions: state.canvasDimensions,
    renderMode: state.renderMode,
    updatePerformance: state.updatePerformance
  }));

  // =============== MEMORY MONITORING ===============
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }, []);

  // =============== FPS CALCULATION ===============
  const calculateFPS = useCallback((): number => {
    const frameTimes = frameTimesRef.current;
    if (frameTimes.length < 2) return 60;

    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    return Math.round(1000 / averageFrameTime);
  }, []);

  // =============== FRAME TIME TRACKING ===============
  const trackFrameTime = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    
    frameTimesRef.current.push(frameTime);
    
    // Mantener solo los últimos 60 frames
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    lastFrameTimeRef.current = now;
    frameCountRef.current++;
  }, []);

  // =============== PERFORMANCE ANALYSIS ===============
  const analyzePerformance = useCallback((): PerformanceMetrics => {
    const fps = calculateFPS();
    const frameTimes = frameTimesRef.current;
    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length || 16;
    const frameDrops = frameTimes.filter(time => time > 33).length; // Frames >33ms
    const memoryUsage = getMemoryUsage();
    const canvasArea = canvasDimensions.width * canvasDimensions.height;

    return {
      fps,
      renderTime: averageFrameTime,
      memoryUsage,
      vectorCount,
      canvasArea,
      renderMode,
      averageFrameTime,
      frameDrops,
      cpuUsage: Math.min(100, (averageFrameTime / 16) * 100) // Estimación basada en frame time
    };
  }, [calculateFPS, getMemoryUsage, vectorCount, canvasDimensions, renderMode]);

  // =============== PERFORMANCE ISSUES DETECTION ===============
  const detectPerformanceIssues = useCallback((metrics: PerformanceMetrics) => {
    const issues: string[] = [];

    if (metrics.fps < mergedThresholds.minFPS) {
      issues.push(`FPS bajo: ${metrics.fps} (mínimo: ${mergedThresholds.minFPS})`);
    }

    if (metrics.renderTime > mergedThresholds.maxRenderTime) {
      issues.push(`Tiempo de render alto: ${metrics.renderTime.toFixed(2)}ms (máximo: ${mergedThresholds.maxRenderTime}ms)`);
    }

    if (metrics.memoryUsage > mergedThresholds.maxMemoryMB) {
      issues.push(`Uso de memoria alto: ${metrics.memoryUsage.toFixed(2)}MB (máximo: ${mergedThresholds.maxMemoryMB}MB)`);
    }

    if (metrics.frameDrops > 5) {
      issues.push(`Muchos frames perdidos: ${metrics.frameDrops} en los últimos 60 frames`);
    }

    return issues;
  }, [mergedThresholds]);

  // =============== AUTO OPTIMIZATION ===============
  const autoOptimize = useCallback((metrics: PerformanceMetrics, issues: string[]) => {
    if (!mergedThresholds.autoOptimize || issues.length === 0) return;

    const state = useVectorGridStore.getState();

    if (debugMode) {
      console.log('⚡ [PerformanceMonitor] Auto-optimizando:', issues);
    }

    // Optimización 1: Cambiar a Canvas si hay muchos vectores y FPS bajo
    if (metrics.vectorCount > 300 && metrics.fps < 40 && renderMode === 'svg') {
      updatePerformance({ renderMode: 'canvas' });
      
      if (debugMode) {
        console.log('⚡ [PerformanceMonitor] Cambiado a Canvas rendering');
      }
    }

    // Optimización 2: Reducir vectores dinámicos si performance es muy mala
    if (metrics.fps < 20 && state.dynamicConfig.enableDynamicLength) {
      useVectorGridStore.setState(state => ({
        dynamicConfig: {
          ...state.dynamicConfig,
          enableDynamicLength: false
        }
      }));
      
      if (debugMode) {
        console.log('⚡ [PerformanceMonitor] Desactivada longitud dinámica');
      }
    }

    // Optimización 3: Pausar animación si es crítico
    if (metrics.fps < 15) {
      state.togglePause();
      
      if (debugMode) {
        console.log('⚡ [PerformanceMonitor] Animación pausada por performance crítica');
      }
    }
  }, [mergedThresholds.autoOptimize, renderMode, updatePerformance, debugMode]);

  // =============== MONITORING LOOP ===============
  const runMonitoringCycle = useCallback(() => {
    if (!enabled) return;

    const currentMetrics = analyzePerformance();
    const issues = detectPerformanceIssues(currentMetrics);

    // Actualizar estado local
    setMetrics(currentMetrics);

    // Actualizar store
    updatePerformance({
      fps: currentMetrics.fps,
      renderTime: currentMetrics.renderTime,
      vectorCount: currentMetrics.vectorCount,
      memoryUsage: currentMetrics.memoryUsage
    });

    // Reportar issues
    if (issues.length > 0) {
      onPerformanceIssue?.(issues.join(', '), currentMetrics);
      autoOptimize(currentMetrics, issues);
    }

    if (debugMode && frameCountRef.current % 5 === 0) {
      console.log('📊 [PerformanceMonitor] Métricas:', {
        fps: currentMetrics.fps,
        renderTime: currentMetrics.renderTime.toFixed(2) + 'ms',
        memory: currentMetrics.memoryUsage.toFixed(2) + 'MB',
        vectors: currentMetrics.vectorCount,
        issues: issues.length
      });
    }
  }, [enabled, analyzePerformance, detectPerformanceIssues, onPerformanceIssue, autoOptimize, updatePerformance, debugMode]);

  // =============== EFFECTS ===============
  useEffect(() => {
    if (!enabled) return;

    // Configurar Performance Observer para métricas adicionales
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'measure') {
            trackFrameTime();
          }
        }
      });

      try {
        performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        console.warn('[PerformanceMonitor] PerformanceObserver no soportado completamente');
      }
    }

    // Configurar interval de monitoreo
    intervalRef.current = setInterval(runMonitoringCycle, sampleInterval);

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
        performanceObserverRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, sampleInterval, runMonitoringCycle]);

  // =============== MANUAL CONTROLS ===============
  const clearMetrics = useCallback(() => {
    frameTimesRef.current = [];
    frameCountRef.current = 0;
    setMetrics({
      fps: 60,
      renderTime: 16,
      memoryUsage: 0,
      vectorCount: 0,
      canvasArea: 0,
      renderMode: 'svg',
      averageFrameTime: 16,
      frameDrops: 0,
      cpuUsage: 0
    });
  }, []);

  const forceOptimization = useCallback(() => {
    const currentMetrics = analyzePerformance();
    const issues = detectPerformanceIssues(currentMetrics);
    autoOptimize(currentMetrics, issues);
  }, [analyzePerformance, detectPerformanceIssues, autoOptimize]);

  const generateReport = useCallback(() => {
    const currentMetrics = analyzePerformance();
    const issues = detectPerformanceIssues(currentMetrics);
    
    return {
      timestamp: new Date().toISOString(),
      metrics: currentMetrics,
      issues,
      thresholds: mergedThresholds,
      recommendations: generateRecommendations(currentMetrics)
    };
  }, [analyzePerformance, detectPerformanceIssues, mergedThresholds]);

  const generateRecommendations = useCallback((metrics: PerformanceMetrics): string[] => {
    const recommendations: string[] = [];

    if (metrics.vectorCount > 500) {
      recommendations.push('Considerar usar Canvas rendering para mejor performance');
    }

    if (metrics.memoryUsage > 50) {
      recommendations.push('Optimizar uso de memoria, limpiar referencias no utilizadas');
    }

    if (metrics.frameDrops > 3) {
      recommendations.push('Reducir complejidad de animaciones o disminuir frame rate');
    }

    return recommendations;
  }, []);

  // =============== PUBLIC API ===============
  return {
    // Estado actual
    metrics,
    isHealthy: metrics.fps >= mergedThresholds.minFPS && 
               metrics.renderTime <= mergedThresholds.maxRenderTime,
    
    // Controles
    clearMetrics,
    forceOptimization,
    trackFrameTime,
    
    // Análisis
    generateReport,
    analyzePerformance,
    
    // Configuración
    thresholds: mergedThresholds,
    
    // Debug info
    debugInfo: debugMode ? {
      enabled,
      sampleInterval,
      frameCount: frameCountRef.current,
      recentFrameTimes: frameTimesRef.current.slice(-10)
    } : undefined
  };
};