# Flynn Vector Grid - Agent Memory

## Frequent Commands
- **Dev server**: `cd flynn-app && npm run dev` (port 3000 or next available)
- **Build**: `cd flynn-app && npm run build`
- **Lint**: `cd flynn-app && npm run lint`

## Recent Changes (January 2025)
- **FlynVectorGrid v2 CREATED**: New version using useFlynnHook as stable brain
- **useSimpleVectorGridOptimized DEPRECATED**: Broken hook marked as deprecated
- **Unified system**: FlynVectorGrid v2 + useFlynnHook without infinite loops
- **v2-test page**: `/v2-test` to test new architecture
- **Backward compatibility**: FlynVectorGrid v2 maintains compatible interface
- **Manual controls**: Only manual controls (rotate, pulse, reset) - no automatic animations

## Project Architecture

### Main Structure
- `flynn-app/` - Main Next.js application
- `back/` - Documentation and auxiliary stores
- Vector grid with hybrid SVG/Canvas rendering (>300 vectors → automatic Canvas)

### Key Components
- `SimpleVectorGrid` - Basic, SVG only
- `SimpleVectorGridOptimized` - Hybrid with performance monitor
- Modular animation system in `flynn-app/src/components/features/vector-grid/simple/animations/`

## Identified and Solved Problems

### Animations with Missing Props
- **seaWaves**: Missing `spatialFactor` in types and legacy conversion
- **geometricPattern**: Missing `patternIntensity` in types and legacy conversion
- **Solution**: Add missing props to `simpleTypes.ts` and `page.tsx`

### Problematic HSL Color System
**Problem**: `hslRainbow` and `hslGradientFlow` are implemented as animations when they should be independent color options.

**Consequences**:
- Colors "stick" when changing animations
- Cannot combine movement animations with color effects
- Mixed responsibilities (movement + color)

### Pending Refactoring Plan
**Status**: Analyzed, not implemented yet
**Goal**: Separate animation system (movement) from color system
**Benefits**: Unified HSL picker, customizable gradients, better UX

### ⚠️ Critical Problem - Broken Animation Loop (January 2025)
**Symptom**: Vectors are visible but don't move automatically over time
**Status**: Detected, not resolved
**Cause**: Animation loop not working correctly
- requestAnimationFrame executes
- isPaused = false
- Pause/play button responds but animations don't run
- Vectors do respond to manual control changes
**Note**: Check useSimpleVectorGridOptimized.ts lines 270-285

## User Configuration
- Prefers 50x50 vectors (2500 vectors) for high-density testing
- Uses debug mode enabled (`debugMode = true` in page.tsx line 48)
- Mainly tests with complex animations (waves, geometric patterns)

## Technical Notes
- Strict TypeScript enabled
- ESLint with React rules
- Tailwind CSS for styling
- Modular type system for animations
- Automatic performance monitoring for rendering