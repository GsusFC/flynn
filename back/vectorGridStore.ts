// src/stores/vectorGridStore.ts
import { create } from 'zustand';
import { createAnimationSlice, type AnimationSlice, INITIAL_ANIMATION_STATE } from './animationSlice'; // Importar el slice
import type {
  // AnimationType, AnimationProps, // Estos ahora vienen de AnimationSlice
  VectorGridCoreProps as OriginalVectorGridCoreProps,
  GridSettings as OriginalGridSettings,
  VectorSettings,
  VectorShape,
  StrokeLinecap,
  RotationOrigin,
  VectorColorValue
} from '../core/types';

// --- Tipos Actualizados ---
export interface GridSettings extends OriginalGridSettings {
  distributeItems?: boolean;
}

// Propiedades principales SIN las de animación
interface VectorGridBaseProps extends Omit<OriginalVectorGridCoreProps,
  'animationType' | 'animationProps' | 'easingFactor' | 'timeScale' |
  'dynamicLengthEnabled' | 'dynamicWidthEnabled' | 'dynamicIntensity' | 'isPaused'
> {
  gridSettings: GridSettings;
}


interface MousePosition {
  x: number | null;
  y: number | null;
}

interface CalculatedGridDimensions {
  width: number;
  height: number;
  effectiveWidth: number;
  effectiveHeight: number;
  offsetX: number;
  offsetY: number;
  actualSpacingX: number;
  actualSpacingY: number;
}

// Estado inicial para la parte NO de animación
const INITIAL_GRID_VECTOR_STATE: VectorGridBaseProps = {
  gridSettings: {
    rows: 12,
    cols: 18,
    spacing: 30,
    margin: 20,
    distributeItems: true,
  },
  vectorSettings: {
    vectorShape: 'arrow',
    vectorLength: 24,
    vectorWidth: 4,
    vectorColor: '#3b82f6',
    strokeLinecap: 'round',
    rotationOrigin: 'center'
  },
  backgroundColor: '#0a0a0a',
  throttleMs: 16,
  // Las props de animación ya no están aquí
};

// Acciones para la parte NO de animación
interface VectorGridBaseActions {
  setGridSettings: (settings: Partial<GridSettings>) => void;
  updateCalculatedGridDimensions: (dimensions: Pick<CalculatedGridDimensions, 'width' | 'height'>) => void;
  setVectorSettings: (settings: Partial<VectorSettings>) => void;
  setVectorShape: (shape: VectorShape) => void;
  setVectorLength: (length: number) => void;
  setVectorWidth: (width: number) => void;
  setVectorColor: (color: VectorColorValue) => void;
  setStrokeLinecap: (linecap: StrokeLinecap) => void;
  setRotationOrigin: (origin: RotationOrigin) => void;
  setThrottleMs: (ms: number) => void;
  updateProps: ( // Solo actualiza props base, las de animación se manejan por su slice
    props: Partial<VectorGridBaseProps>
  ) => void;
  // updateAnimationSettings ya no es necesario aquí, se maneja en AnimationSlice
  triggerPulse: () => void; // Podría quedar aquí si afecta a algo más que la animación
  getExportableState: () => VectorGridBaseProps & AnimationState; // Ahora exporta ambas partes
  resetToDefaults: () => void;
  setMousePosition: (position: MousePosition) => void;
}


// Interfaz completa del store: combina el estado base, el slice de animación y las acciones
export interface VectorGridState extends VectorGridBaseProps, AnimationSlice, VectorGridBaseActions {
  mousePosition: MousePosition;
  calculatedGridDimensions: CalculatedGridDimensions;
}

// Helper para recalcular espaciados y offsets (sin cambios)
const recalculateGridGeometry = (
  currentGridSettings: GridSettings,
  currentSvgWidth: number,
  currentSvgHeight: number
): Omit<CalculatedGridDimensions, 'width'|'height'> => {
  const { rows, cols, margin, spacing, distributeItems } = currentGridSettings;
  const effectiveWidth = Math.max(0, currentSvgWidth - margin * 2);
  const effectiveHeight = Math.max(0, currentSvgHeight - margin * 2);
  let actualSpacingX: number;
  let actualSpacingY: number;

  if (distributeItems) {
    actualSpacingX = cols > 0 ? effectiveWidth / cols : 0;
    actualSpacingY = rows > 0 ? effectiveHeight / rows : 0;
  } else {
    actualSpacingX = spacing;
    actualSpacingY = spacing;
  }
  let gridContentWidth: number = distributeItems ? effectiveWidth : cols * spacing;
  let gridContentHeight: number = distributeItems ? effectiveHeight : rows * spacing;
  const offsetX = margin + (effectiveWidth - gridContentWidth) / 2;
  const offsetY = margin + (effectiveHeight - gridContentHeight) / 2;
  return { effectiveWidth, effectiveHeight, offsetX, offsetY, actualSpacingX, actualSpacingY };
};

