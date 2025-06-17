export interface Point {
  x: number;
  y: number;
  // Optional structural information
  row?: number;
  col?: number;
  ring?: number;
  line?: number;
  arm?: number;
}

export interface Container {
  width: number;
  height: number;
  margin?: number; // espacio interior libre en px
}

export type GridMode = 'basic' | 'math';

export interface GridRequest {
  mode: GridMode;
  // para modo basic
  rows?: number; // ≥1
  cols?: number; // ≥1
  spacingOverride?: number; // px (opcional)

  // para modo math
  count?: number; // número total de vectores
  pattern: string; // id del patrón, ej. 'regular' | 'fibonacci'
  patternParams?: Record<string, unknown>; // parámetros específicos del patrón

  // common
  container: Container;
}

export interface LayoutResult {
  points: Point[];
  // Información auxiliar sobre la estructura de la cuadrícula
  rows?: number;
  cols?: number;
  rings?: number;
  lines?: number;
  arms?: number;
  spacing?: number;
} 