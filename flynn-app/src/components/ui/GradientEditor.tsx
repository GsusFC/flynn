'use client';

import React, { useState, useCallback } from 'react';
import type { GradientColor, ColorStop } from '@/domain/color/types';

interface GradientEditorProps {
  gradient: GradientColor;
  onChange: (gradient: GradientColor) => void;
  onSave?: (name: string, gradient: GradientColor) => void;
  className?: string;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  gradient,
  onChange,
  onSave,
  className = ''
}) => {
  const [saveName, setSaveName] = useState('');
  const [isNaming, setIsNaming] = useState(false);

  // Actualizar un color stop
  const updateColorStop = useCallback((index: number, updates: Partial<ColorStop>) => {
    const newStops = gradient.stops.map((stop, i) => 
      i === index ? { ...stop, ...updates } : stop
    );
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  // Agregar color stop
  const addColorStop = useCallback(() => {
    const newOffset = gradient.stops.length > 0 
      ? Math.min(1, Math.max(...gradient.stops.map(s => s.offset)) + 0.2)
      : 0.5;
    
    const newStops = [...gradient.stops, { 
      offset: newOffset, 
      color: '#ffffff' 
    }].sort((a, b) => a.offset - b.offset);
    
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  // Remover color stop
  const removeColorStop = useCallback((index: number) => {
    if (gradient.stops.length <= 2) return; // Mínimo 2 stops
    const newStops = gradient.stops.filter((_, i) => i !== index);
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  // Cambiar ángulo del gradiente
  const updateAngle = useCallback((angle: number) => {
    onChange({ ...gradient, angle });
  }, [gradient, onChange]);

  // Cambiar variante del gradiente
  const updateVariant = useCallback((variant: 'linear' | 'radial') => {
    const updatedGradient = { ...gradient, variant };
    if (variant === 'radial') {
      // Remover angle para gradientes radiales
      delete (updatedGradient as any).angle;
    } else if (!updatedGradient.angle) {
      // Agregar angle por defecto para gradientes lineales
      updatedGradient.angle = 90;
    }
    onChange(updatedGradient);
  }, [gradient, onChange]);

  // Generar CSS para preview
  const getGradientCSS = useCallback(() => {
    const stopsStr = gradient.stops
      .sort((a, b) => a.offset - b.offset)
      .map(stop => `${stop.color} ${stop.offset * 100}%`)
      .join(', ');
    
    if (gradient.variant === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    } else {
      return `linear-gradient(${gradient.angle || 90}deg, ${stopsStr})`;
    }
  }, [gradient]);

  // Guardar gradiente
  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    onSave?.(saveName.trim(), gradient);
    setSaveName('');
    setIsNaming(false);
  }, [saveName, gradient, onSave]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview Section */}
      <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-4">
        <label className="block text-xs font-medium text-neutral-300 mb-3">Live Preview</label>
        <div 
          className="w-full h-20 rounded-lg border-2 border-neutral-700 shadow-inner"
          style={{ background: getGradientCSS() }}
        />
      </div>

      {/* Configuration Section */}
      <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide border-b border-neutral-700 pb-2">
          Gradient Settings
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2 text-neutral-300">Type</label>
            <select
              value={gradient.variant}
              onChange={(e) => updateVariant(e.target.value as 'linear' | 'radial')}
              className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 p-2.5 text-xs rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>

          {gradient.variant === 'linear' && (
            <div>
              <label className="block text-xs font-medium mb-2 text-neutral-300">Angle (°)</label>
              <input
                type="number"
                min="0"
                max="360"
                step="1"
                value={gradient.angle || 90}
                onChange={(e) => updateAngle(parseInt(e.target.value) || 90)}
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 p-2.5 text-xs rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="90"
              />
            </div>
          )}
        </div>
      </div>

      {/* Color Stops Section */}
      <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
            Color Stops ({gradient.stops.length})
          </h3>
          <button
            onClick={addColorStop}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            + Add Stop
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {gradient.stops
            .sort((a, b) => a.offset - b.offset)
            .map((stop, index) => (
            <div key={index} className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">
                  Stop {index + 1}
                </span>
                {gradient.stops.length > 2 && (
                  <button
                    onClick={() => removeColorStop(index)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                    title="Remove color stop"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Color</label>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(index, { color: e.target.value })}
                    className="w-full h-10 border border-neutral-700 rounded-md cursor-pointer"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Position: {Math.round(stop.offset * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={stop.offset}
                    onChange={(e) => updateColorStop(index, { offset: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Section */}
      {onSave && (
        <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide border-b border-neutral-700 pb-2">
            Save Gradient
          </h3>
          
          {!isNaming ? (
            <button
              onClick={() => setIsNaming(true)}
              className="w-full text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-sm font-medium"
            >
              💾 Save Custom Gradient
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Gradient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter a unique name..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 p-3 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="flex-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  ✅ Save
                </button>
                <button
                  onClick={() => {
                    setIsNaming(false);
                    setSaveName('');
                  }}
                  className="flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};