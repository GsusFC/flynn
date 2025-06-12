'use client';

import React, { useState } from 'react';
import { SimpleTabs } from '@/components/ui/SimpleTabs';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface LengthDynamicsPanelProps {
  onShowHelp: () => void;
}

export const LengthDynamicsPanel: React.FC<LengthDynamicsPanelProps> = ({ onShowHelp }) => {
  const [activeTab, setActiveTab] = useState('Oscillation');
  
  // Select primitive values directly from the store
  const lengthMin = useConfigStore(state => state.lengthMin);
  const lengthMax = useConfigStore(state => state.lengthMax);
  const oscillationFreq = useConfigStore(state => state.oscillationFreq);
  const oscillationAmp = useConfigStore(state => state.oscillationAmp);
  const spatialFactor = useConfigStore(state => state.spatialFactor);
  const spatialMode = useConfigStore(state => state.spatialMode);
  const mouseInfluence = useConfigStore(state => state.mouseInfluence);
  const mouseMode = useConfigStore(state => state.mouseMode);
  const physicsMode = useConfigStore(state => state.physicsMode);
  const setConfig = useConfigStore(state => state.setConfig);

  const TABS = [
    { id: 'Oscillation', label: 'Oscilación' },
    { id: 'Spatial', label: 'Espacial' },
    { id: 'Mouse', label: 'Ratón' },
    { id: 'Physics', label: 'Física' },
  ];
  
  const selectClassName = cn(
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );
  const optionClassName = "bg-background text-foreground";

  const contentMap: Record<string, React.ReactNode> = {
    Oscillation: (
      <div className="grid gap-4">
        <SliderWithInput label="Longitud Mín" min={1} max={300} step={1} value={lengthMin} onChange={(val) => setConfig({ lengthMin: val })} />
        <SliderWithInput label="Longitud Máx" min={1} max={300} step={1} value={lengthMax} onChange={(val) => setConfig({ lengthMax: val })} />
        <SliderWithInput label="Frec. Oscilación" min={0.1} max={10} step={0.1} value={oscillationFreq} onChange={(val) => setConfig({ oscillationFreq: val })} />
        <SliderWithInput label="Amp. Oscilación" min={0} max={1} step={0.05} value={oscillationAmp} onChange={(val) => setConfig({ oscillationAmp: val })} />
      </div>
    ),
    Spatial: (
      <div className="grid gap-4">
        <SliderWithInput label="Factor Espacial" min={0} max={1} step={0.05} value={spatialFactor} onChange={(val) => setConfig({ spatialFactor: val })} />
        <div className="grid gap-2">
          <label htmlFor="spatial-mode">Modo Espacial</label>
          <select id="spatial-mode" value={spatialMode} onChange={(e) => setConfig({ spatialMode: e.target.value as any })} className={selectClassName}>
            <option value="edge" className={optionClassName}>Desde Bordes</option>
            <option value="center" className={optionClassName}>Desde Centro</option>
            <option value="mixed" className={optionClassName}>Mixto</option>
          </select>
        </div>
      </div>
    ),
    Mouse: (
      <div className="grid gap-4">
        <SliderWithInput label="Influencia Ratón" min={0} max={1} step={0.05} value={mouseInfluence} onChange={(val) => setConfig({ mouseInfluence: val })} />
        <div className="grid gap-2">
          <label htmlFor="mouse-mode">Modo Ratón</label>
          <select id="mouse-mode" value={mouseMode} onChange={(e) => setConfig({ mouseMode: e.target.value as any })} className={selectClassName}>
            <option value="attract" className={optionClassName}>Atraer</option>
            <option value="repel" className={optionClassName}>Repeler</option>
            <option value="stretch" className={optionClassName}>Estirar</option>
          </select>
        </div>
      </div>
    ),
    Physics: (
      <div className="grid gap-2">
        <label htmlFor="physics-mode">Modo Física</label>
        <select id="physics-mode" value={physicsMode} onChange={(e) => setConfig({ physicsMode: e.target.value as any })} className={selectClassName}>
          <option value="none" className={optionClassName}>Ninguno</option>
          <option value="velocity" className={optionClassName}>Basado en Velocidad</option>
          <option value="pressure" className={optionClassName}>Basado en Presión</option>
          <option value="field" className={optionClassName}>Basado en Campo</option>
        </select>
      </div>
    )
  };

  return (
    <div className="pt-2">
        <SimpleTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="pt-4">
          {contentMap[activeTab]}
        </div>
        <button onClick={onShowHelp} className="mt-4 text-sm w-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4 mr-2" />
          Ver ayuda de Dinámicas de Longitud
        </button>
    </div>
  );
}; 