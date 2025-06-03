'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Save, FolderOpen } from 'lucide-react';
import { SimpleVectorGridOptimized } from '@/components/features/vector-grid/simple/SimpleVectorGridOptimized';
import { 
  getAllAnimations, 
  getDefaultProps
} from '@/components/features/vector-grid/simple/animations';
import { PRESET_GRADIENTS } from '@/components/features/vector-grid/types/gradientTypes';
import { ExportControls } from '@/components/features/vector-grid/components/ExportControls';
import { PulseButton } from '@/components/features/vector-grid/components/PulseButton';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { useKeyboardControls } from '@/components/features/vector-grid/hooks/useKeyboardControls';
import Tooltip from '@/components/ui/Tooltip';
import SaveConfigModal from '@/components/features/vector-grid/simple/SaveConfigModal';
import ConfigurationsPanel from '@/components/features/vector-grid/simple/ConfigurationsPanel';
import { GifExportModal } from '@/components/features/vector-grid/components/GifExportModal';
import type { 
  GridConfig, 
  VectorConfig, 
  SimpleVectorGridRef,
  AnimationType,
  RotationOrigin,
  ZoomConfig,
  SavedAnimation,
  AnimationConfig
} from '@/components/features/vector-grid/simple/simpleTypes';

// Configuraciones por defecto
const DEFAULT_GRID_CONFIG: GridConfig = {
  rows: 12,
  cols: 18,
  spacing: 30,
  margin: 20
};

const DEFAULT_VECTOR_CONFIG: VectorConfig = {
  shape: 'line',
  length: 24,
  width: 2,
  color: '#10b981',
  rotationOrigin: 'center',
  strokeLinecap: 'butt'
};

const DEFAULT_ZOOM_CONFIG: ZoomConfig = {
  level: 1.0,           // 100% por defecto
  min: 0.1,            // 10% mínimo
  max: 5.0,            // 500% máximo
  step: 0.1,           // Incrementos de 10%
  presets: [0.25, 0.5, 1.0, 1.5, 2.0] // 25%, 50%, 100%, 150%, 200%
};



// ✅ Sistema de animaciones modular - Sin conversiones necesarias

