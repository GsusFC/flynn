import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full right-0 mb-2',
    bottom: 'top-full right-0 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full right-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800',
    bottom: 'bottom-full right-2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-10 ${positionClasses[position]}`}>
          <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 max-w-80 break-words leading-relaxed shadow-lg">
            {content}
          </div>
          <div className={`absolute ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;