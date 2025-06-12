'use client';

import React from 'react';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { SHAPE_REGISTRY } from '@/lib/shapeRegistry';
import type { VectorShape, ShapeDefinition } from '@/lib/shapeRegistry';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';

export const VectorShapePanel: React.FC = () => {
  const vectorShape = useConfigStore(state => state.vectorShape);
  const shapeParams = useConfigStore(state => state.shapeParams);
  const rotationOrigin = useConfigStore(state => state.rotationOrigin);
  const setVectorShape = useConfigStore(state => state.setVectorShape);
  const setConfig = useConfigStore(state => state.setConfig);

  const currentShapeMeta = SHAPE_REGISTRY[vectorShape];
  const currentShapeControls = currentShapeMeta ? Object.entries(currentShapeMeta.params) : [];

  const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVectorShape(e.target.value as VectorShape);
  };
  
  const handleParamChange = (paramId: string, value: number) => {
    setConfig(prev => ({
      shapeParams: {
        ...prev.shapeParams,
        [paramId]: value,
      },
    }));
  };
  
  const handleRotationOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({
      rotationOrigin: e.target.value as 'start' | 'center' | 'end'
    });
  };

  const selectClassName = cn(
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  return (
    <div className="grid gap-4 pt-2">
      <div className="grid gap-2">
        <select
          id="vector-shape"
          value={vectorShape}
          onChange={handleShapeChange}
          className={selectClassName}
          aria-label="Forma del vector"
        >
          {Object.entries(SHAPE_REGISTRY).map(([shapeName, shapeDef]: [string, ShapeDefinition]) => (
            <option key={shapeName} value={shapeName} className="bg-background text-foreground">{shapeDef.label}</option>
          ))}
        </select>
      </div>

      {currentShapeControls.map(([paramId, controlSpec]) => (
        <SliderWithInput
          key={paramId}
          label={controlSpec.label}
          min={controlSpec.min}
          max={controlSpec.max}
          step={controlSpec.step}
          value={shapeParams[paramId] ?? controlSpec.defaultValue}
          onChange={(value) => handleParamChange(paramId, value)}
        />
      ))}

      <div className="grid gap-2">
        <select
          id="rotation-origin"
          value={rotationOrigin}
          onChange={handleRotationOriginChange}
          className={selectClassName}
          aria-label="Origen de rotación"
        >
          <option value="start" className="bg-background text-foreground">Inicio</option>
          <option value="center" className="bg-background text-foreground">Centro</option>
          <option value="end" className="bg-background text-foreground">Final</option>
        </select>
      </div>
    </div>
  );
}; 