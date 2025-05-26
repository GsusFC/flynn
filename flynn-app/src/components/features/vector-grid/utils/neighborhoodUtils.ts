/**
 * Utilidades para algoritmos de vecindario optimizados
 * Basado en las mejores prácticas de victor2
 */

import { getDistanceSquared } from './advancedMath';

export interface SpatialGridCell {
  vectors: string[]; // IDs de vectores en esta celda
}

export interface SpatialGrid {
  cells: Map<string, SpatialGridCell>;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  cols: number;
  rows: number;
}

export interface VectorPosition {
  id: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

export interface NeighborSearchResult {
  neighbors: VectorPosition[];
  distances: number[];
  count: number;
}

/**
 * Crea un grid espacial para búsquedas optimizadas O(1)
 */
export function createSpatialGrid(
  vectors: VectorPosition[],
  gridWidth: number,
  gridHeight: number,
  cellSize: number = 50
): SpatialGrid {
  const cols = Math.ceil(gridWidth / cellSize);
  const rows = Math.ceil(gridHeight / cellSize);
  const cells = new Map<string, SpatialGridCell>();
  
  // Inicializar celdas vacías
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${row}-${col}`;
      cells.set(key, { vectors: [] });
    }
  }
  
  // Asignar vectores a celdas
  vectors.forEach(vector => {
    const col = Math.floor(vector.x / cellSize);
    const row = Math.floor(vector.y / cellSize);
    
    // Verificar límites
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const key = `${row}-${col}`;
      const cell = cells.get(key);
      if (cell) {
        cell.vectors.push(vector.id);
      }
    }
  });
  
  return {
    cells,
    cellSize,
    gridWidth,
    gridHeight,
    cols,
    rows
  };
}

/**
 * Actualiza la posición de un vector en el grid espacial
 */
export function updateVectorInSpatialGrid(
  grid: SpatialGrid,
  vectorId: string,
  oldX: number,
  oldY: number,
  newX: number,
  newY: number
): void {
  const oldCol = Math.floor(oldX / grid.cellSize);
  const oldRow = Math.floor(oldY / grid.cellSize);
  const newCol = Math.floor(newX / grid.cellSize);
  const newRow = Math.floor(newY / grid.cellSize);
  
  // Si cambió de celda, actualizar
  if (oldCol !== newCol || oldRow !== newRow) {
    // Remover de celda anterior
    const oldKey = `${oldRow}-${oldCol}`;
    const oldCell = grid.cells.get(oldKey);
    if (oldCell) {
      const index = oldCell.vectors.indexOf(vectorId);
      if (index !== -1) {
        oldCell.vectors.splice(index, 1);
      }
    }
    
    // Añadir a nueva celda
    if (newCol >= 0 && newCol < grid.cols && newRow >= 0 && newRow < grid.rows) {
      const newKey = `${newRow}-${newCol}`;
      const newCell = grid.cells.get(newKey);
      if (newCell) {
        newCell.vectors.push(vectorId);
      }
    }
  }
}

/**
 * Obtiene vecinos en un radio específico usando el grid espacial
 */
export function getNeighborsInRadius(
  grid: SpatialGrid,
  vectors: Map<string, VectorPosition>,
  targetX: number,
  targetY: number,
  radius: number,
  excludeId?: string
): NeighborSearchResult {
  const neighbors: VectorPosition[] = [];
  const distances: number[] = [];
  const radiusSquared = radius * radius;
  
  // Calcular rango de celdas a verificar
  const cellRadius = Math.ceil(radius / grid.cellSize);
  const centerCol = Math.floor(targetX / grid.cellSize);
  const centerRow = Math.floor(targetY / grid.cellSize);
  
  const minCol = Math.max(0, centerCol - cellRadius);
  const maxCol = Math.min(grid.cols - 1, centerCol + cellRadius);
  const minRow = Math.max(0, centerRow - cellRadius);
  const maxRow = Math.min(grid.rows - 1, centerRow + cellRadius);
  
  // Verificar celdas en el rango
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const key = `${row}-${col}`;
      const cell = grid.cells.get(key);
      
      if (cell) {
        cell.vectors.forEach(vectorId => {
          if (excludeId && vectorId === excludeId) return;
          
          const vector = vectors.get(vectorId);
          if (vector) {
            const distSquared = getDistanceSquared(targetX, targetY, vector.x, vector.y);
            
            if (distSquared <= radiusSquared) {
              neighbors.push(vector);
              distances.push(Math.sqrt(distSquared));
            }
          }
        });
      }
    }
  }
  
  return {
    neighbors,
    distances,
    count: neighbors.length
  };
}

/**
 * Obtiene vecinos por posición de grid (8-conectividad)
 */
export function getGridNeighbors(
  vectors: VectorPosition[],
  vectorGridMap: Map<string, number>,
  targetRow: number,
  targetCol: number,
  gridRows: number,
  gridCols: number,
  includeCenter: boolean = false
): VectorPosition[] {
  const neighbors: VectorPosition[] = [];
  
  // Direcciones para 8-conectividad (incluye diagonales)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  if (includeCenter) {
    directions.push([0, 0]);
  }
  
  directions.forEach(([dr, dc]) => {
    const newRow = targetRow + dr;
    const newCol = targetCol + dc;
    
    // Verificar límites
    if (newRow >= 0 && newRow < gridRows && newCol >= 0 && newCol < gridCols) {
      const neighborIndex = vectorGridMap.get(`${newRow}-${newCol}`);
      
      if (neighborIndex !== undefined && vectors[neighborIndex]) {
        neighbors.push(vectors[neighborIndex]);
      }
    }
  });
  
  return neighbors;
}

/**
 * Obtiene vecinos en un radio específico usando búsqueda lineal (para grids pequeños)
 */
export function getNeighborsLinearSearch(
  vectors: VectorPosition[],
  targetX: number,
  targetY: number,
  radius: number,
  excludeId?: string
): NeighborSearchResult {
  const neighbors: VectorPosition[] = [];
  const distances: number[] = [];
  const radiusSquared = radius * radius;
  
  vectors.forEach(vector => {
    if (excludeId && vector.id === excludeId) return;
    
    const distSquared = getDistanceSquared(targetX, targetY, vector.x, vector.y);
    
    if (distSquared <= radiusSquared) {
      neighbors.push(vector);
      distances.push(Math.sqrt(distSquared));
    }
  });
  
  return {
    neighbors,
    distances,
    count: neighbors.length
  };
}

/**
 * Encuentra los K vecinos más cercanos
 */
export function getKNearestNeighbors(
  vectors: VectorPosition[],
  targetX: number,
  targetY: number,
  k: number,
  excludeId?: string
): NeighborSearchResult {
  const candidates: Array<{ vector: VectorPosition; distance: number }> = [];
  
  vectors.forEach(vector => {
    if (excludeId && vector.id === excludeId) return;
    
    const distance = Math.sqrt(getDistanceSquared(targetX, targetY, vector.x, vector.y));
    candidates.push({ vector, distance });
  });
  
  // Ordenar por distancia y tomar los K más cercanos
  candidates.sort((a, b) => a.distance - b.distance);
  const kNearest = candidates.slice(0, k);
  
  return {
    neighbors: kNearest.map(c => c.vector),
    distances: kNearest.map(c => c.distance),
    count: kNearest.length
  };
}

/**
 * Obtiene vecinos en un área rectangular
 */
export function getNeighborsInRectangle(
  vectors: VectorPosition[],
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  excludeId?: string
): NeighborSearchResult {
  const neighbors: VectorPosition[] = [];
  const distances: number[] = [];
  
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const minX = centerX - halfWidth;
  const maxX = centerX + halfWidth;
  const minY = centerY - halfHeight;
  const maxY = centerY + halfHeight;
  
  vectors.forEach(vector => {
    if (excludeId && vector.id === excludeId) return;
    
    if (vector.x >= minX && vector.x <= maxX && 
        vector.y >= minY && vector.y <= maxY) {
      neighbors.push(vector);
      distances.push(Math.sqrt(getDistanceSquared(centerX, centerY, vector.x, vector.y)));
    }
  });
  
  return {
    neighbors,
    distances,
    count: neighbors.length
  };
}

/**
 * Calcula la densidad de vectores en un área
 */
export function calculateVectorDensity(
  vectors: VectorPosition[],
  centerX: number,
  centerY: number,
  radius: number
): number {
  const area = Math.PI * radius * radius;
  const neighborsInRadius = getNeighborsLinearSearch(vectors, centerX, centerY, radius);
  return neighborsInRadius.count / area;
}

/**
 * Encuentra clusters de vectores usando densidad
 */
export function findDensityClusters(
  vectors: VectorPosition[],
  radius: number,
  minDensity: number
): Array<{ center: { x: number; y: number }; vectors: VectorPosition[]; density: number }> {
  const clusters: Array<{ center: { x: number; y: number }; vectors: VectorPosition[]; density: number }> = [];
  const processedVectors = new Set<string>();
  
  vectors.forEach(vector => {
    if (processedVectors.has(vector.id)) return;
    
    const neighbors = getNeighborsLinearSearch(vectors, vector.x, vector.y, radius);
    const density = calculateVectorDensity(vectors, vector.x, vector.y, radius);
    
    if (density >= minDensity) {
      // Calcular centro del cluster
      const allVectors = [vector, ...neighbors.neighbors];
      const centerX = allVectors.reduce((sum, v) => sum + v.x, 0) / allVectors.length;
      const centerY = allVectors.reduce((sum, v) => sum + v.y, 0) / allVectors.length;
      
      clusters.push({
        center: { x: centerX, y: centerY },
        vectors: allVectors,
        density
      });
      
      // Marcar vectores como procesados
      allVectors.forEach(v => processedVectors.add(v.id));
    }
  });
  
  return clusters;
}

/**
 * Optimiza el tamaño de celda del grid espacial basado en la densidad de vectores
 */
export function optimizeCellSize(
  vectors: VectorPosition[],
  gridWidth: number,
  gridHeight: number,
  targetVectorsPerCell: number = 10
): number {
  const totalVectors = vectors.length;
  const gridArea = gridWidth * gridHeight;
  const vectorDensity = totalVectors / gridArea;
  
  // Calcular tamaño de celda óptimo
  const cellArea = targetVectorsPerCell / vectorDensity;
  const cellSize = Math.sqrt(cellArea);
  
  // Limitar a valores razonables
  const minCellSize = Math.min(gridWidth, gridHeight) / 100; // Máximo 100x100 grid
  const maxCellSize = Math.min(gridWidth, gridHeight) / 5;   // Mínimo 5x5 grid
  
  return Math.max(minCellSize, Math.min(maxCellSize, cellSize));
}

/**
 * Verifica la eficiencia del grid espacial
 */
export function analyzeSpatialGridEfficiency(grid: SpatialGrid): {
  totalCells: number;
  occupiedCells: number;
  emptyCells: number;
  averageVectorsPerCell: number;
  maxVectorsInCell: number;
  efficiency: number; // 0-1, donde 1 es óptimo
} {
  let occupiedCells = 0;
  let totalVectors = 0;
  let maxVectorsInCell = 0;
  
  grid.cells.forEach(cell => {
    if (cell.vectors.length > 0) {
      occupiedCells++;
      totalVectors += cell.vectors.length;
      maxVectorsInCell = Math.max(maxVectorsInCell, cell.vectors.length);
    }
  });
  
  const totalCells = grid.cells.size;
  const emptyCells = totalCells - occupiedCells;
  const averageVectorsPerCell = occupiedCells > 0 ? totalVectors / occupiedCells : 0;
  
  // Eficiencia basada en distribución uniforme (ideal: 50-80% de celdas ocupadas)
  const occupancyRatio = occupiedCells / totalCells;
  const idealOccupancy = 0.65; // 65% ocupación ideal
  const efficiency = 1 - Math.abs(occupancyRatio - idealOccupancy) / idealOccupancy;
  
  return {
    totalCells,
    occupiedCells,
    emptyCells,
    averageVectorsPerCell,
    maxVectorsInCell,
    efficiency: Math.max(0, Math.min(1, efficiency))
  };
}
