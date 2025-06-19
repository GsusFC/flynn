import React, { useMemo } from 'react';
import { INTELLIGENT_PRESETS, type IntelligentPreset } from '../presets/intelligentPresets';

interface IntelligentPresetsPanelProps {
  onApplyPreset: (presetId: string) => void;
  className?: string;
}

export const IntelligentPresetsPanel: React.FC<IntelligentPresetsPanelProps> = ({ 
  onApplyPreset, 
  className = '' 
}) => {
  const allPresets = useMemo(() => Object.values(INTELLIGENT_PRESETS), []);

  const handlePresetClick = (preset: IntelligentPreset) => {
    onApplyPreset(preset.id);
  };

  return (
    <div className={`space-y-2 ${className}`} data-intelligent-presets>
      {/* Presets Grid */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {allPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className="w-full group p-2 bg-neutral-800/50 hover:bg-neutral-700/70 border border-neutral-600 hover:border-neutral-500 rounded cursor-pointer transition-all duration-200 text-left intelligent-preset-item"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{preset.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                  {preset.name}
                </h4>
                <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 