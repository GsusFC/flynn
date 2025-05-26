# Flynn Vector Grid

> Sistema avanzado de visualización vectorial con animaciones dinámicas y renderizado híbrido optimizado para alta performance.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Características Principales

### 🎨 Sistema de Animaciones Avanzado
- **12+ tipos de animación** predefinidos: ondas suaves, patrones geométricos, efectos de mar, vórtices, y más
- **Sistema modular** con props configurables para cada animación
- **Animaciones en tiempo real** con interpolación suave
- **Efectos dinámicos** que responden a la intensidad de movimiento

### ⚡ Renderizado Híbrido Optimizado
- **Cambio automático SVG ↔ Canvas** basado en performance
- **Monitor de rendimiento** con métricas en tiempo real
- **Optimización automática** para grids de alta densidad (2500+ vectores)
- **Calidad adaptativa** según carga computacional

### 🎛️ Longitud Dinámica
- **Vectores reactivos** que cambian tamaño según intensidad de animación
- **Configuración avanzada**: intensidad, reactividad, suavizado
- **Integración automática** con todas las animaciones
- **Visual feedback** en tiempo real

### 📤 Sistema de Exportación
- **Exportación SVG** con vectores animados
- **Generación de GIFs** para animaciones
- **Metadatos incluidos** en exportaciones
- **Configuración personalizable** de calidad y duración

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/GsusFC/flynn.git
cd flynn/flynn-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` (o el siguiente puerto disponible).

### Comandos Disponibles

```bash
npm run dev      # Servidor desarrollo con Turbopack
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linting con ESLint
```

## 🎮 Uso Básico

### Configuración de Grid
```typescript
const gridConfig = {
  rows: 12,        // Filas de vectores
  cols: 18,        // Columnas de vectores  
  spacing: 30,     // Espacio entre vectores
  margin: 20       // Margen del canvas
};
```

### Configuración de Vectores
```typescript
const vectorConfig = {
  shape: 'line',           // 'line' | 'arrow' | 'circle' | 'triangle'
  length: 24,              // Longitud base
  width: 2,                // Grosor
  color: '#10b981',        // Color
  rotationOrigin: 'center' // 'center' | 'start' | 'end'
};
```

### Animaciones
```typescript
// Configuración de animación
const animationProps = {
  waveFrequency: 0.0002,
  waveAmplitude: 30,
  patternScale: 0.01
};

// Aplicar animación
setCurrentAnimationId('smoothWaves');
setAnimationProps(animationProps);
```

## 🏗️ Arquitectura

### Estructura del Proyecto
```
flynn-app/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   └── components/
│       ├── features/
│       │   └── vector-grid/    # Componentes principales
│       │       ├── simple/     # Sistema simplificado
│       │       ├── animations/ # Sistema de animaciones
│       │       ├── renderers/  # Renderizadores híbridos
│       │       ├── export/     # Sistema de exportación
│       │       └── utils/      # Utilidades y helpers
│       └── ui/                 # Componentes UI reutilizables
├── public/                     # Assets estáticos
└── docs/                       # Documentación
```

### Componentes Clave

#### `SimpleVectorGridOptimized`
Componente principal que maneja el renderizado híbrido y optimizaciones de performance.

#### `HybridRenderer` 
Renderizador que alterna automáticamente entre SVG y Canvas según la carga.

#### `useSimpleVectorGrid`
Hook principal que gestiona estado, animaciones y lógica de vectores.

### Sistema de Animaciones

Las animaciones están organizadas modularmente:

```typescript
// Cada animación implementa esta interfaz
interface AnimationImplementation {
  applyAnimation: (vectors: SimpleVector[], props: AnimationProps, time: number) => SimpleVector[];
  getDefaultProps: () => AnimationProps;
  validateProps: (props: any) => AnimationProps;
}
```

## 📊 Animaciones Disponibles

| Animación | Descripción | Props Principales |
|-----------|-------------|-------------------|
| `smoothWaves` | Ondas suaves y fluidas | `waveFrequency`, `waveAmplitude` |
| `seaWaves` | Simulación orgánica de olas | `baseFrequency`, `spatialFactor` |
| `geometricPattern` | Patrones geométricos complejos | `patternType`, `patternIntensity` |
| `centerPulse` | Pulsos desde el centro | `pulseDuration`, `maxAngleOffset` |
| `vortexAnimation` | Efectos de vórtice | `strength`, `radiusFalloff` |
| `rippleEffect` | Ondas expansivas | `rippleSpeed`, `rippleAmplitude` |
| `pinwheels` | Patrones de molinillo | `pinwheelCount`, `rotationSpeed` |
| `jitter` | Movimiento aleatorio | `jitterIntensity`, `jitterSpeed` |
| `lissajous` | Curvas de Lissajous | `xFrequency`, `yFrequency` |
| `perlinFlow` | Flujo basado en ruido Perlin | `noiseScale`, `timeEvolutionSpeed` |

## 🎛️ Configuración Avanzada

### Longitud Dinámica
```typescript
const dynamicConfig = {
  enableDynamicLength: true,   // Activar longitud dinámica
  lengthMultiplier: 2.0,       // Multiplicador máximo (1.0x - 3.0x)
  responsiveness: 0.8,         // Reactividad (10% - 100%)
  smoothing: 0.8              // Suavizado de transiciones (10% - 100%)
};
```

### Monitor de Performance
```typescript
const performanceConfig = {
  targetFPS: 60,              // FPS objetivo
  qualityThreshold: 0.7,      // Umbral de calidad
  autoOptimize: true          // Optimización automática
};
```

## 🔧 Performance

### Optimizaciones Implementadas

#### Animaciones
- **Caché de cálculos** costosos (distancias, ángulos)
- **Eliminación de bucles infinitos** en normalización
- **Pre-cálculo de constantes** fuera de loops
- **Reducción de operaciones Math** pesadas

#### Renderizado
- **Cambio automático** SVG → Canvas para >300 vectores
- **Path2D optimization** para Canvas con muchos vectores
- **Memoización** de datos vectoriales
- **Calidad adaptativa** según carga

#### Memoria
- **Gestión eficiente** de referencias
- **Cleanup automático** de recursos
- **Pooling de objetos** para evitar GC

### Métricas de Performance

El sistema incluye un monitor integrado que rastrea:
- **FPS en tiempo real**
- **Tiempo de renderizado**
- **Uso de memoria**
- **Complejidad computacional**
- **Recomendaciones automáticas**

## 🎨 Personalización

### Crear Nueva Animación

1. **Crear implementación:**
```typescript
// src/components/features/vector-grid/simple/animations/implementations/miAnimacion.ts
import type { SimpleVector, AnimationProps } from '../simpleTypes';

