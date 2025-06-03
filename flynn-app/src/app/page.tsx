'use client';

import './dev/dev.css';
import { useState, useCallback, useEffect, useRef } from 'react';
import DemoVectorGrid from './dev/DemoVectorGrid';
import LengthDynamicsHelp from './dev/LengthDynamicsHelp';
import SliderWithInput from '@/components/features/vector-grid/components/SliderWithInput';
import { useKeyboardControls } from '@/components/features/vector-grid/hooks/useKeyboardControls';
import { GradientEditorModal } from '@/components/ui/GradientEditorModal';
import { SimpleTabs } from '@/components/ui/SimpleTabs';
import { useCustomGradients } from '@/lib/customGradients';
import type { GradientColor } from '@/domain/color/types';
import { ExportModal } from '@/components/features/vector-grid/components/ExportModal';
import { GifExportModal } from '@/components/features/vector-grid/components/GifExportModal';
import type { AnimationType as ExportAnimationType } from '@/components/features/vector-grid/simple/simpleTypes';


type AnimationType = 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence' | 'pinwheels' | 'seaWaves' | 'geometricPattern' | 'flowField' | 'curlNoise' | 'rippleEffect' | 'perlinFlow' | 'gaussianGradient';
type GridPattern = 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar';

interface PresetConfig {
    name: string;
    gridSize: number;
    gridPattern: GridPattern;
    animation: AnimationType;
    speed: number;
    intensity: number;
    // New Color System
    colorMode: 'solid' | 'gradient' | 'dynamic';
    solidColor: string;
    gradientPalette: 'flow' | 'rainbow' | 'cosmic' | 'pulse' | 'subtle' | 'sunset' | 'ocean' | string; // string para custom gradients
    // Dynamic Color Properties
    colorIntensityMode: 'field' | 'velocity' | 'distance' | 'angle';
    colorHueShift: number;
    colorSaturation: number;
    colorBrightness: number;
    // Length Dynamics
    lengthMin: number;
    lengthMax: number;
    oscillationFreq: number;
    oscillationAmp: number;
    pulseSpeed: number;
    spatialFactor: number;
    spatialMode: 'edge' | 'center' | 'mixed';
    mouseInfluence: number;
    mouseMode: 'attract' | 'repel' | 'stretch';
    physicsMode: 'none' | 'velocity' | 'pressure' | 'field';
    // Vector Shape System
    vectorShape: 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
    showArrowheads: boolean;
    curvatureIntensity: number;
    waveFrequency: number;
    spiralTightness: number;
    organicNoise: number;
    // Hybrid System
    rows?: number;
    cols?: number;
    spacing?: number;
    canvasWidth?: number;
    canvasHeight?: number;
    margin?: number;
    // Animation Control
    isPaused: boolean;
}



