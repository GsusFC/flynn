import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  id: number;
}

interface RippleEffectProps {
  strength: number;
  duration: number; // in seconds
  frequency: number;
  rippleWidth: number;
  speed: number;
}

// --- Estado interno del módulo para gestionar las ondas ---
let ripples: Ripple[] = [];
let lastMousePos: { x: number | null; y: number | null } = { x: null, y: null };
let nextRippleId = 0;

const applyRippleEffect = ({ vectors, time, mousePos, props }: AnimationFrameData<RippleEffectProps>): AnimationResult => {
  const { strength, duration, frequency, rippleWidth, speed } = props;

  // 1. Crear nueva onda si el ratón se mueve a una nueva posición
  if (mousePos.x !== null && mousePos.y !== null) {
    if (mousePos.x !== lastMousePos.x || mousePos.y !== lastMousePos.y) {
      ripples.push({
        x: mousePos.x,
        y: mousePos.y,
        startTime: time,
        id: nextRippleId++,
      });
      lastMousePos = { ...mousePos };
    }
  }

  // 2. Eliminar ondas viejas
  ripples = ripples.filter(r => time - r.startTime < duration);

  const results = vectors.map(vector => {
    let netDx = 0;
    let netDy = 0;
    let totalPressure = 0;

    for (const ripple of ripples) {
      const dx = vector.x - ripple.x;
      const dy = vector.y - ripple.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const age = time - ripple.startTime;
      const radius = age * speed;
      
      if (dist > 0 && Math.abs(dist - radius) < rippleWidth) {
        const pressure = 1 - (Math.abs(dist - radius) / rippleWidth);
        totalPressure += pressure; // Acumular la presión de todas las ondas
        const displacement = Math.sin((dist - radius) * frequency) * strength * pressure;
        
        netDx += (dx / dist) * displacement;
        netDy += (dy / dist) * displacement;
      }
    }
    
    let newVector = { ...vector };
    if (netDx !== 0 || netDy !== 0) {
      const originalDx = Math.cos(vector.angle);
      const originalDy = Math.sin(vector.angle);
      newVector.angle = Math.atan2(originalDy + netDy, originalDx + netDx);
    }
    
    const data = {
      fieldStrength: Math.min(totalPressure, 1.0), // Limitar a 1 por si se solapan muchas ondas
    };

    return { vector: newVector, data };
  });

  const newVectors = results.map(r => r.vector);
  const animationData = results.map(r => r.data);

  return { vectors: newVectors, animationData };
};

const rippleEffectMeta: AnimationMeta<RippleEffectProps> = {
  id: 'rippleEffect',
  name: 'Ripple Effect',
  description: 'Crea ondas interactivas que se originan con el movimiento del ratón.',
  category: 'core',
  icon: 'waves',
  
  controls: [
    { id: 'strength', type: 'slider', label: 'Fuerza', min: 0.1, max: 2, step: 0.1, defaultValue: 0.8 },
    { id: 'duration', type: 'slider', label: 'Duración (s)', min: 1, max: 10, step: 0.5, defaultValue: 4 },
    { id: 'frequency', type: 'slider', label: 'Frecuencia', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5 },
    { id: 'rippleWidth', type: 'slider', label: 'Ancho de Onda', min: 5, max: 100, step: 1, defaultValue: 40 },
    { id: 'speed', type: 'slider', label: 'Velocidad', min: 10, max: 200, step: 5, defaultValue: 100 },
  ],
  
  defaultProps: {
    strength: 0.8,
    duration: 4,
    frequency: 0.5,
    rippleWidth: 40,
    speed: 100,
  },
  
  apply: applyRippleEffect,
};

registerAnimation(rippleEffectMeta); 