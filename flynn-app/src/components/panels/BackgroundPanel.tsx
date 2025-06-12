'use client';

import React from 'react';
import { useConfigStore } from '@/store/configStore';

export const BackgroundPanel: React.FC = () => {
  const backgroundColor = useConfigStore((state) => state.backgroundColor);
  const setConfig = useConfigStore((state) => state.setConfig);

  return (
    <div className="grid gap-2 pt-2">
        <label htmlFor="background-color-picker">Color de Fondo</label>
        <input
            id="background-color-picker"
            type="color"
            value={backgroundColor}
            onChange={(e) => setConfig({ backgroundColor: e.target.value })}
            className="w-full h-10 p-0 border-none cursor-pointer rounded-md bg-transparent"
        />
    </div>
  );
}; 