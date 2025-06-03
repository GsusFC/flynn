'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import type { SimpleVectorGridRef } from '../simple/simpleTypes';

interface GifExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridRef: React.RefObject<SimpleVectorGridRef | null>;
}

export const GifExportModal: React.FC<GifExportModalProps> = ({ 
  isOpen, 
  onClose, 
  gridRef
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [gifOptions, setGifOptions] = useState({
    fps: 30,
    duration: 3000,
    quality: 10,
    loop: true
  });

  const handleExportGIF = async () => {
    try {
      setIsLoading(true);
      setExportStatus('Generando GIF...');
      
      console.log('🎬 Iniciando exportación GIF con opciones:', gifOptions);
      console.log('📐 gridRef.current:', gridRef.current);
      
      if (!gridRef.current) {
        setExportStatus('⚠️ GIF Export requiere integración completa con SimpleVectorGridOptimized');
        setTimeout(() => setExportStatus(null), 5000);
        return;
      }
      
      if (!gridRef.current.exportGIF) {
        setExportStatus('Error: Función exportGIF no disponible');
        setTimeout(() => setExportStatus(null), 3000);
        return;
      }
      
      const blob = await gridRef.current.exportGIF(gifOptions);
      console.log('📊 Blob generado:', blob);
      
      if (blob) {
        console.log('✅ Blob válido, iniciando descarga...');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-animation-${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setExportStatus('¡GIF exportado exitosamente!');
        setTimeout(() => setExportStatus(null), 3000);
      } else {
        setExportStatus('Error: No se pudo generar el GIF');
        setTimeout(() => setExportStatus(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error exporting GIF:', error);
      setExportStatus(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setTimeout(() => setExportStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-sidebar-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <FilmIcon className="w-5 h-5 text-sidebar-foreground" />
            <h2 className="text-lg font-semibold text-sidebar-foreground">Exportar GIF</h2>
            {exportStatus && (
              <span className={`text-sm animate-pulse ${
                exportStatus.includes('Error') ? 'text-red-400' : 
                exportStatus.includes('exitosamente') ? 'text-green-400' : 'text-blue-400'
              }`}>
                {exportStatus}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto p-6">
          <div className="space-y-6">
            <div className="text-sidebar-foreground">
              <h3 className="text-lg font-semibold mb-4">Configuración de Exportación</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">FPS (Frames por segundo)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={gifOptions.fps}
                    onChange={(e) => setGifOptions(prev => ({ ...prev, fps: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 bg-sidebar border border-sidebar-border rounded text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-sidebar-foreground/60 mt-1">Mayor FPS = animación más suave pero archivo más grande</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duración (milisegundos)</label>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    value={gifOptions.duration}
                    onChange={(e) => setGifOptions(prev => ({ ...prev, duration: parseInt(e.target.value) || 3000 }))}
                    className="w-full px-3 py-2 bg-sidebar border border-sidebar-border rounded text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-sidebar-foreground/60 mt-1">Tiempo total del GIF (3000ms = 3 segundos)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Calidad</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={gifOptions.quality}
                    onChange={(e) => setGifOptions(prev => ({ ...prev, quality: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 bg-sidebar border border-sidebar-border rounded text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-sidebar-foreground/60 mt-1">1 = mejor calidad, 20 = menor tamaño de archivo</p>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={gifOptions.loop}
                      onChange={(e) => setGifOptions(prev => ({ ...prev, loop: e.target.checked }))}
                      className="rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Loop infinito</span>
                  </label>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">El GIF se repetirá automáticamente</p>
                </div>
              </div>
              
              {/* Info Panel */}
              <div className="bg-sidebar-accent border border-sidebar-border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">📋 Información</h4>
                <div className="text-sm text-sidebar-foreground/80 space-y-1">
                  <p>• <strong>Frames totales:</strong> {Math.ceil((gifOptions.duration / 1000) * gifOptions.fps)}</p>
                  <p>• <strong>Tamaño estimado:</strong> {gifOptions.quality <= 5 ? 'Grande' : gifOptions.quality <= 15 ? 'Medio' : 'Pequeño'}</p>
                  <p>• <strong>Tiempo de generación:</strong> {gifOptions.duration >= 5000 ? 'Alto' : 'Medio'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-sidebar-border bg-sidebar-accent">
          <div className="text-sm text-sidebar-foreground/60">
            Exporta la animación actual como GIF con la configuración seleccionada
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-sidebar-border hover:bg-sidebar disabled:opacity-50 text-sidebar-foreground rounded transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleExportGIF}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Exportar GIF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};