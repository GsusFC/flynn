import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface CellularAutomataProps {
  birthCount: number;
  survivalCount1: number;
  survivalCount2: number;
  updateInterval: number; // en frames
  seed: number;
}

// --- Estado de la Simulación ---
let grid: number[][] = [];
let gridWidth = 0;
let gridHeight = 0;
let vectorToGridMap: { row: number, col: number }[] = [];
let lastSeed = -1;
let frameCounter = 0;
let isInitialized = false;

// --- Lógica de Inicialización ---
function initializeGrid(vectors: Readonly<Vector[]>, seed: number) {
  const uniqueX = [...new Set(vectors.map(v => v.x))].sort((a, b) => a - b);
  const uniqueY = [...new Set(vectors.map(v => v.y))].sort((a, b) => a - b);
  gridWidth = uniqueX.length;
  gridHeight = uniqueY.length;

  if (gridWidth === 0 || gridHeight === 0) return;

  const mapX = new Map(uniqueX.map((x, i) => [x, i]));
  const mapY = new Map(uniqueY.map((y, i) => [y, i]));

  vectorToGridMap = vectors.map(v => ({ col: mapX.get(v.x)!, row: mapY.get(v.y)! }));

  // Usar la semilla para un resultado determinista
  let simpleSeed = seed;
  const pseudoRandom = () => {
    const x = Math.sin(simpleSeed++) * 10000;
    return x - Math.floor(x);
  };

  grid = Array.from({ length: gridHeight }, () => 
    Array.from({ length: gridWidth }, () => (pseudoRandom() > 0.6 ? 1 : 0))
  );
  
  lastSeed = seed;
  isInitialized = true;
}

// --- Lógica de la Animación ---
const applyCellularAutomata = ({ vectors, props, time }: AnimationFrameData<CellularAutomataProps>): AnimationResult => {
  if (!isInitialized || props.seed !== lastSeed || vectorToGridMap.length !== vectors.length) {
    initializeGrid(vectors, props.seed);
  }

  if (!isInitialized) {
    return { vectors: [...vectors], animationData: [] };
  }

  frameCounter++;
  if (frameCounter >= props.updateInterval) {
    frameCounter = 0;

    const nextGrid = grid.map(arr => [...arr]);

    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        // Contar vecinos vivos (con bordes toroidales)
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const neighborRow = (row + i + gridHeight) % gridHeight;
            const neighborCol = (col + j + gridWidth) % gridWidth;
            liveNeighbors += grid[neighborRow][neighborCol];
          }
        }

        // Aplicar reglas
        const state = grid[row][col];
        if (state === 0 && liveNeighbors === props.birthCount) {
          nextGrid[row][col] = 1; // Nacimiento
        } else if (state === 1 && (liveNeighbors < props.survivalCount1 || liveNeighbors > props.survivalCount2)) {
          nextGrid[row][col] = 0; // Muerte por soledad o sobrepoblación
        }
      }
    }
    grid = nextGrid;
  }
  
  // Mapear estado de la retícula a los vectores
  const newVectors = vectors.map((vec, i) => {
      if (!vectorToGridMap[i]) return { ...vec, animationData: { isAlive: 0 } };
      
      const { row, col } = vectorToGridMap[i];
      const isAlive = grid[row][col] === 1;
      
      // La animación solo se encarga de devolver el ESTADO.
      // El motor (useVectorAnimation) se encargará de la APARIENCIA.
      return {
          ...vec,
          // Devolvemos el estado en animationData
          animationData: { isAlive } 
      };
  });

  const allAnimationData = newVectors.map(v => v.animationData);
  
  // La función debe devolver un array de vectores y un array de datos
  return { vectors: newVectors.map(({ animationData, ...rest}) => rest), animationData: allAnimationData };
};

const cellularAutomataMeta: AnimationMeta<CellularAutomataProps> = {
  id: 'cellularAutomata',
  name: 'Cellular Automata',
  description: "Una simulación tipo 'Juego de la Vida' de Conway.",
  category: 'core',
  icon: 'grid',
  
  controls: [
    { id: 'updateInterval', type: 'slider', label: 'Intervalo (frames)', min: 1, max: 60, step: 1, defaultValue: 10 },
    { id: 'birthCount', type: 'slider', label: 'Cond. Nacimiento', min: 1, max: 8, step: 1, defaultValue: 3 },
    { id: 'survivalCount1', type: 'slider', label: 'Min. Supervivencia', min: 1, max: 8, step: 1, defaultValue: 2 },
    { id: 'survivalCount2', type: 'slider', label: 'Max. Supervivencia', min: 1, max: 8, step: 1, defaultValue: 3 },
    { id: 'seed', type: 'slider', label: 'Semilla Aleatoria', min: 0, max: 1000, step: 1, defaultValue: 0 },
  ],
  
  defaultProps: {
    updateInterval: 10,
    birthCount: 3,
    survivalCount1: 2,
    survivalCount2: 3,
    seed: 0,
  },
  
  apply: applyCellularAutomata,
  // La longitud la controla AHORA el sistema Length Dynamics,
  // pero modulado por el estado que devolvemos.
  enableLengthDynamics: true, 
};

registerAnimation(cellularAutomataMeta); 