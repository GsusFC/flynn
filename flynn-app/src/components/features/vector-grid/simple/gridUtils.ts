import { SimpleVector, GridConfig, VectorConfig, ExtendedVectorColorValue } from './simpleTypes';

// Grid generation patterns
export type GridPattern = 
  | 'regular'           // Standard uniform grid
  | 'hexagonal'         // Hexagonal/honeycomb pattern
  | 'fibonacci'         // Fibonacci spiral arrangement
  | 'radial'           // Concentric circles
  | 'staggered'        // Offset rows
  | 'triangular'       // Triangular lattice
  | 'voronoi'          // Voronoi-like random distribution
  | 'golden'           // Golden ratio based positioning;

/**
 * Generates initial vectors based on the specified grid pattern.
 * Replaces the previous placeholder implementation with robust pattern generation.
 */
export const generateInitialVectors = (
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number,
  pattern: GridPattern = 'regular'
): SimpleVector[] => {
  const { rows, cols } = gridConfig;
  
  if (rows <= 0 || cols <= 0) {
    return [];
  }

  switch (pattern) {
    case 'hexagonal':
      return generateHexagonalGrid(gridConfig, vectorConfig, width, height);
    case 'fibonacci':
      return generateFibonacciGrid(gridConfig, vectorConfig, width, height);
    case 'radial':
      return generateRadialGrid(gridConfig, vectorConfig, width, height);
    case 'staggered':
      return generateStaggeredGrid(gridConfig, vectorConfig, width, height);
    case 'triangular':
      return generateTriangularGrid(gridConfig, vectorConfig, width, height);
    case 'voronoi':
      return generateVoronoiGrid(gridConfig, vectorConfig, width, height);
    case 'golden':
      return generateGoldenGrid(gridConfig, vectorConfig, width, height);
    case 'regular':
    default:
      return generateRegularGrid(gridConfig, vectorConfig, width, height);
  }
};

/**
 * Standard regular grid - uniform rows and columns
 */
function generateRegularGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols, spacing } = gridConfig;
  const vectors: SimpleVector[] = [];

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      
      vectors.push(createVectorAt(x, y, row, col, vectorConfig));
    }
  }

  return vectors;
}

/**
 * Hexagonal grid pattern - honeycomb arrangement
 */
function generateHexagonalGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];

  const hexRadius = Math.min(width / (cols * 1.5), height / (rows * Math.sqrt(3)));
  const hexWidth = hexRadius * 2;
  const hexHeight = hexRadius * Math.sqrt(3);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * (hexWidth * 0.5); // Offset every other row
      const x = col * (hexWidth * 0.75) + hexRadius + offsetX;
      const y = row * (hexHeight * 0.5) + hexRadius;
      
      if (x < width && y < height) {
        vectors.push(createVectorAt(x, y, row, col, vectorConfig));
      }
    }
  }

  return vectors;
}

/**
 * Fibonacci spiral grid - golden ratio based positioning
 */
function generateFibonacciGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];
  const totalVectors = rows * cols;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2.5;

  for (let i = 0; i < totalVectors; i++) {
    const angle = i * goldenAngle;
    const radius = maxRadius * Math.sqrt(i / totalVectors);
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    vectors.push(createVectorAt(x, y, row, col, vectorConfig));
  }

  return vectors;
}

/**
 * Radial grid - concentric circles
 */
function generateRadialGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2.2;

  for (let ring = 0; ring < rows; ring++) {
    const radius = (ring + 1) * (maxRadius / rows);
    const vectorsInRing = Math.max(1, Math.floor(cols * (ring + 1) / rows));
    const angleStep = (2 * Math.PI) / vectorsInRing;

    for (let i = 0; i < vectorsInRing; i++) {
      const angle = i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      vectors.push(createVectorAt(x, y, ring, i, vectorConfig));
    }
  }

  return vectors;
}

/**
 * Staggered grid - alternating row offsets
 */
function generateStaggeredGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const staggerOffset = cellWidth / 3;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * staggerOffset;
      const x = col * cellWidth + cellWidth / 2 + offsetX;
      const y = row * cellHeight + cellHeight / 2;
      
      vectors.push(createVectorAt(x, y, row, col, vectorConfig));
    }
  }

  return vectors;
}

/**
 * Triangular lattice grid
 */
function generateTriangularGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const triHeight = cellHeight * Math.sqrt(3) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * (cellWidth / 2);
      const x = col * cellWidth + offsetX + cellWidth / 2;
      const y = row * triHeight + triHeight / 2;
      
      if (y < height) {
        vectors.push(createVectorAt(x, y, row, col, vectorConfig));
      }
    }
  }

  return vectors;
}

/**
 * Voronoi-inspired semi-random distribution
 */
function generateVoronoiGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const randomFactor = 0.3; // How much randomness to apply

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = col * cellWidth + cellWidth / 2;
      const baseY = row * cellHeight + cellHeight / 2;
      
      const randomX = (Math.random() - 0.5) * cellWidth * randomFactor;
      const randomY = (Math.random() - 0.5) * cellHeight * randomFactor;
      
      const x = Math.max(cellWidth / 4, Math.min(width - cellWidth / 4, baseX + randomX));
      const y = Math.max(cellHeight / 4, Math.min(height - cellHeight / 4, baseY + randomY));
      
      vectors.push(createVectorAt(x, y, row, col, vectorConfig));
    }
  }

  return vectors;
}

/**
 * Golden ratio based grid
 */
function generateGoldenGrid(
  gridConfig: GridConfig,
  vectorConfig: VectorConfig,
  width: number,
  height: number
): SimpleVector[] {
  const { rows, cols } = gridConfig;
  const vectors: SimpleVector[] = [];
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const goldenX = (col / phi) % 1;
      const goldenY = (row / phi) % 1;
      
      const x = goldenX * width;
      const y = goldenY * height;
      
      vectors.push(createVectorAt(x, y, row, col, vectorConfig));
    }
  }

  return vectors;
}

/**
 * Helper function to create a vector at specified position
 */
function createVectorAt(
  x: number,
  y: number,
  row: number,
  col: number,
  vectorConfig: VectorConfig
): SimpleVector {
  const id = `vector-${row}-${col}`;
  const angle = vectorConfig.angleOffset || 0;
  
  return {
    id,
    x,
    y,
    angle,
    length: vectorConfig.length,
    width: vectorConfig.width,
    color: vectorConfig.color,
    opacity: vectorConfig.opacity,
    originalX: x,
    originalY: y,
    originalAngle: angle,
    gridRow: row,
    gridCol: col,
    // Additional compatibility fields for legacy code
    baseX: x,
    baseY: y,
    currentAngle: angle,
    baseAngle: angle,
    initialAngle: angle,
    previousAngle: angle,
    baseLength: vectorConfig.length,
    originalLength: vectorConfig.length,
    baseWidth: vectorConfig.width,
    baseOpacity: vectorConfig.opacity,
    originalColor: vectorConfig.color,
    lengthFactor: 1,
    widthFactor: 1,
    intensityFactor: 1,
    r: row,
    c: col,
    animationData: {},
  } as SimpleVector;
}
