'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DemoVectorGrid from '@/app/dev/DemoVectorGrid';


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
  const [colorIntensityMode, setColorIntensityMode] = useState<'field' | 'velocity' | 'distance' | 'angle'>('velocity');
  const [colorHueShift, setColorHueShift] = useState(0);
  const [colorSaturation, setColorSaturation] = useState(70);
  const [colorBrightness, setColorBrightness] = useState(70);
  
  // Length and animation settings
  const [lengthMin, setLengthMin] = useState(10);
  const [lengthMax, setLengthMax] = useState(40);
  const [oscillationFreq, setOscillationFreq] = useState(1);
  const [oscillationAmp, setOscillationAmp] = useState(0.3);
  const [pulseSpeed, setPulseSpeed] = useState(1);
  const [spatialFactor, setSpatialFactor] = useState(0.2);
  const [spatialMode, setSpatialMode] = useState<'edge' | 'center' | 'mixed'>('edge');
  const [mouseInfluence, setMouseInfluence] = useState(0);
  const [mouseMode, setMouseMode] = useState<'attract' | 'repel' | 'stretch'>('attract');
  const [physicsMode, setPhysicsMode] = useState<'none' | 'velocity' | 'pressure' | 'field'>('none');
  
  // Vector shape settings
  const [vectorShape, setVectorShape] = useState<'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic'>('straight');
  const [showArrowheads, setShowArrowheads] = useState(true);
  const [curvatureIntensity, setCurvatureIntensity] = useState(1);
  const [waveFrequency, setWaveFrequency] = useState(2);
  const [spiralTightness, setSpiralTightness] = useState(1);
  const [organicNoise, setOrganicNoise] = useState(0.5);

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
    
    // Color dynamics
    const colorIntensityModeParam = searchParams.get('colorIntensityMode') as 'field' | 'velocity' | 'distance' | 'angle';
    if (colorIntensityModeParam) setColorIntensityMode(colorIntensityModeParam);
    
    const colorHueShiftParam = searchParams.get('colorHueShift');
    if (colorHueShiftParam) setColorHueShift(parseFloat(colorHueShiftParam));
    
    const colorSaturationParam = searchParams.get('colorSaturation');
    if (colorSaturationParam) setColorSaturation(parseInt(colorSaturationParam));
    
    const colorBrightnessParam = searchParams.get('colorBrightness');
    if (colorBrightnessParam) setColorBrightness(parseInt(colorBrightnessParam));
    
    // Length and animation settings
    const lengthMinParam = searchParams.get('lengthMin');
    if (lengthMinParam) setLengthMin(parseInt(lengthMinParam));
    
    const lengthMaxParam = searchParams.get('lengthMax');
    if (lengthMaxParam) setLengthMax(parseInt(lengthMaxParam));
    
    const oscillationFreqParam = searchParams.get('oscillationFreq');
    if (oscillationFreqParam) setOscillationFreq(parseFloat(oscillationFreqParam));
    
    const oscillationAmpParam = searchParams.get('oscillationAmp');
    if (oscillationAmpParam) setOscillationAmp(parseFloat(oscillationAmpParam));
    
    const pulseSpeedParam = searchParams.get('pulseSpeed');
    if (pulseSpeedParam) setPulseSpeed(parseFloat(pulseSpeedParam));
    
    const spatialFactorParam = searchParams.get('spatialFactor');
    if (spatialFactorParam) setSpatialFactor(parseFloat(spatialFactorParam));
    
    const spatialModeParam = searchParams.get('spatialMode') as 'edge' | 'center' | 'mixed';
    if (spatialModeParam) setSpatialMode(spatialModeParam);
    
    const mouseInfluenceParam = searchParams.get('mouseInfluence');
    if (mouseInfluenceParam) setMouseInfluence(parseFloat(mouseInfluenceParam));
    
    const mouseModeParam = searchParams.get('mouseMode') as 'attract' | 'repel' | 'stretch';
    if (mouseModeParam) setMouseMode(mouseModeParam);
    
    const physicsModeParam = searchParams.get('physicsMode') as 'none' | 'velocity' | 'pressure' | 'field';
    if (physicsModeParam) setPhysicsMode(physicsModeParam);
    
    // Vector shape settings
    const vectorShapeParam = searchParams.get('vectorShape') as 'straight' | 'wave' | 'bezier' | 'spiral' | 'arc' | 'organic';
    if (vectorShapeParam) setVectorShape(vectorShapeParam);
    
    const showArrowheadsParam = searchParams.get('showArrowheads');
    if (showArrowheadsParam) setShowArrowheads(showArrowheadsParam === 'true');
    
    const curvatureIntensityParam = searchParams.get('curvatureIntensity');
    if (curvatureIntensityParam) setCurvatureIntensity(parseFloat(curvatureIntensityParam));
    
    const waveFrequencyParam = searchParams.get('waveFrequency');
    if (waveFrequencyParam) setWaveFrequency(parseFloat(waveFrequencyParam));
    
    const spiralTightnessParam = searchParams.get('spiralTightness');
    if (spiralTightnessParam) setSpiralTightness(parseFloat(spiralTightnessParam));
    
    const organicNoiseParam = searchParams.get('organicNoise');
    if (organicNoiseParam) setOrganicNoise(parseFloat(organicNoiseParam));
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
    params.set('colorIntensityMode', colorIntensityMode);
    params.set('colorHueShift', colorHueShift.toString());
    params.set('colorSaturation', colorSaturation.toString());
    params.set('colorBrightness', colorBrightness.toString());
    params.set('lengthMin', lengthMin.toString());
    params.set('lengthMax', lengthMax.toString());
    params.set('oscillationFreq', oscillationFreq.toString());
    params.set('oscillationAmp', oscillationAmp.toString());
    params.set('pulseSpeed', pulseSpeed.toString());
    params.set('spatialFactor', spatialFactor.toString());
    params.set('spatialMode', spatialMode);
    params.set('mouseInfluence', mouseInfluence.toString());
    params.set('mouseMode', mouseMode);
    params.set('physicsMode', physicsMode);
    params.set('vectorShape', vectorShape);
    params.set('showArrowheads', showArrowheads.toString());
    params.set('curvatureIntensity', curvatureIntensity.toString());
    params.set('waveFrequency', waveFrequency.toString());
    params.set('spiralTightness', spiralTightness.toString());
    params.set('organicNoise', organicNoise.toString());
    
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
          colorIntensityMode={colorIntensityMode}
          colorHueShift={colorHueShift}
          colorSaturation={colorSaturation}
          colorBrightness={colorBrightness}
          lengthMin={lengthMin}
          lengthMax={lengthMax}
          oscillationFreq={oscillationFreq}
          oscillationAmp={oscillationAmp}
          pulseSpeed={pulseSpeed}
          spatialFactor={spatialFactor}
          spatialMode={spatialMode}
          mouseInfluence={mouseInfluence}
          mouseMode={mouseMode}
          physicsMode={physicsMode}
          vectorShape={vectorShape}
          showArrowheads={showArrowheads}
          curvatureIntensity={curvatureIntensity}
          waveFrequency={waveFrequency}
          spiralTightness={spiralTightness}
          organicNoise={organicNoise}
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