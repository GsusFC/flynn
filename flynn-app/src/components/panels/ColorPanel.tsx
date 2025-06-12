'use client';

import React from 'react';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import type { CustomGradient } from '@/lib/customGradients';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';

interface ColorPanelProps {
  customGradients: CustomGradient[];
  onShowGradientEditor: () => void;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({ 
  customGradients, 
  onShowGradientEditor 
}) => {
  const colorMode = useConfigStore(state => state.colorMode);
  const solidColor = useConfigStore(state => state.solidColor);
  const gradientPalette = useConfigStore(state => state.gradientPalette);
  const colorIntensityMode = useConfigStore(state => state.colorIntensityMode);
  const colorHueShift = useConfigStore(state => state.colorHueShift);
  const colorSaturation = useConfigStore(state => state.colorSaturation);
  const colorBrightness = useConfigStore(state => state.colorBrightness);
  const setConfig = useConfigStore(state => state.setConfig);

  const selectClassName = cn(
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );
  
  const optionClassName = "bg-background text-foreground";

  return (
    <div className="grid gap-4 pt-2">
      {/* Color Mode Selector */}
      <div className="grid gap-2">
        <select
          id="color-mode"
          value={colorMode}
          onChange={(e) => setConfig({ colorMode: e.target.value as any })}
          className={selectClassName}
          aria-label="Modo de Color"
        >
          <option value="solid" className={optionClassName}>Sólido</option>
          <option value="gradient" className={optionClassName}>Gradiente</option>
          <option value="dynamic" className={optionClassName}>Dinámico</option>
        </select>
      </div>

      {/* Conditional Color Controls */}
      {colorMode === 'solid' && (
        <div className="grid gap-2">
          <input
            id="solid-color-picker"
            type="color"
            value={solidColor}
            onChange={(e) => setConfig({ solidColor: e.target.value })}
            className="w-full h-10 p-0 border-none cursor-pointer rounded-md bg-transparent"
            aria-label="Selector de color sólido"
          />
        </div>
      )}
      {colorMode === 'gradient' && (
        <div className="grid gap-2">
          <select
            id="gradient-palette"
            value={gradientPalette}
            onChange={(e) => setConfig({ gradientPalette: e.target.value })}
            className={selectClassName}
            aria-label="Paleta de gradiente"
          >
            <optgroup label="Presets">
              <option value="auroraBoreal" className={optionClassName}>Aurora Boreal</option>
              <option value="flow" className={optionClassName}>Flow</option>
              <option value="rainbow" className={optionClassName}>Rainbow</option>
              <option value="cosmic" className={optionClassName}>Cosmic</option>
              <option value="pulse" className={optionClassName}>Pulse</option>
              <option value="subtle" className={optionClassName}>Subtle</option>
              <option value="sunset" className={optionClassName}>Sunset</option>
              <option value="ocean" className={optionClassName}>Ocean</option>
            </optgroup>
            {customGradients.length > 0 && (
              <optgroup label="Custom">
                {customGradients.map(g => (
                  <option key={g.id} value={g.id} className={optionClassName}>{g.name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <button
            onClick={onShowGradientEditor}
            className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Editar Gradientes...
          </button>
        </div>
      )}
      {colorMode === 'dynamic' && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <select
              id="color-intensity-mode"
              value={colorIntensityMode}
              onChange={(e) => setConfig({ colorIntensityMode: e.target.value as any })}
              className={selectClassName}
              aria-label="Modo de intensidad de color"
            >
              <option value="field" className={optionClassName}>Intensidad</option>
              <option value="velocity" className={optionClassName}>Velocidad</option>
              <option value="distance" className={optionClassName}>Distancia al centro</option>
              <option value="angle" className={optionClassName}>Ángulo</option>
            </select>
          </div>
          <SliderWithInput label="Tono" min={0} max={5} step={0.1} value={colorHueShift} onChange={(val) => setConfig({colorHueShift: val})} />
          <SliderWithInput label="Saturación" min={0} max={100} step={1} value={colorSaturation} onChange={(val) => setConfig({colorSaturation: val})} suffix="%" />
          <SliderWithInput label="Brillo" min={0} max={100} step={1} value={colorBrightness} onChange={(val) => setConfig({colorBrightness: val})} suffix="%" />
        </div>
      )}
    </div>
  );
}; 