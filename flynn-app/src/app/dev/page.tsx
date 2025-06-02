'use client';

import { useState } from 'react';
import DemoVectorGrid from './DemoVectorGrid';
import LengthDynamicsHelp from './LengthDynamicsHelp';

type AnimationType = 'static' | 'rotation' | 'wave' | 'spiral' | 'dipole' | 'vortex' | 'turbulence';
type GridPattern = 'regular' | 'hexagonal' | 'fibonacci' | 'radial' | 'staggered' | 'triangular' | 'voronoi' | 'golden';

interface PresetConfig {
  name: string;
  gridSize: number;
  gridPattern: GridPattern;
  animation: AnimationType;
  speed: number;
  intensity: number;
  // New Color System
  colorMode: 'solid' | 'gradient';
  solidColor: string;
  gradientPalette: 'flow' | 'rainbow' | 'cosmic' | 'pulse' | 'subtle' | 'sunset' | 'ocean';
  // Dynamic Color Modulation (like Dipole Field)
  dynamicColors: boolean;
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

}



export default function DevPage() {
  const [config, setConfig] = useState<PresetConfig>({
    name: 'Custom', gridSize: 25, gridPattern: 'regular', animation: 'wave', speed: 1, intensity: 0.5, 
    colorMode: 'solid', solidColor: '#3b82f6', gradientPalette: 'flow',
    dynamicColors: false, colorIntensityMode: 'field', colorHueShift: 1, colorSaturation: 80, colorBrightness: 60,
    lengthMin: 10, lengthMax: 25, oscillationFreq: 1, oscillationAmp: 0.3, pulseSpeed: 1, spatialFactor: 0.2, spatialMode: 'edge', mouseInfluence: 0, mouseMode: 'attract', physicsMode: 'none',
    vectorShape: 'straight', showArrowheads: true, curvatureIntensity: 1, waveFrequency: 2, spiralTightness: 1, organicNoise: 0.5
  });
  const [showLengthHelp, setShowLengthHelp] = useState(false);

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
      colorMode: 'gradient', gradientPalette: 'cosmic',
      dynamicColors: true, colorIntensityMode: 'field', colorHueShift: 30, colorSaturation: 80, colorBrightness: 60
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
    }
  };





  const exportSVG = () => {
    console.log('Exporting SVG...', config);
  };

  const exportAnimatedSVG = () => {
    console.log('Exporting Animated SVG...', config);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex h-screen">
        {/* Left Column - Behavior Controls */}
        <div className="w-[15%] bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto">
          <div className="p-4">
            <h1 className="text-lg font-bold mb-6 text-blue-400">⚡ Behavior</h1>
            
            {/* Animation Controls */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Animation Type</h2>
              <select
                value={config.animation}
                onChange={(e) => {
                  const newAnimation = e.target.value as AnimationType;
                  const smartSettings = ANIMATION_LD_PRESETS[newAnimation];
                  setConfig({...config, animation: newAnimation, ...smartSettings});
                }}
                className="w-full bg-gray-800/70 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="static">Static</option>
                <option value="rotation">Rotation</option>
                <option value="wave">Wave</option>
                <option value="spiral">Spiral</option>
                <option value="dipole">Dipole Field</option>
                <option value="vortex">Vortex Flow</option>
                <option value="turbulence">Turbulence</option>
              </select>
            </div>

            {/* Length Dynamics Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-purple-400">🎛️ Length Dynamics</h2>
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
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Min: {config.lengthMin}</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={config.lengthMin}
                      onChange={(e) => setConfig({...config, lengthMin: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Max: {config.lengthMax}</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={config.lengthMax}
                      onChange={(e) => setConfig({...config, lengthMax: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                  </div>
                </div>

                {/* Oscillation */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Osc Freq: {config.oscillationFreq}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={config.oscillationFreq}
                      onChange={(e) => setConfig({...config, oscillationFreq: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Osc Amp: {config.oscillationAmp}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.oscillationAmp}
                      onChange={(e) => setConfig({...config, oscillationAmp: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                  </div>
                </div>

                {/* Advanced */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Pulse: {config.pulseSpeed}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={config.pulseSpeed}
                      onChange={(e) => setConfig({...config, pulseSpeed: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Spatial: {config.spatialFactor}</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.spatialFactor}
                      onChange={(e) => setConfig({...config, spatialFactor: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                    <select
                      value={config.spatialMode}
                      onChange={(e) => setConfig({...config, spatialMode: e.target.value as any})}
                      className="w-full mt-1 bg-gray-800/70 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-100"
                    >
                      <option value="edge">Edge Longer</option>
                      <option value="center">Center Longer</option>
                      <option value="mixed">Mixed Pattern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Mouse: {config.mouseInfluence}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.mouseInfluence}
                      onChange={(e) => setConfig({...config, mouseInfluence: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-purple-500"
                    />
                    <select
                      value={config.mouseMode}
                      onChange={(e) => setConfig({...config, mouseMode: e.target.value as any})}
                      className="w-full mt-1 bg-gray-800/70 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-100"
                    >
                      <option value="attract">Attract (Grow Near)</option>
                      <option value="repel">Repel (Shrink Near)</option>
                      <option value="stretch">Stretch (Dynamic)</option>
                    </select>
                  </div>
                </div>

                {/* Physics Mode */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Physics</label>
                  <select
                    value={config.physicsMode}
                    onChange={(e) => setConfig({...config, physicsMode: e.target.value as any})}
                    className="w-full bg-gray-800/70 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-100"
                  >
                    <option value="none">None</option>
                    <option value="velocity">Velocity</option>
                    <option value="pressure">Pressure</option>
                    <option value="field">Field</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Global Animation Controls */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-4 text-blue-400">⚡ Global Controls</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Speed: {config.speed}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={config.speed}
                    onChange={(e) => setConfig({...config, speed: parseFloat(e.target.value)})}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Intensity: {config.intensity}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.intensity}
                    onChange={(e) => setConfig({...config, intensity: parseFloat(e.target.value)})}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Main Visualization (70% width) */}
        <div className="w-[70%] bg-black border-x border-gray-700/50">
          <DemoVectorGrid 
            gridSize={config.gridSize}
            gridPattern={config.gridPattern}
            animation={config.animation}
            speed={config.speed}
            intensity={config.intensity}
            colorMode={config.colorMode}
            solidColor={config.solidColor}
            gradientPalette={config.gradientPalette}
            dynamicColors={config.dynamicColors}
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
          />
        </div>

        {/* Right Column - Visual Controls & Export */}
        <div className="w-[15%] bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            

            
            {/* Grid Configuration */}
            <div className="mb-8 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Grid Size</label>
                <select
                  value={config.gridSize}
                  onChange={(e) => setConfig({...config, gridSize: parseInt(e.target.value)})}
                  className="w-full bg-gray-800/70 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value={16}>16 (4×4) - Smooth</option>
                  <option value={25}>25 (5×5) - Smooth</option>
                  <option value={36}>36 (6×6) - Smooth</option>
                  <option value={49}>49 (7×7) - Smooth</option>
                  <option value={64}>64 (8×8) - Good</option>
                  <option value={100}>100 (10×10) - Good</option>
                  <option value={400}>400 (20×20) - Medium</option>
                  <option value={900}>900 (30×30) - Heavy</option>
                  <option value={2500}>2500 (50×50) - Extreme</option>
                  <option value={10000}>10000 (100×100) - APOCALYPSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Grid Pattern</label>
                <select
                  value={config.gridPattern}
                  onChange={(e) => setConfig({...config, gridPattern: e.target.value as GridPattern})}
                  className="w-full bg-gray-800/70 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="regular">Regular Grid</option>
                  <option value="hexagonal">Hexagonal</option>
                  <option value="fibonacci">Fibonacci Spiral</option>
                  <option value="radial">Radial Circles</option>
                  <option value="staggered">Staggered Rows</option>
                  <option value="triangular">Triangular</option>
                  <option value="voronoi">Voronoi Random</option>
                  <option value="golden">Golden Ratio</option>
                </select>
              </div>
            </div>

            {/* Color Controls */}
            <div className="mb-8 space-y-4">
              <h2 className="text-lg font-semibold text-gray-300">🎨 Colors</h2>
              
              {/* Color Mode Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Solid Color</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.colorMode === 'gradient'}
                      onChange={(e) => setConfig({...config, colorMode: e.target.checked ? 'gradient' : 'solid'})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm text-gray-400">Gradient</span>
                </div>

                {/* Conditional Controls */}
                {config.colorMode === 'solid' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Color</label>
                    <input
                      type="color"
                      value={config.solidColor}
                      onChange={(e) => setConfig({...config, solidColor: e.target.value})}
                      className="w-full h-10 bg-gray-800/70 border border-gray-600/50 rounded-lg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Gradient Palette</label>
                    <select
                      value={config.gradientPalette}
                      onChange={(e) => setConfig({...config, gradientPalette: e.target.value as any})}
                      className="w-full bg-gray-800/70 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100"
                    >
                      <option value="flow">🌊 Flow</option>
                      <option value="rainbow">🌈 Rainbow</option>
                      <option value="cosmic">🌌 Cosmic</option>
                      <option value="pulse">💓 Pulse</option>
                      <option value="subtle">✨ Subtle</option>
                      <option value="sunset">🌅 Sunset</option>
                      <option value="ocean">🌊 Ocean</option>
                    </select>
                  </div>
                )}
              </div>

               {/* Dynamic Color Modulation */}
               <div className="space-y-3">
                 <div className="flex items-center space-x-2">
                     <input
                     type="checkbox"
                     id="dynamicColors"
                     checked={config.dynamicColors}
                     onChange={(e) => setConfig({...config, dynamicColors: e.target.checked})}
                     className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                   />
                   <label htmlFor="dynamicColors" className="text-sm font-medium text-gray-300">⚡ Dynamic Colors</label>
                 </div>

                 {config.dynamicColors && (
                   <div className="ml-6 space-y-3 border-l-2 border-blue-500/30 pl-3">
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Intensity Mode</label>
                       <select
                         value={config.colorIntensityMode}
                         onChange={(e) => setConfig({...config, colorIntensityMode: e.target.value as any})}
                         className="w-full bg-gray-800/70 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-100"
                       >
                         <option value="field">⚡ Field Strength</option>
                         <option value="velocity">💨 Velocity</option>
                         <option value="distance">📏 Distance</option>
                         <option value="angle">🔄 Angle</option>
                       </select>
                     </div>
                     
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Hue Shift: {config.colorHueShift}</label>
                       <input
                         type="range"
                         min="0"
                         max="360"
                         step="5"
                         value={config.colorHueShift}
                         onChange={(e) => setConfig({...config, colorHueShift: Number(e.target.value)})}
                         className="w-full"
                       />
                     </div>
                     
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Saturation: {config.colorSaturation}%</label>
                       <input
                         type="range"
                         min="0"
                         max="100"
                         step="5"
                         value={config.colorSaturation}
                         onChange={(e) => setConfig({...config, colorSaturation: Number(e.target.value)})}
                         className="w-full"
                       />
                     </div>
                     
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Brightness: {config.colorBrightness}%</label>
                       <input
                         type="range"
                         min="20"
                         max="100"
                         step="5"
                         value={config.colorBrightness}
                         onChange={(e) => setConfig({...config, colorBrightness: Number(e.target.value)})}
                         className="w-full"
                       />
                     </div>
                   </div>
                 )}
               </div>
             </div>



            {/* Vector Shape Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-3 text-green-400">🌊 Vector Shapes</h2>
              
              <div className="space-y-3">
                {/* Vector Shape Selector */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Shape</label>
                  <select
                    value={config.vectorShape}
                    onChange={(e) => setConfig({...config, vectorShape: e.target.value as any})}
                    className="w-full bg-gray-800/70 border border-gray-600/50 rounded px-2 py-1 text-xs text-gray-100"
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
                    onChange={(e) => setConfig({...config, showArrowheads: e.target.checked})}
                    className="w-3 h-3 accent-green-500"
                  />
                  <label htmlFor="showArrowheads" className="text-xs text-gray-300">Show Arrowheads</label>
                </div>

                {/* Curvature Intensity */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Intensity: {config.curvatureIntensity}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={config.curvatureIntensity}
                    onChange={(e) => setConfig({...config, curvatureIntensity: parseFloat(e.target.value)})}
                    className="w-full h-1 accent-green-500"
                  />
                </div>

                {/* Shape-specific controls */}
                {config.vectorShape === 'wave' && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Wave Freq: {config.waveFrequency}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={config.waveFrequency}
                      onChange={(e) => setConfig({...config, waveFrequency: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-green-500"
                    />
                  </div>
                )}

                {config.vectorShape === 'spiral' && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Tightness: {config.spiralTightness}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={config.spiralTightness}
                      onChange={(e) => setConfig({...config, spiralTightness: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-green-500"
                    />
                  </div>
                )}

                {config.vectorShape === 'organic' && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Noise: {config.organicNoise}</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.organicNoise}
                      onChange={(e) => setConfig({...config, organicNoise: parseFloat(e.target.value)})}
                      className="w-full h-1 accent-green-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Export Section */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-orange-400">Export Tools</h2>
              <div className="space-y-2">
                <button
                  onClick={exportSVG}
                  className="w-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Static SVG
                </button>
                <button
                  onClick={exportAnimatedSVG}
                  className="w-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Animated SVG
                </button>
                <div className="pt-1 text-xs text-gray-500 space-y-1">
                  <p>• Static: Current frame</p>
                  <p>• Animated: SMIL loops</p>
                </div>
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
    </div>
  );
}