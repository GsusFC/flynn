'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  CodeBracketIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import type { SimpleVectorGridRef, GridConfig, VectorConfig, AnimationType } from '../simple/simpleTypes';
import { extractGridData, generateSVGCode, generateJSCode, generateReactCode } from './codeGenerators';
import { CodeHighlighter } from './CodeHighlighter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridRef: React.RefObject<SimpleVectorGridRef | null>;
  // Configuración actual de la app
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  canvasDimensions: { width: number; height: number };
  animationProps: Record<string, unknown>;
}

type ExportTab = 'svg' | 'js' | 'react';

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  gridRef, 
  gridConfig, 
  vectorConfig, 
  animationType, 
  canvasDimensions, 
  animationProps 
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('svg');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gridData, setGridData] = useState<any>(null);

  // Extraer datos del grid CADA VEZ que el modal se abre o las props relevantes cambian
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      extractGridData(gridRef, {
        gridConfig,
        vectorConfig,
        animationType,
        canvasDimensions,
        animationProps
      }).then((data) => {
        setGridData(data);
        setIsLoading(false);
      }).catch((error) => {
        console.error('❌ [ExportModal] Error en extracción:', error);
        setGridData(null); // Limpiar en caso de error
        setIsLoading(false);
      });
    } else {
      // Limpiar gridData cuando el modal se cierra para asegurar una carga fresca la próxima vez
      setGridData(null);
    }
    // gridData eliminado de las dependencias para evitar bucles si setGridData lo dispara.
  }, [isOpen, gridRef, gridConfig, vectorConfig, animationType, canvasDimensions, animationProps]);

  // Generar código SVG real
  const svgCode = useMemo(() => {
    if (!gridData) {
      return `<!-- Cargando datos del grid... -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Los vectores se cargarán desde el grid actual -->
</svg>`;
    }
    return generateSVGCode(gridData);
  }, [gridData]);

  // Generar código JavaScript real
  const jsCode = useMemo(() => {
    if (!gridData) {
      return `// Cargando datos del grid...
// Vector Grid Animation - Flynn Export
// Los datos se extraerán del grid actual`;
    }
    return generateJSCode(gridData);
  }, [gridData]);

  // Generar componente React real  
  const reactCode = useMemo(() => {
    if (!gridData) {
      return `// Cargando datos del grid...
import React from 'react';

export const VectorGrid = () => {
  return <div>Cargando configuración del grid...</div>;
};`;
    }
    return generateReactCode(gridData);
  }, [gridData]);

  // Obtener código actual según tab activo
  const getCurrentCode = () => {
    switch (activeTab) {
      case 'svg': return svgCode;
      case 'js': return jsCode;
      case 'react': return reactCode;
      default: return svgCode;
    }
  };



  // Funciones de utilidad
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentCode());
      setCopySuccess(`${activeTab.toUpperCase()} copiado!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      setCopySuccess('Error al copiar');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleDownload = async () => {
    const code = getCurrentCode();
    const filename = {
      svg: 'vector-grid.svg',
      js: 'vector-animation.js',
      react: 'VectorGrid.tsx'
    }[activeTab] || 'export.txt';
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tab data
  const tabs: Array<{id: ExportTab, label: string, icon: React.ReactNode}> = [
    { id: 'svg', label: 'SVG', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'js', label: 'JavaScript', icon: <CodeBracketIcon className="w-4 h-4" /> },
    { id: 'react', label: 'React', icon: <CodeBracketIcon className="w-4 h-4" /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-sidebar-border rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-sidebar-foreground" />
            <h2 className="text-lg font-semibold text-sidebar-foreground">Exportar Código</h2>
            {isLoading && (
              <span className="text-sm text-blue-400 animate-pulse">Extrayendo datos...</span>
            )}
            {copySuccess && (
              <span className="text-sm text-green-400 animate-pulse">{copySuccess}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-sidebar-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-sidebar-foreground border-b-2 border-blue-500 bg-sidebar-accent'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 p-4">
            
            {/* Código completo */}
            <div className="h-full bg-sidebar-accent border border-sidebar-border rounded overflow-hidden flex flex-col">
              {/* Code editor header */}
              <div className="bg-sidebar border-b border-sidebar-border p-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-sidebar-foreground/60 font-mono">
                    {activeTab === 'svg' ? 'vector-grid.svg' : 
                     activeTab === 'js' ? 'vector-animation.js' : 'VectorGrid.tsx'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {gridData && (
                    <span className="text-xs text-sidebar-foreground/60">
                      {gridData.vectors.length} vectores
                    </span>
                  )}
                  <span className="text-xs text-sidebar-foreground/60">
                    {getCurrentCode().split('\n').length} líneas
                  </span>
                </div>
              </div>
              
              {/* Code content */}
              <div className="flex-1 min-h-0 overflow-auto p-4 custom-scrollbar">
                <CodeHighlighter
                  code={getCurrentCode()}
                  language={activeTab as 'svg' | 'js' | 'react'}
                  className="text-sidebar-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-sidebar-border bg-sidebar-accent">
          <div className="text-sm text-sidebar-foreground/60">
            {activeTab === 'svg' && 'Código SVG estático con posiciones actuales'}
            {activeTab === 'js' && 'JavaScript vanilla con datos reales del grid'}
            {activeTab === 'react' && 'Componente React funcional exportable'}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition-colors"
            >
              {copySuccess ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4" />
              )}
              Copiar
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent border border-sidebar-border hover:bg-sidebar disabled:opacity-50 text-sidebar-foreground rounded text-sm transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};