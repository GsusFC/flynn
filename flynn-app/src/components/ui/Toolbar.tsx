'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Download, Share2, Film } from 'lucide-react';

interface ToolbarProps {
  onTogglePause: () => void;
  isPaused: boolean;
  onExportSVG: () => void;
  onExportGIF?: () => void;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onTogglePause,
  isPaused,
  onExportSVG,
  onExportGIF,
  className,
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 100, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const panel = toolbarRef.current;
    if (panel) {
      dragStartPos.current = {
        x: e.clientX - panel.offsetLeft,
        y: e.clientY - panel.offsetTop,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={toolbarRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute bg-neutral-900 border border-neutral-700 rounded-full shadow-2xl flex items-center gap-2 p-2 cursor-move",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 20
      }}
    >
        <button onClick={onTogglePause} className="p-2 hover:bg-neutral-700 rounded-full text-white">
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <div className="w-px h-5 bg-neutral-700" />
        <button onClick={onExportSVG} className="p-2 hover:bg-neutral-700 rounded-full text-white">
            <Download size={16} />
        </button>
        <button onClick={onExportGIF} className="p-2 hover:bg-neutral-700 rounded-full text-white" disabled={!onExportGIF}>
            <Film size={16} />
        </button>
        <button className="p-2 hover:bg-neutral-700 rounded-full text-white" disabled>
            <Share2 size={16} />
        </button>
    </div>
  );
}; 