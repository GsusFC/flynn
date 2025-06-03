'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DemoVectorGrid from '@/app/dev/DemoVectorGrid';
import type { 
  AnimationType
} from '@/components/features/vector-grid/simple/simpleTypes';

type GridPattern = 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden' | 'polar';

// Component that reads URL parameters and renders the grid
function ViewContent() {
  const searchParams = useSearchParams();
  
  // Animation settings  
  const [animation, setAnimation] = useState<'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence' | 'pinwheels' | 'seaWaves' | 'geometricPattern' | 'flowField' | 'curlNoise' | 'rippleEffect' | 'perlinFlow' | 'gaussianGradient'>('wave');
  const [speed, setSpeed] = useState(1);
  const [intensity, setIntensity] = useState(0.5);
  
  // Grid settings
  const [gridPattern, setGridPattern] = useState<GridPattern>('regular');
  const [gridSize, setGridSize] = useState(25);
  const [spacing, setSpacing] = useState(80);
  const [rows, setRows] = useState<number | undefined>(undefined);
  const [cols, setCols] = useState<number | undefined>(undefined);
  
  // Color settings
  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | 'dynamic'>('solid');
  const [solidColor, setSolidColor] = useState('#3b82f6');
  const [gradientPalette, setGradientPalette] = useState<'flow' | 'rainbow' | 'pulse' | 'sunset' | 'ocean' | 'forest' | 'fire' | 'electric' | 'cosmic' | 'aurora'>('flow');

  useEffect(() => {
    // Load configuration from URL parameters
    const animationParam = searchParams.get('animation') as 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence' | 'pinwheels' | 'seaWaves' | 'geometricPattern' | 'flowField' | 'curlNoise' | 'rippleEffect' | 'perlinFlow' | 'gaussianGradient';
    if (animationParam) setAnimation(animationParam);
    
    const speedParam = searchParams.get('speed');
    if (speedParam) setSpeed(parseFloat(speedParam));
    
    const intensityParam = searchParams.get('intensity');
    if (intensityParam) setIntensity(parseFloat(intensityParam));
    
    const gridPatternParam = searchParams.get('gridPattern') as GridPattern;
    if (gridPatternParam) setGridPattern(gridPatternParam);
    
    const gridSizeParam = searchParams.get('gridSize');
    if (gridSizeParam) setGridSize(parseInt(gridSizeParam));
    
    const spacingParam = searchParams.get('spacing');
    if (spacingParam) setSpacing(parseInt(spacingParam));
    
    const rowsParam = searchParams.get('rows');
    if (rowsParam) setRows(parseInt(rowsParam));
    
    const colsParam = searchParams.get('cols');
    if (colsParam) setCols(parseInt(colsParam));
    
    const colorModeParam = searchParams.get('colorMode') as 'solid' | 'gradient' | 'dynamic';
    if (colorModeParam) setColorMode(colorModeParam);
    
    const solidColorParam = searchParams.get('solidColor');
    if (solidColorParam) setSolidColor(decodeURIComponent(solidColorParam));
    
    const gradientPaletteParam = searchParams.get('gradientPalette') as 'flow' | 'rainbow' | 'pulse' | 'sunset' | 'ocean' | 'forest' | 'fire' | 'electric' | 'cosmic' | 'aurora';
    if (gradientPaletteParam) setGradientPalette(gradientPaletteParam);
  }, [searchParams]);

  // Generate edit URL with current parameters
  const generateEditUrl = () => {
    const params = new URLSearchParams();
    params.set('animation', animation);
    params.set('speed', speed.toString());
    params.set('intensity', intensity.toString());
    params.set('gridPattern', gridPattern);
    params.set('gridSize', gridSize.toString());
    params.set('spacing', spacing.toString());
    if (rows !== undefined) params.set('rows', rows.toString());
    if (cols !== undefined) params.set('cols', cols.toString());
    params.set('colorMode', colorMode);
    params.set('solidColor', encodeURIComponent(solidColor));
    params.set('gradientPalette', gradientPalette);
    
    return `${window.location.origin}/?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header with edit button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => window.open(generateEditUrl(), '_blank')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
        >
          Edit Animation
        </button>
      </div>
      
      {/* Full screen vector grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <DemoVectorGrid
          animation={animation}
          speed={speed}
          intensity={intensity}
          gridPattern={gridPattern}
          gridSize={gridSize}
          spacing={spacing}
          rows={rows}
          cols={cols}
          colorMode={colorMode}
          solidColor={solidColor}
          gradientPalette={gradientPalette}
          colorIntensityMode="velocity"
          colorHueShift={0}
          colorSaturation={70}
          colorBrightness={70}
          lengthMin={10}
          lengthMax={40}
        />
      </div>
      
      {/* Footer with subtle branding */}
      <div className="absolute bottom-4 left-4 text-slate-400 text-sm">
        Flynn Vector Grid
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading animation...</div>
      </div>
    }>
      <ViewContent />
    </Suspense>
  );
}