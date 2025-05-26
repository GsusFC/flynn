/* eslint-disable @typescript-eslint/no-unused-vars */
// Importamos desde el nuevo sistema modular
import type { AnimationType } from './types';
import type { AnimatedVectorItem } from '../core/types';
import { updateVectorsWithAnimation, createAnimationParams, initializeAnimatedVector } from './animationEngine';
import { getAnimationImplementation, getDefaultPropsForType, getAvailableAnimations, getControlsForType } from './animationRegistry';
import { v4 as uuidv4 } from 'uuid'; // Necesitaremos instalar uuid
import { fixPrecision } from '@/utils/precision';

// Re-exportamos los tipos y funciones públicas del nuevo sistema
export type { AnimationType } from './types';
export type { AnimatedVectorItem } from '../core/types';
export { updateVectorsWithAnimation, createAnimationParams, initializeAnimatedVector } from './animationEngine';
export { getAnimationImplementation, getDefaultPropsForType, getAvailableAnimations } from './animationRegistry';

// Definimos los tipos compatibles con el sistema anterior para mantener la compatibilidad
export interface AnimationSettings {
  type: AnimationType;
  props: Record<string, unknown>;
  baseSpeed: number;
  canvasWidth: number;
  canvasHeight: number;
  mouseX: number | null;
  mouseY: number | null;
}

export interface Pulse {
  id: string;
  centerX: number;
  centerY: number;
  startTime: number;
}

export interface PulseManager {
  pulses: Pulse[];
  triggerPulse: (centerX: number, centerY: number, currentTime: number) => void;
  updatePulses: (currentTime: number, pulseDurationSeconds: number) => void;
  getActivePulses: (currentTime: number, pulseDurationSeconds: number) => Pulse[];
  clearPulses: () => void;
}

export interface CenterPulseAnimationProps {
  duration?: number;
  speed?: number;
  strength?: number;
  pulseWidth?: number;
}

/**
 * Actualiza un vector individual basado en el tipo de animación y la configuración.
 * Esta es una función central para la lógica de animación.
 * Adaptada para usar el nuevo sistema modular.
 */
