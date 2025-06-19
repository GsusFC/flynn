# Flynn Vector Grid

> Advanced vector visualization system with dynamic animations and hybrid rendering optimized for high performance.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Key Features

### 🎨 Advanced Animation System
- **12+ predefined animation types**: smooth waves, geometric patterns, sea effects, vortices, and more
- **Modular system** with configurable props for each animation
- **Real-time animations** with smooth interpolation
- **Dynamic effects** that respond to movement intensity

### ⚡ Optimized Hybrid Rendering
- **Automatic SVG ↔ Canvas switching** based on performance
- **Performance monitor** with real-time metrics
- **Automatic optimization** for high-density grids (2500+ vectors)
- **Adaptive quality** based on computational load

### 🎛️ Dynamic Length
- **Reactive vectors** that change size based on animation intensity
- **Advanced configuration**: intensity, responsiveness, smoothing
- **Automatic integration** with all animations
- **Real-time visual feedback**

### 📤 Export System
- **SVG export** with animated vectors
- **GIF generation** for animations
- **Metadata included** in exports
- **Customizable configuration** for quality and duration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/GsusFC/flynn.git
cd flynn/flynn-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### Available Commands

```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # Linting with ESLint
```

## 🎮 Basic Usage

### Grid Configuration
```typescript
const gridConfig = {
  rows: 12,        // Vector rows
  cols: 18,        // Vector columns  
  spacing: 30,     // Space between vectors
  margin: 20       // Canvas margin
};
```

### Vector Configuration
```typescript
const vectorConfig = {
  shape: 'line',           // 'line' | 'arrow' | 'circle' | 'triangle'
  length: 24,              // Base length
  width: 2,                // Thickness
  color: '#10b981',        // Color
  rotationOrigin: 'center' // 'center' | 'start' | 'end'
};
```

### Animations
```typescript
// Animation configuration
const animationProps = {
  waveFrequency: 0.0002,
  waveAmplitude: 30,
  patternScale: 0.01
};

// Apply animation
setCurrentAnimationId('smoothWaves');
setAnimationProps(animationProps);
```

## 🏗️ Architecture

### Project Structure
```
flynn-app/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   └── components/
│       ├── features/
│       │   └── vector-grid/    # Main components
│       │       ├── simple/     # Simplified system
│       │       ├── animations/ # Animation system
│       │       ├── renderers/  # Hybrid renderers
│       │       ├── export/     # Export system
│       │       └── utils/      # Utilities and helpers
│       └── ui/                 # Reusable UI components
├── public/                     # Static assets
└── docs/                       # Documentation
```

### Key Components

#### `SimpleVectorGridOptimized`
Main component that handles hybrid rendering and performance optimizations.

#### `HybridRenderer` 
Renderer that automatically alternates between SVG and Canvas based on load.

#### `useSimpleVectorGrid`
Main hook that manages state, animations, and vector logic.

### Animation System

Animations are organized modularly:

```typescript
// Each animation implements this interface
interface AnimationImplementation {
  applyAnimation: (vectors: SimpleVector[], props: AnimationProps, time: number) => SimpleVector[];
  getDefaultProps: () => AnimationProps;
  validateProps: (props: any) => AnimationProps;
}
```

## 📊 Available Animations

| Animation | Description | Main Props |
|-----------|-------------|------------|
| `smoothWaves` | Smooth and fluid waves | `waveFrequency`, `waveAmplitude` |
| `seaWaves` | Organic wave simulation | `baseFrequency`, `spatialFactor` |
| `geometricPattern` | Complex geometric patterns | `patternType`, `patternIntensity` |
| `centerPulse` | Pulses from center | `pulseDuration`, `maxAngleOffset` |
| `vortexAnimation` | Vortex effects | `strength`, `radiusFalloff` |
| `rippleEffect` | Expanding waves | `rippleSpeed`, `rippleAmplitude` |
| `pinwheels` | Pinwheel patterns | `pinwheelCount`, `rotationSpeed` |
| `jitter` | Random movement | `jitterIntensity`, `jitterSpeed` |
| `lissajous` | Lissajous curves | `xFrequency`, `yFrequency` |
| `perlinFlow` | Perlin noise-based flow | `noiseScale`, `timeEvolutionSpeed` |

