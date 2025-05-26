'use client';

import { useState, useRef, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
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
import type { 
  GridConfig, 
  VectorConfig, 
  SimpleVectorGridRef,
  AnimationType,
  DynamicVectorConfig,
  RotationOrigin
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
  rotationOrigin: 'center'
};



// ✅ Sistema de animaciones modular - Sin conversiones necesarias

export default function VectorGridLab() {
  // Referencias
  const vectorGridRef = useRef<SimpleVectorGridRef>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Estados de configuración
  const [gridConfig, setGridConfig] = useState<GridConfig>(DEFAULT_GRID_CONFIG);
  const [vectorConfig, setVectorConfig] = useState<VectorConfig>(DEFAULT_VECTOR_CONFIG);
  const [currentAnimationId, setCurrentAnimationId] = useState<string>('smoothWaves');
  const [animationProps, setAnimationProps] = useState<Record<string, unknown>>(() => {
    // Inicializar con las props por defecto de smoothWaves
    return getDefaultProps('smoothWaves');
  });
  const [isPaused, setIsPaused] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Estado para configuración dinámica
  const [dynamicConfig] = useState<DynamicVectorConfig>({
    enableDynamicLength: false,
    enableDynamicWidth: false,
    lengthMultiplier: 1.5,
    widthMultiplier: 1.2,
    responsiveness: 0.8,
    smoothing: 0.8
  });
  
  // Dimensiones del canvas - responsivo
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });

  // Obtener todas las animaciones disponibles
  const availableAnimations = getAllAnimations();
  const currentAnimation = availableAnimations.find(anim => anim.id === currentAnimationId);

  // Función para disparar pulso
  const handleTriggerPulse = () => {
    vectorGridRef.current?.triggerPulse();
  };

  // Función para alternar pausa
  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Hook para controles de teclado
  useKeyboardControls({
    onTogglePause: handleTogglePause,
    onTriggerPulse: handleTriggerPulse,
    isPaused
  });

  // Función para actualizar las dimensiones del canvas
  const updateCanvasDimensions = () => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const width = Math.max(800, rect.width - 32);
      const height = Math.max(600, rect.height - 32);
      setCanvasDimensions({ width, height });
    }
  };

  // Efecto para actualizar dimensiones al montar y redimensionar
  useEffect(() => {
    updateCanvasDimensions();
    
    const handleResize = () => {
      updateCanvasDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efecto para actualizar props cuando cambia la animación
  useEffect(() => {
    const defaultProps = getDefaultProps(currentAnimationId);
    setAnimationProps(defaultProps);
  }, [currentAnimationId]);

  // Función para cambiar el tipo de animación
  const handleAnimationChange = (animationId: string) => {
    setCurrentAnimationId(animationId);
  };

  // Función para actualizar props de animación
  const updateAnimationProp = (propId: string, value: unknown) => {
    setAnimationProps(prev => ({
      ...prev,
      [propId]: value
    }));
  };

  // Renderizar controles para la animación actual
  const renderAnimationControls = () => {
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
  };

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
            {renderAnimationControls()}
            
            {/* Herramientas 🔧 */}
            <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                🔧 Herramientas
              </h3>
              
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
                  Performance: {canvasDimensions.width}×{canvasDimensions.height} | Vectores: {gridConfig.cols * gridConfig.rows}
                </div>
              </div>
              
              {/* Exportación */}
              <ExportControls 
                gridRef={vectorGridRef}
                gridConfig={gridConfig}
                vectorConfig={vectorConfig}
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
              gridConfig={gridConfig}
              vectorConfig={vectorConfig}
              animationType={currentAnimationId as AnimationType}
              animationProps={{
                type: currentAnimationId,
                ...animationProps
              } as any}
              dynamicVectorConfig={dynamicConfig}
              isPaused={isPaused}
              debugMode={debugMode}
            />
          </div>
          
          {/* Botón Pause/Play Flotante */}
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
          
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Grid Config */}
            <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Cuadrícula</h3>
              <div className="space-y-3">
                <SliderWithInput
                  label="Filas"
                  value={gridConfig.rows}
                  min={5}
                  max={50}
                  onChange={(rows) => {
                    setGridConfig(prev => ({ ...prev, rows }));
                  }}
                  inputWidth="sm"
                />
                <SliderWithInput
                  label="Columnas"
                  value={gridConfig.cols}
                  min={5}
                  max={50}
                  onChange={(cols) => {
                    setGridConfig(prev => ({ ...prev, cols }));
                  }}
                  inputWidth="sm"
                />
                <SliderWithInput
                  label="Espaciado"
                  value={gridConfig.spacing}
                  min={20}
                  max={50}
                  onChange={(spacing) => {
                    setGridConfig(prev => ({ ...prev, spacing }));
                  }}
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
                  value={vectorConfig.length}
                  min={10}
                  max={600}
                  onChange={(length) => {
                    setVectorConfig(prev => ({ ...prev, length }));
                  }}
                  suffix="px"
                  inputWidth="sm"
                />
                
                <SliderWithInput
                  label="Grosor"
                  value={vectorConfig.width}
                  min={1}
                  max={8}
                  onChange={(width) => {
                    setVectorConfig(prev => ({ ...prev, width }));
                  }}
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
                      value={typeof vectorConfig.color === 'string' ? 'solid' : 'gradient'}
                      onChange={(e) => {
                        if (e.target.value === 'solid') {
                          setVectorConfig(prev => ({ ...prev, color: '#10b981' }));
                        } else {
                          setVectorConfig(prev => ({ ...prev, color: PRESET_GRADIENTS.sunset }));
                        }
                      }}
                      className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                    >
                      <option value="solid">🎨 Color Sólido</option>
                      <option value="gradient">🌈 Degradado</option>
                    </select>
                  </div>
                  
                  {/* Control específico según el tipo */}
                  {typeof vectorConfig.color === 'string' ? (
                    <input 
                      type="color" 
                      value={vectorConfig.color} 
                      onChange={(e) => setVectorConfig(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-8 border border-sidebar-border rounded"
                    />
                  ) : (
                    <div className="space-y-2">
                      <select 
                        value={Object.keys(PRESET_GRADIENTS).find(key => 
                          PRESET_GRADIENTS[key] === vectorConfig.color
                        ) || 'sunset'}
                        onChange={(e) => setVectorConfig(prev => ({ 
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
                          background: typeof vectorConfig.color === 'object' && 'type' in vectorConfig.color
                            ? vectorConfig.color.type === 'linear' 
                              ? `linear-gradient(${vectorConfig.color.angle || 0}deg, ${vectorConfig.color.colors.map(c => `${c.color} ${c.offset * 100}%`).join(', ')})`
                              : `radial-gradient(circle, ${vectorConfig.color.colors.map(c => `${c.color} ${c.offset * 100}%`).join(', ')})`
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
                    value={vectorConfig.shape} 
                    onChange={(e) => setVectorConfig(prev => ({ ...prev, shape: e.target.value as VectorConfig["shape"] }))}
                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                  >
                    <option value="line">📏 Línea</option>
                    <option value="arrow">➡️ Flecha</option>
                    <option value="curve">🌊 Curva</option>
                    <option value="circle">⭕ Círculo</option>
                    <option value="dot">⚫ Punto</option>
                  </select>
                </div>

                {/* Control de Punto de Rotación */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-sidebar-foreground">
                    Punto de Rotación
                  </label>
                  <select 
                    value={vectorConfig.rotationOrigin} 
                    onChange={(e) => setVectorConfig(prev => ({ ...prev, rotationOrigin: e.target.value as RotationOrigin }))}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
