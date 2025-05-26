import type { VectorColorValue } from '../core/types'; // Asumiendo que VectorColorValue está en core/types

// Representa el estado interno de un vector para el sistema de animación.
// Puede diferir del UIVectorItem que se usa para la renderización o la configuración inicial.
export interface AnimatedVectorItem {
  id: string;
  r?: number; // Fila en la cuadrícula
  c?: number; // Columna en la cuadrícula
  baseX: number; // Posición X original/base
  baseY: number; // Posición Y original/base
  originalX: number; // Posición X original si se modifica desde baseX
  originalY: number; // Posición Y original si se modifica desde baseY
  x: number; // Posición X actual
  y: number; // Posición Y actual
  angle: number; // Ángulo actual en grados
  originalAngle: number; // Ángulo original/base en grados
  length: number; // Longitud actual
  originalLength: number; // Longitud original/base
  lengthFactor: number; // Factor de escala para la longitud
  widthFactor: number; // Factor de escala para el ancho (si se usa)
  color: VectorColorValue; // Color actual
  originalColor: VectorColorValue; // Color original/base
  
  // Propiedades específicas de la animación que pueden no estar en UIVectorItem
  velocityX?: number;
  velocityY?: number;
  angularVelocity?: number;
  targetX?: number;
  targetY?: number;
  targetAngle?: number;
  targetLength?: number;
  damping?: number; // Factor de amortiguación para movimientos
  age?: number; // Tiempo desde la creación o último reset, en segundos
  lifespan?: number; // Tiempo de vida máximo, en segundos
  
  // Para animaciones basadas en estado o comportamiento
  animationState?: string | number; // ej: 'idle', 'attracting', 'repelling', 'pulsing'
  intensityFactor?: number; // Para modular la intensidad de un efecto

  // Para el hook optimizado y su lógica de mapeo
  customData?: Record<string, unknown>; // Datos personalizados que se pasan desde el UIVectorItem
  initialAngle?: number; // Usado por el hook para restaurar o como referencia
  currentAngle?: number; // El ángulo que el hook está gestionando (puede ser diferente de 'angle' si hay múltiples lógicas)
  previousAngle?: number; // Ángulo en el frame anterior, para cálculos de suavizado o velocidad

  flockId?: number | string; // Para animaciones de enjambre
}

export type AnimationType =
  | 'none'
  | 'custom' // Implementación personalizada a través de una función
  | 'centerPulse'
  | 'smoothWaves'
  | 'directionalFlow'
  | 'vortex'
  | 'flocking'
  | 'mouseInteraction'
  | 'randomWalk'
  | 'breathing'
  | 'rainEffect'
  | 'rippleEffect';
  // ...otros tipos de animación

// Propiedades específicas para cada tipo de animación

export interface CenterPulseAnimationProps {
  speed?: number; // Velocidad de propagación del pulso
  strength?: number; // Fuerza/amplitud del pulso
  duration?: number; // Duración del efecto del pulso en ms
  decay?: number; // Cómo decae el pulso con la distancia/tiempo
  easing?: string; // Tipo de easing para el pulso
  pulseWidth?: number; // Ancho de la onda del pulso
}

export interface SmoothWavesAnimationProps {
  frequency?: number; // Frecuencia de las ondas
  amplitude?: number; // Amplitud de las ondas
  speed?: number; // Velocidad de propagación de las ondas
  direction?: number; // Dirección de las ondas en grados
}

export interface DirectionalFlowAnimationProps {
  angle?: number; // Ángulo del flujo
  speed?: number; // Velocidad del flujo
  noiseFactor?: number; // Factor de aleatoriedad en el flujo
}

export interface VortexAnimationProps {
  centerX?: number; // Coordenada X normalizada del centro del vórtice (0-1)
  centerY?: number; // Coordenada Y normalizada del centro del vórtice (0-1)
  strength?: number; // Fuerza del vórtice
  speed?: number; // Velocidad de rotación
  radius?: number; // Radio de influencia del vórtice
}

export interface FlockingAnimationProps {
  cohesion?: number;
  separation?: number;
  alignment?: number;
  maxSpeed?: number;
  perceptionRadius?: number;
}

export interface MouseInteractionAnimationProps {
  interactionType?: 'attract' | 'repel' | 'displace';
  strength?: number;
  radius?: number; // Radio de influencia del ratón
}

export interface AnimationProps {
  type?: AnimationType; // Opcional si se define en AnimationSettings directamente
  resetOnTypeChange?: boolean; // Si los vectores deben resetearse al cambiar el tipo de animación

  centerPulse?: CenterPulseAnimationProps;
  smoothWaves?: SmoothWavesAnimationProps;
  directionalFlow?: DirectionalFlowAnimationProps;
  vortex?: VortexAnimationProps;
  flocking?: FlockingAnimationProps;
  mouseInteraction?: MouseInteractionAnimationProps;
  // ...otras propiedades para cada tipo
  [key: string]: unknown; // Para permitir propiedades adicionales o tipos no listados explícitamente
}


export interface AnimationSettings {
  type: AnimationType | string; // Tipo de animación actual
  baseSpeed: number; // Multiplicador global de velocidad (timeScale)
  canvasWidth: number;
  canvasHeight: number;
  mouseX: number | null; // Posición X normalizada del ratón (0-1) o null si está fuera
  mouseY: number | null; // Posición Y normalizada del ratón (0-1) o null si está fuera
  isMouseDown: boolean; // Si el botón del ratón está presionado
  resetOnTypeChange: boolean; // Si los vectores deben resetearse al cambiar el tipo
  props: AnimationProps[keyof AnimationProps] | Record<string, unknown>; // Propiedades específicas del tipo de animación actual
}

// Para la gestión de pulsos múltiples
export interface Pulse {
  id: string;
  centerX: number; // Normalizado
  centerY: number; // Normalizado
  startTime: number; // Tiempo de inicio del pulso (segundos)
  maxReached?: boolean; // Si el pulso ha alcanzado su máxima influencia (para decaimiento)
}

export interface PulseManager {
  pulses: Pulse[];
  triggerPulse: (centerX: number, centerY: number, currentTime: number) => void;
  updatePulses: (currentTime: number, pulseDurationSeconds: number) => void;
  getActivePulses: (currentTime: number, pulseDurationSeconds: number) => Pulse[];
  clearPulses: () => void;
}
