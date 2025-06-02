// Curl Noise Animation - Movimiento vorticoso sin divergencia
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
// import { applyCurlToVector } from '../base/curlUtils'; // calculateCurlStandard se define localmente, applyCurlToVector no se usa.
import { simpleNoise } from '../base/utils';

interface CurlNoiseProps {
  noiseScale?: number;
  speed?: number;
  intensity?: number;
  octaves?: number; // Añadido para control de ruido
  persistence?: number; // Añadido para control de ruido
  turbulence?: number; // Opcional, si se quiere control directo
}

// Nueva función para calcular curl de forma más estándar
function calculateCurlStandard(x: number, y: number, time: number, scale: number, noiseFn: (x: number, y: number, z?: number) => number): { x: number, y: number } {
  const epsilon = 0.01; // Pequeña diferencia para calcular derivadas

  // dP/dx
  // Aplicar escala aquí para que epsilon sea relativo al mundo del ruido
  const n1_dx = noiseFn((x + epsilon) * scale, y * scale, time);
  const n2_dx = noiseFn((x - epsilon) * scale, y * scale, time);
  // El denominador debería ser (2 * epsilon * scale) si epsilon es en coordenadas de pantalla
  // o simplemente (2 * epsilon) si epsilon es en coordenadas de ruido. Mantengamos (2*epsilon) por ahora.
  const denominator_dx = 2 * epsilon * scale;
  const dp_dx = denominator_dx === 0 ? 0 : (n1_dx - n2_dx) / denominator_dx;

  // dP/dy
  const n1_dy = noiseFn(x * scale, (y + epsilon) * scale, time);
  const n2_dy = noiseFn(x * scale, (y - epsilon) * scale, time);
  const denominator_dy = 2 * epsilon * scale;
  const dp_dy = denominator_dy === 0 ? 0 : (n1_dy - n2_dy) / denominator_dy;

  return { x: dp_dy, y: -dp_dx }; // curl_x = dP/dy, curl_y = -dP/dx
}

function generateOctaveNoise(nx: number, ny: number, nt: number, octaves: number, persistence: number): number { // Eliminado noiseScale de los parámetros
  let result = 0;
  let frequency = 1;
  let amplitude = 1;

  for (let i = 0; i < octaves; i++) {
    result += simpleNoise(nx * frequency, ny * frequency, nt) * amplitude;
    frequency *= 2;
    amplitude *= persistence;
  }

  return result;
}

