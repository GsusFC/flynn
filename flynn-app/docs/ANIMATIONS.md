# Sistema de Animaciones Flynn Vector Grid

## 🎬 Visión General

El sistema de animaciones de Flynn Vector Grid está diseñado con una arquitectura modular que permite crear efectos visuales complejos de manera eficiente y escalable. Cada animación es una implementación independiente que puede ser configurada, validada y optimizada por separado.

## 🏗️ Arquitectura

### Estructura Modular
```
src/components/features/vector-grid/simple/animations/
├── base/
│   ├── AnimationBase.ts      # Clase base para animaciones
│   ├── utils.ts              # Utilidades matemáticas compartidas
│   └── types.ts              # Tipos TypeScript
├── implementations/
│   ├── smoothWaves.ts        # Ondas suaves
│   ├── seaWaves.ts          # Simulación de mar
│   ├── geometricPattern.ts   # Patrones geométricos
│   ├── centerPulse.ts       # Pulsos centrales
│   ├── vortexAnimation.ts   # Efectos vórtice
│   ├── rippleEffect.ts      # Ondas expansivas
│   ├── pinwheels.ts         # Patrones molinillo
│   ├── jitter.ts            # Movimiento aleatorio
│   ├── lissajous.ts         # Curvas Lissajous
│   └── perlinFlow.ts        # Flujo Perlin
└── animationEngine.ts        # Motor principal
```

### Interfaz de Animación
```typescript
interface AnimationImplementation {
  applyAnimation: (
    vectors: SimpleVector[], 
    props: AnimationProps, 
    time: number
  ) => SimpleVector[];
  
  getDefaultProps: () => AnimationProps;
  validateProps: (props: any) => AnimationProps;
}
```

## 🎨 Catálogo de Animaciones

### 1. smoothWaves
**Descripción:** Ondas suaves y fluidas que se propagan por el grid

```typescript
// Props disponibles
interface SmoothWavesProps {
  waveFrequency: number;    // 0.0001 - 0.001 (velocidad onda)
  waveAmplitude: number;    // 10 - 180 (amplitud en grados) 
  patternScale: number;     // 0.005 - 0.05 (escala espacial)
  timeScale: number;        // 0.1 - 3.0 (multiplicador tiempo)
}

// Uso
setAnimationProps({
  waveFrequency: 0.0002,
  waveAmplitude: 45,
  patternScale: 0.01,
  timeScale: 1.0
});
```

**Algoritmo:**
- Calcula distancia desde centro usando norma Manhattan
- Aplica función seno con fase temporal
- Combina patrones espaciales y temporales

### 2. seaWaves
**Descripción:** Simulación orgánica de olas marinas con múltiples frecuencias

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

**Algoritmo:**
- Combina múltiples ondas sinusoidales
- Añade "choppiness" para irregularidad
- Factor espacial para variación posicional

### 3. geometricPattern
**Descripción:** Patrones geométricos complejos con movimiento tangencial

```typescript
interface GeometricPatternProps {
  patternType: 'spiral' | 'radial' | 'grid' | 'hexagonal';
  patternIntensity: number; // 0.1 - 3.0
  rotationSpeed: number;    // 0.0001 - 0.002
  timeScale: number;        // 0.5 - 2.0
}
```

**Algoritmos por tipo:**
- **Spiral:** Rotación basada en distancia radial
- **Radial:** Líneas desde centro con oscilación
- **Grid:** Patrón de cuadrícula con rotación
- **Hexagonal:** Estructura hexagonal con movimiento

### 4. centerPulse  
**Descripción:** Pulsos expansivos desde el centro con efectos dinámicos

```typescript
interface CenterPulseProps {
  pulseDuration: number;      // 500 - 3000ms
  pulseIntensity: number;     // 0.5 - 2.0
  pulseSpeed: number;         // 0.001 - 0.01
  maxAngleOffset: number;     // 30 - 180
  ringSpacing: number;        // 20 - 100
}
```

**Características:**
- Ondas concéntricas con timing variable
- Efectos de ángulo basados en distancia
- Intensidad decreciente con radio

