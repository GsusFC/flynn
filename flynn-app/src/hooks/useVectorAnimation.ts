import { useState, useEffect, useRef } from 'react';
import type { Vector } from '@/animations/types';
import { getCustomGradient } from '@/lib/customGradients';
import { PRESET_GRADIENTS } from '@/components/features/vector-grid/types/gradientTypes';
import type { GradientConfig } from '@/components/features/vector-grid/types/gradientTypes';
import { evaluateGradient } from '@/lib/colorUtils';
import { simpleNoise } from '@/lib/noise';
import { applyAnimation } from '@/animations/animationEngine';
import { getAnimation } from '@/animations/registry';

const smoothLerp = (current: number, target: number, factor: number = 0.1): number => {
  return current + (target - current) * factor;
};

const calculateDynamicLength = (
  vector: Vector, time: number, index: number,
  dimensions: { width: number; height: number }, mousePos: { x: number; y: number },
  prevValuesRef: React.MutableRefObject<{ [key: string]: number }>,
  props: any
): number => {
    const { width, height } = dimensions;
    const { lengthMin = 10, lengthMax = 25, oscillationFreq = 1, oscillationAmp = 0.3, pulseSpeed = 1, spatialFactor = 0.2, spatialMode = 'edge', mouseInfluence = 0, mouseMode = 'attract' } = props;

    const length = lengthMin + ((lengthMax - lengthMin) * 0.5);
    const basePhase = index * 0.1;
    const spatialPhaseX = vector.x * 0.01;
    const spatialPhaseY = vector.y * 0.01;
    const combinedPhase = basePhase + spatialPhaseX + spatialPhaseY;
    const wave1 = Math.sin(time * oscillationFreq + combinedPhase);
    const wave2 = Math.sin(time * oscillationFreq * 1.618 + combinedPhase * 0.5) * 0.3;
    const wave3 = Math.cos(time * oscillationFreq * 0.7 + combinedPhase * 1.5) * 0.2;
    const complexOscillation = (wave1 + wave2 + wave3) * oscillationAmp * (lengthMax - lengthMin);
    const pulse = Math.sin(time * pulseSpeed) * 0.3 + 1;
    const centerX = width / 2;
    const centerY = height / 2;
    const distanceFromCenter = Math.sqrt((vector.x - centerX) ** 2 + (vector.y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const normalizedDistance = maxDistance > 0 ? distanceFromCenter / maxDistance : 0;
    
    let spatialModifier = 1;
    if (spatialMode === 'edge') spatialModifier = 1 + normalizedDistance * spatialFactor;
    else if (spatialMode === 'center') spatialModifier = 1 + (1 - normalizedDistance) * spatialFactor;
    else if (spatialMode === 'mixed') spatialModifier = 1 + Math.sin(normalizedDistance * Math.PI) * spatialFactor;

    let mouseModifier = 1;
    if (mouseInfluence > 0 && mousePos.x !== null) {
      const dx = vector.x - mousePos.x;
      const dy = vector.y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influenceRadius = 200;
      if (dist < influenceRadius) {
        const factor = (1 - dist / influenceRadius);
        if (mouseMode === 'stretch') mouseModifier = 1 + factor * mouseInfluence * 2;
      }
    }
    
    let finalLength = (length + complexOscillation) * pulse * spatialModifier * mouseModifier;
    finalLength = Math.max(lengthMin, Math.min(finalLength, lengthMax));
    
    const prevKey = `length_${vector.id}`;
    const previousLength = prevValuesRef.current[prevKey] || finalLength;
    const smoothedLength = smoothLerp(previousLength, finalLength, 0.2);
    prevValuesRef.current[prevKey] = smoothedLength;
    
    return smoothedLength;
};

const calculateDynamicColor = (
  vector: Vector, time: number, animationData: any,
  dimensions: { width: number; height: number },
  props: any
) => {
    const { colorMode = 'solid', solidColor = '#3b82f6', gradientPalette = 'flow', colorIntensityMode = 'field', colorHueShift = 1, colorSaturation = 80, colorBrightness = 60 } = props;

    if (colorMode === 'solid') {
      return solidColor;
    }
    
    if (colorMode === 'gradient') {
      // 1) Verificar si es un degradado predefinido
      if (PRESET_GRADIENTS[gradientPalette]) {
        return PRESET_GRADIENTS[gradientPalette] as GradientConfig;
      }

      // 2) Verificar si es un degradado personalizado
      const customGradient = getCustomGradient(gradientPalette);
      if (customGradient) {
        const { variant = 'linear', angle, stops, centerX, centerY, radius } = (customGradient.gradient as any);
        const converted: GradientConfig = {
          type: variant === 'radial' ? 'radial' : 'linear',
          colors: stops.map((s: any) => ({ color: s.color, offset: s.offset })),
          ...(variant === 'linear' ? { angle } : { centerX, centerY, radius })
        };
        return converted;
      }

      // 3) Fallback a color sólido blanco
      return '#FFFFFF';
    }

    let fieldIntensity = 0.5;
    if (colorIntensityMode === 'velocity') fieldIntensity = animationData.velocity ?? 0.5;
    else if (colorIntensityMode === 'distance') {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const dist = Math.sqrt((vector.x - centerX)**2 + (vector.y - centerY)**2);
      const maxDist = Math.sqrt(centerX**2 + centerY**2);
      fieldIntensity = maxDist > 0 ? dist / maxDist : 0;
    }
    else if (colorIntensityMode === 'angle') {
      const angle = animationData.angle ?? vector.angle ?? 0;
      fieldIntensity = (angle / (2 * Math.PI)) % 1;
    }
    else fieldIntensity = animationData.fieldStrength ?? 0.5;
    
    const hue = (time * 10 + fieldIntensity * 360 + colorHueShift) % 360;
    return `hsl(${hue}, ${colorSaturation}%, ${colorBrightness}%)`;
};

// This function remains to apply global effects like mouse influence after the main animation
const applyGlobalEffects = (
  vectors: Vector[],
  mousePos: { x: number; y: number },
  props: any,
  prevValuesRef: React.MutableRefObject<{ [key: string]: number }>
) => {
  return vectors.map(vector => {
    let newAngle = vector.angle;

    // Mouse influence
    const dxMouse = vector.x - mousePos.x;
    const dyMouse = vector.y - mousePos.y;
    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
    
    if (props.mouseInfluence > 0 && distMouse < 200) {
      const angleToMouse = Math.atan2(dyMouse, dxMouse);
      let mouseAngleInfluence = 0;
      if (props.mouseMode === 'attract') mouseAngleInfluence = angleToMouse + Math.PI;
      else if (props.mouseMode === 'repel') mouseAngleInfluence = angleToMouse;

      if (mouseAngleInfluence !== 0) {
        let shortest_angle = ((((mouseAngleInfluence - newAngle) % (2 * Math.PI)) + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
        newAngle = newAngle + shortest_angle * 0.1 * props.mouseInfluence;
      }
    }

    // Angle smoothing
    const prevAngleKey = `angle_main_${vector.id}`;
    const prevAngle = prevValuesRef.current[prevAngleKey] || newAngle;
    const finalSmoothedAngle = smoothLerp(prevAngle, newAngle, 0.15);
    prevValuesRef.current[prevAngleKey] = finalSmoothedAngle;

    return { ...vector, angle: finalSmoothedAngle };
  });
}

interface UseVectorAnimationProps {
  vectors: Vector[];
  dimensions: { width: number; height: number };
  mousePos: { x: number; y: number };
  isPaused: boolean;
  [key: string]: any;
  shapeParams?: Record<string, number>;
}

export const useVectorAnimation = ({
  vectors, dimensions, mousePos, isPaused, ...props
}: UseVectorAnimationProps) => {
  const [animatedVectors, setAnimatedVectors] = useState<Vector[]>([]);
  const animationTimeRef = useRef(0);
  const prevValuesRef = useRef<{ [key: string]: number }>({});
  const animationFrameRef = useRef<number>();
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    // We clone the vectors to avoid mutating the original array from useVectorGrid
    setAnimatedVectors([...vectors]);
  }, [vectors]);

  useEffect(() => {
    const animate = () => {
      const currentProps = propsRef.current;
      if (!isPaused && vectors.length && dimensions.width && dimensions.height) {
        animationTimeRef.current += 0.02 * (currentProps.speed || 1);
        const time = animationTimeRef.current;
        
        // --- Integración con el nuevo sistema de animaciones ---
        const animationMeta = getAnimation(currentProps.animation);
        
        // Combinar props globales con las props específicas de la animación
        const animationSpecificProps = animationMeta ? animationMeta.defaultProps : {};
        const combinedProps = { ...animationSpecificProps, ...currentProps };

        // 1. Apply the core animation logic from the engine
        const { vectors: baseAnimatedVectors, animationData } = applyAnimation(currentProps.animation, {
          vectors,
          time,
          dimensions,
          mousePos,
          props: combinedProps // <-- Usar las props combinadas
        });

        // 2. Calculate dynamic properties (length, color) for each vector
        const vectorsWithDynamicProps = baseAnimatedVectors.map((vector: Vector, index: number) => {
          const data = animationData[index] || {};
          
          // --- Lógica especial para Cellular Automata ---
          if (data.isAlive === 0) {
            return {
              ...vector,
              length: 2, // Longitud mínima para células muertas
              angle: 0, // Ángulo estático para células muertas
              color: '#333', // Color oscuro para células muertas
              shapeParams: vector.shapeParams || currentProps.shapeParams || {},
            };
          }

          // --- Lógica normal para el resto de animaciones (y células vivas) ---
          let newLength = vector.length;
          if (animationMeta?.enableLengthDynamics !== false) {
            newLength = calculateDynamicLength(vector, time, index, dimensions, mousePos, prevValuesRef, currentProps);
          }

          const newColor = calculateDynamicColor(vector, time, data, dimensions, currentProps);
          
          return {
            ...vector,
            length: newLength,
            color: newColor,
            shapeParams: vector.shapeParams || currentProps.shapeParams || {},
          };
        });

        // 3. Apply global effects (like mouse influence) and smoothing
        const finalVectors = applyGlobalEffects(vectorsWithDynamicProps, mousePos, currentProps, prevValuesRef);

        setAnimatedVectors(finalVectors);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [vectors, dimensions, mousePos, isPaused]);

  return animatedVectors;
};