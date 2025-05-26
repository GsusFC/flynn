# API Reference - Flynn Vector Grid

## 🎯 Componentes Principales

### SimpleVectorGridOptimized

Componente principal para renderizar grids de vectores con optimizaciones automáticas.

```typescript
interface SimpleVectorGridOptimizedProps {
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  animationProps: Record<string, unknown>;
  dynamicVectorConfig?: DynamicVectorConfig;
  isPaused?: boolean;
  debugMode?: boolean;
  onVectorClick?: (vector: SimpleVector, event: React.MouseEvent) => void;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
  forceRenderMode?: RenderMode;
  backgroundColor?: string;
  className?: string;
}
```

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `gridConfig` | `GridConfig` | ✅ | Configuración del grid (filas, columnas, espaciado) |
| `vectorConfig` | `VectorConfig` | ✅ | Configuración de vectores (forma, tamaño, color) |
| `animationType` | `AnimationType` | ✅ | Tipo de animación a aplicar |
| `animationProps` | `Record<string, unknown>` | ✅ | Props específicas de la animación |
| `dynamicVectorConfig` | `DynamicVectorConfig` | ❌ | Configuración de longitud dinámica |
| `isPaused` | `boolean` | ❌ | Pausar/reanudar animación |
| `debugMode` | `boolean` | ❌ | Activar logs de debug |
| `onVectorClick` | `Function` | ❌ | Callback al hacer click en vector |
| `onPerformanceChange` | `Function` | ❌ | Callback con métricas de performance |
| `forceRenderMode` | `RenderMode` | ❌ | Forzar modo de renderizado |
| `backgroundColor` | `string` | ❌ | Color de fondo del canvas |

#### Ejemplo de uso

```typescript
import { SimpleVectorGridOptimized } from '@/components/features/vector-grid/simple/SimpleVectorGridOptimized';

function MyComponent() {
  const [gridConfig] = useState({
    rows: 20,
    cols: 30,
    spacing: 25,
    margin: 20
  });
  
  const [vectorConfig] = useState({
    shape: 'line',
    length: 20,
    width: 2,
    color: '#10b981',
    rotationOrigin: 'center'
  });
  
  return (
    <SimpleVectorGridOptimized
      gridConfig={gridConfig}
      vectorConfig={vectorConfig}
      animationType="smoothWaves"
      animationProps={{
        waveFrequency: 0.0002,
        waveAmplitude: 30
      }}
      debugMode={true}
    />
  );
}
```

## 🎬 Sistema de Animaciones

### AnimationType

Tipos de animación disponibles:

```typescript
type AnimationType = 
  | 'smoothWaves'
  | 'seaWaves'
  | 'geometricPattern'
  | 'centerPulse'
  | 'vortexAnimation'
  | 'rippleEffect'
  | 'pinwheels'
  | 'jitter'
  | 'lissajous'
  | 'perlinFlow'
  | 'hslRainbow'
  | 'hslGradientFlow';
```

### Props por Animación

#### smoothWaves
```typescript
interface SmoothWavesProps {
  waveFrequency: number;    // 0.0001 - 0.001
  waveAmplitude: number;    // 10 - 180
  patternScale: number;     // 0.005 - 0.05
  timeScale: number;        // 0.1 - 3.0
}
```

#### seaWaves
```typescript
interface SeaWavesProps {
  baseFrequency: number;    // 0.0005 - 0.003
  baseAmplitude: number;    // 15 - 90
  rippleFrequency: number;  // 0.001 - 0.005
  rippleAmplitude: number;  // 5 - 45
  spatialFactor: number;    // 0.005 - 0.02
  choppiness: number;       // 0.0 - 1.0
}
```

#### geometricPattern
```typescript
interface GeometricPatternProps {
  patternType: 'spiral' | 'radial' | 'grid' | 'hexagonal';
  patternIntensity: number; // 0.1 - 3.0
  rotationSpeed: number;    // 0.0001 - 0.002
  timeScale: number;        // 0.5 - 2.0
}
```

## 🎛️ Configuraciones

### GridConfig

```typescript
interface GridConfig {
  rows: number;      // Número de filas (1-100)
  cols: number;      // Número de columnas (1-100)
  spacing: number;   // Espaciado entre vectores (10-100)
  margin: number;    // Margen del canvas (0-50)
}
```

### VectorConfig

```typescript
interface VectorConfig {
  shape: VectorShape;           // Forma del vector
  length: number;               // Longitud base (5-100)
  width: number;                // Grosor (1-10)
  color: VectorColorValue;      // Color
  rotationOrigin: RotationOrigin; // Punto de rotación
}
```