### 5. vortexAnimation
**Descripción:** Efectos de vórtice con rotación tangencial

```typescript
interface VortexProps {
  centerX?: number;           // Posición X centro
  centerY?: number;           // Posición Y centro  
  strength: number;           // 0.01 - 0.2
  radiusFalloff: number;      // 0.5 - 2.0
  direction: 'cw' | 'ccw';    // Dirección rotación
}
```

**Algoritmo:**
- Calcula ángulo tangencial a centro
- Aplica falloff por distancia
- Combina con ángulo base del vector

### 6. rippleEffect
**Descripción:** Ondas expansivas con propagación radial

```typescript
interface RippleProps {
  rippleSpeed: number;        // 0.001 - 0.01
  rippleAmplitude: number;    // 20 - 120
  frequency: number;          // 0.01 - 0.1
  damping: number;            // 0.1 - 1.0
}
```

### 7. pinwheels
**Descripción:** Patrones de molinillo con múltiples centros

```typescript
interface PinwheelsProps {
  pinwheelCount: number;      // 2 - 8
  rotationSpeed: number;      // 0.0005 - 0.005
  radiusInfluence: number;    // 50 - 200
  phaseOffset: number;        // 0 - 2π
}
```

### 8. jitter
**Descripción:** Movimiento aleatorio controlado

```typescript
interface JitterProps {
  jitterIntensity: number;    // 0.1 - 2.0
  jitterSpeed: number;        // 0.001 - 0.02
  smoothness: number;         // 0.1 - 1.0
  baseAngle: number;          // 0 - 360
}
```

### 9. lissajous
**Descripción:** Curvas de Lissajous aplicadas a movimiento vectorial

```typescript
interface LissajousProps {
  xFrequency: number;         // 1 - 8
  yFrequency: number;         // 1 - 8  
  xAmplitude: number;         // 30 - 180
  yAmplitude: number;         // 30 - 180
  phaseOffset: number;        // 0 - 2π
  timeSpeed: number;          // 0.0005 - 0.005
}
```

### 10. perlinFlow
**Descripción:** Flujo orgánico basado en ruido Perlin

```typescript
interface PerlinFlowProps {
  noiseScale: number;         // 0.01 - 0.1
  timeEvolutionSpeed: number; // 0.0002 - 0.002
  angleMultiplier: number;    // 180 - 720
  octaves: number;            // 1 - 4
}
```

## ⚡ Optimizaciones de Performance

### Estrategias Implementadas

#### 1. Caché de Cálculos Costosos
```typescript
// Cache distancia máxima para evitar recálculo
let cachedMaxDistance: number | null = null;

function getMaxDistance(vectors: SimpleVector[]): number {
  if (cachedMaxDistance === null) {
    cachedMaxDistance = calculateMaxDistance(vectors);
  }
  return cachedMaxDistance;
}
```

#### 2. Pre-cálculo de Constantes
```typescript
// Calcular constantes una vez por frame
const timePhase = time * waveFrequency * timeScale;
const spatialScale = patternScale;

// Usar en loop
vectors.forEach(vector => {
  const phase = timePhase + (distance * spatialScale);
  // ...
});
```

#### 3. Eliminación de Operaciones Costosas
```typescript
// ❌ Lento - conversión repetida
Math.sin(angle * Math.PI / 180)

// ✅ Rápido - trabajar en radianes
Math.sin(angleInRadians)
```

#### 4. Normalización Optimizada
```typescript
// ❌ Peligroso - bucle infinito posible
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// ✅ Seguro - operación matemática directa
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}
```

### Métricas de Performance

#### Benchmarks Típicos (2500 vectores)
| Animación | FPS (SVG) | FPS (Canvas) | Complejidad |
|-----------|-----------|--------------|-------------|
| smoothWaves | 45-60 | 55-60 | Baja |
| seaWaves | 40-55 | 50-60 | Media |
| geometricPattern | 35-50 | 45-60 | Alta |
| vortexAnimation | 40-55 | 50-60 | Media |
| perlinFlow | 30-45 | 40-55 | Alta |

## 🛠️ Creación de Nuevas Animaciones

