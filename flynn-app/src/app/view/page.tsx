'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FlynVectorGrid from '@/app/dev/FlynVectorGrid';


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
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  
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
  
  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [margin, setMargin] = useState(20);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // First try to load compressed configuration
    const tryLoadCompressedConfig = async () => {
      const compressedParam = searchParams.get('c');
      if (compressedParam) {
        try {
          const { decompressConfig } = await import('@/utils/urlCompression');
          const config = decompressConfig(decodeURIComponent(compressedParam));
          
          // Apply all configuration from compressed data
          if (config.animation) setAnimation(config.animation);
          if (config.speed !== undefined) setSpeed(config.speed);
          if (config.intensity !== undefined) setIntensity(config.intensity);
          if (config.gridPattern) setGridPattern(config.gridPattern);
          if (config.gridSize !== undefined) setGridSize(config.gridSize);
          if (config.spacing !== undefined) setSpacing(config.spacing);
          if (config.rows !== undefined) setRows(config.rows);
          if (config.cols !== undefined) setCols(config.cols);
          if (config.colorMode) setColorMode(config.colorMode);
          if (config.solidColor) setSolidColor(config.solidColor);
          if (config.gradientPalette) setGradientPalette(config.gradientPalette);
          if (config.colorIntensityMode) setColorIntensityMode(config.colorIntensityMode);
          if (config.colorHueShift !== undefined) setColorHueShift(config.colorHueShift);
          if (config.colorSaturation !== undefined) setColorSaturation(config.colorSaturation);
          if (config.colorBrightness !== undefined) setColorBrightness(config.colorBrightness);
          if (config.lengthMin !== undefined) setLengthMin(config.lengthMin);
          if (config.lengthMax !== undefined) setLengthMax(config.lengthMax);
          if (config.oscillationFreq !== undefined) setOscillationFreq(config.oscillationFreq);
          if (config.oscillationAmp !== undefined) setOscillationAmp(config.oscillationAmp);
          if (config.pulseSpeed !== undefined) setPulseSpeed(config.pulseSpeed);
          if (config.spatialFactor !== undefined) setSpatialFactor(config.spatialFactor);
          if (config.spatialMode) setSpatialMode(config.spatialMode);
          if (config.mouseInfluence !== undefined) setMouseInfluence(config.mouseInfluence);
          if (config.mouseMode) setMouseMode(config.mouseMode);
          if (config.physicsMode) setPhysicsMode(config.physicsMode);
          if (config.vectorShape) setVectorShape(config.vectorShape);
          if (config.showArrowheads !== undefined) setShowArrowheads(config.showArrowheads);
          if (config.curvatureIntensity !== undefined) setCurvatureIntensity(config.curvatureIntensity);
          if (config.waveFrequency !== undefined) setWaveFrequency(config.waveFrequency);
          if (config.spiralTightness !== undefined) setSpiralTightness(config.spiralTightness);
          if (config.organicNoise !== undefined) setOrganicNoise(config.organicNoise);
          if (config.canvasWidth !== undefined) setCanvasWidth(config.canvasWidth);
          if (config.canvasHeight !== undefined) setCanvasHeight(config.canvasHeight);
          if (config.margin !== undefined) setMargin(config.margin);
          if (config.isPaused !== undefined) setIsPaused(config.isPaused);
          
          console.log('✅ Configuración cargada desde URL comprimida:', config);
          return; // Exit early if compressed config was loaded
        } catch (error) {
          console.error('❌ Error descomprimiendo configuración:', error);
          // Fall through to try legacy parameter loading
        }
      }
      
      // Fallback to legacy URL parameter loading
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
    
    const backgroundColorParam = searchParams.get('backgroundColor');
    if (backgroundColorParam) setBackgroundColor(decodeURIComponent(backgroundColorParam));
    
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
    
    // Canvas dimensions (legacy format)
    const canvasWidthParam = searchParams.get('canvasWidth');
    if (canvasWidthParam) setCanvasWidth(parseInt(canvasWidthParam));
    
    const canvasHeightParam = searchParams.get('canvasHeight');
    if (canvasHeightParam) setCanvasHeight(parseInt(canvasHeightParam));
    
    const marginParam = searchParams.get('margin');
    if (marginParam) setMargin(parseInt(marginParam));
    
    const isPausedParam = searchParams.get('isPaused');
    if (isPausedParam) setIsPaused(isPausedParam === 'true');
    };
    
    tryLoadCompressedConfig();
  }, [searchParams]);

  // Generate edit URL with current parameters
  const generateEditUrl = async () => {
    const config = {
      animation, speed, intensity, gridPattern, gridSize, spacing, rows, cols,
      colorMode, solidColor, gradientPalette, colorIntensityMode, colorHueShift,
      colorSaturation, colorBrightness, lengthMin, lengthMax, oscillationFreq,
      oscillationAmp, pulseSpeed, spatialFactor, spatialMode, mouseInfluence,
      mouseMode, physicsMode, vectorShape, showArrowheads, curvatureIntensity,
      waveFrequency, spiralTightness, organicNoise, canvasWidth, canvasHeight,
      margin, isPaused
    };
    
    try {
      const { createCompressedShareUrl } = await import('@/utils/urlCompression');
      return createCompressedShareUrl(config, window.location.origin.replace('/view', ''));
    } catch (error) {
      console.error('Error generating edit URL:', error);
      // Fallback to regular URL with basic parameters
      const params = new URLSearchParams();
      params.set('animation', animation);
      params.set('gridPattern', gridPattern);
      params.set('gridSize', gridSize.toString());
      if (rows !== undefined) params.set('rows', rows.toString());
      if (cols !== undefined) params.set('cols', cols.toString());
      return `${window.location.origin.replace('/view', '')}/?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header with edit button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={async () => {
            const editUrl = await generateEditUrl();
            window.open(editUrl, '_blank');
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
        >
          Edit Animation
        </button>
      </div>
      
      {/* Full screen vector grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <FlynVectorGrid
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
          backgroundColor={backgroundColor}
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
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          margin={margin}
          isPaused={isPaused}
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