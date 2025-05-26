'use client';

import React, { useState } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import type { SimpleVectorGridRef, GridConfig, VectorConfig, AnimationType } from '../simple/simpleTypes';
import { ExportModal } from './ExportModal';

interface ExportControlsProps {
  gridRef: React.RefObject<SimpleVectorGridRef | null>;
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  canvasDimensions: { width: number; height: number };
  animationProps: Record<string, unknown>;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ 
  gridRef, 
  gridConfig, 
  vectorConfig, 
  animationType, 
  canvasDimensions, 
  animationProps,
  className = '' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={className}>
      {/* Botón para abrir modal de exportación */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sidebar-accent/50 hover:bg-sidebar-accent border border-sidebar-border text-sidebar-foreground rounded text-sm transition-colors"
      >
        <CodeBracketIcon className="w-4 h-4" />
        Exportar Código
      </button>

      {/* Modal de exportación */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gridRef={gridRef}
        gridConfig={gridConfig}
        vectorConfig={vectorConfig}
        animationType={animationType}
        canvasDimensions={canvasDimensions}
        animationProps={animationProps}
      />
    </div>
  );
};