### Template Base
```typescript
// src/components/features/vector-grid/simple/animations/implementations/miAnimacion.ts

import type { SimpleVector, AnimationProps } from '../simpleTypes';
import { normalizeAngle } from '../base/utils';

interface MiAnimacionProps {
  intensity: number;
  speed: number;
  // ... más props
}

export const miAnimacion = {
  applyAnimation: (
    vectors: SimpleVector[], 
    props: MiAnimacionProps, 
    time: number
  ): SimpleVector[] => {
    
    // Pre-cálculos (una vez por frame)
    const timePhase = time * props.speed;
    
    return vectors.map(vector => {
      // Cálculos por vector
      const newAngle = calculateNewAngle(vector, props, timePhase);
      
      return {
        ...vector,
        angle: normalizeAngle(newAngle)
      };
    });
  },

  getDefaultProps: (): MiAnimacionProps => ({
    intensity: 1.0,
    speed: 0.001
  }),

  validateProps: (props: any): MiAnimacionProps => ({
    intensity: Math.max(0.1, Math.min(3.0, props.intensity ?? 1.0)),
    speed: Math.max(0.0001, Math.min(0.01, props.speed ?? 0.001))
  })
};

function calculateNewAngle(
  vector: SimpleVector, 
  props: MiAnimacionProps, 
  timePhase: number
): number {
  // Implementar lógica de animación aquí
  return vector.originalAngle + Math.sin(timePhase) * props.intensity * 45;
}
```

### Registro en Engine
```typescript
// src/components/features/vector-grid/simple/animations/animationEngine.ts

import { miAnimacion } from './implementations/miAnimacion';

export const animationRegistry = {
  // ... animaciones existentes
  miAnimacion
};

export type AnimationType = keyof typeof animationRegistry;
```

### Añadir a UI
```typescript
// src/app/page.tsx - en la función getDefaultProps

function getDefaultProps(animationType: string): Record<string, unknown> {
  switch (animationType) {
    // ... casos existentes
    case 'miAnimacion':
      return animationRegistry.miAnimacion.getDefaultProps();
    default:
      return {};
  }
}
```

## 🎛️ Configuración Avanzada

### Props Dinámicas
```typescript
// Cambiar props durante ejecución
const updateAnimationProps = (newProps: Partial<AnimationProps>) => {
  setAnimationProps(prev => ({ ...prev, ...newProps }));
};

// Animación reactiva a interacciones
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    updateAnimationProps({
      centerX: e.clientX,
      centerY: e.clientY
    });
  };
  
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);
```

### Combinación de Animaciones
```typescript
// Aplicar múltiples animaciones (no implementado aún)
const combineAnimations = (
  vectors: SimpleVector[],
  animations: Array<{ type: AnimationType; props: AnimationProps; weight: number }>
): SimpleVector[] => {
  return animations.reduce((acc, { type, props, weight }) => {
    const animated = animationRegistry[type].applyAnimation(acc, props, time);
    return blendVectorAngles(acc, animated, weight);
  }, vectors);
};
```

## 🔍 Debug y Análisis

### Debug Mode
```typescript
// Activar logs detallados
const debugMode = true;

// En implementación de animación
if (debugMode && Math.random() < 0.001) {
  console.log('🎬 [miAnimacion] Frame data:', {
    vectorCount: vectors.length,
    timePhase,
    sampleAngle: vectors[0]?.angle
  });
}
```

### Profiling de Performance
```typescript
// Medir tiempo de ejecución
const startTime = performance.now();
const animatedVectors = applyAnimation(vectors, props, time);
const endTime = performance.now();

console.log(`Animation ${type} took ${endTime - startTime}ms`);
```

### Visualización de Debugging
```typescript
// Añadir vectores de debug al render
const debugVectors = [
  { x: centerX, y: centerY, angle: 0, color: 'red' }, // Centro
  { x: mouseX, y: mouseY, angle: 90, color: 'blue' }  // Mouse
];
```

Este sistema de animaciones proporciona una base sólida y extensible para crear efectos visuales complejos mientras mantiene alta performance y facilidad de uso.