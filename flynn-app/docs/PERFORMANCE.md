# Guía de Performance - Flynn Vector Grid

## 🎯 Objetivos de Performance

Flynn Vector Grid está diseñado para mantener **60 FPS** con grids de hasta **1000 vectores** y **30+ FPS** con grids de hasta **5000 vectores**, adaptándose automáticamente según la capacidad del dispositivo.

### Benchmarks de Referencia

| Vectores | Modo Recomendado | FPS Target | Uso CPU | Uso Memoria |
|----------|------------------|------------|---------|-------------|
| < 100    | SVG              | 60 FPS     | < 20%   | < 50 MB     |
| 100-300  | SVG              | 45-60 FPS  | 20-40%  | 50-100 MB   |
| 300-1000 | Canvas           | 30-45 FPS  | 40-60%  | 100-200 MB  |
| 1000+    | Canvas + Low Quality | 15-30 FPS | 60-80% | 200-400 MB |

## ⚡ Sistema de Renderizado Híbrido

### Cambio Automático de Modo

El sistema monitorea constantemente la performance y cambia automáticamente entre renderizado SVG y Canvas:

```typescript
// Lógica de decisión simplificada
class PerformanceMonitor {
  shouldSwitchRenderMode(): { mode: RenderMode; reason: string } | null {
    const metrics = this.getMetrics();
    
    // SVG → Canvas: Demasiados vectores o FPS bajo
    if (this.currentMode === RenderMode.SVG) {
      if (metrics.vectorCount > 300 || metrics.fps < 30) {
        return {
          mode: RenderMode.CANVAS,
          reason: `Vector count: ${metrics.vectorCount}, FPS: ${metrics.fps}`
        };
      }
    }
    
    // Canvas → SVG: Pocos vectores y performance sobrada
    if (this.currentMode === RenderMode.CANVAS) {
      if (metrics.vectorCount < 200 && metrics.fps > 55 && metrics.renderTime < 10) {
        return {
          mode: RenderMode.SVG,
          reason: 'Light load, SVG provides better quality'
        };
      }
    }
    
    return null;
  }
}
```

### Calidad Adaptativa

En modo Canvas, el sistema ajusta automáticamente la calidad de renderizado:

```typescript
enum QualityLevel {
  LOW = 'low',       // Máxima performance
  MEDIUM = 'medium', // Balance
  HIGH = 'high'      // Máxima calidad
}

interface QualitySettings {
  usePath2D: boolean;        // Usar Path2D para optimización
  enableAntialiasing: boolean; // Activar antialiasing
  maxVectorLength: number;   // Longitud máxima para culling
  skipComplexShapes: boolean; // Simplificar formas complejas
}

function getQualitySettings(level: QualityLevel): QualitySettings {
  switch (level) {
    case QualityLevel.LOW:
      return {
        usePath2D: true,
        enableAntialiasing: false,
        maxVectorLength: 50,
        skipComplexShapes: true
      };
    case QualityLevel.MEDIUM:
      return {
        usePath2D: true,
        enableAntialiasing: true,
        maxVectorLength: 100,
        skipComplexShapes: false
      };
    case QualityLevel.HIGH:
      return {
        usePath2D: false,
        enableAntialiasing: true,
        maxVectorLength: Infinity,
        skipComplexShapes: false
      };
  }
}
```

## 🔧 Optimizaciones Implementadas

### 1. Optimizaciones de Animación

#### Caché de Cálculos Costosos
```typescript
// ❌ Lento - recalcula cada frame
function getMaxDistance(vectors: SimpleVector[]): number {
  return Math.max(...vectors.map(v => 
    Math.sqrt(v.x * v.x + v.y * v.y)
  ));
}

// ✅ Rápido - caché persistente
let cachedMaxDistance: number | null = null;
let cachedVectorCount = 0;

function getMaxDistance(vectors: SimpleVector[]): number {
  if (cachedMaxDistance === null || vectors.length !== cachedVectorCount) {
    cachedMaxDistance = Math.max(...vectors.map(v => 
      Math.sqrt(v.x * v.x + v.y * v.y)
    ));
    cachedVectorCount = vectors.length;
  }
  return cachedMaxDistance;
}
```

#### Pre-cálculo de Constantes
```typescript
// ❌ Lento - cálculo repetido
vectors.forEach(vector => {
  const angle = vector.originalAngle + 
    Math.sin(time * 0.001 + vector.x * 0.01) * 30;
});

// ✅ Rápido - pre-cálculo
const timePhase = time * 0.001;
const spatialScale = 0.01;
const amplitude = 30;

vectors.forEach(vector => {
  const angle = vector.originalAngle + 
    Math.sin(timePhase + vector.x * spatialScale) * amplitude;
});
```