#### VectorShape

```typescript
type VectorShape = 
  | 'line'        // Línea simple
  | 'arrow'       // Flecha con punta
  | 'circle'      // Círculo
  | 'triangle'    // Triángulo
  | 'curve'       // Curva suave
  | 'dot';        // Punto
```

#### RotationOrigin

```typescript
type RotationOrigin = 
  | 'center'  // Centro del vector
  | 'start'   // Inicio del vector
  | 'end';    // Final del vector
```

#### VectorColorValue

```typescript
type VectorColorValue = 
  | string                    // Color CSS
  | HSLColor                  // Color HSL
  | GradientConfig;           // Configuración de gradiente

interface HSLColor {
  h: number;  // Hue (0-360)
  s: number;  // Saturation (0-100)
  l: number;  // Lightness (0-100)
  a?: number; // Alpha (0-1)
}
```

### DynamicVectorConfig

```typescript
interface DynamicVectorConfig {
  enableDynamicLength: boolean;   // Activar longitud dinámica
  enableDynamicWidth: boolean;    // Activar grosor dinámico
  lengthMultiplier: number;       // Multiplicador máximo (1.0-3.0)
  widthMultiplier: number;        // Multiplicador grosor (1.0-3.0)
  responsiveness: number;         // Reactividad (0.0-1.0)
  smoothing: number;              // Suavizado (0.0-1.0)
}
```

## 🎮 Hooks

### useSimpleVectorGrid

Hook principal para gestión de vectores y animaciones.

```typescript
function useSimpleVectorGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  animationType: AnimationType,
  animationProps: Record<string, unknown>,
  dynamicVectorConfig?: DynamicVectorConfig,
  isPaused?: boolean,
  debugMode?: boolean
): {
  vectors: SimpleVector[];
  isAnimating: boolean;
  performanceMetrics: PerformanceMetrics;
  triggerPulse: (x: number, y: number) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
}
```

#### Ejemplo de uso

```typescript
function CustomVectorGrid() {
  const {
    vectors,
    isAnimating,
    performanceMetrics,
    triggerPulse
  } = useSimpleVectorGrid(
    gridConfig,
    vectorConfig,
    'smoothWaves',
    { waveFrequency: 0.0002 }
  );
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    triggerPulse(x, y);
  };
  
  return (
    <div onClick={handleCanvasClick}>
      {/* Renderizado personalizado */}
    </div>
  );
}
```

## 📤 Sistema de Exportación

### exportToSVG

```typescript
interface ExportSVGOptions {
  vectors: SimpleVector[];
  width: number;
  height: number;
  backgroundColor?: string;
  includeMetadata?: boolean;
  title?: string;
  description?: string;
}

async function exportToSVG(options: ExportSVGOptions): Promise<string>
```

#### Ejemplo

```typescript
import { exportToSVG } from '@/components/features/vector-grid/export/svgGenerator';

const svgString = await exportToSVG({
  vectors: currentVectors,
  width: 1200,
  height: 800,
  backgroundColor: '#ffffff',
  includeMetadata: true,
  title: 'Mi Grid de Vectores',
  description: 'Exportado desde Flynn Vector Grid'
});

// Descargar archivo
const blob = new Blob([svgString], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
// ... lógica de descarga
```

### exportToGIF

```typescript
interface ExportGIFOptions {
  frames: SimpleVector[][];
  width: number;
  height: number;
  duration: number;          // Duración total en ms
  fps?: number;              // Frames por segundo (default: 30)
  quality?: 'low' | 'medium' | 'high';
  backgroundColor?: string;
  onProgress?: (progress: number) => void;
}

async function exportToGIF(options: ExportGIFOptions): Promise<Blob>
```

#### Ejemplo

```typescript
import { exportToGIF } from '@/components/features/vector-grid/export/gifGenerator';

// Capturar frames
const frames: SimpleVector[][] = [];
for (let i = 0; i < 90; i++) {
  // Generar frame con animación
  frames.push(getCurrentVectors());
  await new Promise(resolve => setTimeout(resolve, 33)); // ~30fps
}

const gifBlob = await exportToGIF({
  frames,
  width: 800,
  height: 600,
  duration: 3000,
  fps: 30,
  quality: 'high',
  onProgress: (progress) => {
    console.log(`Exportando GIF: ${(progress * 100).toFixed(1)}%`);
  }
});
```

## 🔧 Utilidades

### Performance Monitor

