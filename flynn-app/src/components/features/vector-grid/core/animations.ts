// /Users/gsus/CascadeProjects/Flynn/flynn-app/src/components/features/vector-grid/core/animations.ts

import type {
    AnimationType,
    AnimationProps,
    NoAnimationProps,
    StaticAngleProps,
    RandomLoopProps,
    SmoothWavesProps,
    MouseInteractionProps,
    CenterPulseProps,
    CenterPulseSubProps,
    SeaWavesProps,
    PerlinFlowProps,
    DirectionalFlowProps,
    TangenteClasicaProps,
    LissajousProps,
    VortexProps
  } from './types';
  
  // Función para obtener las propiedades por defecto para un tipo de animación dado
  export const getDefaultPropsForType = (type: AnimationType): AnimationProps => {
    switch (type) {
      case 'none':
        return { type: 'none' } satisfies NoAnimationProps;
      case 'staticAngle':
        return { type: 'staticAngle', angle: 0 } satisfies StaticAngleProps;
      case 'randomLoop':
        return {
          type: 'randomLoop',
          intervalMs: 2000,
          transitionSpeedFactor: 1.0,
        } satisfies RandomLoopProps;
      case 'smoothWaves':
      // Valores por defecto actualizados según la discusión y para coincidir con SmoothWavesProps
      return { type: 'smoothWaves', frequency: 0.1, amplitude: 30, speed: 0.5, baseAngle: 0, patternScale: 0.01, waveType: 'circular', timeScale: 1.0 } satisfies SmoothWavesProps;
      case 'mouseInteraction':
        return {
          type: 'mouseInteraction',
          interactionRadius: 150,
          attractionDistance: 50,
          repulsionDistance: 150,
          effectType: 'repel',
          strength: 1.0,
          alignAngleOffset: 0
        } satisfies MouseInteractionProps;
      case 'centerPulse':
        const defaultPulseProps: CenterPulseSubProps = {
          pulseDuration: 1000,
          maxAngleOffset: 90,
          angleOffsetMode: 'sine',
          targetAngleDuringPulse: 'currentRelative',
          maxLengthFactorPulse: 1.5,
          minLengthFactorPulse: 0.8,
          maxWidthFactorPulse: 1.2,
          minWidthFactorPulse: 0.9,
          maxIntensityFactorPulse: 1.0,
          minIntensityFactorPulse: 0.5,
          distanceImpactFactor: 0.3,
          delayPerDistanceUnit: 0,
          easingFnKey: 'easeInOutQuad',
          angleEasingFnKey: 'easeOutQuad',
          factorEasingFnKey: 'easeOutElastic',
        };
        return { type: 'centerPulse', pulse: defaultPulseProps } satisfies CenterPulseProps;
  
      // --- Casos para animaciones conceptuales o aún no detalladas ---
      // Devuelven 'none' por ahora, o puedes crear props básicas si lo prefieres.
      case 'seaWaves':
        return {
          type: 'seaWaves',
          baseFrequency: 0.003,
          baseAmplitude: 30,
          rippleFrequency: 0.005,
          rippleAmplitude: 15,
          choppiness: 0.5,
          spatialFactor: 0.01
        } satisfies SeaWavesProps;
      case 'perlinFlow':
        return {
          type: 'perlinFlow',
          noiseScale: 0.02,
          timeScale: 0.0005,
          forceMagnitude: 1.5,
          angleOffset: 0,
        } satisfies PerlinFlowProps;
      case 'directionalFlow':
        return {
          type: 'directionalFlow',
          flowAngle: 0,
          flowSpeed: 1,
          angleVariation: 0,
          noiseScale: 0.01,
        } satisfies DirectionalFlowProps;
      case 'tangenteClasica':
        return {
          type: 'tangenteClasica',
          rotationSpeed: 0.01,
          radiusFactor: 1,
          phaseOffset: 0,
          // centerX y centerY podrían tomarse del tamaño del grid dinámicamente si no se proveen
        } satisfies TangenteClasicaProps;
      case 'lissajous':
        return {
          type: 'lissajous',
          xFrequency: 3,
          yFrequency: 2,
          xPhase: 0,
          yPhase: Math.PI / 2, // 1.5707963267948966
          amplitudeScale: 0.8,
          rotationSpeed: 0,
          pointMode: false,
        } satisfies LissajousProps;
      case 'vortex':
        return {
          type: 'vortex',
          strength: 5,
          radius: 100,
          // centerX y centerY podrían tomarse del tamaño del grid o mouse si no se proveen
          rotationSpeed: 0.01,
          damping: 0.95,
        } satisfies VortexProps;
  
      default:
        // Para asegurar que todos los AnimationType estén cubiertos (exhaustiveness check)
        // Si AnimationType es una unión de strings literales, TypeScript puede no hacer esto automáticamente
        // Una forma de forzarlo es:
        // const _exhaustiveCheck: never = type;
        // console.warn(`getDefaultPropsForType: Unknown animation type '${type}', defaulting to 'none'.`);
        return { type: 'none' } satisfies NoAnimationProps;
    }
  };