#### Normalización Optimizada
```typescript
// ❌ Peligroso - bucle infinito posible
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// ✅ Seguro y rápido
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}
```

### 2. Optimizaciones de Renderizado

#### React Optimizations
```typescript
// Memoización estratégica
const MemoizedVectorGrid = React.memo(SimpleVectorGridOptimized, (prevProps, nextProps) => {
  return (
    prevProps.gridConfig === nextProps.gridConfig &&
    prevProps.vectorConfig === nextProps.vectorConfig &&
    prevProps.animationType === nextProps.animationType &&
    JSON.stringify(prevProps.animationProps) === JSON.stringify(nextProps.animationProps)
  );
});

// UseCallback para funciones estables
const handleVectorClick = useCallback((vector: SimpleVector, event: React.MouseEvent) => {
  // Lógica de click
}, []);

// UseMemo para cálculos costosos
const memoizedVectorData = useMemo(() => {
  return vectors.map(vector => ({
    x: vector.x,
    y: vector.y,
    angle: vector.angle,
    length: vector.dynamicLength || vector.length
  }));
}, [vectors]);
```

#### Canvas Optimizations
```typescript
// Path2D para múltiples vectores similares
const renderWithPath2D = useCallback((
  ctx: CanvasRenderingContext2D, 
  vectors: CanvasVectorData[]
) => {
  const pathsByColor = new Map<string, Path2D>();
  
  // Agrupar por color
  vectors.forEach(vector => {
    const colorKey = typeof vector.color === 'string' ? 
      vector.color : 
      `hsla(${vector.color.h},${vector.color.s}%,${vector.color.l}%,${vector.color.a || 1})`;
    
    if (!pathsByColor.has(colorKey)) {
      pathsByColor.set(colorKey, new Path2D());
    }
    
    const path = pathsByColor.get(colorKey)!;
    addVectorToPath(path, vector);
  });
  
  // Renderizar por grupos
  pathsByColor.forEach((path, color) => {
    ctx.strokeStyle = color;
    ctx.stroke(path);
  });
}, []);

// Culling de vectores fuera de viewport
const culledVectors = vectors.filter(vector => {
  return vector.x >= -50 && vector.x <= width + 50 &&
         vector.y >= -50 && vector.y <= height + 50;
});
```

### 3. Optimizaciones de Memoria

#### Pooling de Objetos
```typescript
class VectorPool {
  private pool: SimpleVector[] = [];
  
  get(): SimpleVector {
    return this.pool.pop() || this.createVector();
  }
  
  release(vector: SimpleVector): void {
    // Reset properties
    vector.dynamicLength = undefined;
    vector.dynamicWidth = undefined;
    vector.intensity = 0;
    
    this.pool.push(vector);
  }
  
  private createVector(): SimpleVector {
    return {
      id: '',
      x: 0, y: 0,
      angle: 0, length: 0, width: 0,
      color: '#000000', opacity: 1,
      originalX: 0, originalY: 0, originalAngle: 0,
      gridRow: 0, gridCol: 0
    };
  }
}
```

#### Cleanup de Referencias
```typescript
useEffect(() => {
  // Cleanup function
  return () => {
    // Limpiar timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Limpiar event listeners
    window.removeEventListener('resize', handleResize);
    
    // Limpiar cache
    clearAnimationCache();
  };
}, []);
```

## 📊 Monitoreo en Tiempo Real

### Métricas Rastreadas

```typescript
interface PerformanceMetrics {
  fps: number;              // Frames por segundo actual
  averageFps: number;       // FPS promedio últimos 60 frames
  renderTime: number;       // Tiempo renderizado último frame (ms)
  maxRenderTime: number;    // Tiempo máximo registrado
  memoryUsage: number;      // Uso estimado memoria (MB)
  complexity: number;       // Factor complejidad (0-1)
  vectorCount: number;      // Número vectores renderizados
  droppedFrames: number;    // Frames perdidos
  
  // Breakdown por subsistema
  animationTime: number;    // Tiempo en animaciones (ms)
  renderingTime: number;    // Tiempo en renderizado (ms)
  dynamicsTime: number;     // Tiempo en dinámicas (ms)
}
```

### Performance Dashboard

```typescript
const PerformanceDashboard: React.FC<{ metrics: PerformanceMetrics }> = ({ metrics }) => {
  const getPerformanceColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-black/80 text-white p-3 rounded text-xs font-mono">
      <div className={`text-lg ${getPerformanceColor(metrics.fps)}`}>
        FPS: {metrics.fps.toFixed(1)}
      </div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      <div>Vectors: {metrics.vectorCount}</div>
      
      {/* Breakdown detallado */}
      <div className="mt-2 space-y-1">
        <div>Animation: {metrics.animationTime.toFixed(1)}ms</div>
        <div>Rendering: {metrics.renderingTime.toFixed(1)}ms</div>
        <div>Dynamics: {metrics.dynamicsTime.toFixed(1)}ms</div>
      </div>
      
      {/* Alertas */}
      {metrics.droppedFrames > 0 && (
        <div className="text-red-400 mt-2">
          ⚠️ {metrics.droppedFrames} dropped frames
        </div>
      )}
    </div>
  );
};
```

