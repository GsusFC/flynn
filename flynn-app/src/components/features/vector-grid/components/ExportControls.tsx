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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSVG = async () => {
    if (!gridRef.current) return;
    
    setIsExporting(true);
    try {
      const svgString = await gridRef.current.exportSVG({
        format: 'svg',
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        quality: 'high',
        precision: 2,
        optimize: true
      });
      
      // Crear blob y descargar
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flynn-vector-grid-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar SVG:', error);
      alert('Error al exportar SVG. Ver consola para detalles.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGIF = async () => {
    if (!gridRef.current) return;
    
    setIsExporting(true);
    try {
      const gifBlob = await gridRef.current.exportGIF({
        format: 'gif',
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        quality: 'medium',
        duration: 3000,
        fps: 30,
        loop: true
      });
      
      // Crear URL y descargar
      const url = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flynn-vector-grid-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar GIF:', error);
      alert('Error al exportar GIF. Ver consola para detalles.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {/* Botón para exportar SVG directo */}
        <button
          onClick={handleExportSVG}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-sm transition-colors"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar SVG
            </>
          )}
        </button>

        {/* Botón para exportar GIF animado */}
        <button
          onClick={handleExportGIF}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded text-sm transition-colors"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10" />
              </svg>
              Descargar GIF
            </>
          )}
        </button>

        {/* Botón para abrir modal de exportación de código */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sidebar-accent/50 hover:bg-sidebar-accent border border-sidebar-border text-sidebar-foreground rounded text-sm transition-colors"
        >
          <CodeBracketIcon className="w-4 h-4" />
          Exportar Código
        </button>
      </div>

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