'use client';

import { SliderWithInput } from "@/components/features/vector-grid/components/SliderWithInput";
import { useConfigStore } from "@/store/configStore";

export default function CanvasGridControls() {
    const rows = useConfigStore(state => state.rows);
    const cols = useConfigStore(state => state.cols);
    const spacing = useConfigStore(state => state.spacing);
    const setConfig = useConfigStore(state => state.setConfig);

    return (
        <div className="grid gap-4 pt-2">
            <SliderWithInput
                label="Filas"
                value={rows}
                min={2}
                max={50}
                step={1}
                onChange={val => setConfig({ rows: val, gridSize: 0 })}
            />
            <SliderWithInput
                label="Columnas"
                value={cols}
                min={2}
                max={50}
                step={1}
                onChange={val => setConfig({ cols: val, gridSize: 0 })}
            />
            <SliderWithInput
                label="Espaciado"
                value={spacing}
                min={20}
                max={200}
                step={5}
                onChange={(value) => setConfig({ spacing: value })}
                suffix="px"
            />
        </div>
    );
} 