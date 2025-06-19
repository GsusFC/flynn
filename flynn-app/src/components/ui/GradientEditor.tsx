'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { GradientColor, ColorStop } from '@/domain/color/types';
import { X, Plus, Trash2, Copy, ChevronsLeftRight, RotateCw } from 'lucide-react';
import * as THREE from 'three';

interface GradientEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialGradient: GradientColor;
  onSave: (newGradient: GradientColor) => void;
  onSaveAsCustom: (name: string, gradient: GradientColor) => void;
}

const ColorPicker: React.FC<{ color: string, onChange: (newColor: string) => void }> = ({ color, onChange }) => {
  const [displayColor, setDisplayColor] = useState(color);

  useEffect(() => {
    setDisplayColor(color);
  }, [color]);

  return (
    <input
      type="color"
      value={displayColor}
      onChange={(e) => {
        setDisplayColor(e.target.value);
        onChange(e.target.value);
      }}
      className="w-12 h-8 p-0 border-none cursor-pointer rounded-md bg-transparent"
    />
  );
};

export const GradientEditor: React.FC<GradientEditorProps> = ({ isOpen, onClose, initialGradient, onSave, onSaveAsCustom }) => {
  const [gradient, setGradient] = useState<GradientColor>(initialGradient);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customName, setCustomName] = useState('');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGradient(initialGradient);
  }, [initialGradient]);

  const addStop = (offset: number) => {
    const sortedStops = [...gradient.stops].sort((a, b) => a.offset - b.offset);
    let newColor = '#ffffff';

    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (offset >= sortedStops[i].offset && offset <= sortedStops[i + 1].offset) {
        const factor = (offset - sortedStops[i].offset) / (sortedStops[i + 1].offset - sortedStops[i].offset);
        const color1 = new THREE.Color(sortedStops[i].color);
        const color2 = new THREE.Color(sortedStops[i + 1].color);
        newColor = color1.lerp(color2, factor).getStyle();
        break;
      }
    }

    const newStop: ColorStop = { offset, color: newColor };
    const newStops = [...gradient.stops, newStop].sort((a, b) => a.offset - b.offset);
    setGradient(prev => ({ ...prev, stops: newStops }));
    setActiveStopIndex(newStops.indexOf(newStop));
  };
  
  const removeStop = (index: number) => {
    const newStops = gradient.stops.filter((_, i) => i !== index);
    if (newStops.length < 2) return; // Must have at least 2 stops
    setGradient(prev => ({ ...prev, stops: newStops }));
    setActiveStopIndex(null);
  };
  
  const handleSave = () => {
    onSave(gradient);
    onClose();
  };

  const createGradientCss = (grad: GradientColor): string => {
    const stops = grad.stops
      .sort((a, b) => a.offset - b.offset)
      .map(s => `${s.color} ${s.offset * 100}%`)
      .join(', ');

    switch (grad.variant) {
      case 'radial':
        return `radial-gradient(circle, ${stops})`;
      case 'conic':
        return `conic-gradient(${stops})`;
      case 'linear':
      default:
        return `linear-gradient(${grad.angle || 90}deg, ${stops})`;
    }
  };

  const activeStop = activeStopIndex !== null ? gradient.stops[activeStopIndex] : null;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || activeStopIndex === null || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const newOffset = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleUpdateStop(activeStopIndex, { offset: newOffset });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeStopIndex]);

  if (!isOpen) return null;

  const handleUpdateStop = (index: number, newStop: Partial<ColorStop>) => {
    const newStops = [...gradient.stops];
    newStops[index] = { ...newStops[index], ...newStop };
    setGradient(prev => ({ ...prev, stops: newStops }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-neutral-800/70 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Editor de Gradientes</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-700 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Gradient Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-300">Vista Previa</h3>
            <div
              ref={previewRef}
              className="w-full h-24 rounded-lg border-2 border-neutral-600 relative cursor-pointer"
              style={{ background: createGradientCss(gradient) }}
              onClick={(e) => {
                const rect = previewRef.current?.getBoundingClientRect();
                if (!rect) return;
                const newOffset = (e.clientX - rect.left) / rect.width;
                addStop(newOffset);
              }}
            >
              {/* Stop Markers */}
              {gradient.stops.map((stop, index) => (
                <div
                  key={index}
                  className={`
                    absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2
                    ${activeStopIndex === index ? 'border-blue-400 scale-125' : 'border-white/80'}
                    cursor-grab transition-all
                  `}
                  style={{ 
                    left: `${stop.offset * 100}%`,
                    backgroundColor: stop.color,
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStopIndex(index);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    setActiveStopIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Gradient Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-300">Configuración General</h3>
              <div className="bg-neutral-800/50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2 text-neutral-300">Tipo de Gradiente</label>
                  <select
                    value={gradient.variant}
                    onChange={(e) => setGradient(prev => ({ ...prev, variant: e.target.value as 'linear' | 'radial' | 'conic' }))}
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 p-2.5 text-xs rounded-md"
                  >
                    <option value="linear">Lineal</option>
                    <option value="radial">Radial</option>
                    <option value="conic">Cónico</option>
                  </select>
                </div>
                {gradient.variant === 'linear' && (
                  <div>
                    <label className="block text-xs font-medium mb-2 text-neutral-300">Ángulo</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradient.angle || 0}
                      onChange={(e) => setGradient(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Stop Editor */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-300">Editor de Parada</h3>
              {activeStop ? (
                <div className="bg-neutral-800/50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Color</label>
                    <ColorPicker 
                      color={activeStop.color} 
                      onChange={(newColor) => handleUpdateStop(activeStopIndex!, { color: newColor })}
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-white">Posición: {Math.round(activeStop.offset * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={activeStop.offset}
                      onChange={(e) => handleUpdateStop(activeStopIndex!, { offset: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <button onClick={() => removeStop(activeStopIndex!)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-800/50 hover:bg-red-800/80 border border-red-700 rounded text-xs text-red-200">
                    <Trash2 size={14}/>
                    Eliminar Parada
                  </button>
                </div>
              ) : (
                <div className="text-center text-neutral-500 bg-neutral-800/50 p-4 rounded-lg h-full flex items-center justify-center">
                  Selecciona una parada en la vista previa para editarla.
                </div>
              )}
            </div>
          </div>

          {/* Save Custom Preset */}
          <div className="space-y-3 pt-4 border-t border-neutral-700/60">
            <h3 className="text-sm font-medium text-neutral-300">Guardar en mis presets</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del preset..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 p-2.5 text-xs rounded-md"
              />
              <button
                onClick={() => {
                  if (customName.trim()) {
                    onSaveAsCustom(customName.trim(), gradient);
                    setCustomName('');
                  }
                }}
                disabled={!customName.trim()}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-semibold disabled:bg-neutral-600 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-neutral-800/70 border-t border-neutral-700 px-6 py-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};