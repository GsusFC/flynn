import type { Vector } from './FlynVectorGrid';
import type { PresetConfig } from '@/types/config';

interface GridGenerationParams {
    width: number;
    height: number;
    gridSize: number;
    gridPattern: PresetConfig['gridPattern'];
    rows?: number;
    cols?: number;
    spacing?: number;
    margin?: number;
    color: string;
    length: number;
}

const generateRegularGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;

    const effectiveWidth = width - margin * 2;
    const effectiveHeight = height - margin * 2;

    for (let y = margin; y < effectiveHeight; y += gridSize) {
        for (let x = margin; x < effectiveWidth; x += gridSize) {
            vectors.push({
                id: `v_${idCounter++}`,
                x,
                y,
                angle: 0,
                color,
                length,
            });
        }
    }
    return vectors;
}

const generateHexagonalGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const hexWidth = Math.sqrt(3) * gridSize;
    const hexHeight = 2 * gridSize * 0.75;

    let row = 0;
    for (let y = margin; y + gridSize / 2 < height - margin; y += hexHeight) {
        let col = 0;
        for (let x = margin; x + hexWidth / 2 < width - margin; x += hexWidth) {
            const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
            if (x + offsetX < width - margin) {
                 vectors.push({
                    id: `v_${idCounter++}`,
                    x: x + offsetX,
                    y: y,
                    angle: 0,
                    color,
                    length,
                });
            }
            col++;
        }
        row++;
    }
    return vectors;
}

const generateFibonacciGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    const numVectors = gridSize * 10; // Usamos gridSize para controlar la densidad
    const centerX = width / 2;
    const centerY = height / 2;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const goldenAngle = 2 * Math.PI * (2 - phi); // Approx 137.5 degrees in radians

    for (let i = 0; i < numVectors; i++) {
        const r = Math.sqrt(i) * (Math.min(width, height) / Math.sqrt(numVectors)) / 2;
        const theta = i * goldenAngle;
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);

        if (x > margin && x < width - margin && y > margin && y < height - margin) {
            vectors.push({
                id: `v_${i}`,
                x,
                y,
                angle: theta, // Angulo inicial orientado hacia afuera
                color,
                length,
            });
        }
    }
    return vectors;
}

const generateRadialGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const numRings = Math.floor(gridSize / 20); // Densidad basada en gridSize
    const numSpokes = Math.floor(gridSize / 10);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - margin;

    for (let i = 1; i <= numRings; i++) {
        const radius = (i / numRings) * maxRadius;
        for (let j = 0; j < numSpokes; j++) {
            const angle = (j / numSpokes) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            vectors.push({
                id: `v_${idCounter++}`,
                x,
                y,
                angle: angle,
                color,
                length,
            });
        }
    }
    return vectors;
};

// El patrón Golden Angle es esencialmente el mismo que Fibonacci/Phyllotaxis.
// Podemos simplemente reutilizar la función.
const generateGoldenAngleGrid = generateFibonacciGrid;

const generateStaggeredGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const staggerAmount = gridSize / 2;

    for (let y = margin, row = 0; y < height - margin; y += gridSize, row++) {
        const xOffset = row % 2 === 0 ? 0 : staggerAmount;
        for (let x = margin + xOffset; x < width - margin; x += gridSize) {
            vectors.push({ id: `v_${idCounter++}`, x, y, angle: 0, color, length });
        }
    }
    return vectors;
}

const generateTriangularGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const triHeight = gridSize * Math.sqrt(3) / 2;

    for (let y = margin, row = 0; y < height - margin; y += triHeight, row++) {
        const xOffset = row % 2 === 0 ? 0 : gridSize / 2;
        for (let x = margin + xOffset; x < width - margin; x += gridSize) {
             vectors.push({ id: `v_${idCounter++}`, x, y, angle: Math.PI / 2, color, length });
        }
    }
    return vectors;
}

const generatePolarGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - margin;
    const numRings = Math.floor(maxRadius / (gridSize * 2)); // Ajustar densidad
    const numSpokes = Math.floor(gridSize / 5);

    for (let i = 1; i <= numRings; i++) {
        const radius = (i / numRings) * maxRadius;
        const pointsOnRing = numSpokes * i;
        for (let j = 0; j < pointsOnRing; j++) {
            const angle = (j / pointsOnRing) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            vectors.push({ id: `v_${idCounter++}`, x, y, angle: angle + Math.PI / 2, color, length });
        }
    }
    return vectors;
};

const generateLogSpiralGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const a = 5; // Start distance from center
    const b = 0.2; // Tightness of the spiral
    const maxRadius = Math.min(width, height) / 2 - margin;

    for (let angle = 0; ; angle += Math.PI / (gridSize / 2)) {
        const r = a * Math.exp(b * angle);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (r > maxRadius) break;
        vectors.push({ id: `v_${idCounter++}`, x, y, angle, color, length });
    }
    return vectors;
}

const generateConcentricSquaresGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    let idCounter = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - margin;
    
    for (let r = gridSize; r <= maxRadius; r += gridSize) {
        const pointsPerSide = Math.floor(r * 2 / gridSize);
        for(let i = 0; i < pointsPerSide; i++) {
            // Top, Right, Bottom, Left
            vectors.push({ id: `v_${idCounter++}`, x: centerX - r + i * (r*2/pointsPerSide), y: centerY - r, angle: 0, color, length });
            vectors.push({ id: `v_${idCounter++}`, x: centerX + r, y: centerY - r + i * (r*2/pointsPerSide), angle: Math.PI / 2, color, length });
            vectors.push({ id: `v_${idCounter++}`, x: centerX + r - i * (r*2/pointsPerSide), y: centerY + r, angle: Math.PI, color, length });
            vectors.push({ id: `v_${idCounter++}`, x: centerX - r, y: centerY + r - i * (r*2/pointsPerSide), angle: -Math.PI / 2, color, length });
        }
    }
    return vectors;
}

// Para Voronoi, necesitamos una implementación más compleja. 
// Por ahora, devolveremos una parrilla aleatoria como placeholder.
const generateVoronoiGrid = (params: GridGenerationParams): Vector[] => {
    const { width, height, gridSize, margin = 20, color, length } = params;
    const vectors: Vector[] = [];
    const numPoints = gridSize * 10;
    for(let i = 0; i < numPoints; i++) {
        vectors.push({
            id: `v_${i}`,
            x: margin + Math.random() * (width - margin*2),
            y: margin + Math.random() * (height - margin*2),
            angle: Math.random() * 2 * Math.PI,
            color, length
        });
    }
    return vectors;
}

export const generateInitialVectors = (params: GridGenerationParams): Vector[] => {
    switch (params.gridPattern) {
        case 'regular':
            return generateRegularGrid(params);
        case 'hexagonal':
            return generateHexagonalGrid(params);
        case 'fibonacci':
            return generateFibonacciGrid(params);
        case 'radial':
            return generateRadialGrid(params);
        case 'golden':
            return generateGoldenAngleGrid(params);
        case 'staggered':
            return generateStaggeredGrid(params);
        case 'triangular':
            return generateTriangularGrid(params);
        case 'polar':
            return generatePolarGrid(params);
        case 'logSpiral':
            return generateLogSpiralGrid(params);
        case 'concentricSquares':
            return generateConcentricSquaresGrid(params);
        case 'voronoi':
            return generateVoronoiGrid(params);
        default:
            console.warn(`Grid pattern "${params.gridPattern}" not implemented. Falling back to regular grid.`);
            return generateRegularGrid(params);
    }
};