```typescript
interface PerformanceMetrics {
  fps: number;              // Frames por segundo
  renderTime: number;       // Tiempo de renderizado (ms)
  memoryUsage: number;      // Uso de memoria (MB)
  complexity: number;       // Complejidad computacional (0-1)
  vectorCount: number;      // Número de vectores
  recommendation?: {
    mode: RenderMode;
    reason: string;
  };
}

class PerformanceMonitor {
  updateMetrics(vectorCount: number, animationType: string, renderTime: number): void;
  getMetrics(): PerformanceMetrics;
  shouldSwitchRenderMode(): { mode: RenderMode; reason: string } | null;
  setRenderMode(mode: RenderMode): void;
}
```

### Validadores

```typescript
// Validar configuración de grid
function validateGridConfig(config: Partial<GridConfig>): GridConfig;

// Validar configuración de vector
function validateVectorConfig(config: Partial<VectorConfig>): VectorConfig;

// Validar props de animación
function validateAnimationProps(
  animationType: AnimationType, 
  props: any
): Record<string, unknown>;
```

### Utilidades Matemáticas

```typescript
// Normalizar ángulo a rango 0-360
function normalizeAngle(angle: number): number;

// Calcular distancia entre puntos
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number;

// Interpolación lineal
function lerp(start: number, end: number, factor: number): number;

// Clamp valor a rango
function clamp(value: number, min: number, max: number): number;
```

## 🎨 Tipos Principales

### SimpleVector

```typescript
interface SimpleVector {
  id: string;
  x: number;                    // Posición X
  y: number;                    // Posición Y
  angle: number;                // Ángulo actual (0-360)
  length: number;               // Longitud base
  width: number;                // Grosor
  color: VectorColorValue;      // Color
  opacity: number;              // Opacidad (0-1)
  
  // Propiedades originales
  originalX: number;
  originalY: number;
  originalAngle: number;
  
  // Grid info
  gridRow: number;
  gridCol: number;
  
  // Propiedades dinámicas
  dynamicLength?: number;       // Longitud dinámica calculada
  dynamicWidth?: number;        // Grosor dinámico calculado
  intensity?: number;           // Intensidad de animación (0-1)
  previousAngle?: number;       // Ángulo del frame anterior
}
```

### RenderMode

```typescript
enum RenderMode {
  SVG = 'svg',       // Renderizado SVG (< 300 vectores típicamente)
  CANVAS = 'canvas'  // Renderizado Canvas (> 300 vectores)
}
```

## 🔍 Eventos

### onVectorClick

```typescript
type VectorClickHandler = (
  vector: SimpleVector, 
  event: React.MouseEvent
) => void;

// Ejemplo
const handleVectorClick: VectorClickHandler = (vector, event) => {
  console.log(`Vector clickeado: ${vector.id} en posición (${vector.x}, ${vector.y})`);
  // Lógica personalizada
};
```

### onPerformanceChange

```typescript
type PerformanceChangeHandler = (metrics: PerformanceMetrics) => void;

// Ejemplo  
const handlePerformanceChange: PerformanceChangeHandler = (metrics) => {
  if (metrics.fps < 30) {
    console.warn('Performance baja detectada:', metrics);
  }
  
  if (metrics.recommendation) {
    console.log('Recomendación:', metrics.recommendation);
  }
};
```

## 🚨 Manejo de Errores

### Errores Comunes

```typescript
// Error de configuración inválida
class InvalidConfigError extends Error {
  constructor(field: string, value: any, expected: string) {
    super(`Invalid ${field}: ${value}. Expected: ${expected}`);
  }
}

// Error de animación
class AnimationError extends Error {
  constructor(animationType: string, message: string) {
    super(`Animation ${animationType}: ${message}`);
  }
}

// Error de renderizado
class RenderError extends Error {
  constructor(mode: RenderMode, message: string) {
    super(`Render ${mode}: ${message}`);
  }
}
```

### Try-Catch Recomendado

```typescript
try {
  const vectors = useSimpleVectorGrid(
    gridConfig,
    vectorConfig,
    animationType,
    animationProps
  );
} catch (error) {
  if (error instanceof InvalidConfigError) {
    // Manejar error de configuración
    console.error('Configuración inválida:', error.message);
  } else if (error instanceof AnimationError) {
    // Manejar error de animación
    console.error('Error en animación:', error.message);
  } else {
    // Error genérico
    console.error('Error inesperado:', error);
  }
}
```

Esta API proporciona una interfaz completa y tipada para trabajar con Flynn Vector Grid, permitiendo desde casos de uso simples hasta implementaciones altamente personalizadas.