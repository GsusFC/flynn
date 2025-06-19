'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface SimpleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  textSize?: string;
  buttonClassName?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  textSize = 'text-xs',
  buttonClassName = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex bg-neutral-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 px-3 py-1.5 ${textSize} font-medium rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${buttonClassName}
              ${activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};