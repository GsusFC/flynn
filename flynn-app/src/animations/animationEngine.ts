import { getAnimation } from './registry';
import type { AnimationFrameData, AnimationResult } from './types';

// Importar los módulos de animación para asegurar que se registren
import './implementations/rotation';
import './implementations/wave';
import './implementations/spiral';
import './implementations/turbulence';
import './implementations/vortex';
import './implementations/dipole';
import './implementations/static';
import './implementations/jitter';
import './implementations/pulse';
import './implementations/perlinFlow';
import './implementations/curlNoise';
import './implementations/rippleEffect';
import './implementations/gaussianGradient';
import './implementations/pinwheels';
import './implementations/seaWaves';
import './implementations/oceanCurrents';
import './implementations/geometricPattern';
import './implementations/flocking';
import './implementations/pathFlow';
import './implementations/cellularAutomata';
import './implementations/smoothWaves';
import './implementations/seaWavesVictor';
import './implementations/geometricPatternVictor';
import './implementations/inkFlow';
import './implementations/gaussianPulse';
// A medida que migremos más, los añadiremos aquí.

/**
 * Aplica la animación seleccionada a los vectores consultando el registro central.
 * @param animationId El ID de la animación a aplicar.
 * @param data Los datos para el frame de animación actual.
 * @returns El resultado de la animación (vectores transformados y datos).
 */
export const applyAnimation = (
  animationId: string,
  data: AnimationFrameData<any> // Pasamos 'any' porque no sabemos las props específicas aquí
): AnimationResult => {
  const implementation = getAnimation(animationId);

  if (implementation) {
    // Aquí pasamos las props que vienen en `data` a la implementación.
    // La UI se encargará de que `data.props` tenga la forma correcta.
    return implementation.apply(data);
  }

  // Fallback para animaciones no encontradas
  console.warn(`[AnimationEngine] Animación "${animationId}" no encontrada.`, { available: Object.keys(getAnimation) });
  return { vectors: [...data.vectors], animationData: [] };
}; 