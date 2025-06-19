'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Minus, X } from 'lucide-react';

// Dummy provider for backward compatibility
export const PanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  defaultPosition: { x: number; y: number };
  defaultWidth: number;
  onClose?: () => void;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  children,
  defaultPosition,
  defaultWidth,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    const panel = panelRef.current;
    if (panel) {
      dragStartPos.current = {
        x: e.clientX - panel.offsetLeft,
        y: e.clientY - panel.offsetTop,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  
  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${defaultWidth}px`,
        height: isMinimized ? '40px' : 'auto',
        zIndex: isDragging ? 20 : 10
      }}
    >
      <div 
        className="drag-handle h-10 bg-neutral-800/70 rounded-t-lg flex items-center justify-between px-4 cursor-move text-white flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        <span className="font-mono text-sm">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleMinimize} className="p-1 hover:bg-neutral-700 rounded-full">
            <Minus size={14} />
          </button>
          <button onClick={handleClose} className="p-1 hover:bg-red-500/50 rounded-full">
            <X size={14} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}; 