// Crear el store con Zustand, combinando los slices
export const useVectorGridStore = create<VectorGridState>()((set, get, api) => {
  const initialGeometry = recalculateGridGeometry(INITIAL_GRID_VECTOR_STATE.gridSettings, 0, 0);

  return {
    // Estado inicial de la parte base
    ...INITIAL_GRID_VECTOR_STATE,
    mousePosition: { x: null, y: null },
    calculatedGridDimensions: {
      width: 0,
      height: 0,
      ...initialGeometry,
    },

    // Integrar el slice de animación
    // Las funciones de 'set' dentro de createAnimationSlice ahora operarán
    // sobre el estado global de VectorGridState.
    ...createAnimationSlice(
      (partial) => set(partial as Partial<VectorGridState>), // casteamos para que set funcione
      () => get() as VectorGridState, // casteamos para que get funcione
      api as any // casteamos para que api funcione
    ),

    // Acciones de la parte base
    setGridSettings: (settingsUpdate) =>
      set((state) => {
        const newGridSettings = { ...state.gridSettings, ...settingsUpdate };
        const newGeometry = recalculateGridGeometry(
          newGridSettings,
          state.calculatedGridDimensions.width,
          state.calculatedGridDimensions.height
        );
        return {
          gridSettings: newGridSettings,
          calculatedGridDimensions: {
            ...state.calculatedGridDimensions,
            ...newGeometry,
          },
        };
      }),
    updateCalculatedGridDimensions: ({ width, height }) =>
      set((state) => {
        const newGeometry = recalculateGridGeometry(state.gridSettings, width, height);
        return { calculatedGridDimensions: { width, height, ...newGeometry } };
      }),
    setVectorSettings: (settings) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, ...settings } })),
    setVectorShape: (shape) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, vectorShape: shape } })),
    setVectorLength: (length) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, vectorLength: length } })),
    setVectorWidth: (width) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, vectorWidth: width } })),
    setVectorColor: (color) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, vectorColor: color } })),
    setStrokeLinecap: (linecap) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, strokeLinecap: linecap } })),
    setRotationOrigin: (origin) =>
        set((state) => ({ vectorSettings: { ...state.vectorSettings, rotationOrigin: origin } })),
    setThrottleMs: (ms) => set({ throttleMs: ms }),
    updateProps: (props) => {
        set((state) => {
            const newState = { ...state, ...props };
            if (props.gridSettings) {
                const newGeometry = recalculateGridGeometry(
                    newState.gridSettings,
                    newState.calculatedGridDimensions.width,
                    newState.calculatedGridDimensions.height
                );
                newState.calculatedGridDimensions = { ...newState.calculatedGridDimensions, ...newGeometry };
            }
            return newState;
        });
    },
    triggerPulse: () => { console.log("Pulse effect triggered (implement actual logic)"); },
    getExportableState: () => {
        const {
            // Excluir funciones de acción y estado no exportable del estado actual
            setGridSettings, updateCalculatedGridDimensions, setVectorSettings,
            setVectorShape, setVectorLength, setVectorWidth, setVectorColor,
            setStrokeLinecap, setRotationOrigin, setThrottleMs, updateProps,
            triggerPulse, getExportableState, resetToDefaults, setMousePosition,
            setAnimationType, updateAnimationProps, setEasingFactor, setTimeScale,
            setDynamicLengthEnabled, setDynamicWidthEnabled, setDynamicIntensity,
            togglePause, mousePosition, calculatedGridDimensions,
            ...exportableState
        } = get();
        return exportableState as VectorGridBaseProps & AnimationState; // Tipado más preciso
    },
    resetToDefaults: () => {
      const currentCalculatedDims = get().calculatedGridDimensions;
      const newInitialGeometry = recalculateGridGeometry(
        INITIAL_GRID_VECTOR_STATE.gridSettings,
        currentCalculatedDims.width,
        currentCalculatedDims.height
      );
      set({
        ...INITIAL_GRID_VECTOR_STATE,
        ...INITIAL_ANIMATION_STATE, // También resetea el estado de animación
        mousePosition: { x: null, y: null }, // Opcional: resetear mouse si es necesario
        calculatedGridDimensions: {
            width: currentCalculatedDims.width, // Mantener dimensiones actuales del SVG
            height: currentCalculatedDims.height,
            ...newInitialGeometry,
        },
      });
    },
    setMousePosition: (position) => set({ mousePosition: position }),
  };
});

export const useVectorGridSelector = <T>(
  selector: (state: VectorGridState) => T,
) => useVectorGridStore(selector);