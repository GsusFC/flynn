'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  FilmIcon,
  DocumentIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import type { SimpleVectorGridRef, AnimationType } from '../simple/simpleTypes';
import { generateAnimatedSVG, generateCSSAnimatedSVG } from './animatedSvgGenerator';
import { extractGridData } from './codeGenerators';
import { useConfigStore } from '@/store/configStore';

interface AnimatedSvgExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridRef: React.RefObject<SimpleVectorGridRef | null>;
}

export const AnimatedSvgExportModal: React.FC<AnimatedSvgExportModalProps> = ({ 
  isOpen, 
  onClose, 
  gridRef 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [animationType, setAnimationType] = useState<'smil' | 'css'>('smil');
  const [loopDuration, setLoopDuration] = useState(4);
  const [includeColors, setIncludeColors] = useState(true);
  
  const config = useConfigStore();

  const handleExportAnimatedSVG = async () => {
    setIsLoading(true);
    
    try {
      // Extract current grid data
      const gridData = await extractGridData(gridRef, {
        gridConfig: {
          rows: config.rows || 10,
          cols: config.cols || 10,
          spacing: config.spacing || 10,
          margin: config.margin || 0
        },
        vectorConfig: {
          length: config.vectorLength || 10,
          width: config.vectorWidth || 2,
          color: config.primaryColor || '#10b981',
          shape: (config.vectorShape || 'line') as any,
          strokeLinecap: (config.strokeLinecap || 'round') as any,
          rotationOrigin: (config.rotationOrigin || 'center') as any
        },
        animationType: (config.animationType || 'none') as AnimationType,
        canvasDimensions: { 
          width: config.canvasSize?.width || 800, 
          height: config.canvasSize?.height || 800 
        },
        animationProps: {
          speed: config.animationSpeed,
          intensity: config.animationIntensity,
          ...config.animationProps
        }
      });

      if (!gridData) {
        throw new Error('No se pudieron extraer los datos del grid');
      }

      // Generate animated SVG
      const svgContent = animationType === 'smil' 
        ? generateAnimatedSVG({
            ...gridData,
            animationType: gridData.animationType as AnimationType,
            animationDuration: loopDuration,
            loopForever: true
          })
        : generateCSSAnimatedSVG({
            ...gridData,
            animationType: gridData.animationType as AnimationType,
            animationDuration: loopDuration,
            loopForever: true
          });

      // Download the file
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flynn-animated-${config.animationType}-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Error al exportar SVG animado:', error);
      alert('Error al exportar: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl max-w-md w-full">
        
        {/* Header - Flynn Style */}
        <div className="bg-neutral-800/70 rounded-t-lg flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <FilmIcon className="w-5 h-5 text-white" />
            <h2 className="font-mono text-sm text-white">Exportar SVG Animado</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-500/50 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Animation Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Tipo de Animación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAnimationType('smil')}
                className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                  animationType === 'smil'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                }`}
              >
                <DocumentIcon className="w-4 h-4 inline-block mr-1" />
                SMIL (Nativo)
              </button>
              <button
                onClick={() => setAnimationType('css')}
                className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                  animationType === 'css'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                }`}
              >
                <Cog6ToothIcon className="w-4 h-4 inline-block mr-1" />
                CSS (Moderno)
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {animationType === 'smil' 
                ? 'Animaciones SVG nativas, compatibles con todos los navegadores'
                : 'Animaciones CSS, más control pero requiere navegadores modernos'}
            </p>
          </div>

          {/* Loop Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Duración del Bucle
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={loopDuration}
                onChange={(e) => setLoopDuration(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(loopDuration - 1) / 19 * 100}%, #404040 ${(loopDuration - 1) / 19 * 100}%, #404040 100%)`
                }}
              />
              <span className="text-sm text-white w-12 text-right font-mono">
                {loopDuration}s
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeColors}
                onChange={(e) => setIncludeColors(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-800 text-green-600 focus:ring-green-600 focus:ring-offset-0"
              />
              <span className="text-sm text-white">
                Incluir colores actuales
              </span>
            </label>
          </div>

          {/* Info - Flynn Style */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">
              ℹ️ Información
            </h3>
            <ul className="text-xs text-neutral-300 space-y-1">
              <li>• El SVG incluirá la animación actual: <strong className="text-green-400">{config.animationType}</strong></li>
              <li>• El archivo se puede abrir en cualquier navegador</li>
              <li>• Compatible con editores como Illustrator o Inkscape</li>
              <li>• El tamaño del archivo será proporcional al número de vectores</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-700 bg-neutral-800/30 rounded-b-lg">
          <div className="text-sm text-neutral-400 font-mono">
            {(config.rows || 10) * (config.cols || 10)} vectores
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleExportAnimatedSVG}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Exportar SVG Animado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 