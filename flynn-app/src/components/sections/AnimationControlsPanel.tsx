'use client';

import React from 'react';
import { getAnimation } from '@/animations/registry';
import type { ControlDef } from '@/animations/types';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';

// Componente individual para un control, que puede usar hooks
const ControlRenderer: React.FC<{ control: ControlDef }> = ({ control }) => {
  const { id, label, type } = control;
  const value = useConfigStore((state) => state[id] ?? control.defaultValue);
  const setConfig = useConfigStore((state) => state.setConfig);

  const selectClassName = cn(
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  switch (type) {
    case 'slider':
      return (
        <SliderWithInput
          key={id}
          label={label}
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={(newValue) => setConfig({ [id]: newValue })}
        />
      );
    case 'select':
      return (
        <div key={id} className="grid gap-2">
          <label htmlFor={id}>{label}</label>
          <select
            id={id}
            value={value}
            onChange={(e) => setConfig({ [id]: e.target.value })}
            className={selectClassName}
          >
            {control.options.map(option => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'checkbox':
      return (
        <div key={id} className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id={id}
            checked={value}
            onChange={(e) => setConfig({ [id]: e.target.checked })}
            className="h-4 w-4 rounded border-primary text-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        </div>
      );
    default:
      return <p key={id}>Control de tipo "{type}" no implementado.</p>;
  }
};

interface AnimationControlsPanelProps {
  animationId: string;
}

export const AnimationControlsPanel: React.FC<AnimationControlsPanelProps> = ({
  animationId,
}) => {
  const animationMeta = getAnimation(animationId);

  if (!animationMeta || !animationMeta.controls || animationMeta.controls.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground pt-2">
        No hay controles para esta animación.
      </div>
    );
  }

  return (
    <div className="grid gap-4 pt-2">
      {animationMeta.controls.map(control => (
        <ControlRenderer key={control.id} control={control} />
      ))}
    </div>
  );
}; 