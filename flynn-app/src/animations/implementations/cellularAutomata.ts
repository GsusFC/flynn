import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

interface CellularAutomataProps {
  birthCount: number;
  survivalCount1: number;
  survivalCount2: number;
  updateInterval: number; // en frames
  seed: number;
}

// --- Estado de la Simulación Encapsulado ---
interface CellularAutomataState {
  grid: number[][];
  gridWidth: number;
  gridHeight: number;
  vectorToGridMap: { row: number, col: number }[];
  lastSeed: number;
  frameCounter: number;
  isInitialized: boolean;
}

// WeakMap para almacenar estado por instancia de animación.
// Usamos la referencia de `vectors` como clave porque permanece estable mientras
// la cuadrícula no cambie, y es exclusiva de cada instancia de `FlynVectorGrid`.
// (Si en el futuro se dispone de un `instanceId` explícito, bastará con sustituir la clave.)
const instanceStates = new WeakMap<Readonly<Vector[]>, CellularAutomataState>();

// Función para obtener o crear el estado de la instancia según el array de vectores.
function getInstanceState(vectorsKey: Readonly<Vector[]>): CellularAutomataState {
  let state = instanceStates.get(vectorsKey);
  if (!state) {
    state = {
      grid: [],
      gridWidth: 0,
      gridHeight: 0,
      vectorToGridMap: [],
      lastSeed: -1,
      frameCounter: 0,
      isInitialized: false,
    };
    instanceStates.set(vectorsKey, state);
  }
  return state;
}

// --- Lógica de Inicialización ---
function initializeGrid(vectors: Readonly<Vector[]>, seed: number, state: CellularAutomataState) {
  const uniqueX = [...new Set(vectors.map(v => v.x))].sort((a, b) => a - b);
  const uniqueY = [...new Set(vectors.map(v => v.y))].sort((a, b) => a - b);
  state.gridWidth = uniqueX.length;
  state.gridHeight = uniqueY.length;

  if (state.gridWidth === 0 || state.gridHeight === 0) return;

  const mapX = new Map(uniqueX.map((x, i) => [x, i]));
  const mapY = new Map(uniqueY.map((y, i) => [y, i]));

  state.vectorToGridMap = vectors.map(v => ({ col: mapX.get(v.x)!, row: mapY.get(v.y)! }));

  // Usar la semilla para un resultado determinista
  let simpleSeed = seed;
  const pseudoRandom = () => {
    const x = Math.sin(simpleSeed++) * 10000;
    return x - Math.floor(x);
  };

  state.grid = Array.from({ length: state.gridHeight }, () => 
    Array.from({ length: state.gridWidth }, () => (pseudoRandom() > 0.6 ? 1 : 0))
  );
  
  state.lastSeed = seed;
  state.isInitialized = true;
}

// --- Lógica de la Animación ---
const applyCellularAutomata = (frameData: AnimationFrameData<CellularAutomataProps>): AnimationResult => {
  const { vectors, props } = frameData;
  const state = getInstanceState(vectors);

  if (!state.isInitialized || props.seed !== state.lastSeed || state.vectorToGridMap.length !== vectors.length) {
    initializeGrid(vectors, props.seed, state);
    state.frameCounter = 0; // Reset frameCounter after grid initialization
  }

  if (!state.isInitialized) {
    return { vectors: [...vectors], animationData: [] };
  }

  state.frameCounter++;
  if (state.frameCounter >= props.updateInterval) {
    state.frameCounter = 0;

    const nextGrid = state.grid.map(arr => [...arr]);

    for (let row = 0; row < state.gridHeight; row++) {
      for (let col = 0; col < state.gridWidth; col++) {
        // Contar vecinos vivos (con bordes toroidales)
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const neighborRow = (row + i + state.gridHeight) % state.gridHeight;
            const neighborCol = (col + j + state.gridWidth) % state.gridWidth;
            liveNeighbors += state.grid[neighborRow][neighborCol];
          }
        }

        // Aplicar reglas
        const cellState = state.grid[row][col];
        if (cellState === 0 && liveNeighbors === props.birthCount) {
          nextGrid[row][col] = 1; // Nacimiento
        } else if (cellState === 1 && (liveNeighbors < props.survivalCount1 || liveNeighbors > props.survivalCount2)) {
          nextGrid[row][col] = 0; // Muerte por soledad o sobrepoblación
        }
      }
    }
    state.grid = nextGrid;
  }
  
  // Mapear estado de la retícula a los vectores
  const newVectors = vectors.map((vec, i) => {
      if (!state.vectorToGridMap[i]) return { ...vec, animationData: { isAlive: 0 } };
      
      const { row, col } = state.vectorToGridMap[i];
      const isAlive = state.grid[row][col] === 1;
      
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