## 🎛️ Advanced Configuration

### Dynamic Length
```typescript
const dynamicConfig = {
  enableDynamicLength: true,   // Enable dynamic length
  lengthMultiplier: 2.0,       // Maximum multiplier (1.0x - 3.0x)
  responsiveness: 0.8,         // Responsiveness (10% - 100%)
  smoothing: 0.8              // Transition smoothing (10% - 100%)
};
```

### Performance Monitor
```typescript
const performanceConfig = {
  targetFPS: 60,              // Target FPS
  qualityThreshold: 0.7,      // Quality threshold
  autoOptimize: true          // Automatic optimization
};
```

## 🔧 Performance

### Implemented Optimizations

#### Animations
- **Caching of expensive calculations** (distances, angles)
- **Elimination of infinite loops** in normalization
- **Pre-calculation of constants** outside loops
- **Reduction of heavy Math operations**

#### Rendering
- **Automatic switching** SVG → Canvas for >300 vectors
- **Path2D optimization** for Canvas with many vectors
- **Memoization** of vector data
- **Adaptive quality** based on load

#### Memory
- **Efficient reference management**
- **Automatic resource cleanup**
- **Object pooling** to avoid GC

### Performance Metrics

The system includes an integrated monitor that tracks:
- **Real-time FPS**
- **Rendering time**
- **Memory usage**
- **Computational complexity**
- **Automatic recommendations**

## 🎨 Customization

### Create New Animation

1. **Create implementation:**
```typescript
// src/components/features/vector-grid/simple/animations/implementations/myAnimation.ts
import type { SimpleVector, AnimationProps } from '../simpleTypes';

export const myAnimation = {
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

2. **Register in animationEngine:**
```typescript
// src/components/features/vector-grid/simple/animations/animationEngine.ts
import { myAnimation } from './implementations/myAnimation';

export const animationRegistry = {
  // ... other animations
  myAnimation
};
```

### Customize Rendering

The system allows complete rendering customization:

```typescript
// Custom renderer for custom shapes
const customRenderer = (props: VectorRenderProps) => (
  <path d={generateCustomPath(props)} fill="none" stroke={props.color} />
);
```

## 📤 Export

### SVG
```typescript
const svgString = await exportToSVG({
  vectors: currentVectors,
  width: 1200,
  height: 800,
  includeMetadata: true
});
```

### Animated GIF
```typescript
const gifBlob = await exportToGIF({
  frames: animationFrames,
  duration: 3000,
  quality: 'high',
  fps: 30
});
```

## 🛠️ Development

### Commit Structure
```
🎨 feat: New functionality
🔧 fix: Bug fixes  
⚡ perf: Performance improvements
📚 docs: Documentation
🧪 test: Tests
🔨 refactor: Refactoring
```

### Debug Mode
```typescript
// Enable debug mode for detailed logs
const debugMode = true;
```

### Testing
```bash
# Recommended test configuration
npm run dev  # Terminal 1: Development server
# Open http://localhost:3000
# Configure 50x50 grid (2500 vectors)
# Test complex animations
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m '🎨 feat: Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

## 📋 Roadmap

### v0.2.0
- [ ] Independent HSL color system
- [ ] Customizable gradients
- [ ] Audio-based animations
- [ ] Visual animation editor

### v0.3.0
- [ ] WebGL renderer for massive grids
- [ ] Plugin system
- [ ] 3D animations
- [ ] Video export

## ⚖️ License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🙏 Acknowledgments

- **Next.js Team** - Development framework
- **Vercel** - Deployment platform  
- **React Team** - UI library
- **Tailwind CSS** - CSS framework

---

**Developed with ❤️ by [GsusFC](https://github.com/GsusFC)**

> If you find this project useful, consider giving it a ⭐ on GitHub!