'use client';

import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';

export const GridPanel = () => {
    const gridMode = useConfigStore(state => state.gridMode);
    const rows = useConfigStore(state => state.rows);
    const cols = useConfigStore(state => state.cols);
    const spacing = useConfigStore(state => state.spacing);
    const gridSize = useConfigStore(state => state.gridSize);
    const gridPattern = useConfigStore(state => state.gridPattern);
    const setConfig = useConfigStore(state => state.setConfig);

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value as 'basic' | 'math';
        setConfig({ gridMode: newMode });
    };

    const selectClassName = cn(
      "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50"
    );
    const optionClassName = "bg-background text-foreground";

    return (
        <div className="grid gap-4 pt-2">
            <div className="grid gap-2">
                <select
                    id="grid-mode-selector"
                    value={gridMode}
                    onChange={handleModeChange}
                    className={selectClassName}
                    aria-label="Modo de Cuadrícula"
                >
                    <option value="basic" className={optionClassName}>Básico (Filas/Columnas)</option>
                    <option value="math" className={optionClassName}>Matemático (Densidad)</option>
                </select>
            </div>

            {gridMode === 'basic' && (
                <>
                    <SliderWithInput
                        label="Filas"
                        value={rows}
                        min={1}
                        max={50}
                        step={1}
                        onChange={val => setConfig({ rows: val })}
                    />
                    <SliderWithInput
                        label="Columnas"
                        value={cols}
                        min={1}
                        max={50}
                        step={1}
                        onChange={val => setConfig({ cols: val })}
                    />
                    <SliderWithInput
                        label="Espaciado"
                        value={spacing}
                        min={1}
                        max={100}
                        step={1}
                        onChange={val => setConfig({ spacing: val })}
                    />
                </>
            )}

            {gridMode === 'math' && (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <select
                            id="grid-pattern-selector"
                            value={gridPattern}
                            onChange={e => setConfig({ gridPattern: e.target.value as any })}
                            className={selectClassName}
                            aria-label="Patrón Matemático"
                        >
                            <option value="fibonacci" className={optionClassName}>Fibonacci (Phyllotaxis)</option>
                            <option value="golden" className={optionClassName}>Golden Angle</option>
                            <option value="radial" className={optionClassName}>Radial</option>
                            <option value="polar" className={optionClassName}>Coordenadas Polares</option>
                            <option value="logSpiral" className={optionClassName}>Espiral Logarítmica</option>
                            <option value="hexagonal" className={optionClassName}>Hexagonal</option>
                            <option value="triangular" className={optionClassName}>Triangular</option>
                            <option value="staggered" className={optionClassName}>Escalonado (Staggered)</option>
                            <option value="concentricSquares" className={optionClassName}>Cuadrados Concéntricos</option>
                            <option value="voronoi" className={optionClassName}>Voronoi (Experimental)</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <select
                            id="grid-size-selector"
                            value={gridSize}
                            onChange={e => setConfig({ gridSize: parseInt(e.target.value) })}
                            className={selectClassName}
                            aria-label="Densidad de Vectores"
                        >
                            <option value={100} className={optionClassName}>100 vectores 🚀 Óptimo</option>
                            <option value={400} className={optionClassName}>400 vectores 🔥 Denso</option>
                            <option value={900} className={optionClassName}>900 vectores 🖥️ Lienzo</option>
                            <option value={1600} className={optionClassName}>1600 vectores 🤯 Extremo</option>
                            <option value={2500} className={optionClassName}>2500 vectores 💥 Locura</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}; 