export const updateVectorByType = (
  vector: AnimatedVectorItem,
  currentTime: number, // en segundos
  deltaTime: number,   // en segundos
  settings: AnimationSettings,
  allVectors?: AnimatedVectorItem[], // Opcional, para animaciones que consideran a otros vectores (ej. flocking)
  pulseManager?: PulseManager      // Opcional, para animaciones que reaccionan a pulsos
): AnimatedVectorItem => {
  const { type, props, baseSpeed, canvasWidth, canvasHeight, mouseX, mouseY } = settings;

  // Copia del vector para modificar y retornar
  const updatedVector = { ...vector };

  // Lógica de pulso (ejemplo básico si se usa pulseManager)
  if (pulseManager && type === 'centerPulse' && props) {
    // Extrae las propiedades de pulso directamente del objeto props
    const centerPulseProps = props as CenterPulseAnimationProps;
    const activePulses = pulseManager.getActivePulses(currentTime, (centerPulseProps.duration || 1000) / 1000);
    for (const pulse of activePulses) {
      const dx = updatedVector.baseX - pulse.centerX * canvasWidth;
      const dy = updatedVector.baseY - pulse.centerY * canvasHeight;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pulseRadius = (currentTime - pulse.startTime) * (centerPulseProps.speed || 100) * baseSpeed;
      const effectStrength = centerPulseProps.strength || 1;
      const pulseWidth = centerPulseProps.pulseWidth || 50; // Ancho de la onda del pulso

      if (dist < pulseRadius + pulseWidth / 2 && dist > pulseRadius - pulseWidth / 2) {
        const angleToPulse = Math.atan2(dy, dx);
        // Mover el vector radialmente desde el centro del pulso
        updatedVector.x += Math.cos(angleToPulse) * effectStrength * (1 - Math.abs(dist - pulseRadius) / (pulseWidth / 2));
        updatedVector.y += Math.sin(angleToPulse) * effectStrength * (1 - Math.abs(dist - pulseRadius) / (pulseWidth / 2));
        
        // También actualizamos el ángulo del vector para que apunte en la dirección del pulso
        updatedVector.angle = (angleToPulse * 180 / Math.PI) + 180; // Convertir a grados y ajustar dirección
      }
    }
  }

  // Aquí iría la lógica específica para cada tipo de animación
  switch (type) {
    case 'staticAngle':
      // Animación de ángulo estático (el vector no se mueve, solo cambia su ángulo)
      if (props) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const staticProps = props as { angle?: number };
        updatedVector.angle = staticProps.angle || 0;
      }
      break;
      
    case 'smoothWaves':
      if (props) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const waveProps = props as { frequency?: number; amplitude?: number; speed?: number; direction?: number };
        const frequency = waveProps.frequency || 0.1;
        const amplitude = waveProps.amplitude || 10;
        const speed = waveProps.speed || 1;
        const direction = waveProps.direction || 0;
        
        const angleRad = direction * (Math.PI / 180);
        const waveOffset = (updatedVector.baseX * Math.cos(angleRad) + updatedVector.baseY * Math.sin(angleRad)) * frequency * 0.1;
        updatedVector.x = updatedVector.baseX + Math.cos(currentTime * speed * baseSpeed + waveOffset) * amplitude;
        updatedVector.y = updatedVector.baseY + Math.sin(currentTime * speed * baseSpeed + waveOffset) * amplitude;
      }
      break;
      
    case 'directionalFlow':
      if (props) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const flowProps = props as { angle?: number; speed?: number; noiseFactor?: number };
        const angle = flowProps.angle || 0;
        const speed = flowProps.speed || 10;
        const noiseFactor = flowProps.noiseFactor || 0;
        
        const angleRad = angle * (Math.PI / 180);
        updatedVector.x += Math.cos(angleRad) * speed * deltaTime * baseSpeed;
        updatedVector.y += Math.sin(angleRad) * speed * deltaTime * baseSpeed;

        if (noiseFactor > 0) {
          updatedVector.x += (Math.random() - 0.5) * noiseFactor * speed * deltaTime * baseSpeed;
          updatedVector.y += (Math.random() - 0.5) * noiseFactor * speed * deltaTime * baseSpeed;
        }
        // Restablecer si sale de los límites (ejemplo básico)
        if (updatedVector.x > canvasWidth) updatedVector.x = 0;
        if (updatedVector.x < 0) updatedVector.x = canvasWidth;
        if (updatedVector.y > canvasHeight) updatedVector.y = 0;
        if (updatedVector.y < 0) updatedVector.y = canvasHeight;
      }
      break;
      
    case 'mouseInteraction':
      if (props && mouseX !== null && mouseY !== null) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const mouseProps = props as { effectType?: string; strength?: number; interactionRadius?: number };
        const interactionType = mouseProps.effectType || 'repel';
        const strength = mouseProps.strength || 50;
        const radius = mouseProps.interactionRadius || 100;
        
        const mX = mouseX * canvasWidth;
        const mY = mouseY * canvasHeight;
        const dX = updatedVector.x - mX;
        const dY = updatedVector.y - mY;
        const distance = Math.sqrt(dX * dX + dY * dY);

        if (distance < radius) {
          const force = (1 - distance / radius) * strength * baseSpeed;
          const angleToMouse = Math.atan2(dY, dX);
          const moveFactor = interactionType === 'attract' ? -1 : 1;
          
          updatedVector.x += Math.cos(angleToMouse) * force * moveFactor * deltaTime * 10; // deltaTime ya está, 10 es un multiplicador arbitrario
          updatedVector.y += Math.sin(angleToMouse) * force * moveFactor * deltaTime * 10;
        }
      }
      break;
      
    case 'randomLoop':
      // La animación de bucle aleatorio cambia periódicamente el ángulo de manera aleatoria
      if (props) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const loopProps = props as { intervalMs?: number };
        const intervalMs = loopProps.intervalMs || 2000;
        const timeInLoop = (currentTime * 1000) % intervalMs;
        const transitionDuration = intervalMs * 0.2; // El 20% del intervalo se usa para la transición
        
        // Si estamos en el momento de transición
        if (timeInLoop < transitionDuration) {
          // Establecer un nuevo ángulo aleatorio al inicio de cada intervalo
          if (timeInLoop === 0 || !updatedVector.targetAngle) {
            updatedVector.targetAngle = Math.random() * 360;
          }
          
          // Transición suave hacia el nuevo ángulo
          const progress = timeInLoop / transitionDuration;
          const startAngle = updatedVector.angle || 0;
          const targetAngle = updatedVector.targetAngle || 0;
          updatedVector.angle = startAngle + (targetAngle - startAngle) * progress;
        }
      }
      break;
    // Añadir más casos para otros tipos de animación...
    case 'vortex':
      if (props && mouseX !== null && mouseY !== null) {
        // Hacemos un cast seguro para poder acceder a las propiedades
        const vortexProps = props as { strength?: number; radius?: number; centerX?: number; centerY?: number; rotationSpeed?: number };
        
        // Usar centro personalizado o posición del mouse
        const centerX = vortexProps.centerX !== undefined ? vortexProps.centerX * canvasWidth : (mouseX * canvasWidth);
        const centerY = vortexProps.centerY !== undefined ? vortexProps.centerY * canvasHeight : (mouseY * canvasHeight);
        const strength = vortexProps.strength || 1;
        const radius = vortexProps.radius || 200;
        const rotationSpeed = vortexProps.rotationSpeed || 0.01;
        
        // Calcular distancia al centro
        const dx = updatedVector.x - centerX;
        const dy = updatedVector.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius) {
          // Calcular ángulo actual al centro
          const angleToCenter = Math.atan2(dy, dx);
          
          // Calcular nuevo ángulo (rotación)
          const rotationAngle = angleToCenter + (Math.PI / 2) * rotationSpeed * deltaTime * 60;
          
          // Factor de fuerza basado en distancia
          const forceFactor = 1 - (distance / radius);
          
          // Aplicar movimiento rotacional
          const force = strength * forceFactor * deltaTime * 50;
          updatedVector.x += Math.cos(rotationAngle) * force;
          updatedVector.y += Math.sin(rotationAngle) * force;
          
          // Actualizar ángulo del vector para que apunte en la dirección del movimiento
          updatedVector.angle = (rotationAngle * 180 / Math.PI) + 90; // Convertir a grados
        }
      }
      break;
      
    case 'seaWaves':
      if (props) {
        const seaProps = props as { waveFrequency?: number; waveAmplitude?: number; choppiness?: number; flowSpeed?: number };
        const frequency = seaProps.waveFrequency || 0.001;
        const amplitude = seaProps.waveAmplitude || 20;
        const choppiness = seaProps.choppiness || 0.5;
        const flowSpeed = seaProps.flowSpeed || 0.05;
        
        // Crear un patrón de olas combinando dos ondas sinusoidales
        const wave1 = Math.sin(updatedVector.baseX * frequency + currentTime * flowSpeed * baseSpeed);
        const wave2 = Math.sin(updatedVector.baseY * frequency * 1.5 + currentTime * flowSpeed * 0.8 * baseSpeed);
        
        // Combinación de ondas con efecto de "cresta" usando choppiness
        const combinedWave = (wave1 + wave2) * 0.5;
        const choppyWave = combinedWave * (1 - choppiness) + Math.pow(combinedWave, 3) * choppiness;
        
        // Aplicar movimiento vertical
        updatedVector.y = updatedVector.baseY + choppyWave * amplitude;
        
        // Aplicar un ligero movimiento horizontal para simular corriente
        updatedVector.x = updatedVector.baseX + Math.cos(currentTime * flowSpeed * 0.2 * baseSpeed) * amplitude * 0.2;
        
        // Ajustar ángulo para seguir la pendiente de la ola
        const angleRad = Math.atan2(
          (Math.cos(updatedVector.baseX * frequency + currentTime * flowSpeed * baseSpeed) + 
           Math.cos(updatedVector.baseY * frequency * 1.5 + currentTime * flowSpeed * 0.8 * baseSpeed)) * 0.5 * amplitude * frequency,
          1
        );
        updatedVector.angle = angleRad * 180 / Math.PI;
      }
      break;
      
    case 'flocking':
    case 'randomWalk':
    // ...
    case 'none':
    case 'custom':
       // Para 'none' o 'custom' donde la lógica de ángulo ya se aplicó,
       // podríamos querer restaurar X/Y a baseX/baseY si no hay otra animación.
       // O simplemente no hacer nada si el ángulo ya define el comportamiento.
       // updatedVector.x = updatedVector.baseX;
       // updatedVector.y = updatedVector.baseY;
      break;
    default:
      // Comportamiento por defecto: podría ser volver a la posición base o mantener la actual.
      // Por ahora, si el ángulo se calcula externamente, x/y pueden ser base.
      // updatedVector.x = updatedVector.baseX;
      // updatedVector.y = updatedVector.baseY;
      break;
  }

  // Aplicar fixPrecision a las propiedades numéricas relevantes
  updatedVector.x = fixPrecision(updatedVector.x, 2);
  updatedVector.y = fixPrecision(updatedVector.y, 2);
  updatedVector.angle = fixPrecision(updatedVector.angle, 4);
  updatedVector.length = fixPrecision(updatedVector.length, 3);

  return updatedVector;
};


/**
 * Crea un gestor de pulsos.
 */
export const createCenterPulseManager = (): PulseManager => {
  let pulses: Pulse[] = [];
  const PULSE_ID_PREFIX = 'pulse_';

  return {
    pulses,
    triggerPulse: (centerX: number, centerY: number, currentTime: number) => {
      const newPulse: Pulse = {
        id: `${PULSE_ID_PREFIX}${uuidv4()}`,
        centerX: fixPrecision(centerX, 4),
        centerY: fixPrecision(centerY, 4),
        startTime: fixPrecision(currentTime, 3),
      };
      pulses.push(newPulse);
    },
    updatePulses: (currentTime: number, pulseDurationSeconds: number) => {
      pulses = pulses.filter(pulse => (currentTime - pulse.startTime) < pulseDurationSeconds);
    },
    getActivePulses: (currentTime: number, pulseDurationSeconds: number): Pulse[] => {
      return pulses.filter(pulse => {
        const elapsed = currentTime - pulse.startTime;
        return elapsed >= 0 && elapsed < pulseDurationSeconds;
      });
    },
    clearPulses: () => {
      pulses = [];
    },
  };
};
