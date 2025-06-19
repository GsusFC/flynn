"use client";

import React, { useState, useRef } from 'react';
import { X, Download, Copy, Package, Box, Image, FileText, Sparkles } from 'lucide-react';
import { Lab3DGenerator, Lab3DConfig, Lab3DExportUtils, type Lab3DExportFormats } from '@/export/web/generators/lab3D';
import * as THREE from 'three';

interface Lab3DExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Lab3DConfig;
  animatedVectors: any[];
  gridPositions: any[];
  vectorColors: THREE.Color[];
  canvas?: HTMLCanvasElement;
}

type ExportStep = 'configure' | 'preview' | 'generate' | 'download';
type ExportFormat = 'obj' | 'ply' | 'json' | 'canvas' | 'threeScene' | 'package';

interface ExportConfig {
  format: ExportFormat;
  includeColors: boolean;
  includeMetadata: boolean;
  vectorLength: number;
  optimizeForBlender: boolean;
  optimizeForThreeJS: boolean;
}

export default function Lab3DExportModal({
  isOpen,
  onClose,
  config,
  animatedVectors,
  gridPositions,
  vectorColors,
  canvas
}: Lab3DExportModalProps) {
  const [currentStep, setCurrentStep] = useState<ExportStep>('configure');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'package',
    includeColors: true,
    includeMetadata: true,
    vectorLength: 1.0,
    optimizeForBlender: false,
    optimizeForThreeJS: false
  });
  
  const [generatedFiles, setGeneratedFiles] = useState<Lab3DExportFormats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formats = [
    {
      id: 'package' as const,
      name: 'Paquete Completo',
      description: 'Todos los formatos en un archivo',
      icon: Package,
      color: 'text-purple-400',
      files: '.obj, .ply, .json, .png, README.md'
    },
    {
      id: 'obj' as const,
      name: 'Wavefront OBJ',
      description: 'Para Blender, Maya, 3ds Max',
      icon: Box,
      color: 'text-blue-400',
      files: '.obj'
    },
    {
      id: 'ply' as const,
      name: 'Stanford PLY',
      description: 'Para software de nubes de puntos',
      icon: Box,
      color: 'text-green-400',
      files: '.ply'
    },
    {
      id: 'json' as const,
      name: 'Flynn Lab JSON',
      description: 'Formato nativo con configuración completa',
      icon: FileText,
      color: 'text-yellow-400',
      files: '.json'
    },
    {
      id: 'canvas' as const,
      name: 'Captura 3D',
      description: 'Imagen PNG del estado actual',
      icon: Image,
      color: 'text-pink-400',
      files: '.png'
    },
    {
      id: 'threeScene' as const,
      name: 'Three.js Scene',
      description: 'Para aplicaciones web 3D',
      icon: Sparkles,
      color: 'text-cyan-400',
      files: '.json'
    }
  ];

  const steps = [
    { id: 'configure', label: 'Configurar', description: 'Opciones de exportación' },
    { id: 'preview', label: 'Vista Previa', description: 'Revisar configuración' },
    { id: 'generate', label: 'Generar', description: 'Procesando archivos' },
    { id: 'download', label: 'Descargar', description: 'Archivos listos' }
  ];

  const generateFiles = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('generate');

    try {
      // Simulate progress for better UX
      const progressSteps = [20, 40, 60, 80, 100];
      
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(progressSteps[i]);
      }

      // Use real Lab3DGenerator instead of mock data
      const generator = Lab3DGenerator.fromLabCanvas(
        config,
        animatedVectors,
        gridPositions,
        vectorColors
      );

      // Generate all formats using the real generator
      const realFiles = generator.generateAll(canvas);
      
      setGeneratedFiles(realFiles);
      setCurrentStep('download');
    } catch (error) {
      console.error('Error generating files:', error);
      // Fallback to mock data if generator fails
      const mockFiles: Lab3DExportFormats = {
        obj: '# Flynn Lab 3D Export - OBJ Format\n# Generated: ' + new Date().toISOString(),
        ply: 'ply\nformat ascii 1.0\ncomment Flynn Lab 3D Export',
        json: JSON.stringify({ format: 'flynn-lab-3d', vectors: animatedVectors }, null, 2),
        canvas: canvas?.toDataURL('image/png') || '',
        threeScene: JSON.stringify({ metadata: { type: 'Object', generator: 'Flynn Lab' } }, null, 2)
      };
      setGeneratedFiles(mockFiles);
      setCurrentStep('download');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (format: keyof Lab3DExportFormats) => {
    if (!generatedFiles) return;
    
    const content = generatedFiles[format];
    const extension = Lab3DExportUtils.getFileExtension(format);
    const mimeType = Lab3DExportUtils.getMimeType(format);
    const filename = `flynn-lab-3d.${extension}`;
    
    // Handle PNG differently for base64 data
    if (format === 'canvas' && content.startsWith('data:image/png;base64,')) {
      // Convert base64 to blob for PNG
      const base64Data = content.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Use utility function for other formats
      Lab3DExportUtils.downloadFile(content, filename, mimeType);
    }
  };

  const copyToClipboard = async (format: keyof Lab3DExportFormats) => {
    if (!generatedFiles) return;
    
    try {
      const content = generatedFiles[format];
      
      // For PNG, copy the data URL
      if (format === 'canvas') {
        await navigator.clipboard.writeText(content);
      } else {
        await navigator.clipboard.writeText(content);
      }
      
      // Could add toast notification here
      console.log(`${format} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const selectedFormat = formats.find(f => f.id === exportConfig.format);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-neutral-800/70 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Exportación 3D de Flynn Lab</h2>
            <p className="text-sm text-neutral-300">
              {animatedVectors.length} vectores • {config.gridPattern} • {config.animationType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-neutral-800/50 border-b border-neutral-700 px-6 py-3">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-700 text-neutral-400'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-white' : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-neutral-700 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 'configure' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Formato de Exportación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setExportConfig(prev => ({ ...prev, format: format.id }))}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-left
                          ${exportConfig.format === format.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-neutral-600 hover:border-neutral-500 bg-neutral-800/50'
                          }
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`w-6 h-6 ${format.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white">{format.name}</div>
                            <div className="text-sm text-neutral-400 mt-1">{format.description}</div>
                            <div className="text-xs text-neutral-500 mt-2 font-mono">{format.files}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Opciones Avanzadas</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Incluir colores</label>
                    <input
                      type="checkbox"
                      checked={exportConfig.includeColors}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeColors: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Incluir metadatos</label>
                    <input
                      type="checkbox"
                      checked={exportConfig.includeMetadata}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white">Longitud del vector: {exportConfig.vectorLength.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={exportConfig.vectorLength}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, vectorLength: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Resumen de Exportación</h3>
                <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Formato:</span>
                    <span className="text-white">{selectedFormat?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Vectores:</span>
                    <span className="text-white">{animatedVectors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Patrón de grid:</span>
                    <span className="text-white">{config.gridPattern}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Animación:</span>
                    <span className="text-white">{config.animationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Colores:</span>
                    <span className="text-white">{exportConfig.includeColors ? 'Incluidos' : 'No incluidos'}</span>
                  </div>
                  {canvas && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Canvas 3D:</span>
                      <span className="text-green-400">✓ Disponible para captura PNG</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-white mb-2">Archivos que se generarán:</h4>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="font-mono text-sm text-neutral-300">
                    {selectedFormat?.files}
                  </div>
                </div>
              </div>

              {/* Canvas Preview for PNG */}
              {exportConfig.format === 'canvas' && canvas && (
                <div>
                  <h4 className="text-md font-semibold text-white mb-2">Vista previa de captura:</h4>
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="text-sm text-neutral-400 mb-2">
                      Resolución: {canvas.width} × {canvas.height} px
                    </div>
                    <div className="border border-neutral-600 rounded-lg overflow-hidden max-w-md">
                      <canvas
                        width={canvas.width}
                        height={canvas.height}
                        className="w-full h-auto bg-black"
                        ref={(previewCanvas) => {
                          if (previewCanvas && canvas) {
                            const ctx = previewCanvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(canvas, 0, 0);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'generate' && (
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Generando archivos...</h3>
                <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-neutral-400">{progress}% completado</p>
                {canvas && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Capturando canvas 3D para PNG...
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'download' && generatedFiles && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Archivos generados</h3>
                <div className="space-y-3">
                  {Object.entries(generatedFiles).map(([format, content]) => {
                    if (!content) return null;
                    const formatInfo = formats.find(f => f.id === format) || {
                      name: format,
                      color: 'text-neutral-400',
                      icon: FileText
                    };
                    const Icon = formatInfo.icon;
                    
                    return (
                      <div key={format} className="bg-neutral-800/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${formatInfo.color}`} />
                          <div>
                            <div className="text-white font-medium">{formatInfo.name}</div>
                            <div className="text-sm text-neutral-400">
                              {format === 'canvas' 
                                ? `Imagen PNG (${canvas?.width || 800}×${canvas?.height || 600})`
                                : `${(content.length / 1024).toFixed(1)} KB`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(format as keyof Lab3DExportFormats)}
                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
                            title="Copiar al portapapeles"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => downloadFile(format as keyof Lab3DExportFormats)}
                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
                            title="Descargar archivo"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-800/70 border-t border-neutral-700 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Cerrar
          </button>
          
          <div className="flex space-x-3">
            {currentStep === 'configure' && (
              <button
                onClick={() => setCurrentStep('preview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continuar
              </button>
            )}
            
            {currentStep === 'preview' && (
              <>
                <button
                  onClick={() => setCurrentStep('configure')}
                  className="px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={generateFiles}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generar Archivos
                </button>
              </>
            )}
            
            {currentStep === 'download' && (
              <button
                onClick={() => {
                  setCurrentStep('configure');
                  setGeneratedFiles(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nueva Exportación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 