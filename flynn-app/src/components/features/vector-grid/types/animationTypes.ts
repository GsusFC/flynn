// Tipos para las propiedades de animación
export type StaticAngleProps = {
  angle: number;
};

export type SmoothWavesProps = {
  frequency: number;
  amplitude: number;
  speed: number;
};

export type MouseInteractionProps = {
  interactionRadius: number;
  effectType: 'attract' | 'repel';
};

export type RandomLoopProps = {
  intervalMs: number;
};

export type CenterPulseProps = {
  pulse: {
    pulseDuration: number;
    maxAngleOffset: number;
  };
};

export type AnimationType = 
  | 'none' 
  | 'staticAngle' 
  | 'randomLoop' 
  | 'smoothWaves' 
  | 'mouseInteraction' 
  | 'centerPulse';

// Union type para las propiedades de animación
export type AnimationProps = 
  | StaticAngleProps
  | SmoothWavesProps
  | MouseInteractionProps
  | RandomLoopProps
  | CenterPulseProps
  | Record<string, never>; // Para 'none'

// Valores por defecto para cada tipo de animación
export const defaultAnimationProps: Record<AnimationType, AnimationProps> = {
  none: {},
  staticAngle: {
    angle: 45
  },
  smoothWaves: {
    frequency: 0.1,
    amplitude: 30,
    speed: 0.5
  },
  mouseInteraction: {
    interactionRadius: 150,
    effectType: 'attract'
  },
  randomLoop: {
    intervalMs: 2000
  },
  centerPulse: {
    pulse: {
      pulseDuration: 1000,
      maxAngleOffset: 90
    }
  }
};
