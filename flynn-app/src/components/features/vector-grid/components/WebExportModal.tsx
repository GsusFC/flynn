'use client';

import React, { useState, useMemo } from 'react';
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  DocumentIcon,
  Cog6ToothIcon,
  CheckIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import type { SimpleVectorGridRef, GridConfig, VectorConfig, AnimationType } from '../simple/simpleTypes';
import { 
  StandaloneGenerator, 
  type StandaloneConfig,
  defaultStandaloneConfig 
} from '@/export/web/generators/standalone';
import { SliderWithInput } from './SliderWithInput';

interface WebExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridRef: React.RefObject<SimpleVectorGridRef | null>;
  // Current configuration from the app
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  canvasDimensions: { width: number; height: number };
  animationProps: Record<string, unknown>;
}

type ExportFormat = 'standalone' | 'webComponent' | 'react' | 'cdn';
type ExportStep = 'configure' | 'preview' | 'generate' | 'download';

export const WebExportModal: React.FC<WebExportModalProps> = ({ 
  isOpen, 
  onClose, 
  gridRef,
  gridConfig,
  vectorConfig,
  animationType,
  canvasDimensions,
  animationProps
}) => {
  const [currentStep, setCurrentStep] = useState<ExportStep>('configure');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('standalone');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [exportResult, setExportResult] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Web export configuration
  const [webConfig, setWebConfig] = useState<StandaloneConfig>(() => ({
    ...defaultStandaloneConfig,
    gridConfig: {
      rows: gridConfig.rows || 10,
      cols: gridConfig.cols || 10,
      spacing: gridConfig.spacing || 40,
      margin: gridConfig.margin || 20,
      pattern: 'regular'
    },
    vectorConfig: {
      length: vectorConfig.length || 20,
      width: vectorConfig.width || 2,
      color: typeof vectorConfig.color === 'string' ? vectorConfig.color : '#10b981',
      shape: (vectorConfig.shape as any) || 'line',
      opacity: vectorConfig.opacity || 0.8
    },
    animation: {
      type: animationType || 'wave',
      speed: (animationProps.speed as number) || 1.0,
      intensity: (animationProps.intensity as number) || 1.0,
      props: animationProps
    },
    canvas: {
      width: canvasDimensions.width || 800,
      height: canvasDimensions.height || 600,
      background: '#0a0a0a',
      responsive: true
    },
    interaction: {
      clickToPause: true,
      mouseInfluence: false,
      autoStart: true
    }
  }));

  // Format configurations
  const exportFormats = [
    {
      id: 'standalone' as ExportFormat,
      name: 'JavaScript Standalone',
      icon: <CodeBracketIcon className="w-5 h-5" />,
      description: 'Self-contained JS file that works anywhere',
      features: ['No dependencies', 'Easy integration', 'Auto-initialization'],
      size: '~50KB',
      complexity: 'Simple',
      status: 'ready'
    },
    {
      id: 'webComponent' as ExportFormat,
      name: 'Web Component',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      description: 'Modern custom element with Shadow DOM',
      features: ['Style isolation', 'Reusable', 'Framework agnostic'],
      size: '~65KB',
      complexity: 'Medium',
      status: 'coming-soon'
    },
    {
      id: 'react' as ExportFormat,
      name: 'React Component',
      icon: <DocumentIcon className="w-5 h-5" />,
      description: 'Ready-to-use React component',
      features: ['TypeScript support', 'Props interface', 'Tree-shakable'],
      size: '~40KB',
      complexity: 'Medium',
      status: 'coming-soon'
    },
    {
      id: 'cdn' as ExportFormat,
      name: 'CDN Ready',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      description: 'Optimized for CDN distribution',
      features: ['Lazy loading', 'Cache optimized', 'Multi-instance'],
      size: '~45KB',
      complexity: 'Simple',
      status: 'coming-soon'
    }
  ];

  // Steps configuration
  const steps = [
    { id: 'configure', name: 'Configurar', icon: <Cog6ToothIcon className="w-4 h-4" /> },
    { id: 'preview', name: 'Vista Previa', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'generate', name: 'Generar', icon: <CodeBracketIcon className="w-4 h-4" /> },
    { id: 'download', name: 'Descargar', icon: <ArrowDownTrayIcon className="w-4 h-4" /> }
  ];

  // Generate web export
  const handleGenerate = async () => {
    if (selectedFormat !== 'standalone') {
      alert('Esta funcionalidad estará disponible próximamente. Por ahora solo JavaScript Standalone está disponible.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generate');
    setGenerationProgress(0);

    try {
      // Simulate progress for better UX
      const progressSteps = [
        { progress: 20, message: 'Configurando generador...' },
        { progress: 40, message: 'Generando JavaScript core...' },
        { progress: 60, message: 'Compilando estilos CSS...' },
        { progress: 80, message: 'Creando archivos de demostración...' },
        { progress: 100, message: 'Finalizando exportación...' }
      ];

      for (const step of progressSteps) {
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Generate using StandaloneGenerator
      const result = await StandaloneGenerator.generate(webConfig);
      
      setExportResult(result);
      setCurrentStep('download');
    } catch (error) {
      console.error('Error generating web export:', error);
      alert('Error al generar la exportación: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download file
  const downloadFile = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(`${label} copiado`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setCopySuccess('Error al copiar');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  // Reset modal state when opening
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('configure');
      setExportResult(null);
      setGenerationProgress(0);
      setCopySuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-neutral-800/70 rounded-t-lg flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="font-mono text-lg font-semibold text-white">Web Export System</h2>
              <p className="text-sm text-neutral-400">Exporta Flynn para integración web</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono ${
                  currentStep === step.id
                    ? 'bg-green-600 text-white'
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-800 text-green-200'
                    : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.name}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-red-500/50 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Step 1: Configure */}
          {currentStep === 'configure' && (
            <div className="h-full flex">
              {/* Format Selection */}
              <div className="w-1/3 p-6 border-r border-neutral-700 overflow-y-auto">
                <h3 className="font-mono text-sm font-semibold text-white mb-4">Formato de Exportación</h3>
                <div className="space-y-3">
                  {exportFormats.map((format) => (
                    <div
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedFormat === format.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
                      } ${format.status === 'coming-soon' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-green-400">{format.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-mono text-sm font-medium text-white">{format.name}</h4>
                            {format.status === 'coming-soon' && (
                              <span className="px-2 py-0.5 bg-yellow-600 text-yellow-200 text-xs rounded font-mono">
                                Próximamente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">{format.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-green-400">📦 {format.size}</span>
                            <span className="text-blue-400">⚡ {format.complexity}</span>
                          </div>
                          <div className="mt-2">
                            {format.features.map((feature, index) => (
                              <span key={index} className="inline-block bg-neutral-700 text-neutral-300 text-xs px-2 py-0.5 rounded mr-1 mb-1">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Panel */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="font-mono text-sm font-semibold text-white mb-4">Configuración de Exportación</h3>
                
                {selectedFormat === 'standalone' ? (
                  <div className="space-y-6">
                    {/* Grid Configuration */}
                    <div className="bg-neutral-800/50 rounded-lg p-4">
                      <h4 className="font-mono text-sm font-medium text-green-400 mb-3">🔢 Configuración de Grid</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <SliderWithInput
                          label="Filas"
                          value={webConfig.gridConfig.rows}
                          min={3}
                          max={20}
                          step={1}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            gridConfig: { ...prev.gridConfig, rows: value }
                          }))}
                        />
                        <SliderWithInput
                          label="Columnas"
                          value={webConfig.gridConfig.cols}
                          min={3}
                          max={20}
                          step={1}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            gridConfig: { ...prev.gridConfig, cols: value }
                          }))}
                        />
                        <SliderWithInput
                          label="Espaciado"
                          value={webConfig.gridConfig.spacing}
                          min={20}
                          max={80}
                          step={5}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            gridConfig: { ...prev.gridConfig, spacing: value }
                          }))}
                        />
                        <SliderWithInput
                          label="Margen"
                          value={webConfig.gridConfig.margin}
                          min={0}
                          max={50}
                          step={5}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            gridConfig: { ...prev.gridConfig, margin: value }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Vector Configuration */}
                    <div className="bg-neutral-800/50 rounded-lg p-4">
                      <h4 className="font-mono text-sm font-medium text-green-400 mb-3">📐 Configuración de Vectores</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <SliderWithInput
                          label="Longitud"
                          value={webConfig.vectorConfig.length}
                          min={10}
                          max={50}
                          step={2}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            vectorConfig: { ...prev.vectorConfig, length: value }
                          }))}
                        />
                        <SliderWithInput
                          label="Grosor"
                          value={webConfig.vectorConfig.width}
                          min={1}
                          max={6}
                          step={0.5}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            vectorConfig: { ...prev.vectorConfig, width: value }
                          }))}
                        />
                        <div>
                          <label className="block text-xs font-medium text-neutral-300 mb-2">Color</label>
                          <input
                            type="color"
                            value={webConfig.vectorConfig.color}
                            onChange={(e) => setWebConfig(prev => ({
                              ...prev,
                              vectorConfig: { ...prev.vectorConfig, color: e.target.value }
                            }))}
                            className="w-full h-10 rounded border border-neutral-600 bg-transparent cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-300 mb-2">Forma</label>
                          <select
                            value={webConfig.vectorConfig.shape}
                            onChange={(e) => setWebConfig(prev => ({
                              ...prev,
                              vectorConfig: { ...prev.vectorConfig, shape: e.target.value as any }
                            }))}
                            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                          >
                            <option value="line">Línea</option>
                            <option value="arrow">Flecha</option>
                            <option value="circle">Círculo</option>
                            <option value="dash">Guión</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Animation Configuration */}
                    <div className="bg-neutral-800/50 rounded-lg p-4">
                      <h4 className="font-mono text-sm font-medium text-green-400 mb-3">🌊 Configuración de Animación</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-300 mb-2">Tipo</label>
                          <select
                            value={webConfig.animation.type}
                            onChange={(e) => setWebConfig(prev => ({
                              ...prev,
                              animation: { ...prev.animation, type: e.target.value as AnimationType }
                            }))}
                            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                          >
                            <option value="none">Sin animación</option>
                            <option value="wave">Onda</option>
                            <option value="vortex">Vórtice</option>
                            <option value="rotation">Rotación</option>
                            <option value="spiral">Espiral</option>
                            <option value="ripple">Ondas</option>
                            <option value="turbulence">Turbulencia</option>
                          </select>
                        </div>
                        <SliderWithInput
                          label="Velocidad"
                          value={webConfig.animation.speed}
                          min={0.1}
                          max={3.0}
                          step={0.1}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            animation: { ...prev.animation, speed: value }
                          }))}
                        />
                        <SliderWithInput
                          label="Intensidad"
                          value={webConfig.animation.intensity}
                          min={0.1}
                          max={2.0}
                          step={0.1}
                          onChange={(value) => setWebConfig(prev => ({
                            ...prev,
                            animation: { ...prev.animation, intensity: value }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Canvas & Interaction */}
                    <div className="bg-neutral-800/50 rounded-lg p-4">
                      <h4 className="font-mono text-sm font-medium text-green-400 mb-3">🖥️ Canvas e Interacción</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-white">
                            <input
                              type="checkbox"
                              checked={webConfig.canvas.responsive}
                              onChange={(e) => setWebConfig(prev => ({
                                ...prev,
                                canvas: { ...prev.canvas, responsive: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            Responsive (recomendado)
                          </label>
                          <label className="flex items-center gap-2 text-sm text-white">
                            <input
                              type="checkbox"
                              checked={webConfig.interaction.clickToPause}
                              onChange={(e) => setWebConfig(prev => ({
                                ...prev,
                                interaction: { ...prev.interaction, clickToPause: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            Click para pausar
                          </label>
                          <label className="flex items-center gap-2 text-sm text-white">
                            <input
                              type="checkbox"
                              checked={webConfig.interaction.mouseInfluence}
                              onChange={(e) => setWebConfig(prev => ({
                                ...prev,
                                interaction: { ...prev.interaction, mouseInfluence: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            Influencia del ratón
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-neutral-300 mb-2">Color de Fondo</label>
                          <input
                            type="color"
                            value={webConfig.canvas.background}
                            onChange={(e) => setWebConfig(prev => ({
                              ...prev,
                              canvas: { ...prev.canvas, background: e.target.value }
                            }))}
                            className="w-32 h-10 rounded border border-neutral-600 bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚧</div>
                    <h4 className="font-mono text-lg text-white mb-2">Próximamente</h4>
                    <p className="text-neutral-400">
                      {exportFormats.find(f => f.id === selectedFormat)?.name} estará disponible en una futura actualización.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="font-mono text-lg font-semibold text-white mb-4">Vista Previa de Configuración</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-mono text-sm font-medium text-green-400 mb-3">📊 Resumen de Exportación</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Formato:</span>
                      <span className="text-white font-mono">{exportFormats.find(f => f.id === selectedFormat)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Grid:</span>
                      <span className="text-white font-mono">{webConfig.gridConfig.rows}×{webConfig.gridConfig.cols} ({webConfig.gridConfig.rows * webConfig.gridConfig.cols} vectores)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Animación:</span>
                      <span className="text-white font-mono">{webConfig.animation.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Tamaño estimado:</span>
                      <span className="text-white font-mono">~50-80KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Responsive:</span>
                      <span className="text-white font-mono">{webConfig.canvas.responsive ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-mono text-sm font-medium text-green-400 mb-3">📋 Archivos a Generar</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-mono">flynn-standalone.js</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-mono">flynn-styles.css</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-green-400" />
                      <span className="text-white font-mono">demo.html</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-mono">config.json</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-mono">README.md</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
                <h4 className="font-mono text-sm font-medium text-green-400 mb-3">🔧 Código de Integración</h4>
                <pre className="bg-neutral-900 rounded p-3 text-sm text-green-400 overflow-x-auto">
{`<!-- Integración simple con HTML -->
<div class="flynn-container" data-flynn='{"animation":{"type":"${webConfig.animation.type}"}}'></div>
<script src="flynn-standalone.js"></script>

<!-- O usando JavaScript API -->
<script>
  const flynn = Flynn.create('#container', {
    animation: { type: '${webConfig.animation.type}', speed: ${webConfig.animation.speed} },
    gridConfig: { rows: ${webConfig.gridConfig.rows}, cols: ${webConfig.gridConfig.cols} }
  });
</script>`}
                </pre>
              </div>
            </div>
          )}

          {/* Step 3: Generate */}
          {currentStep === 'generate' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-neutral-600 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-green-400 rounded-full transition-all duration-300"
                    style={{
                      clipPath: `polygon(0 0, ${generationProgress}% 0, ${generationProgress}% 100%, 0 100%)`,
                      transform: 'rotate(-90deg)'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-mono font-bold text-white">{generationProgress}%</span>
                  </div>
                </div>
                
                <h3 className="font-mono text-xl font-semibold text-white mb-2">Generando Exportación Web</h3>
                <p className="text-neutral-400 mb-4">
                  Creando archivos optimizados para integración web...
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Procesando {selectedFormat} export
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Download */}
          {currentStep === 'download' && exportResult && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <CheckIcon className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="font-mono text-xl font-semibold text-white">¡Exportación Completada!</h3>
                  <p className="text-neutral-400">Tamaño total: {exportResult.bundleSize}KB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Downloads */}
                <div className="space-y-3">
                  <h4 className="font-mono text-sm font-medium text-green-400 mb-3">📁 Archivos Generados</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <CodeBracketIcon className="w-4 h-4 text-blue-400" />
                        <span className="font-mono text-sm text-white">flynn-standalone.js</span>
                        <span className="text-xs text-neutral-400">{Math.round(exportResult.js.length / 1024)}KB</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(exportResult.js, 'JavaScript')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => downloadFile(exportResult.js, 'flynn-standalone.js', 'application/javascript')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-purple-400" />
                        <span className="font-mono text-sm text-white">flynn-styles.css</span>
                        <span className="text-xs text-neutral-400">{Math.round(exportResult.css.length / 1024)}KB</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(exportResult.css, 'CSS')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => downloadFile(exportResult.css, 'flynn-styles.css', 'text/css')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4 text-green-400" />
                        <span className="font-mono text-sm text-white">demo.html</span>
                        <span className="text-xs text-neutral-400">{Math.round(exportResult.demo.length / 1024)}KB</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(exportResult.demo, 'Demo HTML')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => downloadFile(exportResult.demo, 'demo.html', 'text/html')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-white">README.md</span>
                        <span className="text-xs text-neutral-400">{Math.round(exportResult.instructions.length / 1024)}KB</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(exportResult.instructions, 'Instrucciones')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => downloadFile(exportResult.instructions, 'README.md', 'text/markdown')}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Integration */}
                <div>
                  <h4 className="font-mono text-sm font-medium text-green-400 mb-3">🚀 Integración Rápida</h4>
                  <div className="bg-neutral-900 rounded p-4 text-sm">
                    <pre className="text-green-400 whitespace-pre-wrap">{`<!-- Opción 1: Auto-inicialización -->
<link rel="stylesheet" href="flynn-styles.css">
<div class="flynn-container" data-flynn='{"animation":{"type":"${webConfig.animation.type}"}}'></div>
<script src="flynn-standalone.js"></script>

<!-- Opción 2: JavaScript API -->
<script>
const flynn = Flynn.create('#container', {
  animation: { 
    type: '${webConfig.animation.type}', 
    speed: ${webConfig.animation.speed} 
  }
});
</script>`}</pre>
                  </div>
                </div>
              </div>

              {copySuccess && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg font-mono text-sm animate-pulse">
                  ✅ {copySuccess}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-700 bg-neutral-800/30 rounded-b-lg">
          <div className="text-sm text-neutral-400 font-mono">
            {currentStep === 'configure' && `${webConfig.gridConfig.rows * webConfig.gridConfig.cols} vectores • ${selectedFormat}`}
            {currentStep === 'preview' && 'Revisa la configuración antes de generar'}
            {currentStep === 'generate' && 'Generando archivos...'}
            {currentStep === 'download' && `Exportación completada • ${exportResult?.bundleSize}KB total`}
          </div>
          
          <div className="flex gap-3">
            {currentStep !== 'generate' && (
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-sm border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded transition-colors"
              >
                {currentStep === 'download' ? 'Cerrar' : 'Cancelar'}
              </button>
            )}
            
            {currentStep === 'configure' && (
              <button
                onClick={() => setCurrentStep('preview')}
                disabled={selectedFormat !== 'standalone'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition-colors"
              >
                Vista Previa
                <DocumentIcon className="w-4 h-4" />
              </button>
            )}
            
            {currentStep === 'preview' && (
              <>
                <button
                  onClick={() => setCurrentStep('configure')}
                  className="px-4 py-2 text-sm border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-sm transition-colors"
                >
                  Generar Exportación
                  <CodeBracketIcon className="w-4 h-4" />
                </button>
              </>
            )}
            
            {currentStep === 'download' && (
              <button
                onClick={() => {
                  // Download all files as ZIP would be ideal, but for now download the main JS file
                  downloadFile(exportResult.js, 'flynn-standalone.js', 'application/javascript');
                  downloadFile(exportResult.css, 'flynn-styles.css', 'text/css');
                  downloadFile(exportResult.demo, 'demo.html', 'text/html');
                  downloadFile(exportResult.instructions, 'README.md', 'text/markdown');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Descargar Todo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};