export const miAnimacion = {
  applyAnimation: (vectors: SimpleVector[], props: AnimationProps, time: number) => {
    return vectors.map(vector => ({
      ...vector,
      angle: calculateNewAngle(vector, props, time)
    }));
  },
  
  getDefaultProps: () => ({
    intensity: 1.0,
    speed: 0.001
  }),
  
  validateProps: (props: any) => ({
    intensity: Math.max(0, Math.min(2, props.intensity ?? 1.0)),
    speed: Math.max(0.0001, Math.min(0.01, props.speed ?? 0.001))
  })
};
```

2. **Registrar en animationEngine:**
```typescript
// src/components/features/vector-grid/simple/animations/animationEngine.ts
import { miAnimacion } from './implementations/miAnimacion';

export const animationRegistry = {
  // ... otras animaciones
  miAnimacion
};
```

### Personalizar Renderizado

El sistema permite personalizar completamente el renderizado:

```typescript
// Renderer personalizado para formas custom
const customRenderer = (props: VectorRenderProps) => (
  <path d={generateCustomPath(props)} fill="none" stroke={props.color} />
);
```

## 📤 Exportación

### SVG
```typescript
const svgString = await exportToSVG({
  vectors: currentVectors,
  width: 1200,
  height: 800,
  includeMetadata: true
});
```

### GIF Animado
```typescript
const gifBlob = await exportToGIF({
  frames: animationFrames,
  duration: 3000,
  quality: 'high',
  fps: 30
});
```

## 🛠️ Desarrollo

### Estructura de Commits
```
🎨 feat: Nueva funcionalidad
🔧 fix: Corrección de bugs  
⚡ perf: Mejoras de performance
📚 docs: Documentación
🧪 test: Tests
🔨 refactor: Refactoring
```

### Debug Mode
```typescript
// Activar modo debug para logs detallados
const debugMode = true;
```

### Testing
```bash
# Configuración de test recomendada
npm run dev  # Terminal 1: Servidor desarrollo
# Abrir http://localhost:3000
# Configurar grid 50x50 (2500 vectores)
# Probar animaciones complejas
```

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crear rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m '🎨 feat: Add AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir Pull Request**

## 📋 Roadmap

### v0.2.0
- [ ] Sistema de colores HSL independiente
- [ ] Gradientes personalizables
- [ ] Animaciones basadas en audio
- [ ] Editor visual de animaciones

### v0.3.0
- [ ] WebGL renderer para grids masivos
- [ ] Sistema de plugins
- [ ] Animaciones 3D
- [ ] Exportación a video

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Reconocimientos

- **Next.js Team** - Framework de desarrollo
- **Vercel** - Platform de deployment  
- **React Team** - Librería UI
- **Tailwind CSS** - Framework CSS

---

**Desarrollado con ❤️ por [GsusFC](https://github.com/GsusFC)**

> Si encuentras útil este proyecto, ¡considera darle una ⭐ en GitHub!