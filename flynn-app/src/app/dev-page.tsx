'use client';

import './dev/dev.css';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import FlynVectorGrid from './dev/FlynVectorGrid';
import LengthDynamicsHelp from './dev/LengthDynamicsHelp';
import { useKeyboardControls } from '@/components/features/vector-grid/hooks/useKeyboardControls';
import { GradientEditorModal } from '@/components/ui/GradientEditorModal';
import { useCustomGradients } from '@/lib/customGradients';
import { GifExportModal } from '@/components/features/vector-grid/components/GifExportModal';
import { GridPanel } from '@/components/panels/GridPanel';
import { AnimationControlsPanel } from '@/components/sections/AnimationControlsPanel';
import { VectorShapePanel } from '@/components/panels/VectorShapePanel';
import { ColorPanel } from '@/components/panels/ColorPanel';
import { BackgroundPanel } from '@/components/panels/BackgroundPanel';
import { LengthDynamicsPanel } from '@/components/panels/LengthDynamicsPanel';
import { getAllAnimations } from '@/animations/registry';
import { AnimationSelectorPanel } from '@/components/panels/AnimationSelectorPanel';
import { useConfigStore } from '@/store/configStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimationParamsPanel } from '@/components/panels/AnimationParamsPanel';
import { FloatingPanel } from '@/components/ui/FloatingPanel';
import { Toolbar } from '@/components/ui/Toolbar';

// Cargar todas las animaciones para que se registren
import '@/animations/implementations/rotation';
import '@/animations/implementations/wave';
import '@/animations/implementations/spiral';

export default function DevPage() {
    const currentAnimationId = useConfigStore(state => state.animation);
    const isPaused = useConfigStore(state => state.isPaused);
    const setConfig = useConfigStore(state => state.setConfig);
    
    const [showLengthHelp, setShowLengthHelp] = useState(false);
    const [showGradientEditor, setShowGradientEditor] = useState(false);
    const [showGifExportModal, setShowGifExportModal] = useState(false);

    const availableAnimations = getAllAnimations();
    
    const gridRef = useRef<any>(null);
    const { gradients: customGradients, refresh: refreshCustomGradients } = useCustomGradients();

    useEffect(() => {
        refreshCustomGradients();
    }, [refreshCustomGradients]);
    
    const handleTogglePause = useCallback(() => setConfig({ isPaused: !isPaused }), [setConfig, isPaused]);
    const handleTriggerPulse = useCallback(() => { /* Placeholder */ }, []);

    const handleExportSVG = useCallback(async () => {
        if (gridRef.current) {
            const { data, filename } = await gridRef.current.exportSVG();
            const blob = new Blob([data], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, []);

    useKeyboardControls({ 
        onTogglePause: handleTogglePause,
        onTriggerPulse: handleTriggerPulse,
        isPaused: isPaused 
    });
    
    const handleGradientCreated = useCallback((id: string) => {
        setConfig({ colorMode: 'gradient', gradientPalette: id });
        refreshCustomGradients();
    }, [setConfig, refreshCustomGradients]);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <main className="flex-1 h-screen relative bg-black">
                <FlynVectorGrid ref={gridRef} />
                <Toolbar
                  isPaused={isPaused}
                  onTogglePause={handleTogglePause}
                  onExportSVG={handleExportSVG}
                  onExportGIF={() => setShowGifExportModal(true)}
                />

                <FloatingPanel
                    title="Configuración Esencial"
                    defaultPosition={{ x: 20, y: 20 }}
                    defaultWidth={380}
                >
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-medium mb-2 text-neutral-400">Cuadrícula</h3>
                            <GridPanel />
                        </section>
                        <section>
                            <h3 className="text-sm font-medium mb-2 text-neutral-400">Animación</h3>
                            <div className="space-y-4">
                                <AnimationSelectorPanel availableAnimations={availableAnimations} />
                                <AnimationParamsPanel gridRef={gridRef} />
                            </div>
                        </section>
                    </div>
                </FloatingPanel>

                <FloatingPanel
                    title="Estilo y Dinámica"
                    defaultPosition={{ x: window.innerWidth - 420, y: 20 }}
                    defaultWidth={380}
                >
                    <div className="space-y-6">
                       <section>
                            <h3 className="text-sm font-medium mb-2 text-neutral-400">Forma del Vector</h3>
                            <VectorShapePanel />
                        </section>
                         <section>
                            <h3 className="text-sm font-medium mb-2 text-neutral-400">Dinámica de Longitud</h3>
                            <LengthDynamicsPanel onShowHelp={() => setShowLengthHelp(true)} />
                        </section>
                        <section>
                            <h3 className="text-sm font-medium mb-2 text-neutral-400">Color</h3>
                             <ColorPanel customGradients={customGradients} onShowGradientEditor={() => setShowGradientEditor(true)} />
                        </section>
                    </div>
                </FloatingPanel>

            </main>

            {/* Modals */}
            <LengthDynamicsHelp isOpen={showLengthHelp} onClose={() => setShowLengthHelp(false)} />
            <GradientEditorModal isOpen={showGradientEditor} onClose={() => setShowGradientEditor(false)} onGradientCreated={handleGradientCreated} />
            <GifExportModal isOpen={showGifExportModal} onClose={() => setShowGifExportModal(false)} gridRef={gridRef} />
        </div>
    );
}