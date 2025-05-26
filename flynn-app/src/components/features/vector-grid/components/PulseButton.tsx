'use client';

import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface PulseButtonProps {
  onTriggerPulse: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const PulseButton: React.FC<PulseButtonProps> = ({ 
  onTriggerPulse, 
  size = 'medium',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1.5 text-xs';
      case 'medium':
        return 'px-3 py-2 text-sm';
      case 'large':
        return 'px-4 py-2.5 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'h-3 w-3';
      case 'medium':
        return 'h-4 w-4';
      case 'large':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <button
      onClick={onTriggerPulse}
      className={`
        inline-flex items-center gap-2 
        bg-orange-500 hover:bg-orange-600 active:bg-orange-700
        text-white font-medium
        rounded-lg transition-all duration-200
        hover:scale-105 active:scale-95
        shadow-md hover:shadow-lg
        ${getSizeClasses()}
        ${className}
      `}
      title="Disparar pulso de animación (Ctrl/Cmd + P)"
    >
      <ArrowPathIcon className={`${getIconSize()} flex-shrink-0`} />
      <span className="flex-shrink-0">⚡ Pulso</span>
    </button>
  );
};