export const curlNoiseAnimation = createSimpleAnimation<CurlNoiseProps>({
  id: 'curlNoise',
  name: 'Curl Noise',
  description: 'Movimiento vorticoso y turbulento usando curl noise sin divergencia',
  category: 'flow',
  icon: '🌀',
  
  controls: [
    {
      id: 'noiseScale',
      label: 'Escala del Ruido',
      type: 'slider',
      min: 0.01,
      max: 0.1,
      step: 0.005,
      defaultValue: 0.03
    },
    {
      id: 'speed',
      label: 'Velocidad',
      type: 'slider',
      min: 0.0,
      max: 0.03,
      step: 0.001,
      defaultValue: 0.008
    },
    {
      id: 'intensity',
      label: 'Intensidad',
      type: 'slider',
      min: 0.1,
      max: 4.0,
      step: 0.1,
      defaultValue: 1.5
    },
    {
      id: 'octaves',
      label: 'Octavas de Ruido',
      type: 'slider',
      min: 1,
      max: 6, // Permitir hasta 6 octavas
      step: 1,
      defaultValue: 3,
      description: 'Número de capas de ruido para detalle. Más octavas pueden costar más rendimiento.',
      icon: '🌊'
    },
    {
      id: 'persistence',
      label: 'Persistencia de Ruido',
      type: 'slider',
      min: 0.1,
      max: 1.0, // Permitir hasta 1.0
      step: 0.05,
      defaultValue: 0.5,
      description: 'Influencia de las octavas de ruido superiores. Valores más bajos son más suaves.',
      icon: '💪'
    },
    {
      id: 'turbulence',
      label: 'Turbulencia',
      type: 'slider',
      min: 0.0,
      max: 2.0,
      step: 0.1,
      defaultValue: 0.5
    }
  ],
  
  defaultProps: {
    noiseScale: 0.02, // Ajustado para que coincida con perlinFlow como punto de partida
    speed: 0.002,    // Ajustado para que coincida con perlinFlow
    intensity: 1,
    octaves: 3,      // Valor por defecto para octavas
    persistence: 0.5 // Valor por defecto para persistencia
    // turbulence no se incluye en defaultProps para que se calcule si no se provee
  },
  
  validateProps: (props: CurlNoiseProps): boolean => {
    return (
      (props.noiseScale === undefined || (typeof props.noiseScale === 'number' && props.noiseScale > 0)) &&
      (props.speed === undefined || (typeof props.speed === 'number' && props.speed >= 0)) &&
      (props.intensity === undefined || (typeof props.intensity === 'number' && props.intensity >= 0)) &&
      (props.octaves === undefined || (typeof props.octaves === 'number' && props.octaves >= 1 && props.octaves <= 8)) &&
      (props.persistence === undefined || (typeof props.persistence === 'number' && props.persistence > 0 && props.persistence <= 1)) &&
      (props.turbulence === undefined || (typeof props.turbulence === 'number' && props.turbulence >=0))
    );
  },
  
  animate: (
    vectors: SimpleVector[], 
    props: CurlNoiseProps, 
    context: AnimationContext
  ): SimpleVector[] => {
    // Usar valores de props directamente con fallbacks alineados con defaultProps
    const noiseScale = props.noiseScale ?? 0.02; // Alineado con defaultProps
    const speed = props.speed ?? 0.002;       // Alineado con defaultProps
    const intensity = props.intensity ?? 1;       // Alineado con defaultProps (ya estaba correcto)
    const turbulenceAmount = props.turbulence ?? 0.5; // Sin defaultProp, fallback local está bien
    const persistence = props.persistence ?? 0.5; // Alineado con defaultProps
    const octaves = props.octaves ?? 3;         // Alineado con defaultProps
    
    const { time } = context; // Eliminado canvasWidth y canvasHeight no utilizados
    const noiseTime = time * speed; // Tiempo para la evolución del ruido, similar a perlinFlow

    // Create constant values to ensure TypeScript knows they're numbers
    const finalOctaves = 3;
    const finalPersistence = 0.5;

    return vectors.map(vector => {
      // Coordenadas escaladas directamente
      const nx = vector.x * noiseScale;
      const ny = vector.y * noiseScale;
      
      // Calcular el campo de curl usando la función de ruido con octavas
      // La propia función generateOctaveNoise ahora maneja el noiseScale internamente
      // por lo que el cuarto argumento de calculateCurlStandard (scale) se puede poner a 1 o ajustar si es necesario.
      // Aquí, dado que generateOctaveNoise ya escala x,y con props.noiseScale, pasamos 1.
      const curl = calculateCurlStandard(
        vector.originalX, // Se pasa originalX/Y para que el escalado sea consistente con generateOctaveNoise
        vector.originalY,
        noiseTime,        // Usamos el tiempo modulado por la velocidad
        noiseScale,       // calculateCurlStandard se encarga de la escala principal
        (nx, ny, nt) => generateOctaveNoise(nx, ny, nt, finalOctaves, finalPersistence) // generateOctaveNoise ya no toma noiseScale
      );
      
      // Aplicar turbulencia si está habilitada
      // turbulenceAmount ya está definido arriba con un valor por defecto numérico
      if (turbulenceAmount > 0) {
        const turbX = simpleNoise(nx * 3, ny * 3, noiseTime * 1.5) * turbulenceAmount;
        const turbY = simpleNoise(nx * 3.1, ny * 3.1, noiseTime * 1.7) * turbulenceAmount;
        curl.x += turbX;
        curl.y += turbY;
      }
      
      // El uso anterior de 'persistenceFactor' aquí era incorrecto y ha sido eliminado.
      // La persistencia ya se aplica dentro de generateOctaveNoise.
      
      // Convertir curl a ángulo Y LUEGO A GRADOS
      let curlAngleDegrees = Math.atan2(curl.y, curl.x) * (180 / Math.PI);
      // Normalizar curlAngleDegrees a 0-360
      curlAngleDegrees = ((curlAngleDegrees % 360) + 360) % 360;

      const curlMagnitude = Math.sqrt(curl.x * curl.x + curl.y * curl.y);
      
      const mixFactor = Math.min(intensity * 0.6, 1.0); // Usar intensity en lugar de strength
      
      // Asegurarse que vector.angle está en el rango 0-360 (debería estarlo)
      const currentVectorAngle = ((vector.angle % 360) + 360) % 360;

      // Diferencia angular en GRADOS
      let angleDiffDegrees = curlAngleDegrees - currentVectorAngle;
      if (angleDiffDegrees > 180) angleDiffDegrees -= 360;
      if (angleDiffDegrees < -180) angleDiffDegrees += 360;
      
      // Aplicar cambio, el resultado es en grados
      let newAngleDegrees = currentVectorAngle + angleDiffDegrees * mixFactor;
      // Normalizar el resultado final
      newAngleDegrees = ((newAngleDegrees % 360) + 360) % 360;
      
      // Longitud basada en la magnitud del curl
      const lengthMultiplier = 0.4 + curlMagnitude * 1.2;
      
      return {
        ...vector,
        angle: newAngleDegrees,
        length: vector.length * Math.max(0.3, Math.min(2.0, lengthMultiplier))
      };
    });
  }
}); // Corregir el cierre de createSimpleAnimation