/**
 * Sistema de monitoreo de rendimiento para Vector Grid
 * Detecta automáticamente cuándo cambiar entre SVG y Canvas
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  vectorCount: number;
  complexity: number;
  memoryUsage: number;
  renderTime: number;
}

export enum RenderMode {
  SVG = 'svg',
  CANVAS = 'canvas',
  HYBRID = 'hybrid'
}

export enum QualityLevel {
  ULTRA = 'ultra',
  HIGH = 'high', 
  MEDIUM = 'medium',
  PERFORMANCE = 'performance'
}

export interface PerformanceConfig {
  targetFPS: number;
  minFPS: number;
  maxVectorsForSVG: number;
  complexityThreshold: number;
  memoryThreshold: number;
  autoSwitch: boolean;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  targetFPS: 60,
  minFPS: 30,
  maxVectorsForSVG: 300,
  complexityThreshold: 0.7,
  memoryThreshold: 100, // MB
  autoSwitch: true
};

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private frameHistory: number[] = [];
  private renderTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private currentMode: RenderMode = RenderMode.SVG;
  private currentQuality: QualityLevel = QualityLevel.HIGH;
  private switchCooldown: number = 0;
  private readonly COOLDOWN_FRAMES = 180; // 3 segundos a 60fps
  private readonly HISTORY_SIZE = 60; // 1 segundo de historia

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      vectorCount: 0,
      complexity: 0,
      memoryUsage: 0,
      renderTime: 0
    };
  }

  /**
   * Actualiza las métricas de rendimiento
   */
  updateMetrics(vectorCount: number, animationType: string, renderStartTime: number): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const renderTime = now - renderStartTime;

    // Actualizar historia de frames
    this.frameHistory.push(frameTime);
    this.renderTimeHistory.push(renderTime);
    
    if (this.frameHistory.length > this.HISTORY_SIZE) {
      this.frameHistory.shift();
      this.renderTimeHistory.shift();
    }

    // Calcular FPS promedio
    const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    const fps = 1000 / avgFrameTime;

    // Calcular complejidad de la animación
    const complexity = this.calculateAnimationComplexity(animationType, vectorCount);

    // Estimar uso de memoria (aproximado)
    const memoryUsage = this.estimateMemoryUsage(vectorCount);

    this.metrics = {
      fps: Math.round(fps * 100) / 100,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      vectorCount,
      complexity,
      memoryUsage,
      renderTime: Math.round(renderTime * 100) / 100
    };

    this.frameCount++;
    this.lastFrameTime = now;

    // Reducir cooldown
    if (this.switchCooldown > 0) {
      this.switchCooldown--;
    }
  }

  /**
   * Calcula la complejidad de la animación actual
   */
  private calculateAnimationComplexity(animationType: string, vectorCount: number): number {
    const complexityWeights: Record<string, number> = {
      'none': 0.1,
      'staticAngle': 0.2,
      'smoothWaves': 0.4,
      'mouseInteraction': 0.5,
      'randomLoop': 0.3,
      'centerPulse': 0.6,
      'seaWaves': 0.8,
      'vortex': 0.9,
      'directionalFlow': 0.5,
      'tangenteClasica': 0.7,
      'lissajous': 0.8,
      'perlinFlow': 0.9
    };

    const baseComplexity = complexityWeights[animationType] || 0.5;
    const vectorComplexity = Math.min(vectorCount / 1000, 1); // Normalizar a 1000 vectores
    
    return Math.min(baseComplexity + vectorComplexity * 0.3, 1);
  }

  /**
   * Estima el uso de memoria aproximado
   */
  private estimateMemoryUsage(vectorCount: number): number {
    // Estimación aproximada: cada vector usa ~1KB en SVG, ~0.1KB en Canvas
    const bytesPerVector = this.currentMode === RenderMode.SVG ? 1024 : 102.4;
    return (vectorCount * bytesPerVector) / (1024 * 1024); // MB
  }

  /**
   * Determina el modo de renderizado óptimo
   */
  shouldSwitchRenderMode(): { mode: RenderMode; reason: string } | null {
    if (!this.config.autoSwitch || this.switchCooldown > 0) {
      return null;
    }

    const { fps, vectorCount, complexity, memoryUsage } = this.metrics;
    const { minFPS, maxVectorsForSVG, complexityThreshold, memoryThreshold } = this.config;

    // Condiciones para cambiar a Canvas
    if (this.currentMode === RenderMode.SVG) {
      if (fps < minFPS) {
        this.switchCooldown = this.COOLDOWN_FRAMES;
        return { mode: RenderMode.CANVAS, reason: `FPS bajo: ${fps}` };
      }
      
      if (vectorCount > maxVectorsForSVG) {
        this.switchCooldown = this.COOLDOWN_FRAMES;
        return { mode: RenderMode.CANVAS, reason: `Muchos vectores: ${vectorCount}` };
      }
      
      if (complexity > complexityThreshold) {
        this.switchCooldown = this.COOLDOWN_FRAMES;
        return { mode: RenderMode.CANVAS, reason: `Alta complejidad: ${complexity}` };
      }
      
      if (memoryUsage > memoryThreshold) {
        this.switchCooldown = this.COOLDOWN_FRAMES;
        return { mode: RenderMode.CANVAS, reason: `Alto uso de memoria: ${memoryUsage}MB` };
      }
    }

    // Condiciones para volver a SVG
    if (this.currentMode === RenderMode.CANVAS) {
      const goodPerformance = fps > this.config.targetFPS * 0.9;
      const lowVectorCount = vectorCount < maxVectorsForSVG * 0.8;
      const lowComplexity = complexity < complexityThreshold * 0.8;
      const lowMemory = memoryUsage < memoryThreshold * 0.8;

      if (goodPerformance && lowVectorCount && lowComplexity && lowMemory) {
        this.switchCooldown = this.COOLDOWN_FRAMES;
        return { mode: RenderMode.SVG, reason: 'Rendimiento mejorado' };
      }
    }

    return null;
  }

  /**
   * Determina el nivel de calidad óptimo
   */
  getOptimalQuality(): QualityLevel {
    const { fps, complexity, vectorCount } = this.metrics;
    const { targetFPS, minFPS } = this.config;

    if (fps >= targetFPS && complexity < 0.5 && vectorCount < 200) {
      return QualityLevel.ULTRA;
    } else if (fps >= targetFPS * 0.8 && complexity < 0.7 && vectorCount < 400) {
      return QualityLevel.HIGH;
    } else if (fps >= minFPS && complexity < 0.8 && vectorCount < 600) {
      return QualityLevel.MEDIUM;
    } else {
      return QualityLevel.PERFORMANCE;
    }
  }

  /**
   * Obtiene las métricas actuales
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtiene el modo de renderizado actual
   */
  getCurrentMode(): RenderMode {
    return this.currentMode;
  }

  /**
   * Establece el modo de renderizado
   */
  setRenderMode(mode: RenderMode): void {
    this.currentMode = mode;
  }

  /**
   * Obtiene el nivel de calidad actual
   */
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }

  /**
   * Establece el nivel de calidad
   */
  setQuality(quality: QualityLevel): void {
    this.currentQuality = quality;
  }

  /**
   * Obtiene configuración de throttling basada en rendimiento
   */
  getThrottleConfig(): { updateRate: number; skipFrames: number } {
    const { fps, vectorCount } = this.metrics;
    
    if (fps < 20 || vectorCount > 800) {
      return { updateRate: 15, skipFrames: 4 }; // Muy agresivo
    } else if (fps < 30 || vectorCount > 500) {
      return { updateRate: 10, skipFrames: 3 }; // Agresivo
    } else if (fps < 45 || vectorCount > 300) {
      return { updateRate: 5, skipFrames: 2 }; // Moderado
    } else {
      return { updateRate: 3, skipFrames: 1 }; // Suave
    }
  }

  /**
   * Resetea las métricas
   */
  reset(): void {
    this.frameHistory = [];
    this.renderTimeHistory = [];
    this.frameCount = 0;
    this.switchCooldown = 0;
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      vectorCount: 0,
      complexity: 0,
      memoryUsage: 0,
      renderTime: 0
    };
  }

  /**
   * Obtiene estadísticas de rendimiento para debugging
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      metrics: this.metrics,
      mode: this.currentMode,
      quality: this.currentQuality,
      frameCount: this.frameCount,
      switchCooldown: this.switchCooldown,
      throttleConfig: this.getThrottleConfig(),
      frameHistorySize: this.frameHistory.length
    };
  }
}

// Instancia singleton para uso global
export const performanceMonitor = new PerformanceMonitor();
