// Gaussian Gradient Animation - Campo de gradiente gaussiano
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// Props para la animación gaussianGradient
interface GaussianGradientProps {
  centerX: number;
  centerY: number;
  sigma: number;
  strength: number;
  mode: 'repel' | 'attract';
}

// Función principal de animación
const animateGaussianGradient = (
  vectors: SimpleVector[],
  props: GaussianGradientProps,
  context: AnimationContext
): SimpleVector[] => {
  const { centerX, centerY, sigma, strength, mode } = props;
  const { canvasWidth, canvasHeight, time } = context;

  // DEBUG: Verificar si la función se ejecuta y el valor de time
  console.log(`[gaussianGradient] animate - time: ${time}`);
  
  // Convertir centro de proporción [0,1] a píxeles
  const cx = centerX * canvasWidth;
  const cy = centerY * canvasHeight;
  
  // Escalar sigma a píxeles para que sea útil (sigma está en [0.1, 2.0])
  const sigmaPixels = sigma * Math.min(canvasWidth, canvasHeight) * 0.2; // 20% del canvas
  const sigmaSquared = sigmaPixels * sigmaPixels;
  const twoSigmaSquared = 2 * sigmaSquared;
  
  // Animación temporal - pulso suave
  const timeFactor = 1 + Math.sin(time * 0.003) * 0.7; // Pulso más fuerte, entre 0.3 y 1.7
  
  return vectors.map(vector => {
    // Distancia desde el centro
    const dx = vector.x - cx;
    const dy = vector.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const distanceSquared = dx * dx + dy * dy;
    
    // Función gaussiana con factor temporal
    const gaussian = Math.exp(-distanceSquared / twoSigmaSquared) * timeFactor;
    
    // Calcular ángulo del gradiente
    let angle: number;
    if (distance < 1.0) {
      // Muy cerca del centro, usar ángulo aleatorio para evitar singularidad
      angle = (time * 0.001) % (Math.PI * 2);
    } else {
      // Gradiente apunta radialmente
      if (mode === 'repel') {
        angle = Math.atan2(dy, dx); // Desde el centro hacia fuera
      } else {
        angle = Math.atan2(-dy, -dx); // Hacia el centro
      }
    }
    
    // Intensidad amplificada y más agresiva
    const intensity = Math.min(gaussian * strength * 3, 5.0); // Amplificar 3x
    
    // Factor de mezcla mucho más agresivo (mixFactor eliminado ya que no se usaba)
    // const baseMixFactor = Math.min(intensity * 0.8, 1.0);
    // const mixFactor = Math.max(baseMixFactor, 0.1); // Mínimo 10% de efecto
    
    // Aplicar cambio directo sin interpolación suave
    const finalAngleDegrees = angle * (180 / Math.PI); // Convertir a grados
    
    // Longitud muy visible basada en intensidad
    const lengthMultiplier = 0.5 + intensity * 0.8;
    
    return {
      ...vector,
      angle: finalAngleDegrees, // Usar ángulo en grados
      length: vector.length * Math.max(0.3, Math.min(3.0, lengthMultiplier)) // Original
      // length: debugLength // Comentado para restaurar lengthMultiplier
    };
  });
};

// Validación de props
const validateGaussianGradientProps = (props: GaussianGradientProps): boolean => {
  if (typeof props.centerX !== 'number' || props.centerX < 0 || props.centerX > 1) {
    console.warn('[gaussianGradient] centerX debe estar entre 0 y 1');
    return false;
  }
  if (typeof props.centerY !== 'number' || props.centerY < 0 || props.centerY > 1) {
    console.warn('[gaussianGradient] centerY debe estar entre 0 y 1');
    return false;
  }
  if (typeof props.sigma !== 'number' || props.sigma <= 0 || props.sigma > 3) {
    console.warn('[gaussianGradient] sigma debe estar entre 0 y 3');
    return false;
  }
  if (typeof props.strength !== 'number' || props.strength <= 0 || props.strength > 10) {
    console.warn('[gaussianGradient] strength debe estar entre 0 y 10');
    return false;
  }
  if (!['repel', 'attract'].includes(props.mode)) {
    console.warn('[gaussianGradient] mode debe ser "repel" o "attract"');
    return false;
  }
  return true;
};

// Exportar la animación
export const gaussianGradientAnimation = createSimpleAnimation<GaussianGradientProps>({
  id: 'gaussianGradient',
  name: 'Gradiente Gaussiano',
  description: 'Campo de fuerza basado en gradiente de función gaussiana - crea montañas invisibles de vectores',
  category: 'advanced',
  icon: '⛰️',
  controls: [
    {
      id: 'centerX',
      label: 'Centro X',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Posición horizontal del centro del campo (0-1)',
      icon: '↔️'
    },
    {
      id: 'centerY',
      label: 'Centro Y',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Posición vertical del centro del campo (0-1)',
      icon: '↕️'
    },
    {
      id: 'sigma',
      label: 'Ancho (Sigma)',
      type: 'slider',
      min: 0.1,
      max: 2.0,
      step: 0.05,
      defaultValue: 0.8,
      description: 'Ancho del campo gaussiano - menor = más concentrado',
      icon: '📏'
    },
    {
      id: 'strength',
      label: 'Intensidad',
      type: 'slider',
      min: 0.5,
      max: 5.0,
      step: 0.1,
      defaultValue: 2.5,
      description: 'Intensidad del efecto del campo',
      icon: '💪'
    },
    {
      id: 'mode',
      label: 'Modo',
      type: 'select',
      options: [
        { value: 'repel', label: '💥 Repulsión (Explosión)' },
        { value: 'attract', label: '🌀 Atracción (Implosión)' }
      ],
      defaultValue: 'repel',
      description: 'Dirección del gradiente - repeler desde o atraer hacia el centro',
      icon: '🎯'
    }
  ],
  defaultProps: {
    centerX: 0.5,
    centerY: 0.5,
    sigma: 0.8,
    strength: 2.5,
    mode: 'repel'
  },
  animate: animateGaussianGradient,
  validateProps: validateGaussianGradientProps
});