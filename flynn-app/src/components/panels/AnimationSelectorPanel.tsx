'use client';

import React from 'react';
import type { AnimationMeta } from '@/animations/types';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/lib/utils';

interface AnimationSelectorPanelProps {
  availableAnimations: AnimationMeta<any>[];
}

export const AnimationSelectorPanel: React.FC<AnimationSelectorPanelProps> = ({
  availableAnimations,
}) => {
  const animation = useConfigStore(state => state.animation);
  const setAnimation = useConfigStore(state => state.setAnimation);

  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnimation(e.target.value);
  };

  const selectClassName = cn(
    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  const groupAndSort = (category: string) =>
    availableAnimations
      .filter(a => a.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));

  const coreList = groupAndSort('core');
  const legacyList = groupAndSort('legacy');
  const experimentalList = availableAnimations
      .filter(a => a.category !== 'core' && a.category !== 'legacy')
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pt-2">
      <select
        id="animation-selector"
        value={animation}
        onChange={handleAnimationChange}
        className={selectClassName}
      >
        {coreList.length > 0 && (
          <optgroup label="Core">
            {coreList.map(a => (
              <option key={a.id} value={a.id} className="bg-background text-foreground">
                {a.name}
              </option>
            ))}
          </optgroup>
        )}
        {legacyList.length > 0 && (
          <optgroup label="Legacy (Victor2)">
            {legacyList.map(a => (
              <option key={a.id} value={a.id} className="bg-background text-foreground">
                {a.name}
              </option>
            ))}
          </optgroup>
        )}
        {experimentalList.length > 0 && (
          <optgroup label="Experimental">
            {experimentalList.map(a => (
              <option key={a.id} value={a.id} className="bg-background text-foreground">
                {a.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}; 