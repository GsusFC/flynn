import { AnimationImplementation, AnimatedVectorItem, AnimationParams, WaveType } from '../types';

/**
 * Animación "smoothWaves" - Genera un patrón de ondas suaves que se propagan por la cuadrícula
 */
export const smoothWavesAnimation: AnimationImplementation = {
  id: 'smoothWaves',
  name: 'Ondas suaves',
  description: 'Genera un patrón de ondas suaves y fluidas que se propagan a través de la cuadrícula',
  
  defaultProps: {
    frequency: 0.1,          // Frecuencia de la onda
    amplitude: 30,           // Amplitud angular en grados
    speed: 0.5,              // Velocidad de propagación
    baseAngle: 0,            // Ángulo base
    patternScale: 0.01,      // Escala espacial del patrón
    waveType: 'circular',    // Tipo de patrón de onda: 'circular', 'linear', 'diagonal'
    timeScale: 1.0           // Escala temporal
  },
  
  controls: [
    {
      id: 'frequency',
      type: 'slider',
      label: 'Frecuencia',
      min: 0.01,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.1,
      tooltip: 'Frecuencia de la onda (valores más altos = más ondas)'
    },
    {
      id: 'amplitude',
      type: 'slider',
      label: 'Amplitud',
      min: 5,
      max: 90,
      step: 1,
      defaultValue: 30,
      tooltip: 'Amplitud de la oscilación en grados'
    },
    {
      id: 'speed',
      type: 'slider',
      label: 'Velocidad',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 0.5,
      tooltip: 'Velocidad de movimiento de las ondas'
    },
    {
      id: 'baseAngle',
      type: 'slider',
      label: 'Ángulo base',
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 0,
      tooltip: 'Ángulo base sobre el que oscilan las ondas'
    },
    {
      id: 'patternScale',
      type: 'slider',
      label: 'Escala espacial',
      min: 0.001,
      max: 0.05,
      step: 0.001,
      defaultValue: 0.01,
      tooltip: 'Escala del patrón espacial (valores más altos = ondas más juntas)'
    },
    {
      id: 'waveType',
      type: 'select',
      label: 'Tipo de onda',
      options: [
        { value: 'circular', label: 'Circular' },
        { value: 'linear', label: 'Lineal' },
        { value: 'diagonal', label: 'Diagonal' }
      ],
      defaultValue: 'circular',
      tooltip: 'Patrón de propagación de las ondas'
    }
  ],
  
  update: (
    vectors: AnimatedVectorItem[], 
    params: AnimationParams, 
    props: Record<string, unknown>
  ): AnimatedVectorItem[] => {
    const { time, canvasWidth, canvasHeight } = params;
    const frequency = Number(props.frequency) || 0.1;
    const amplitude = Number(props.amplitude) || 30;
    const speed = Number(props.speed) || 0.5;
    const baseAngle = Number(props.baseAngle) || 0;
    const patternScale = Number(props.patternScale) || 0.01;
    const waveType = (props.waveType as WaveType) || 'circular';
    const timeScale = Number(props.timeScale) || 1.0;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const scaledTime = time * speed * timeScale;
    
    return vectors.map(vector => {
      let waveOffset = 0;
      
      // Calcular el offset de onda según el tipo de onda
      switch (waveType) {
        case 'circular':
          // Ondas circulares desde el centro
          const dx = vector.baseX - centerX;
          const dy = vector.baseY - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          waveOffset = distance * patternScale;
          break;
          
        case 'linear':
          // Ondas lineales (horizontales por defecto)
          waveOffset = vector.baseY * patternScale;
          break;
          
        case 'diagonal':
          // Ondas diagonales
          waveOffset = (vector.baseX + vector.baseY) * patternScale;
          break;
      }
      
      // Calcular el ángulo usando la función seno
      const waveAngle = baseAngle + Math.sin(scaledTime + waveOffset * frequency) * amplitude;
      
      return {
        ...vector,
        angle: waveAngle,
        // Mantener otras propiedades en sus valores base
        length: vector.baseLength,
        width: vector.baseWidth,
        opacity: vector.baseOpacity
      };
    });
  }
};
