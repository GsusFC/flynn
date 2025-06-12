'use client';

import { useConfigStore } from "@/store/configStore";
import { cn } from "@/lib/utils";

export default function MathPatternControls() {
    const gridSize = useConfigStore(state => state.gridSize);
    const setConfig = useConfigStore(state => state.setConfig);

    const handleGridSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value);
        setConfig({
            gridSize: newSize,
            rows: 0, // Reset rows/cols
            cols: 0
        });
    };

    const selectClassName = cn(
      "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50"
    );
    const optionClassName = "bg-background text-foreground";

    return (
        <div className="grid gap-2 pt-2">
            <label htmlFor="grid-size-selector">Densidad de Vectores</label>
            <select
                id="grid-size-selector"
                value={gridSize}
                onChange={handleGridSizeChange}
                className={selectClassName}
            >
                <option value={16} className={optionClassName}>16 vectores ⚡ Rápido</option>
                <option value={25} className={optionClassName}>25 vectores ⚡ Rápido</option>
                <option value={49} className={optionClassName}>49 vectores ⚡ Rápido</option>
                <option value={100} className={optionClassName}>100 vectores 🚀 Óptimo</option>
                <option value={400} className={optionClassName}>400 vectores 🔥 Denso</option>
                <option value={900} className={optionClassName}>900 vectores 🖥️ Lienzo</option>
            </select>
        </div>
    );
} 