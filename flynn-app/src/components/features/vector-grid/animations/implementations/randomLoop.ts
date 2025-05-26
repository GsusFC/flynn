import { AnimationImplementation, AnimatedVectorItem, AnimationParams } from '../types';

/**
 * Animación "randomLoop" - Cambia periódicamente el ángulo objetivo a uno aleatorio
 */
export const randomLoopAnimation: AnimationImplementation = {
  id: 'randomLoop',
  name: 'Bucle aleatorio',
  description: 'Cada vector selecciona un nuevo ángulo objetivo aleatorio a intervalos regulares',
  
  defaultProps: {
    intervalMs: 2000,              // Intervalo entre cambios aleatorios (ms)
    transitionSpeedFactor: 1.0,    // Factor de velocidad de transición
    randomAmplitude: 360,          // Amplitud máxima del cambio aleatorio (grados)
  },
  
  controls: [
    {
      id: 'intervalMs',
      type: 'slider',
      label: 'Intervalo (ms)',
      min: 500,
      max: 5000,
      step: 100,
      defaultValue: 2000,
      tooltip: 'Tiempo entre cambios aleatorios en milisegundos'
    },
    {
      id: 'transitionSpeedFactor',
      type: 'slider',
      label: 'Velocidad',
      min: 0.1,
      max: 3.0,
      step: 0.1,
      defaultValue: 1.0,
      tooltip: 'Velocidad de transición hacia el nuevo ángulo'
    },
    {
      id: 'randomAmplitude',
      type: 'slider',
      label: 'Amplitud',
      min: 10,
      max: 360,
      step: 10,
      defaultValue: 360,
      tooltip: 'Amplitud máxima del cambio aleatorio en grados'
    }
  ],
  
  update: (
    vectors: AnimatedVectorItem[], 
    params: AnimationParams, 
    props: Record<string, unknown>
  ): AnimatedVectorItem[] => {
    const { time, deltaTime } = params;
    const intervalMs = Number(props.intervalMs) || 2000;
    const transitionSpeedFactor = Number(props.transitionSpeedFactor) || 1.0;
    const randomAmplitude = Number(props.randomAmplitude) || 360;
    
    // Calcular el índice de intervalo actual (cambia cada intervalMs)
    const intervalIndex = Math.floor((time * 1000) / intervalMs);
    
    return vectors.map(vector => {
      // Usar el ID del vector como semilla para mantener coherencia
      // pero cambiarlo en cada intervalo
      const seed = vector.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + intervalIndex;
      
      // Generar un ángulo objetivo pseudoaleatorio basado en la semilla
      if (vector.targetAngle === undefined || 
          Math.floor((time * 1000 - deltaTime * 1000) / intervalMs) !== intervalIndex) {
        
        // Usar una función determinista para generar "aleatoriedad" consistente
        const pseudoRandom = () => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        // Asignar un nuevo ángulo objetivo
        vector.targetAngle = (vector.baseAngle + (pseudoRandom() * randomAmplitude)) % 360;
        
        // También podemos usar este momento para añadir datos de animación personalizados
        vector.animationData = {
          ...(vector.animationData || {}),
          lastChangeTime: time
        };
      }
      
      // Calcular una transición suave hacia el ángulo objetivo
      const targetAngle = vector.targetAngle;
      const currentAngle = vector.angle;
      
      // Calcular el camino más corto hacia el ángulo objetivo (para evitar giros de >180°)
      let angleDiff = targetAngle - currentAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      // Aplicar una transición suave usando el factor de velocidad
      const transitionRate = 2.0 * transitionSpeedFactor; // Factor de velocidad ajustable
      const newAngle = currentAngle + (angleDiff * transitionRate * deltaTime);
      
      return {
        ...vector,
        angle: newAngle % 360,
        // Mantener otras propiedades en sus valores base
        length: vector.baseLength,
        width: vector.baseWidth,
        opacity: vector.baseOpacity
      };
    });
  }
};