export default function VectorGridLab() {
  // Referencias
  const vectorGridRef = useRef<SimpleVectorGridRef>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // 🚀 Estados de configuración con lazy initialization
  const [baseGridConfig, setBaseGridConfig] = useState<GridConfig>(() => DEFAULT_GRID_CONFIG);
  const [baseVectorConfig, setBaseVectorConfig] = useState<VectorConfig>(() => DEFAULT_VECTOR_CONFIG);
  const [zoomConfig, setZoomConfig] = useState<ZoomConfig>(() => DEFAULT_ZOOM_CONFIG);
  const [currentAnimationId, setCurrentAnimationId] = useState<string>('smoothWaves');
  const [animationProps, setAnimationProps] = useState<Record<string, unknown>>(() => {
    // Solo calcular props por defecto si estamos en cliente
    if (typeof window === 'undefined') return {};
    return getDefaultProps('smoothWaves');
  });
  const [isPaused, setIsPaused] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Estados para sistema de configuraciones guardadas
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfigsPanel, setShowConfigsPanel] = useState(false);
  const [showGifExportModal, setShowGifExportModal] = useState(false);
  
  // 🔍 Funciones de cálculo de zoom
  const scaledGridConfig = useMemo((): GridConfig => ({
    ...baseGridConfig,
    rows: baseGridConfig.rows,
    cols: baseGridConfig.cols,
    spacing: Math.round(baseGridConfig.spacing * zoomConfig.level),
    margin: Math.round(baseGridConfig.margin * zoomConfig.level)
  }), [baseGridConfig, zoomConfig.level]);

  const scaledVectorConfig = useMemo((): VectorConfig => ({
    ...baseVectorConfig,
    length: Math.round(baseVectorConfig.length * zoomConfig.level),
    width: Math.max(1, Math.round(baseVectorConfig.width * zoomConfig.level)) // Mínimo 1px
  }), [baseVectorConfig, zoomConfig.level]);

  // Estado para configuración dinámica removido para simplificar
  
  // 🚀 Dimensiones del canvas - lazy y responsivo  
  const [canvasDimensions, setCanvasDimensions] = useState(() => ({ width: 800, height: 600 }));

  // 🚀 Obtener animaciones con memoización
  const availableAnimations = useMemo(() => getAllAnimations(), []);
  const currentAnimation = useMemo(() => 
    availableAnimations.find(anim => anim.id === currentAnimationId), 
    [availableAnimations, currentAnimationId]
  );

  // 🚀 Funciones memoizadas para evitar re-renders
  const handleTriggerPulse = useCallback(() => {
    vectorGridRef.current?.triggerPulse();
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Función de inspección dinámica removida

  console.log('[VectorGridLab] Rendering. currentAnimationId:', currentAnimationId, 'animationProps:', JSON.stringify(animationProps));

  // Hook para controles de teclado
  useKeyboardControls({
    onTogglePause: handleTogglePause,
    onTriggerPulse: handleTriggerPulse,
    isPaused
  });

  // 🚀 Función para actualizar dimensiones con throttling implícito
  const updateCanvasDimensions = useCallback(() => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      
      // ✅ Ampliar canvas - reducir espacio libre a la mitad (padding de 32px → 16px)
      const rawWidth = rect.width - 16;
      const rawHeight = rect.height - 16;
      
      // Aplicar mínimos y máximos razonables para evitar canvas gigantes
      const width = Math.min(Math.max(400, rawWidth), 1800);
      const height = Math.min(Math.max(300, rawHeight), 1200);
      
      setCanvasDimensions(prev => {
        // Solo actualizar si hay cambio significativo (>10px)
        if (Math.abs(prev.width - width) > 10 || Math.abs(prev.height - height) > 10) {
          return { width, height };
        }
        return prev;
      });
    }
  }, []);

  // Efecto para actualizar dimensiones al montar y redimensionar
  useEffect(() => {
    updateCanvasDimensions();
    
    const handleResize = () => {
      updateCanvasDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasDimensions]);

  // 🚀 Efecto para actualizar props cuando cambia la animación (solo en cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultProps = getDefaultProps(currentAnimationId);
      setAnimationProps(defaultProps);
    }
  }, [currentAnimationId]);

  // 🚀 Funciones memoizadas para cambios de animación
  const handleAnimationChange = useCallback((animationId: string) => {
    setCurrentAnimationId(animationId);
    // 🔧 RESETEAR vectores para limpiar colores anteriores
    if (vectorGridRef.current?.resetVectors) {
      vectorGridRef.current.resetVectors();
    }
  }, []);

  const updateAnimationProp = useCallback((propId: string, value: unknown) => {
    setAnimationProps(prev => ({
      ...prev,
      [propId]: value
    }));
  }, []);

  // 🚀 Funciones para configuraciones guardadas
  const handleSaveConfig = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleLoadConfig = useCallback((config: SavedAnimation) => {
    // Cargar configuraciones
    setBaseGridConfig(config.gridConfig);
    setBaseVectorConfig(config.vectorConfig);
    setZoomConfig(config.zoomConfig);
    
    // Cargar animación y sus props
    setCurrentAnimationId(config.animationConfig.type);
    setAnimationProps(config.animationConfig.props);
    
    // Cerrar panel si está abierto
    setShowConfigsPanel(false);
  }, []);

  const handleConfigSaved = useCallback((config: SavedAnimation) => {
    // Opcional: mostrar notificación de éxito
    console.log('Configuration saved:', config.name);
  }, []);

  const handleDeleteConfig = useCallback((configId: string) => {
    // Opcional: mostrar notificación de eliminación
    console.log('Configuration deleted:', configId);
  }, []);

  // Crear configuración de animación actual para guardar
  const currentAnimationConfig: AnimationConfig = useMemo(() => ({
    type: currentAnimationId as AnimationType,
    props: animationProps
  }), [currentAnimationId, animationProps]);

  // 🚀 Renderizar controles memoizado para evitar re-renders innecesarios
  const renderAnimationControls = useMemo(() => {
    if (!currentAnimation) return null;

    return (
      <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
        
        <div className="space-y-4">
          {currentAnimation.controls.map(control => (
            <div key={control.id}>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-medium text-sidebar-foreground">
                  {control.icon && <span className="mr-1">{control.icon}</span>}
                  {control.label}: {String(animationProps[control.id] ?? control.defaultValue)}
                </label>
                {control.description && (
                  <Tooltip content={control.description} position="top">
                    <InformationCircleIcon className="w-4 h-4 text-sidebar-foreground/40 hover:text-sidebar-foreground/70 cursor-help transition-colors" />
                  </Tooltip>
                )}
              </div>
              
              {control.type === 'slider' && (
                <input 
                  type="range" 
                  min={control.min} 
                  max={control.max} 
                  step={control.step}
                  value={(animationProps[control.id] as number) ?? (control.defaultValue as number)} 
                  onChange={(e) => updateAnimationProp(
                    control.id, 
                    control.step && control.step < 1 
                      ? parseFloat(e.target.value) 
                      : parseInt(e.target.value)
                  )}
                  className="w-full h-2 bg-sidebar rounded-lg appearance-none cursor-pointer accent-sidebar-primary"
                />
              )}
              
              {control.type === 'select' && control.options && (
                <select 
                  value={(animationProps[control.id] as string) ?? (control.defaultValue as string)} 
                  onChange={(e) => updateAnimationProp(control.id, e.target.value)}
                  className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs focus:ring-2 focus:ring-sidebar-ring"
                >
                  {control.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {control.type === 'toggle' && (
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={(animationProps[control.id] as boolean) ?? (control.defaultValue as boolean)}
                    onChange={(e) => updateAnimationProp(control.id, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-xs text-sidebar-foreground">
                    {control.description || 'Activar'}
                  </span>
                </label>
              )}
              
              {control.type === 'color' && (
                <input 
                  type="color" 
                  value={(animationProps[control.id] as string) ?? (control.defaultValue as string)}
                  onChange={(e) => updateAnimationProp(control.id, e.target.value)}
                  className="w-full h-8 border border-sidebar-border rounded"
                />
              )}
              

            </div>
          ))}
          
          {/* Botón Pulso al final de los controles - SOLO para centerPulse */}
          {currentAnimationId === 'centerPulse' && (
            <div className="pt-3 border-t border-sidebar-border">
              <PulseButton 
                onTriggerPulse={handleTriggerPulse}
                size="small"
                className="w-full justify-center"
              />
            </div>
          )}
        </div>
      </div>
    );
  }, [currentAnimation, animationProps, updateAnimationProp, handleTriggerPulse, currentAnimationId]);

  // ✅ Props directos sin conversión legacy

  return (
    <div className="min-h-screen bg-background text-foreground">


      {/* Main Layout */}
      <div className="flex h-screen">
        
        {/* Columna Izquierda - Animaciones */}
        <div className="w-80 bg-sidebar border-r border-sidebar-border">
          
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Selector de animación */}
            <div>
              <select 
                value={currentAnimationId} 
                onChange={(e) => handleAnimationChange(e.target.value)}
                className="w-full bg-sidebar-accent border border-sidebar-border text-sidebar-foreground p-2 rounded focus:ring-2 focus:ring-sidebar-ring"
              >
                {availableAnimations.map(animation => (
                  <option key={animation.id} value={animation.id}>
                    {animation.icon} {animation.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Controles de la animación actual */}
            {renderAnimationControls}
            
            {/* Herramientas 🔧 */}
            <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                🔧 Herramientas
              </h3>
              
              {/* Configuraciones Guardadas */}
              <div className="space-y-2 mb-4 pb-4 border-b border-sidebar-border">
                <button
                  onClick={handleSaveConfig}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  Guardar Configuración
                </button>
                
                <button
                  onClick={() => setShowConfigsPanel(!showConfigsPanel)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    showConfigsPanel 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <FolderOpen size={16} />
                  {showConfigsPanel ? 'Ocultar' : 'Ver'} Configuraciones
                </button>
              </div>
              
              {/* Controles Debug/Performance */}
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-sidebar-foreground">Modo Debug</span>
                </label>
                
                <div className="text-xs text-sidebar-foreground/60">
                  Performance: {canvasDimensions.width}×{canvasDimensions.height} | Vectores: {scaledGridConfig.cols * scaledGridConfig.rows} | Zoom: {Math.round(zoomConfig.level * 100)}%
                </div>
              </div>
              
              {/* Exportación GIF */}
              <div className="border-t border-sidebar-border pt-3 mb-3">
                <button
                  onClick={() => setShowGifExportModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  Exportar GIF
                </button>
              </div>

              {/* Exportación Código */}
              <ExportControls 
              gridRef={vectorGridRef}
              gridConfig={scaledGridConfig}
              vectorConfig={scaledVectorConfig}
              animationType={currentAnimationId as AnimationType}
              canvasDimensions={canvasDimensions}
              animationProps={animationProps}
              className="border-t border-sidebar-border pt-3"
              />
            </div>
          </div>
        </div>

        {/* Columna Central - Canvas */}
        <div className="flex-1 bg-background relative" ref={canvasContainerRef}>
          <div className="h-full flex items-center justify-center p-4">
            <SimpleVectorGridOptimized
              ref={vectorGridRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              gridConfig={scaledGridConfig}
              vectorConfig={scaledVectorConfig}
              animationType={currentAnimationId as AnimationType}
              animationProps={animationProps as any}
              isPaused={isPaused}
              debugMode={debugMode}
            />
          </div>
          
          {/* Controles de Zoom Flotantes - Centro Inferior */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-sidebar-accent/90 backdrop-blur-sm border border-sidebar-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              {/* Botones de Zoom Rápido */}
              <div className="flex items-center gap-1">
                {zoomConfig.presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setZoomConfig(prev => ({ ...prev, level: preset }))}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      Math.abs(zoomConfig.level - preset) < 0.05
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                    title={`Zoom ${Math.round(preset * 100)}%`}
                  >
                    {Math.round(preset * 100)}%
                  </button>
                ))}
              </div>

              {/* Separador */}
              <div className="w-px h-6 bg-sidebar-border"></div>

              {/* Controles de Incremento */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomConfig(prev => ({ 
                    ...prev, 
                    level: Math.max(prev.min, prev.level - prev.step) 
                  }))}
                  disabled={zoomConfig.level <= zoomConfig.min}
                  className="w-8 h-8 bg-sidebar border border-sidebar-border rounded text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm font-bold"
                  title="Zoom Out"
                >
                  −
                </button>

                <div className="px-3 py-1 bg-sidebar border border-sidebar-border rounded text-xs text-sidebar-foreground min-w-[4rem] text-center">
                  {Math.round(zoomConfig.level * 100)}%
                </div>

                <button
                  onClick={() => setZoomConfig(prev => ({ 
                    ...prev, 
                    level: Math.min(prev.max, prev.level + prev.step) 
                  }))}
                  disabled={zoomConfig.level >= zoomConfig.max}
                  className="w-8 h-8 bg-sidebar border border-sidebar-border rounded text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm font-bold"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              {/* Separador */}
              <div className="w-px h-6 bg-sidebar-border"></div>

              {/* Reset Zoom */}
              <button
                onClick={() => setZoomConfig(prev => ({ ...prev, level: 1.0 }))}
                className="px-3 py-1 text-xs bg-sidebar border border-sidebar-border rounded text-sidebar-foreground hover:bg-sidebar-accent transition-all"
                title="Reset Zoom (100%)"
              >
                🔍 Reset
              </button>
            </div>
          </div>
           
           {/* Botón Pause/Play Flotante - Reposicionado */}
           <button
             onClick={handleTogglePause}
             className="absolute bottom-4 right-4 w-12 h-12 bg-sidebar-accent/90 hover:bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
             title={isPaused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
           >
            {isPaused ? (
              <svg className="w-5 h-5 text-sidebar-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-sidebar-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Columna Derecha - Configuración */}
        <div className="w-80 bg-sidebar border-l border-sidebar-border">
          
          <div className="h-full overflow-y-auto">
            {showConfigsPanel ? (
              <ConfigurationsPanel
                onLoadConfig={handleLoadConfig}
                onDeleteConfig={handleDeleteConfig}
              />
            ) : (
              <div className="p-4 space-y-6">
            {/* Grid Config */}
            <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Cuadrícula</h3>
              <div className="space-y-3">
                {/* Controles editables para valores base */}

                <SliderWithInput
                  label="Filas"
                  value={baseGridConfig.rows}
                  min={5}
                  max={50}
                  onChange={(rows) => setBaseGridConfig(prev => ({ ...prev, rows }))}
                  inputWidth="sm"
                />
                <SliderWithInput
                  label="Columnas"
                  value={baseGridConfig.cols}
                  min={5}
                  max={50}
                  onChange={(cols) => setBaseGridConfig(prev => ({ ...prev, cols }))}
                  inputWidth="sm"
                />
                <SliderWithInput
                  label="Espaciado"
                  value={baseGridConfig.spacing}
                  min={20}
                  max={50}
                  onChange={(spacing) => setBaseGridConfig(prev => ({ ...prev, spacing }))}
                  suffix="px"
                  inputWidth="sm"
                />
              </div>
            </div>

            {/* Vector Config */}
            <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Vectores</h3>
              <div className="space-y-3">

                <SliderWithInput
                  label="Longitud"
                  value={baseVectorConfig.length}
                  min={10}
                  max={600}
                  onChange={(length) => setBaseVectorConfig(prev => ({ ...prev, length }))}
                  suffix="px"
                  inputWidth="sm"
                />
                
                <SliderWithInput
                  label="Grosor"
                  value={baseVectorConfig.width}
                  min={1}
                  max={8}
                  onChange={(width) => setBaseVectorConfig(prev => ({ ...prev, width }))}
                  suffix="px"
                  inputWidth="sm"
                />
                
                {/* Selector de Color/Degradado */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-sidebar-foreground">
                    Color/Degradado
                  </label>
                  
                  {/* Selector de tipo */}
                  <div className="mb-2">
                    <select 
                      value={typeof baseVectorConfig.color === 'string' ? 'solid' : 'gradient'}
                      onChange={(e) => {
                      if (e.target.value === 'solid') {
                      setBaseVectorConfig(prev => ({ ...prev, color: '#10b981' }));
                      } else {
                      setBaseVectorConfig(prev => ({ ...prev, color: PRESET_GRADIENTS.sunset }));
                      }
                      }}
                      className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                    >
                      <option value="solid">🎨 Color Sólido</option>
                      <option value="gradient">🌈 Degradado</option>
                    </select>
                  </div>
                  
                  {/* Control específico según el tipo */}
                  {typeof baseVectorConfig.color === 'string' ? (
                    <input 
                      type="color" 
                      value={baseVectorConfig.color as string} 
                      onChange={(e) => setBaseVectorConfig(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-8 border border-sidebar-border rounded"
                    />
                  ) : (
                    <div className="space-y-2">
                      <select 
                        value={Object.keys(PRESET_GRADIENTS).find(key => 
                        PRESET_GRADIENTS[key] === baseVectorConfig.color
                        ) || 'sunset'}
                        onChange={(e) => setBaseVectorConfig(prev => ({ 
                        ...prev, 
                        color: PRESET_GRADIENTS[e.target.value] 
                        }))}
                        className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                      >
                        {Object.entries(PRESET_GRADIENTS).map(([key, gradient]) => (
                          <option key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} ({gradient.type})
                          </option>
                        ))}
                      </select>
                      
                      {/* Preview del degradado */}
                      <div 
                        className="w-full h-6 border border-sidebar-border rounded"
                        style={{
                          background: typeof baseVectorConfig.color === 'object' && 'type' in baseVectorConfig.color
                          ? baseVectorConfig.color.type === 'linear' 
                          ? `linear-gradient(${baseVectorConfig.color.angle || 0}deg, ${baseVectorConfig.color.colors.map(c => `${c.color} ${c.offset * 100}%`).join(', ')})`
                          : `radial-gradient(circle, ${baseVectorConfig.color.colors.map(c => `${c.color} ${c.offset * 100}%`).join(', ')})`
                            : '#10b981'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
                    Forma
                  </label>
                  <select 
                  value={baseVectorConfig.shape} 
                  onChange={(e) => setBaseVectorConfig(prev => ({ ...prev, shape: e.target.value as VectorConfig["shape"] }))}
                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                  >
                    <option value="line">📏 Línea</option>
                    <option value="curve">🌊 Curva</option>
                    <option value="circle">⭕ Círculo</option>
                  </select>
                </div>

                {/* Control de Punto de Rotación */}
                <div>
                <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
                Punto de Rotación
                </label>
                <select 
                value={baseVectorConfig.rotationOrigin} 
                onChange={(e) => setBaseVectorConfig(prev => ({ ...prev, rotationOrigin: e.target.value as RotationOrigin }))}
                className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                >
                <option value="center">🎯 Centro</option>
                <option value="start">⬅️ Inicio (Cola)</option>
                <option value="end">➡️ Final (Punta)</option>
                </select>
                <p className="text-xs text-sidebar-foreground/60 mt-1">
                Punto alrededor del cual rota el vector
                </p>
                </div>

                {/* Control de Terminaciones de Línea */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
                    Terminaciones
                  </label>
                  <select 
                    value={baseVectorConfig.strokeLinecap} 
                    onChange={(e) => setBaseVectorConfig(prev => ({ ...prev, strokeLinecap: e.target.value as VectorConfig["strokeLinecap"] }))}
                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                  >
                    <option value="butt">📐 Sin Terminación</option>
                    <option value="round">🔵 Redondeadas</option>
                    <option value="square">⬜ Cuadradas</option>
                  </select>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">
                    Estilo de las puntas de los vectores
                  </p>
                </div>

                 {/* Controles de longitud dinámica removidos */}
              </div>
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal para guardar configuraciones */}
      <SaveConfigModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        gridConfig={baseGridConfig}
        vectorConfig={baseVectorConfig}
        animationConfig={currentAnimationConfig}
        zoomConfig={zoomConfig}
        onSaved={handleConfigSaved}
      />

      {/* Modal para exportar GIF */}
      <GifExportModal
        isOpen={showGifExportModal}
        onClose={() => setShowGifExportModal(false)}
        gridRef={vectorGridRef}
      />
    </div>
  );
}
