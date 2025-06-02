// Sistema de animaciones modular - ACTUALIZADO
// Usa el nuevo registry de animaciones

import type { 
  SimpleVector, 
  AnimationProps, 
  MousePosition
} from './simpleTypes';
import { executeAnimation } from './animations';
import type { AnimationContext } from './animations/types';

// Función principal que aplica la animación correcta usando el nuevo sistema
export const applyAnimation = (
  vectors: SimpleVector[],
  animationProps: AnimationProps,
  mousePosition: MousePosition,
  time: number,
  pulseCenter: { x: number; y: number } | null,
  pulseStartTime: number | null,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): SimpleVector[] => {
  // Crear el contexto de animación
  const context: AnimationContext = {
    time,
    canvasWidth,
    canvasHeight,
    mousePosition,
    pulseCenter,
    pulseStartTime
  };

  // Verificar que animationProps tenga el tipo correcto
  if (!animationProps || typeof (animationProps as any)?.type !== 'string') {
    console.error('AnimationProps inválido:', {
      animationProps,
      hasAnimationProps: !!animationProps,
      typeOfType: typeof (animationProps as any)?.type,
      propsKeys: animationProps ? Object.keys(animationProps) : []
    });
    return executeAnimation('none', vectors, {}, context);
  }

  // Usar el nuevo sistema modular de animaciones
  switch (animationProps.type) {
    case 'none': {
      return executeAnimation('none', vectors, {}, context);
    }
    
    case 'smoothWaves': {
      const { ...props } = animationProps;
      return executeAnimation('smoothWaves', vectors, props as Record<string, unknown>, context);
    }
    
    case 'mouseInteraction': {
      const { ...props } = animationProps;
      return executeAnimation('mouseInteraction', vectors, props as Record<string, unknown>, context);
    }
    
    case 'randomLoop': {
      const { ...props } = animationProps;
      return executeAnimation('randomLoop', vectors, props as Record<string, unknown>, context);
    }
    
    case 'centerPulse': {
      const { ...props } = animationProps;
      return executeAnimation('centerPulse', vectors, props as Record<string, unknown>, context);
    }
    
    case 'seaWaves': {
      const { ...props } = animationProps;
      return executeAnimation('seaWaves', vectors, props as Record<string, unknown>, context);
    }
    
    case 'tangenteClasica': {
      const { ...props } = animationProps;
      return executeAnimation('tangenteClasica', vectors, props as Record<string, unknown>, context);
    }
    
    case 'lissajous': {
      const { ...props } = animationProps;
      return executeAnimation('lissajous', vectors, props as Record<string, unknown>, context);
    }
    
    case 'perlinFlow': {
      const { ...props } = animationProps;
      return executeAnimation('perlinFlow', vectors, props as Record<string, unknown>, context);
    }
    

    
    case 'geometricPattern': {
      const { ...props } = animationProps;
      return executeAnimation('geometricPattern', vectors, props as Record<string, unknown>, context);
    }
    
    case 'vortex': {
      const { ...props } = animationProps;
      return executeAnimation('vortex', vectors, props as Record<string, unknown>, context);
    }
    
    case 'pinwheels': {
      const { ...props } = animationProps;
      return executeAnimation('pinwheels', vectors, props as Record<string, unknown>, context);
    }
    
    case 'rippleEffect': {
      const { ...props } = animationProps;
      return executeAnimation('rippleEffect', vectors, props as Record<string, unknown>, context);
    }
    
    case 'jitter': {
      const { ...props } = animationProps;
      return executeAnimation('jitter', vectors, props as Record<string, unknown>, context);
    }
    
    case 'curlNoise': {
      const { ...props } = animationProps;
      return executeAnimation('curlNoise', vectors, props as Record<string, unknown>, context);
    }
    
    case 'flowField': {
      const { ...props } = animationProps;
      return executeAnimation('flowField', vectors, props as Record<string, unknown>, context);
    }
    
    case 'gaussianGradient': {
      const { ...props } = animationProps;
      return executeAnimation('gaussianGradient', vectors, props as Record<string, unknown>, context);
    }
    
    case 'dipoleField': {
      const { ...props } = animationProps;
      return executeAnimation('dipoleField', vectors, props as Record<string, unknown>, context);
    }
    
    case 'testRotation': {
      const { ...props } = animationProps;
      return executeAnimation('testRotation', vectors, props as Record<string, unknown>, context);
    }
    
    default:
      console.warn('Tipo de animación desconocido:', animationProps);
      return executeAnimation('none', vectors, {}, context);
  }
};