export default function DevPage() {

    const [config, setConfig] = useState<PresetConfig>({
        name: 'Custom', gridSize: 25, gridPattern: 'regular', animation: 'wave', speed: 1, intensity: 0.5,
        colorMode: 'solid', solidColor: '#3b82f6', gradientPalette: 'flow',
        colorIntensityMode: 'field', colorHueShift: 1, colorSaturation: 80, colorBrightness: 60,
        lengthMin: 10, lengthMax: 25, oscillationFreq: 1, oscillationAmp: 0.3, pulseSpeed: 1, spatialFactor: 0.2, spatialMode: 'edge', mouseInfluence: 0, mouseMode: 'attract', physicsMode: 'none',
        vectorShape: 'straight', showArrowheads: true, curvatureIntensity: 1, waveFrequency: 2, spiralTightness: 1, organicNoise: 0.5,
        spacing: 80,
        isPaused: false
    });
    const [showLengthHelp, setShowLengthHelp] = useState(false);
    const [showGradientEditor, setShowGradientEditor] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showGifExportModal, setShowGifExportModal] = useState(false);
    
    // Ref dummy para los modales de exportación (temporal)
    const gridRef = useRef(null);

    // Hook para gradientes personalizados
    const { gradients: customGradients, refresh: refreshCustomGradients } = useCustomGradients();

    // Refrescar gradientes al cargar el componente
    useEffect(() => {
        refreshCustomGradients();
    }, [refreshCustomGradients]);

    // Cargar configuración desde URL al montar el componente
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.size > 0) {
            console.log('🔗 Cargando configuración desde URL...');
            
            const urlConfig: Partial<PresetConfig> = {};
            
            // Cargar parámetros básicos
            if (urlParams.get('animation')) urlConfig.animation = urlParams.get('animation') as AnimationType;
            if (urlParams.get('gridPattern')) urlConfig.gridPattern = urlParams.get('gridPattern') as GridPattern;
            if (urlParams.get('gridSize')) urlConfig.gridSize = parseInt(urlParams.get('gridSize')!);
            if (urlParams.get('speed')) urlConfig.speed = parseFloat(urlParams.get('speed')!);
            if (urlParams.get('intensity')) urlConfig.intensity = parseFloat(urlParams.get('intensity')!);
            if (urlParams.get('colorMode')) urlConfig.colorMode = urlParams.get('colorMode') as 'solid' | 'gradient' | 'dynamic';
            if (urlParams.get('solidColor')) urlConfig.solidColor = urlParams.get('solidColor')!;
            if (urlParams.get('gradientPalette')) urlConfig.gradientPalette = urlParams.get('gradientPalette')!;
            if (urlParams.get('rows')) urlConfig.rows = parseInt(urlParams.get('rows')!);
            if (urlParams.get('cols')) urlConfig.cols = parseInt(urlParams.get('cols')!);
            if (urlParams.get('spacing')) urlConfig.spacing = parseInt(urlParams.get('spacing')!);
            
            // Cargar parámetros avanzados
            if (urlParams.get('colorIntensityMode')) urlConfig.colorIntensityMode = urlParams.get('colorIntensityMode') as 'field' | 'velocity' | 'distance' | 'angle';
            if (urlParams.get('colorHueShift')) urlConfig.colorHueShift = parseFloat(urlParams.get('colorHueShift')!);
            if (urlParams.get('colorSaturation')) urlConfig.colorSaturation = parseInt(urlParams.get('colorSaturation')!);
            if (urlParams.get('colorBrightness')) urlConfig.colorBrightness = parseInt(urlParams.get('colorBrightness')!);
            if (urlParams.get('lengthMin')) urlConfig.lengthMin = parseInt(urlParams.get('lengthMin')!);
            if (urlParams.get('lengthMax')) urlConfig.lengthMax = parseInt(urlParams.get('lengthMax')!);
            if (urlParams.get('oscillationFreq')) urlConfig.oscillationFreq = parseFloat(urlParams.get('oscillationFreq')!);
            if (urlParams.get('oscillationAmp')) urlConfig.oscillationAmp = parseFloat(urlParams.get('oscillationAmp')!);
            if (urlParams.get('pulseSpeed')) urlConfig.pulseSpeed = parseFloat(urlParams.get('pulseSpeed')!);
            if (urlParams.get('spatialFactor')) urlConfig.spatialFactor = parseFloat(urlParams.get('spatialFactor')!);
            if (urlParams.get('spatialMode')) urlConfig.spatialMode = urlParams.get('spatialMode') as 'edge' | 'center' | 'mixed';
            if (urlParams.get('mouseInfluence')) urlConfig.mouseInfluence = parseFloat(urlParams.get('mouseInfluence')!);
            if (urlParams.get('mouseMode')) urlConfig.mouseMode = urlParams.get('mouseMode') as 'attract' | 'repel' | 'stretch';
            if (urlParams.get('physicsMode')) urlConfig.physicsMode = urlParams.get('physicsMode') as 'none' | 'velocity' | 'pressure' | 'field';
            if (urlParams.get('vectorShape')) urlConfig.vectorShape = urlParams.get('vectorShape') as 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
            if (urlParams.get('showArrowheads')) urlConfig.showArrowheads = urlParams.get('showArrowheads') === 'true';
            if (urlParams.get('curvatureIntensity')) urlConfig.curvatureIntensity = parseFloat(urlParams.get('curvatureIntensity')!);
            if (urlParams.get('waveFrequency')) urlConfig.waveFrequency = parseFloat(urlParams.get('waveFrequency')!);
            if (urlParams.get('spiralTightness')) urlConfig.spiralTightness = parseFloat(urlParams.get('spiralTightness')!);
            if (urlParams.get('organicNoise')) urlConfig.organicNoise = parseFloat(urlParams.get('organicNoise')!);
            
            // Aplicar configuración cargada
            if (Object.keys(urlConfig).length > 0) {
                setConfig(prev => ({ ...prev, ...urlConfig }));
                console.log('✅ Configuración cargada desde URL:', urlConfig);
                
                // Limpiar URL después de cargar (opcional)
                // window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    // Animation-specific Length Dynamics presets
    const ANIMATION_LD_PRESETS: Record<string, Partial<PresetConfig>> = {
        'static': {
            oscillationFreq: 0.5, oscillationAmp: 0.2, physicsMode: 'none', spatialMode: 'edge',
            vectorShape: 'straight', showArrowheads: true
        },
        'rotation': {
            oscillationFreq: 1, oscillationAmp: 0.3, physicsMode: 'none', spatialMode: 'center',
            vectorShape: 'straight', showArrowheads: true
        },
        'wave': {
            oscillationFreq: 2, oscillationAmp: 0.6, physicsMode: 'velocity', spatialMode: 'mixed',
            vectorShape: 'bezier', showArrowheads: false, curvatureIntensity: 1.2, waveFrequency: 1.5,
            colorMode: 'gradient', gradientPalette: 'flow'
        },
        'spiral': {
            oscillationFreq: 1.5, oscillationAmp: 0.4, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'spiral', showArrowheads: false, spiralTightness: 1.8, curvatureIntensity: 1.1
        },
        'dipole': {
            oscillationFreq: 2.5, oscillationAmp: 0.7, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'arc', showArrowheads: false, curvatureIntensity: 1.3, mouseMode: 'stretch',
            colorMode: 'dynamic', colorIntensityMode: 'field', colorHueShift: 30, colorSaturation: 80, colorBrightness: 60
        },
        'vortex': {
            oscillationFreq: 3, oscillationAmp: 0.8, physicsMode: 'velocity', spatialMode: 'mixed',
            vectorShape: 'bezier', showArrowheads: false, curvatureIntensity: 1.5, mouseMode: 'repel',
            colorMode: 'gradient', gradientPalette: 'rainbow'
        },
        'turbulence': {
            oscillationFreq: 4, oscillationAmp: 1, physicsMode: 'pressure', spatialMode: 'mixed',
            vectorShape: 'organic', showArrowheads: false, organicNoise: 1.3, curvatureIntensity: 1.6,
            colorMode: 'gradient', gradientPalette: 'pulse'
        },
        'pinwheels': {
            oscillationFreq: 1.5, oscillationAmp: 0.4, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'straight', showArrowheads: true, mouseMode: 'attract',
            colorMode: 'dynamic', colorIntensityMode: 'velocity'
        },
        'seaWaves': {
            oscillationFreq: 1, oscillationAmp: 0.8, physicsMode: 'velocity', spatialMode: 'edge',
            vectorShape: 'bezier', showArrowheads: false, curvatureIntensity: 1.5,
            colorMode: 'dynamic', colorIntensityMode: 'velocity'
        },
        'geometricPattern': {
            oscillationFreq: 2, oscillationAmp: 0.5, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'straight', showArrowheads: true,
            colorMode: 'dynamic', colorIntensityMode: 'field'
        },
        'flowField': {
            oscillationFreq: 2.5, oscillationAmp: 0.7, physicsMode: 'velocity', spatialMode: 'mixed',
            vectorShape: 'organic', showArrowheads: false, organicNoise: 1.2, curvatureIntensity: 1.4,
            colorMode: 'dynamic', colorIntensityMode: 'velocity'
        },
        'curlNoise': {
            oscillationFreq: 3, oscillationAmp: 0.8, physicsMode: 'pressure', spatialMode: 'mixed',
            vectorShape: 'organic', showArrowheads: false, organicNoise: 1.5, curvatureIntensity: 1.6,
            colorMode: 'dynamic', colorIntensityMode: 'field'
        },
        'rippleEffect': {
            oscillationFreq: 1.5, oscillationAmp: 0.6, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'arc', showArrowheads: false, curvatureIntensity: 1.3,
            colorMode: 'dynamic', colorIntensityMode: 'distance'
        },
        'perlinFlow': {
            oscillationFreq: 2, oscillationAmp: 0.7, physicsMode: 'velocity', spatialMode: 'mixed',
            vectorShape: 'bezier', showArrowheads: false, curvatureIntensity: 1.4,
            colorMode: 'dynamic', colorIntensityMode: 'velocity'
        },
        'gaussianGradient': {
            oscillationFreq: 1, oscillationAmp: 0.5, physicsMode: 'field', spatialMode: 'center',
            vectorShape: 'straight', showArrowheads: true, mouseMode: 'attract',
            colorMode: 'dynamic', colorIntensityMode: 'field'
        }
    };





    const exportSVG = () => {
        setShowExportModal(true);
    };

    const exportAnimatedSVG = () => {
        setShowGifExportModal(true);
    };

    // 🚀 Funciones para controles de animación
    const handleTogglePause = useCallback(() => {
        setConfig(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }, []);

    const handleTriggerPulse = useCallback(() => {
        // Placeholder para pulso (implementar más adelante)
        console.log('Pulse triggered!');
    }, []);

    // 🚀 Funciones para gradientes personalizados
    const handleGradientCreated = useCallback((id: string, name: string, gradient: GradientColor) => {
        // Cambiar a usar el nuevo gradiente personalizado
        setConfig(prev => ({
            ...prev,
            colorMode: 'gradient' as const,
            gradientPalette: id
        }));
        refreshCustomGradients();
    }, [refreshCustomGradients]);

    // 🚀 Función para compartir configuración actual
    const handleShareConfig = useCallback(async () => {
        console.log('🔗 Iniciando proceso de compartir...');
        console.log('📋 Configuración actual:', config);
        
        try {
            // Crear URL con la configuración actual como parámetros
            const configParams = new URLSearchParams({
                animation: config.animation,
                gridPattern: config.gridPattern,
                gridSize: config.gridSize.toString(),
                speed: config.speed.toString(),
                intensity: config.intensity.toString(),
                colorMode: config.colorMode,
                solidColor: config.solidColor,
                gradientPalette: config.gradientPalette,
                colorIntensityMode: config.colorIntensityMode,
                colorHueShift: config.colorHueShift.toString(),
                colorSaturation: config.colorSaturation.toString(),
                colorBrightness: config.colorBrightness.toString(),
                lengthMin: config.lengthMin.toString(),
                lengthMax: config.lengthMax.toString(),
                oscillationFreq: config.oscillationFreq.toString(),
                oscillationAmp: config.oscillationAmp.toString(),
                pulseSpeed: config.pulseSpeed.toString(),
                spatialFactor: config.spatialFactor.toString(),
                spatialMode: config.spatialMode,
                mouseInfluence: config.mouseInfluence.toString(),
                mouseMode: config.mouseMode,
                physicsMode: config.physicsMode,
                vectorShape: config.vectorShape,
                showArrowheads: config.showArrowheads.toString(),
                curvatureIntensity: config.curvatureIntensity.toString(),
                waveFrequency: config.waveFrequency.toString(),
                spiralTightness: config.spiralTightness.toString(),
                organicNoise: config.organicNoise.toString(),
                ...(config.rows && { rows: config.rows.toString() }),
                ...(config.cols && { cols: config.cols.toString() }),
                ...(config.spacing && { spacing: config.spacing.toString() })
            });
            
            const shareUrl = `${window.location.origin}/view?${configParams.toString()}`;
            console.log('🌐 URL generada:', shareUrl);
            
            // Verificar si el navegador soporta clipboard API
            if (!navigator.clipboard) {
                console.warn('⚠️ Clipboard API no disponible, usando fallback');
                // Fallback: mostrar la URL para copiar manualmente
                alert(`URL para compartir:\n\n${shareUrl}`);
                return;
            }
            
            // Copiar al portapapeles
            await navigator.clipboard.writeText(shareUrl);
            
            console.log('✅ URL copiada al portapapeles exitosamente!');
            alert('✅ ¡Configuración copiada al portapapeles!');
        } catch (error) {
            console.error('❌ Error compartiendo configuración:', error);
            alert('❌ Error al copiar. Revisa la consola para más detalles.');
        }
    }, [config]);

    // 🚀 Hook para controles de teclado global
    useKeyboardControls({
        onTogglePause: handleTogglePause,
        onTriggerPulse: handleTriggerPulse,
        isPaused: config.isPaused
    });

    return (
        <div className="dev-environment">
            <div className="flex h-screen">
                {/* Left Column - Behavior Controls */}
                <div className="w-[15%] dev-sidebar overflow-y-auto dev-scroll">
                    <div className="p-4 space-y-6">

                        {/* Animation Type Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
                            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Animation Type</h3>
                            <select
                                value={config.animation}
                                onChange={(e) => {
                                    const newAnimation = e.target.value as AnimationType;
                                    const smartSettings = ANIMATION_LD_PRESETS[newAnimation];
                                    setConfig({ ...config, animation: newAnimation, ...smartSettings });
                                }}
                                className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                            >
                                <option value="static">Static</option>
                                <option value="rotation">Rotation</option>
                                <option value="wave">Wave</option>
                                <option value="spiral">Spiral</option>
                                <option value="dipole">Dipole Field</option>
                                <option value="vortex">Vortex Flow</option>
                                <option value="turbulence">Turbulence</option>
                                <option value="pinwheels">🌀 Pinwheels</option>
                                <option value="seaWaves">🌊 Sea Waves</option>
                                <option value="geometricPattern">📐 Geometric Pattern</option>
                                <option value="flowField">🌪️ Flow Field</option>
                                <option value="curlNoise">🌀 Curl Noise</option>
                                <option value="rippleEffect">💧 Ripple Effect</option>
                                <option value="perlinFlow">🌊 Perlin Flow</option>
                                <option value="gaussianGradient">🔘 Gaussian Gradient</option>
                            </select>
                        </div>

                        {/* Length Dynamics Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-sidebar-foreground">Length Dynamics</h3>
                                <button
                                    onClick={() => setShowLengthHelp(true)}
                                    className="w-5 h-5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 rounded-full flex items-center justify-center text-xs transition-colors"
                                    title="Show Length Dynamics Help"
                                >
                                    ?
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Base Length Range */}
                                <div className="space-y-3">
                                    <SliderWithInput
                                        label="Length Min"
                                        value={config.lengthMin}
                                        min={1}
                                        max={20}
                                        step={1}
                                        onChange={(value) => setConfig({ ...config, lengthMin: value })}
                                        suffix="px"
                                        inputWidth="sm"
                                    />

                                    <SliderWithInput
                                        label="Length Max"
                                        value={config.lengthMax}
                                        min={20}
                                        max={300}
                                        step={1}
                                        onChange={(value) => setConfig({ ...config, lengthMax: value })}
                                        suffix="px"
                                        inputWidth="sm"
                                    />
                                </div>

                                {/* Oscillation */}
                                <div className="space-y-3">
                                    <SliderWithInput
                                        label="Oscillation Frequency"
                                        value={config.oscillationFreq}
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, oscillationFreq: value })}
                                        suffix="Hz"
                                        inputWidth="sm"
                                    />

                                    <SliderWithInput
                                        label="Oscillation Amplitude"
                                        value={config.oscillationAmp}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, oscillationAmp: value })}
                                        inputWidth="sm"
                                    />
                                </div>

                                {/* Advanced */}
                                <div className="space-y-3">
                                    <SliderWithInput
                                        label="Pulse Speed"
                                        value={config.pulseSpeed}
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, pulseSpeed: value })}
                                        suffix="Hz"
                                        inputWidth="sm"
                                    />

                                    <div>
                                        <SliderWithInput
                                            label="Spatial Factor"
                                            value={config.spatialFactor}
                                            min={0}
                                            max={2}
                                            step={0.1}
                                            onChange={(value) => setConfig({ ...config, spatialFactor: value })}
                                            inputWidth="sm"
                                        />
                                        <select
                                            value={config.spatialMode}
                                            onChange={(e) => setConfig({ ...config, spatialMode: e.target.value as any })}
                                            className="w-full mt-2 bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                                        >
                                            <option value="edge">Edge Longer</option>
                                            <option value="center">Center Longer</option>
                                            <option value="mixed">Mixed Pattern</option>
                                        </select>
                                    </div>
                                    <div>
                                        <SliderWithInput
                                            label="Mouse Influence"
                                            value={config.mouseInfluence}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            onChange={(value) => setConfig({ ...config, mouseInfluence: value })}
                                            inputWidth="sm"
                                        />
                                        <select
                                            value={config.mouseMode}
                                            onChange={(e) => setConfig({ ...config, mouseMode: e.target.value as any })}
                                            className="w-full mt-2 bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                                        >
                                            <option value="attract">Attract (Grow Near)</option>
                                            <option value="repel">Repel (Shrink Near)</option>
                                            <option value="stretch">Stretch (Dynamic)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Physics Mode */}
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-sidebar-foreground">Physics</label>
                                    <select
                                        value={config.physicsMode}
                                        onChange={(e) => setConfig({ ...config, physicsMode: e.target.value as any })}
                                        className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                                    >
                                        <option value="none">None</option>
                                        <option value="velocity">Velocity</option>
                                        <option value="pressure">Pressure</option>
                                        <option value="field">Field</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Global Controls Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
                            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Global Controls</h3>
                            <div className="space-y-3">
                                <SliderWithInput
                                    label="Speed"
                                    value={config.speed}
                                    min={0.1}
                                    max={5}
                                    step={0.1}
                                    onChange={(speed) => setConfig({ ...config, speed })}
                                />
                                <SliderWithInput
                                    label="Intensity"
                                    value={config.intensity}
                                    min={0.1}
                                    max={5}
                                    step={0.1}
                                    onChange={(intensity) => setConfig({ ...config, intensity })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column - Main Visualization (70% width) */}
                <div className="w-[70%] bg-black border-x border-gray-700/50 relative p-4">
                    <DemoVectorGrid
                        gridSize={config.gridSize}
                        gridPattern={config.gridPattern}
                        animation={config.animation}
                        speed={config.speed}
                        intensity={config.intensity}
                        colorMode={config.colorMode}
                        solidColor={config.solidColor}
                        gradientPalette={config.gradientPalette}
                        colorIntensityMode={config.colorIntensityMode}
                        colorHueShift={config.colorHueShift}
                        colorSaturation={config.colorSaturation}
                        colorBrightness={config.colorBrightness}
                        lengthMin={config.lengthMin}
                        lengthMax={config.lengthMax}
                        oscillationFreq={config.oscillationFreq}
                        oscillationAmp={config.oscillationAmp}
                        pulseSpeed={config.pulseSpeed}
                        spatialFactor={config.spatialFactor}
                        spatialMode={config.spatialMode}
                        mouseInfluence={config.mouseInfluence}
                        mouseMode={config.mouseMode}
                        physicsMode={config.physicsMode}
                        vectorShape={config.vectorShape}
                        showArrowheads={config.showArrowheads}
                        curvatureIntensity={config.curvatureIntensity}
                        waveFrequency={config.waveFrequency}
                        spiralTightness={config.spiralTightness}
                        organicNoise={config.organicNoise}
                        rows={config.rows}
                        cols={config.cols}
                        spacing={config.spacing}
                        canvasWidth={config.canvasWidth}
                        canvasHeight={config.canvasHeight}
                        margin={config.margin}
                        isPaused={config.isPaused}

                    />



                    {/* Botón Pause/Play Flotante */}
                    <button
                        onClick={handleTogglePause}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-sidebar-accent/90 hover:bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                        title={config.isPaused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
                    >
                        {config.isPaused ? (
                            <svg className="w-5 h-5 text-sidebar-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-sidebar-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Right Column - Visual Controls & Export */}
                <div className="w-[15%] dev-sidebar overflow-y-auto dev-scroll">
                    <div className="p-4 space-y-6">

                        {/* Grid Pattern Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-5 rounded-lg space-y-5">
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-sidebar-foreground mb-1">Grid Patterns</h3>
                                <p className="text-xs text-sidebar-foreground/70">Vector layout and distribution</p>
                            </div>

                            {/* Pattern Type Section */}
                            <div className="bg-sidebar-accent/40 border border-sidebar-border rounded-lg p-4">
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-sidebar-foreground">Pattern Type</label>
                                </div>
                                
                                <SimpleTabs
                                    tabs={[
                                        { id: 'grid', label: 'Grid' },
                                        { id: 'math', label: 'Math' }
                                    ]}
                                    activeTab={
                                        ['regular', 'staggered', 'hexagonal'].includes(config.gridPattern) ? 'grid' : 'math'
                                    }
                                    onChange={(tab) => {
                                        if (tab === 'grid') {
                                            // Cambio a Grid: usar rows/cols, limpiar gridSize automático
                                            setConfig({ 
                                                ...config, 
                                                gridPattern: 'regular',
                                                rows: config.rows || 5,
                                                cols: config.cols || 5,
                                                gridSize: (config.rows || 5) * (config.cols || 5)
                                            });
                                        } else {
                                            // Cambio a Math: usar gridSize, limpiar rows/cols
                                            setConfig({ 
                                                ...config, 
                                                gridPattern: 'fibonacci',
                                                rows: undefined,
                                                cols: undefined,
                                                gridSize: config.gridSize || 25
                                            });
                                        }
                                    }}
                                />

                                <div className="mt-3">
                                    {/* Grid Tab */}
                                    {['regular', 'staggered', 'hexagonal'].includes(config.gridPattern) && (
                                        <div className="space-y-3">
                                            <select
                                                value={config.gridPattern}
                                                onChange={(e) => setConfig({ ...config, gridPattern: e.target.value as GridPattern })}
                                                className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="regular">Regular Grid</option>
                                                <option value="staggered">Staggered Grid</option>
                                                <option value="hexagonal">Hexagonal Grid</option>
                                            </select>
                                            
                                            {/* Grid Controls */}
                                            <div className="space-y-3">
                                                <SliderWithInput
                                                    label="Rows"
                                                    value={config.rows || 5}
                                                    min={4}
                                                    max={50}
                                                    step={1}
                                                    onChange={(value) => {
                                                        const cols = config.cols || 5;
                                                        setConfig({ ...config, rows: value, gridSize: value * cols });
                                                    }}
                                                    inputWidth="sm"
                                                />
                                                <SliderWithInput
                                                    label="Columns"
                                                    value={config.cols || 5}
                                                    min={4}
                                                    max={50}
                                                    step={1}
                                                    onChange={(value) => {
                                                        const rows = config.rows || 5;
                                                        setConfig({ ...config, cols: value, gridSize: rows * value });
                                                    }}
                                                    inputWidth="sm"
                                                />
                                                <SliderWithInput
                                                    label="Spacing"
                                                    value={config.spacing || 80}
                                                    min={20}
                                                    max={200}
                                                    step={5}
                                                    onChange={(value) => setConfig({ ...config, spacing: value })}
                                                    suffix="px"
                                                    inputWidth="sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Math Tab */}
                                    {!['regular', 'staggered', 'hexagonal'].includes(config.gridPattern) && (
                                        <div className="space-y-3">
                                            {/* Vector Density - Solo para Math */}
                                            <div>
                                                <label className="block text-xs font-medium mb-2 text-sidebar-foreground">Vector Density</label>
                                                <select
                                                    value={config.gridSize}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        gridSize: parseInt(e.target.value),
                                                        rows: undefined,
                                                        cols: undefined
                                                    })}
                                                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    <option value={16}>16 vectors ⚡ Fast</option>
                                                    <option value={25}>25 vectors ⚡ Fast</option>
                                                    <option value={49}>49 vectors ⚡ Fast</option>
                                                    <option value={100}>100 vectors 🚀 Good</option>
                                                    <option value={400}>400 vectors 🔥 Dense</option>
                                                    <option value={900}>900 vectors 🖥️ Canvas</option>
                                                </select>
                                                {config.gridSize >= 900 && (
                                                    <div className="mt-2 text-xs text-blue-400 bg-blue-950/20 border border-blue-500/20 rounded-lg p-2 text-center">
                                                        🖥️ Canvas rendering for optimal performance
                                                    </div>
                                                )}
                                            </div>

                                            {/* Math Pattern Selector */}
                                            <div>
                                                <label className="block text-xs font-medium mb-2 text-sidebar-foreground">Math Pattern</label>
                                                <select
                                                    value={config.gridPattern}
                                                    onChange={(e) => setConfig({ ...config, gridPattern: e.target.value as GridPattern })}
                                                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="fibonacci">📐 Fibonacci Spiral</option>
                                                    <option value="polar">🎯 Polar Grid (Dartboard)</option>
                                                    <option value="triangular">🔺 Triangular Lattice</option>
                                                    <option value="voronoi">🌿 Random Distribution</option>
                                                    <option value="radial">🎯 Radial Pattern</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Colors Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded-lg space-y-4">
                        <SimpleTabs
                            tabs={[
                                { id: 'solid', label: 'Solid' },
                                { id: 'gradient', label: 'Gradient' },
                                { id: 'dynamic', label: 'Dynamic' }
                            ]}
                            activeTab={config.colorMode}
                            onChange={(mode) => setConfig({ ...config, colorMode: mode as 'solid' | 'gradient' | 'dynamic' })}
                        />

                        {config.colorMode === 'solid' && (
                            <div className="bg-sidebar-accent/40 border border-sidebar-border rounded-lg p-3">
                                <input
                                    type="color"
                                    value={config.solidColor}
                                    onChange={(e) => setConfig({ ...config, solidColor: e.target.value })}
                                    className="w-full h-12 border-2 border-sidebar-border rounded-lg cursor-pointer"
                                />
                                <div className="mt-2 text-xs text-sidebar-foreground/70 text-center">
                                    {config.solidColor.toUpperCase()}
                                </div>
                            </div>
                        )}

                        {config.colorMode === 'gradient' && (
                            <div className="bg-sidebar-accent/40 border border-sidebar-border rounded-lg p-3 space-y-3">
                                <select
                                    value={config.gradientPalette}
                                    onChange={(e) => setConfig({ ...config, gradientPalette: e.target.value as any })}
                                    className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-3 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <optgroup label="Built-in Gradients">
                                        <option value="flow">🌊 Flow</option>
                                        <option value="rainbow">🌈 Rainbow</option>
                                        <option value="cosmic">🌌 Cosmic</option>
                                        <option value="pulse">💓 Pulse</option>
                                        <option value="subtle">✨ Subtle</option>
                                        <option value="sunset">🌅 Sunset</option>
                                        <option value="ocean">🌊 Ocean</option>
                                    </optgroup>
                                    {customGradients.length > 0 && (
                                        <optgroup label="Custom Gradients">
                                            {customGradients.map(gradient => (
                                                <option key={gradient.id} value={gradient.id}>
                                                    🎨 {gradient.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>

                                <button
                                    onClick={() => setShowGradientEditor(true)}
                                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg transition-colors shadow-sm font-medium"
                                >
                                    ✨ Create Custom Gradient
                                </button>
                            </div>
                        )}

                        {config.colorMode === 'dynamic' && (
                            <div className="bg-sidebar-accent/40 border border-sidebar-border rounded-lg p-3 space-y-3">
                                <div>
                                    <label className="block text-xs text-sidebar-foreground mb-1">Intensity Mode</label>
                                    <select
                                        value={config.colorIntensityMode}
                                        onChange={(e) => setConfig({ ...config, colorIntensityMode: e.target.value as any })}
                                        className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                                    >
                                        <option value="field">⚡ Field Strength</option>
                                        <option value="velocity">💨 Velocity</option>
                                        <option value="distance">📏 Distance</option>
                                        <option value="angle">🔄 Angle</option>
                                    </select>
                                </div>

                                <SliderWithInput
                                    label="Hue Shift"
                                    value={config.colorHueShift}
                                    min={0}
                                    max={360}
                                    step={5}
                                    onChange={(value) => setConfig({ ...config, colorHueShift: value })}
                                    suffix="°"
                                    inputWidth="sm"
                                />

                                <SliderWithInput
                                    label="Saturation"
                                    value={config.colorSaturation}
                                    min={0}
                                    max={100}
                                    step={5}
                                    onChange={(value) => setConfig({ ...config, colorSaturation: value })}
                                    suffix="%"
                                    inputWidth="sm"
                                />

                                <SliderWithInput
                                    label="Brightness"
                                    value={config.colorBrightness}
                                    min={20}
                                    max={100}
                                    step={5}
                                    onChange={(value) => setConfig({ ...config, colorBrightness: value })}
                                    suffix="%"
                                    inputWidth="sm"
                                />
                            </div>
                        )}
                    </div>





                        {/* Vector Shapes Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
                            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Vector Shapes</h3>

                            <div className="space-y-3">
                                {/* Vector Shape Selector */}
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-sidebar-foreground">Shape</label>
                                    <select
                                        value={config.vectorShape}
                                        onChange={(e) => setConfig({ ...config, vectorShape: e.target.value as any })}
                                        className="w-full bg-sidebar border border-sidebar-border text-sidebar-foreground p-2 text-xs rounded focus:ring-2 focus:ring-sidebar-ring"
                                    >
                                        <option value="straight">Straight Lines</option>
                                        <option value="wave">Wave Serpentine</option>
                                        <option value="bezier">Smooth Curves</option>
                                        <option value="spiral">Spiral Coils</option>
                                        <option value="arc">Simple Arcs</option>
                                        <option value="organic">Organic Forms</option>
                                    </select>
                                </div>

                                {/* Arrowheads Toggle */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="showArrowheads"
                                        checked={config.showArrowheads}
                                        onChange={(e) => setConfig({ ...config, showArrowheads: e.target.checked })}
                                        className="w-3 h-3 accent-green-500"
                                    />
                                    <label htmlFor="showArrowheads" className="text-xs text-sidebar-foreground">Show Arrowheads</label>
                                </div>

                                {/* Curvature Intensity */}
                                <SliderWithInput
                                    label="Curvature Intensity"
                                    value={config.curvatureIntensity}
                                    min={0.1}
                                    max={3}
                                    step={0.1}
                                    onChange={(value) => setConfig({ ...config, curvatureIntensity: value })}
                                    inputWidth="sm"
                                />

                                {/* Shape-specific controls */}
                                {config.vectorShape === 'wave' && (
                                    <SliderWithInput
                                        label="Wave Frequency"
                                        value={config.waveFrequency}
                                        min={0.5}
                                        max={5}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, waveFrequency: value })}
                                        suffix="Hz"
                                        inputWidth="sm"
                                    />
                                )}

                                {config.vectorShape === 'spiral' && (
                                    <SliderWithInput
                                        label="Spiral Tightness"
                                        value={config.spiralTightness}
                                        min={0.1}
                                        max={3}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, spiralTightness: value })}
                                        inputWidth="sm"
                                    />
                                )}

                                {config.vectorShape === 'organic' && (
                                    <SliderWithInput
                                        label="Organic Noise"
                                        value={config.organicNoise}
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        onChange={(value) => setConfig({ ...config, organicNoise: value })}
                                        inputWidth="sm"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Export Card */}
                        <div className="bg-sidebar-accent border border-sidebar-border p-4 rounded">
                            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Export & Share</h3>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={exportSVG}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Export SVG/Code</span>
                                </button>

                                <button
                                    onClick={exportAnimatedSVG}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-2"
                                    title="GIF Export requiere integración con SimpleVectorGridOptimized"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
                                    </svg>
                                    <span>Export GIF (Beta)</span>
                                </button>

                                <button
                                    onClick={handleShareConfig}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-2"
                                    title="Copiar URL con configuración actual al portapapeles"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    <span>Share Config</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Length Dynamics Help Modal */}
            <LengthDynamicsHelp
                isOpen={showLengthHelp}
                onClose={() => setShowLengthHelp(false)}
            />

            {/* Gradient Editor Modal */}
            <GradientEditorModal
                isOpen={showGradientEditor}
                onClose={() => setShowGradientEditor(false)}
                onGradientCreated={handleGradientCreated}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                gridRef={gridRef}
                gridConfig={{
                    rows: config.rows || Math.sqrt(config.gridSize),
                    cols: config.cols || Math.sqrt(config.gridSize),
                    spacing: config.spacing || 80,
                    margin: config.margin || 20
                }}
                vectorConfig={{
                    shape: 'line',
                    length: config.lengthMax,
                    width: 2,
                    color: config.solidColor,
                    rotationOrigin: 'center',
                    strokeLinecap: 'butt'
                }}
                animationType={'rotation' as ExportAnimationType}
                canvasDimensions={{ width: 800, height: 600 }}
                animationProps={{
                    speed: config.speed,
                    intensity: config.intensity,
                    spatialFactor: config.spatialFactor
                }}
            />

            {/* GIF Export Modal */}
            <GifExportModal
                isOpen={showGifExportModal}
                onClose={() => setShowGifExportModal(false)}
                gridRef={gridRef}
            />
        </div>
    );
}