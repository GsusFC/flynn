// Panel de control de colores usando el nuevo ColorSystem
// Reemplaza la lógica mezclada en page.tsx

'use client';

import React, { useMemo } from 'react';
import { useColorSystem } from '@/hooks/useColorSystem';
import { 
  ColorFactory, 
  COLOR_CATEGORIES, 
  type VectorColor, 
  type ColorMode 
} from '@/domain/color';

interface ColorPanelProps {
  currentColor: VectorColor;
  onColorChange: (color: VectorColor) => void;
  debugMode?: boolean;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({
  currentColor,
  onColorChange,
  debugMode = false
}) => {
  const { presets, getPresets, defaultColor } = useColorSystem({ debugMode });

  // Determinar el modo actual
  const currentMode: ColorMode = currentColor.type;

  // Manejar cambio de modo
  const handleModeChange = (mode: ColorMode) => {
    switch (mode) {
      case 'solid':
        onColorChange(ColorFactory.solid('#10b981'));
        break;
      case 'gradient':
        onColorChange(getPresets('gradient')['sunset']);
        break;
      case 'hsl':
        onColorChange(ColorFactory.hslRainbow());
        break;
      case 'dynamic':
        // Para implementar en futuras fases
        onColorChange(defaultColor);
        break;
    }
  };

  // Renderizar controles según el modo
  const renderModeControls = () => {
    switch (currentMode) {
      case 'solid':
        return renderSolidControls();
      case 'gradient':
        return renderGradientControls();
      case 'hsl':
        return renderHSLControls();
      default:
        return null;
    }
  };

  const renderSolidControls = () => {
    if (currentColor.type !== 'solid') return null;

    return (
      <div className="space-y-2">
        <input 
          type="color" 
          value={currentColor.value} 
          onChange={(e) => onColorChange(ColorFactory.solid(e.target.value))}
          className="w-full h-8 border border-sidebar-border rounded"
        />
        
        {/* Presets sólidos */}
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(getPresets('solid')).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => onColorChange(preset)}
              className="w-8 h-8 rounded border border-sidebar-border hover:scale-110 transition-transform"
              style={{ backgroundColor: preset.type === 'solid' ? preset.value : '#ccc' }}
              title={name}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderGradientControls = () => {
    return (
      <div className="space-y-2">
        <select 
          value={Object.keys(getPresets('gradient')).find(key => 
            JSON.stringify(getPresets('gradient')[key]) === JSON.stringify(currentColor)
          ) || 'sunset'}
          onChange={(e) => onColorChange(getPresets('gradient')[e.target.value])}
          className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
        >
          {Object.entries(getPresets('gradient')).map(([key, gradient]) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        
        {/* Preview del gradiente */}
        {currentColor.type === 'gradient' && (
          <div 
            className="w-full h-6 border border-sidebar-border rounded"
            style={{
              background: currentColor.variant === 'linear' 
                ? `linear-gradient(${currentColor.angle || 0}deg, ${currentColor.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
                : `radial-gradient(circle, ${currentColor.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
            }}
          />
        )}
      </div>
    );
  };

  const renderHSLControls = () => {
    if (currentColor.type !== 'hsl') return null;

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
            Variante
          </label>
          <select 
            value={currentColor.variant}
            onChange={(e) => onColorChange({
              ...currentColor,
              variant: e.target.value as 'rainbow' | 'flow' | 'cycle'
            })}
            className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded"
          >
            <option value="rainbow">🌈 Arcoiris</option>
            <option value="flow">🌊 Flujo</option>
            <option value="cycle">🔄 Ciclo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
            Velocidad: {currentColor.speed.toFixed(4)}
          </label>
          <input 
            type="range" 
            min="0.0001" 
            max="0.01" 
            step="0.0001"
            value={currentColor.speed}
            onChange={(e) => onColorChange({
              ...currentColor,
              speed: parseFloat(e.target.value)
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
            Saturación: {currentColor.saturation}%
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={currentColor.saturation}
            onChange={(e) => onColorChange({
              ...currentColor,
              saturation: parseInt(e.target.value)
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
            Luminosidad: {currentColor.lightness}%
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={currentColor.lightness}
            onChange={(e) => onColorChange({
              ...currentColor,
              lightness: parseInt(e.target.value)
            })}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
      <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
        🎨 Sistema de Colores
      </h3>
      
      {/* Selector de modo */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-sidebar-foreground">
          Modo de Color
        </label>
        <select 
          value={currentMode}
          onChange={(e) => handleModeChange(e.target.value as ColorMode)}
          className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
        >
          <option value="solid">🎨 Color Sólido</option>
          <option value="gradient">🌈 Degradado</option>
          <option value="hsl">🔄 HSL Animado</option>
          <option value="dynamic">⚡ Dinámico (Próximamente)</option>
        </select>
      </div>
      
      {/* Controles específicos del modo */}
      {renderModeControls()}
      
      {debugMode && (
        <div className="mt-4 p-2 bg-sidebar border border-sidebar-border rounded">
          <div className="text-xs text-sidebar-foreground/60">
            <strong>Debug:</strong> {currentColor.type}
            <pre className="mt-1 text-xs">
              {JSON.stringify(currentColor, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};