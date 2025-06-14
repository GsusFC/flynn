'use client';

import React from 'react';
import { useConfigStore } from '@/store/configStore';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { cn } from '@/lib/utils';

export const PatternSpecificControls: React.FC = () => {
    const gridPattern = useConfigStore(state => state.gridPattern);
    const setConfig = useConfigStore(state => state.setConfig);
    
    // Fibonacci controls
    const fibonacciDensity = useConfigStore(state => state.fibonacciDensity ?? 1.0);
    const fibonacciRadius = useConfigStore(state => state.fibonacciRadius ?? 0.8);
    const fibonacciAngle = useConfigStore(state => state.fibonacciAngle ?? 137.5);
    
    // Radial controls
    const radialRings = useConfigStore(state => state.radialRings ?? 6);
    const radialVectorsPerRing = useConfigStore(state => state.radialVectorsPerRing ?? 12);
    const radialMaxRadius = useConfigStore(state => state.radialMaxRadius ?? 0.9);
    
    // Polar controls
    const polarRadialLines = useConfigStore(state => state.polarRadialLines ?? 16);
    const polarRings = useConfigStore(state => state.polarRings ?? 6);
    const polarDistribution = useConfigStore(state => state.polarDistribution ?? 'uniform');
    
    // Golden ratio controls
    const goldenExpansion = useConfigStore(state => state.goldenExpansion ?? 1.0);
    const goldenRotation = useConfigStore(state => state.goldenRotation ?? 0);
    const goldenCompression = useConfigStore(state => state.goldenCompression ?? 1.0);
    
    // Spiral controls
    const spiralTightness = useConfigStore(state => state.spiralTightness ?? 0.2);
    const spiralArms = useConfigStore(state => state.spiralArms ?? 2);
    const spiralStartRadius = useConfigStore(state => state.spiralStartRadius ?? 5);
    
    // Hexagonal controls
    const hexagonalSpacing = useConfigStore(state => state.hexagonalSpacing ?? 1.0);
    const hexagonalOffset = useConfigStore(state => state.hexagonalOffset ?? 0.5);

    const selectClassName = cn(
        "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
        "ring-offset-background placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50"
    );
    const optionClassName = "bg-background text-foreground";

    // Render controls based on selected pattern
    switch (gridPattern) {
        case 'fibonacci':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Fibonacci</div>
                    <SliderWithInput
                        label="Densidad Espiral"
                        value={fibonacciDensity}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        onChange={val => setConfig({ fibonacciDensity: val })}
                    />
                    <SliderWithInput
                        label="Radio Máximo"
                        value={fibonacciRadius}
                        min={0.3}
                        max={1.0}
                        step={0.05}
                        onChange={val => setConfig({ fibonacciRadius: val })}
                    />
                    <SliderWithInput
                        label="Ángulo Dorado"
                        value={fibonacciAngle}
                        min={130}
                        max={145}
                        step={0.5}
                        onChange={val => setConfig({ fibonacciAngle: val })}
                        suffix="°"
                    />
                </div>
            );

        case 'radial':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Radiales</div>
                    <SliderWithInput
                        label="Número de Anillos"
                        value={radialRings}
                        min={3}
                        max={15}
                        step={1}
                        onChange={val => setConfig({ radialRings: val })}
                    />
                    <SliderWithInput
                        label="Vectores por Anillo"
                        value={radialVectorsPerRing}
                        min={6}
                        max={24}
                        step={2}
                        onChange={val => setConfig({ radialVectorsPerRing: val })}
                    />
                    <SliderWithInput
                        label="Radio Máximo"
                        value={radialMaxRadius}
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        onChange={val => setConfig({ radialMaxRadius: val })}
                    />
                </div>
            );

        case 'polar':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Polares</div>
                    <SliderWithInput
                        label="Líneas Radiales"
                        value={polarRadialLines}
                        min={8}
                        max={32}
                        step={2}
                        onChange={val => setConfig({ polarRadialLines: val })}
                    />
                    <SliderWithInput
                        label="Anillos Concéntricos"
                        value={polarRings}
                        min={3}
                        max={12}
                        step={1}
                        onChange={val => setConfig({ polarRings: val })}
                    />
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Distribución</label>
                        <select
                            value={polarDistribution}
                            onChange={e => setConfig({ polarDistribution: e.target.value as 'uniform' | 'logarithmic' })}
                            className={selectClassName}
                        >
                            <option value="uniform" className={optionClassName}>Uniforme</option>
                            <option value="logarithmic" className={optionClassName}>Logarítmica</option>
                        </select>
                    </div>
                </div>
            );

        case 'golden':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Proporción Áurea</div>
                    <SliderWithInput
                        label="Factor de Expansión"
                        value={goldenExpansion}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        onChange={val => setConfig({ goldenExpansion: val })}
                    />
                    <SliderWithInput
                        label="Rotación Base"
                        value={goldenRotation}
                        min={0}
                        max={360}
                        step={5}
                        onChange={val => setConfig({ goldenRotation: val })}
                        suffix="°"
                    />
                    <SliderWithInput
                        label="Compresión"
                        value={goldenCompression}
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        onChange={val => setConfig({ goldenCompression: val })}
                    />
                </div>
            );

        case 'logSpiral':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Espiral Logarítmica</div>
                    <SliderWithInput
                        label="Tensión Espiral"
                        value={spiralTightness}
                        min={0.05}
                        max={0.5}
                        step={0.01}
                        onChange={val => setConfig({ spiralTightness: val })}
                    />
                    <SliderWithInput
                        label="Número de Brazos"
                        value={spiralArms}
                        min={1}
                        max={6}
                        step={1}
                        onChange={val => setConfig({ spiralArms: val })}
                    />
                    <SliderWithInput
                        label="Radio Inicial"
                        value={spiralStartRadius}
                        min={2}
                        max={20}
                        step={1}
                        onChange={val => setConfig({ spiralStartRadius: val })}
                    />
                </div>
            );

        case 'hexagonal':
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Hexagonales</div>
                    <SliderWithInput
                        label="Espaciado Hexagonal"
                        value={hexagonalSpacing}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        onChange={val => setConfig({ hexagonalSpacing: val })}
                    />
                    <SliderWithInput
                        label="Desplazamiento"
                        value={hexagonalOffset}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={val => setConfig({ hexagonalOffset: val })}
                    />
                </div>
            );

        case 'regular':
        case 'staggered':
        case 'triangular':
            // For geometric patterns, show grid scale
            const gridScale = useConfigStore(state => state.gridScale ?? 1);
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">Controles Geométricos</div>
                    <SliderWithInput
                        label="Escala Cuadrícula"
                        value={gridScale}
                        min={0.2}
                        max={2.0}
                        step={0.05}
                        onChange={val => setConfig({ gridScale: val })}
                    />
                </div>
            );

        default:
            return (
                <div className="grid gap-4 pt-2">
                    <div className="text-sm text-muted-foreground">
                        No hay controles específicos para este patrón
                    </div>
                </div>
            );
    }
}; 