## 🎛️ Configuración de Performance

### Configuración Automática por Dispositivo

```typescript
function getOptimalConfiguration(): {
  maxVectors: number;
  preferredMode: RenderMode;
  quality: QualityLevel;
} {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  
  // Detectar capacidades GPU
  const hasWebGL = !!gl;
  const renderer = gl?.getParameter(gl.RENDERER) || '';
  const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
  
  // Detectar RAM aproximada
  const memory = (navigator as any).deviceMemory || 4; // GB
  
  if (isMobile) {
    return {
      maxVectors: memory > 4 ? 1000 : 500,
      preferredMode: RenderMode.CANVAS,
      quality: QualityLevel.MEDIUM
    };
  }
  
  if (hasWebGL && renderer.includes('NVIDIA')) {
    return {
      maxVectors: 5000,
      preferredMode: RenderMode.CANVAS,
      quality: QualityLevel.HIGH
    };
  }
  
  return {
    maxVectors: 2000,
    preferredMode: RenderMode.SVG,
    quality: QualityLevel.MEDIUM
  };
}
```

### Configuración Manual

```typescript
// Configuración para máxima performance
const performanceConfig = {
  maxVectors: 500,
  forceRenderMode: RenderMode.CANVAS,
  quality: QualityLevel.LOW,
  disableDynamics: true,
  simplifiedAnimations: true
};

// Configuración para máxima calidad
const qualityConfig = {
  maxVectors: 1000,
  forceRenderMode: RenderMode.SVG,
  quality: QualityLevel.HIGH,
  enableDynamics: true,
  complexAnimations: true
};
```

## 🔍 Profiling y Debug

### Performance Profiler Integrado

```typescript
class PerformanceProfiler {
  private markers = new Map<string, number>();
  
  start(label: string): void {
    this.markers.set(label, performance.now());
  }
  
  end(label: string): number {
    const start = this.markers.get(label);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.markers.delete(label);
    
    if (duration > 16) { // Frame budget exceeded
      console.warn(`⚠️ Performance: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
}

// Uso en animaciones
const profiler = new PerformanceProfiler();

const animatedVectors = profiler.measure('smoothWaves', () => {
  return smoothWaves.applyAnimation(vectors, props, time);
});
```

### Memory Leak Detection

```typescript
class MemoryMonitor {
  private samples: number[] = [];
  private readonly maxSamples = 100;
  
  sample(): void {
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      this.samples.push(usage);
      
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      this.detectLeak();
    }
  }
  
  private detectLeak(): void {
    if (this.samples.length < 50) return;
    
    const recent = this.samples.slice(-20);
    const older = this.samples.slice(-50, -20);
    
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b) / older.length;
    
    const growth = recentAvg - olderAvg;
    
    if (growth > 10) { // 10MB growth
      console.warn(`🚨 Potential memory leak detected: +${growth.toFixed(1)}MB`);
    }
  }
}
```

## 🚀 Recomendaciones de Uso

### Para Desarrolladores

1. **Usa el modo debug** para identificar cuellos de botella:
   ```typescript
   <SimpleVectorGridOptimized debugMode={true} />
   ```

2. **Configura límites razonables** según tu caso de uso:
   ```typescript
   const gridConfig = {
     rows: Math.min(maxRows, 50),
     cols: Math.min(maxCols, 50)
   };
   ```

3. **Monitora las métricas** y ajusta dinámicamente:
   ```typescript
   const handlePerformanceChange = (metrics: PerformanceMetrics) => {
     if (metrics.fps < 20) {
       setGridSize(prev => ({
         rows: Math.max(10, prev.rows - 5),
         cols: Math.max(10, prev.cols - 5)
       }));
     }
   };
   ```

### Para Usuarios Finales

1. **Configuración Conservadora (recomendada)**:
   - Grid: 20x30 (600 vectores)
   - Animaciones simples (smoothWaves, jitter)
   - Longitud dinámica: Intensidad 1.5x

2. **Configuración Performance**:
   - Grid: 30x40 (1200 vectores)
   - Modo Canvas forzado
   - Animaciones optimizadas

3. **Configuración Extrema** (solo dispositivos potentes):
   - Grid: 50x50 (2500 vectores)
   - Todas las animaciones disponibles
   - Longitud dinámica máxima

El sistema está diseñado para degradar graciosamente y mantener usabilidad incluso bajo condiciones de alta carga, priorizando siempre la estabilidad sobre la complejidad visual.