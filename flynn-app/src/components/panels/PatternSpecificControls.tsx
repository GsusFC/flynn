'use client';

import React from 'react';
import { useConfigStore } from '@/store/configStore';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { cn } from '@/lib/utils';

export const PatternSpecificControls: React.FC = () => {
    const gridPattern = useConfigStore(state => state.gridPattern);
    const setConfig = useConfigStore(state => state.setConfig);
    
    // Individual selectors to avoid new object creation on each render
    const fibonacciDensity = useConfigStore(state => state.fibonacciDensity ?? 1.0);
    const fibonacciRadius = useConfigStore(state => state.fibonacciRadius ?? 0.8);
    const fibonacciAngle = useConfigStore(state => state.fibonacciAngle ?? 137.5);

    const radialPatternBias = useConfigStore(state => state.radialPatternBias ?? 0);
    const radialMaxRadius = useConfigStore(state => state.radialMaxRadius ?? 0.9);

    const polarDistribution = useConfigStore(state => state.polarDistribution ?? 'uniform');
    const polarRadialBias = useConfigStore(state => state.polarRadialBias ?? 0);

    const goldenExpansion = useConfigStore(state => state.goldenExpansion ?? 1.0);
    const goldenRotation = useConfigStore(state => state.goldenRotation ?? 0);
    const goldenCompression = useConfigStore(state => state.goldenCompression ?? 1.0);

    const spiralTightness = useConfigStore(state => state.spiralTightness ?? 0.2);
    const spiralArms = useConfigStore(state => state.spiralArms ?? 2);
    const spiralStartRadius = useConfigStore(state => state.spiralStartRadius ?? 5);

    const hexagonalSpacing = useConfigStore(state => state.hexagonalSpacing ?? 1.0);
    const hexagonalOffset = useConfigStore(state => state.hexagonalOffset ?? 0.5);

    const concentricSquaresNumSquares = useConfigStore(state => state.concentricSquaresNumSquares ?? 5);
    const concentricSquaresRotation = useConfigStore(state => state.concentricSquaresRotation ?? 0);

    const voronoiSeed = useConfigStore(state => state.voronoiSeed ?? 1);

    const gridScale = useConfigStore(state => state.gridScale ?? 1);

    const selectClassName = cn(
        "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
        "ring-offset-background placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50"
    );
    const optionClassName = "bg-background text-foreground";

    // Render controls based on selected pattern - no early returns
    let controlsContent = null;

    if (gridPattern === 'fibonacci') {
        controlsContent = (
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
    } else if (gridPattern === 'radial') {
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Radiales</div>
                <SliderWithInput
                    label="Proporción Radial"
                    value={radialPatternBias}
                    min={-1}
                    max={1}
                    step={0.1}
                    onChange={val => setConfig({ radialPatternBias: val })}
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
    } else if (gridPattern === 'polar') {
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Polares</div>
                <SliderWithInput
                    label="Proporción Radial"
                    value={polarRadialBias}
                    min={-1}
                    max={1}
                    step={0.1}
                    onChange={val => setConfig({ polarRadialBias: val })}
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
    } else if (gridPattern === 'golden') {
        controlsContent = (
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
    } else if (gridPattern === 'logSpiral') {
        controlsContent = (
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
                    min={1}
                    max={20}
                    step={1}
                    onChange={val => setConfig({ spiralStartRadius: val })}
                />
            </div>
        );
    } else if (gridPattern === 'hexagonal') {
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Hexagonales</div>
                <SliderWithInput
                    label="Multiplicador Espaciado"
                    value={hexagonalSpacing}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    onChange={val => setConfig({ hexagonalSpacing: val })}
                />
                <SliderWithInput
                    label="Factor de Desplazamiento"
                    value={hexagonalOffset}
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    onChange={val => setConfig({ hexagonalOffset: val })}
                />
            </div>
        );
    } else if (gridPattern === 'concentricSquares') {
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Cuadrados Concéntricos</div>
                <SliderWithInput
                    label="Número de Cuadrados"
                    value={concentricSquaresNumSquares}
                    min={1}
                    max={20}
                    step={1}
                    onChange={val => setConfig({ concentricSquaresNumSquares: val })}
                />
                <SliderWithInput
                    label="Rotación"
                    value={concentricSquaresRotation}
                    min={0}
                    max={90}
                    step={1}
                    onChange={val => setConfig({ concentricSquaresRotation: val })}
                    suffix="°"
                />
            </div>
        );
    } else if (gridPattern === 'voronoi') {
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Voronoi</div>
                <SliderWithInput
                    label="Semilla Aleatoria"
                    value={voronoiSeed}
                    min={1}
                    max={1000}
                    step={1}
                    onChange={val => setConfig({ voronoiSeed: val })}
                />
            </div>
        );
    } else if (['triangular', 'staggered'].includes(gridPattern)) {
        // Geometric patterns that use gridScale
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm font-medium text-muted-foreground">Controles Geométricos</div>
                <SliderWithInput
                    label="Escala de Cuadrícula"
                    value={gridScale}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    onChange={val => setConfig({ gridScale: val })}
                />
            </div>
        );
    } else {
        // Fallback for patterns without specific controls
        controlsContent = (
            <div className="grid gap-4 pt-2">
                <div className="text-sm text-muted-foreground">
                    Este patrón no tiene controles específicos disponibles.
                </div>
            </div>
        );
    }

    return controlsContent;
}; 