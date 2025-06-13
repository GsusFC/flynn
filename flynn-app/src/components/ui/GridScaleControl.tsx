import React from 'react';
import { useConfigStore } from '@/store/configStore';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';

export const GridScaleControl: React.FC = () => {
  const gridScale = useConfigStore(state => state.gridScale ?? 1);
  const setConfig = useConfigStore(state => state.setConfig);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/80 border border-neutral-700 rounded-lg px-4 py-2 backdrop-blur z-30 shadow-md flex items-center gap-3">
      <span className="text-sm text-white whitespace-nowrap">Escala cuadrícula</span>
      <div className="w-40">
        <SliderWithInput
          label=""
          value={gridScale}
          min={0.2}
          max={1}
          step={0.05}
          onChange={(val) => setConfig({ gridScale: val })}
          showInput={false}
        />
      </div>
    </div>
  );
}; 