import type { SimpleVector } from '../simple/simpleTypes'; // DynamicVectorConfig removido
import type { GlobalAnimationControls } from './globalAnimationControls';

// ValidatedDynamicConfig ahora es un alias para GlobalAnimationControls,
// ya que DynamicVectorConfig fue eliminado de simpleTypes.
// Las propiedades "dinámicas" específicas (como enableDynamicLength)
// se manejarán a través de DEFAULT_DYNAMIC_FIELDS y la lógica interna de updateVectorsWithDynamics.
export type ValidatedDynamicConfig = GlobalAnimationControls;

// Valores por defecto para campos que antes estaban en DynamicVectorConfig.
// updateVectorsWithDynamics puede usar estos si no se especifican en GlobalAnimationControls
// o para complementar la lógica.
export const DEFAULT_DYNAMIC_FIELDS = {
  enableDynamicLength: false,
  // baseLength: 10, // Considerar si esto debe venir de VectorConfig en el hook
  lengthMultiplier: 1.0,
  minLength: 1,
  maxLength: 100,
  enableDynamicWidth: false,
  // baseWidth: 2, // Considerar si esto debe venir de VectorConfig en el hook
  widthMultiplier: 1.0,
  minWidth: 0.5,
  maxWidth: 20,
  // Podríamos añadir más campos como enableDynamicAngle, angleOffsetMultiplier, etc.
};

/**
 * Placeholder para calcular la intensidad global de la animación.
 * La implementación real podría basarse en el cambio entre frames o configuraciones.
 * @param currentVectors - Los vectores del frame actual.
 * @param previousVectors - Los vectores del frame anterior (opcional).
 * @returns Un número representando la intensidad global.
 */
export const calculateGlobalAnimationIntensity = (
  currentVectors: SimpleVector[],
  // config es GlobalAnimationControls, aunque el placeholder actual no lo use,
  // la implementación real podría necesitarlo.
  config: GlobalAnimationControls,
  previousVectors?: SimpleVector[]
): number => {
  // Lógica placeholder: Devuelve un valor fijo.
  // La implementación real podría ser más compleja, por ejemplo:
  // if (!previousVectors || previousVectors.length === 0) return 1.0;
  // let totalIntensityChange = 0;
  // currentVectors.forEach((cv, i) => {
  //   if (previousVectors[i]) {
  //     // Ejemplo: cambio en ángulo o longitud
  //     totalIntensityChange += Math.abs(cv.angle - previousVectors[i].angle);
  //   }
  // });
  // return 1.0 + Math.min(totalIntensityChange / currentVectors.length, 1.0); // Normalizar y acotar
  return 1.0;
};

/**
 * Placeholder para actualizar los vectores con propiedades dinámicas.
 * La implementación real modificaría longitud, anchura, etc., basándose en la configuración y la intensidad.
 * @param vectors - Los vectores a actualizar.
 * @param previousVectors - Los vectores del frame anterior (opcional).
 * @param config - La configuración dinámica validada (incluye GlobalAnimationControls).
 * @param intensity - La intensidad global calculada.
 * @returns Un nuevo array de vectores con las propiedades dinámicas aplicadas.
 */
export const updateVectorsWithDynamics = (
  vectors: SimpleVector[],
  // config ahora es directamente GlobalAnimationControls (alias ValidatedDynamicConfig)
  config: GlobalAnimationControls, 
  globalIntensity: number,
  previousVectors?: SimpleVector[]
): SimpleVector[] => {
  // Lógica placeholder: Simplemente clona los vectores sin modificarlos.
  // La implementación real iteraría sobre los vectores y aplicaría lógica como:
  // return vectors.map(vector => {
  //   const newVector = { ...vector };
  //   if (config.enableDynamicLength && config.lengthMultiplier) {
  //     newVector.length = (vector.originalLength ?? vector.length) * config.lengthMultiplier * intensity;
  //   }
  //   if (config.enableDynamicWidth && config.widthMultiplier) {
  //     newVector.width = (vector.originalWidth ?? vector.width) * config.widthMultiplier * intensity;
  //   }
  //   // ... más lógica para ángulo, color, etc.
  //   return newVector;
  // });
  return vectors.map(v => ({ ...v })); // Devuelve una nueva instancia para inmutabilidad
};
