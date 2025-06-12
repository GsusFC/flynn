declare module 'simplex-noise' {
  /**
   * A function that returns a noise value in the range [-1, 1].
   */
  type Noise3D = (x: number, y: number, z: number) => number;

  /**
   * Creates a 3D noise function.
   * @param random A function that returns a random number between 0 and 1. Defaults to Math.random.
   */
  export function createNoise3D(random?: () => number): Noise3D;
  
  // Se pueden añadir aquí otras exportaciones como createNoise2D si son necesarias en el futuro
} 