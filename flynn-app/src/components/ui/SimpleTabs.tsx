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
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex bg-sidebar-accent/20 border border-sidebar-border rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-sidebar text-sidebar-foreground shadow-sm border border-sidebar-border'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
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