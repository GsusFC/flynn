/**
 * Corrige la precisión de un número a un número específico de decimales.
 * Evita problemas comunes de representación de punto flotante.
 *
 * @param num El número a formatear.
 * @param decimalPlaces El número de decimales a mantener. Por defecto es 2.
 * @returns El número con la precisión corregida.
 */
export const fixPrecision = (num: number, decimalPlaces: number = 2): number => {
  if (isNaN(num) || !isFinite(num)) {
    // Se podría agregar un console.warn o manejo de error aquí si se prefiere.
    // console.warn(`fixPrecision recibió un valor no válido: ${num}`);
    return num; // Devolver el número original o un valor por defecto como 0
  }
  const factor = Math.pow(10, decimalPlaces);
  // Usar Number.EPSILON para un redondeo más robusto en ciertos casos límite
  return Math.round((num + Number.EPSILON) * factor) / factor;
};
