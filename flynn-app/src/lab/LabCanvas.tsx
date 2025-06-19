"use client";

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLabControls, type LabControls } from './hooks/useLabControls';
import { InstancedVectorGrid } from './components/InstancedVectorGrid';
import { FloatingPanel, PanelProvider } from '@/components/ui/FloatingPanel';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import { SimpleTabs } from '@/components/ui/SimpleTabs';
import { cn } from '@/lib/utils';
import { useVectorGrid } from '@/hooks/useVectorGrid';
import type { Vector } from '@/animations/types';
import { GRADIENT_PRESETS, HSL_PRESETS, DYNAMIC_PRESETS } from '@/domain/color/ColorPresets';
import { IntelligentPresetsPanel } from './components/IntelligentPresetsPanel';
import { flynnStyles } from './flynn-styles';
import Lab3DExportModal from '@/components/features/lab/Lab3DExportModal';
import { GradientEditor } from '@/components/ui/GradientEditor';
import type { GradientColor } from '@/domain/color/types';
import { applyAnimation } from '@/animations/animationEngine';
import { getAllAnimations } from '@/animations/registry';

interface Lab3DConfig {
  gridSize: number;
  gridPattern: string;
  gridScale: number;
  depthMin: number;
  depthMax: number;
  depthPattern: string;
  depthNoiseScale: number;
  animationType: string;
  animationSpeed: number;
  animationIntensity: number;
  time: number;
  colorConfig: any;
  vectorShape: string;
  vectorThickness: number;
  canvasWidth: number;
  canvasHeight: number;
}

const hexToThreeColor = (hex: string): THREE.Color => new THREE.Color(hex);

const hslToThreeColor = (hslString: string): THREE.Color => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return new THREE.Color('#ffffff');
  const [, h, s, l] = match.map(Number);
  const color = new THREE.Color();
  color.setHSL(h / 360, s / 100, l / 100);
  return color;
};

const createGradientPreview = (gradient: GradientColor): string => {
  if (!gradient || !gradient.stops) return '#10b981';
  const stops = gradient.stops.sort((a, b) => a.offset - b.offset).map(s => `${s.color} ${s.offset * 100}%`).join(', ');
  switch (gradient.variant) {
    case 'radial': return `radial-gradient(circle, ${stops})`;
    case 'conic': return `conic-gradient(${stops})`;
    default: return `linear-gradient(${gradient.angle || 90}deg, ${stops})`;
  }
};

const interpolateColor = (color1: THREE.Color, color2: THREE.Color, factor: number): THREE.Color => {
  const result = new THREE.Color();
  result.lerpColors(color1, color2, Math.max(0, Math.min(1, factor)));
  return result;
};

const getColorFromGradientStops = (stops: any[], offset: number): THREE.Color => {
  offset = Math.max(0, Math.min(1, offset));
  for (let i = 0; i < stops.length - 1; i++) {
    if (offset >= stops[i].offset && offset <= stops[i + 1].offset) {
      const factor = (offset - stops[i].offset) / (stops[i + 1].offset - stops[i].offset);
      return interpolateColor(new THREE.Color(stops[i].color), new THREE.Color(stops[i + 1].color), factor);
    }
  }
  return new THREE.Color(stops[stops.length - 1].color);
};

const simulateGradientForThreeJS = (gradient: any, position: { x: number; y: number }): THREE.Color => {
  if (!gradient.stops || gradient.stops.length === 0) return new THREE.Color('#10b981');
  let progress = 0;
  const normalizedX = position.x / 10;
  const normalizedY = position.y / 10;
  switch (gradient.variant) {
    case 'linear':
      const angle = (gradient.angle || 0) * Math.PI / 180;
      progress = (normalizedX * Math.cos(angle) + normalizedY * Math.sin(angle) + 1) / 2;
      break;
    case 'radial':
      progress = Math.min(Math.sqrt(position.x ** 2 + position.y ** 2) / 10, 1);
      break;
    case 'conic':
      progress = (Math.atan2(position.y, position.x) + Math.PI) / (2 * Math.PI);
      break;
    default:
      progress = (position.x + 10) / 20;
  }
  return getColorFromGradientStops(gradient.stops, progress);
};

const simulateHSLAnimationForThreeJS = (hslColor: any, position: { x: number; y: number }, time: number, vectorIndex: number): THREE.Color => {
  let { hue = 0, saturation = 70, lightness = 50, speed = 0.1 } = hslColor;
  const normalizedX = position.x / 10;
  const normalizedY = position.y / 10;
  switch (hslColor.variant) {
    case 'rainbow':
      hue = (time * speed * 100 + vectorIndex * 2) % 360;
      break;
    case 'flow':
      hue = (hue + normalizedX * 180 + normalizedY * 90 + time * speed * 50) % 360;
      break;
    case 'cycle':
      const pulseFactor = Math.sin(time * speed * 2 + vectorIndex * 0.1);
      hue = (hue + pulseFactor * 180) % 360;
      saturation = Math.max(20, Math.min(100, saturation + pulseFactor * 30));
      break;
    default:
      hue = (hue + normalizedX * 30 + normalizedY * 15) % 360;
  }
  const color = new THREE.Color();
  color.setHSL(Math.max(0, Math.min(360, hue)) / 360, Math.max(0, Math.min(100, saturation)) / 100, Math.max(0, Math.min(100, lightness)) / 100);
  return color;
};

const processColorToThree = (colorResult: any, position?: { x: number; y: number }, time?: number, originalColor?: any, vectorIndex?: number): THREE.Color => {
  if (originalColor?.type === 'gradient' && position) return simulateGradientForThreeJS(originalColor, position);
  if (originalColor?.type === 'hsl' && position && time !== undefined) return simulateHSLAnimationForThreeJS(originalColor, position, time, vectorIndex || 0);
  if (typeof colorResult?.fill !== 'string') return new THREE.Color('#ffffff');
  const { fill } = colorResult;
  if (fill.startsWith('url(#') && originalColor) return simulateGradientForThreeJS(originalColor, position || { x: 0, y: 0 });
  if (fill.startsWith('#')) return hexToThreeColor(fill);
  if (fill.startsWith('hsl')) return hslToThreeColor(fill);
  return new THREE.Color('#10b981');
};

const SelectControl: React.FC<{ label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; className?: string; }> = ({ label, value, options, onChange, className }) => (
  <div className={cn("space-y-2", className)}>
    <label className="block flynn-label">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full flynn-select">
      {options.map(option => <option key={option.value} value={option.value} className="bg-neutral-800">{option.label}</option>)}
    </select>
  </div>
);

const getGradientEmoji = (key: string): string => ({ sunset: '🌅', ocean: '🌊', forest: '🌲', fire: '🔥', cosmic: '🌌', neon: '💫', aurora: '✨', rainbow: '🌈', pastel: '🎨', metallic: '⚡', grayscale: '⚫', subtle: '💭', flow: '🌊', pulse: '💓' }[key] || '🎨');

// 3D Depth Calculation System
const calculate3DDepth = (
  position: { x: number; y: number },
  vectorIndex: number,
  time: number,
  controls: LabControls,
  canvasWidth: number,
  canvasHeight: number
): number => {
  const {
    depthMin,
    depthMax,
    depthPattern,
    depthNoiseScale,
    depthLayers,
    depthTemporalMode,
    depthTemporalSpeed,
    depthTemporalAmplitude,
    depthSpatialMode,
    depthDistanceFactor,
    depthAsymmetry,
    depthFlowDirection,
    depthFlowIntensity,
    depthTurbulence
  } = controls;

  let depth = 0;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const normalizedX = (position.x - centerX) / canvasWidth;
  const normalizedY = (position.y - centerY) / canvasHeight;
  
  // Base pattern calculation
  switch (depthPattern) {
    case 'waves':
      depth = Math.sin(normalizedX * Math.PI * 4) * Math.cos(normalizedY * Math.PI * 3);
      break;
    case 'perlin':
      // Simplified Perlin-like noise
      let noise = 0;
      for (let i = 0; i < depthLayers; i++) {
        const freq = Math.pow(2, i) * depthNoiseScale;
        const amp = Math.pow(0.5, i);
        noise += Math.sin(normalizedX * freq * Math.PI) * Math.cos(normalizedY * freq * Math.PI) * amp;
      }
      depth = noise;
      break;
    case 'spiral':
      const angle = Math.atan2(normalizedY, normalizedX);
      const radius = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      depth = Math.sin(angle * 3 + radius * Math.PI * 2) * Math.exp(-radius);
      break;
    case 'vortex':
      const vortexAngle = Math.atan2(normalizedY, normalizedX);
      const vortexRadius = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      depth = Math.sin(vortexAngle * 8 - vortexRadius * Math.PI * 4) * (1 - vortexRadius);
      break;
    case 'fractal':
      let fractal = 0;
      for (let i = 0; i < depthLayers; i++) {
        const scale = Math.pow(2, i);
        const x = normalizedX * scale;
        const y = normalizedY * scale;
        fractal += Math.sin(x * Math.PI) * Math.cos(y * Math.PI) / scale;
      }
      depth = fractal;
      break;
    case 'ridges':
      const ridgeX = Math.abs(normalizedX * 4) % 1;
      const ridgeY = Math.abs(normalizedY * 4) % 1;
      depth = Math.min(ridgeX, 1 - ridgeX) * Math.min(ridgeY, 1 - ridgeY) * 4;
      break;
  }

  // Apply temporal effects
  if (depthTemporalMode !== 'none') {
    let temporalFactor = 0;
    const timeOffset = time * depthTemporalSpeed;
    
    switch (depthTemporalMode) {
      case 'pulse':
        temporalFactor = Math.sin(timeOffset + vectorIndex * 0.1) * depthTemporalAmplitude;
        break;
      case 'wave':
        temporalFactor = Math.sin(timeOffset + normalizedX * Math.PI) * depthTemporalAmplitude;
        break;
      case 'spiral':
        const tempAngle = Math.atan2(normalizedY, normalizedX);
        temporalFactor = Math.sin(timeOffset + tempAngle * 2) * depthTemporalAmplitude;
        break;
      case 'earthquake':
        temporalFactor = (Math.random() - 0.5) * depthTemporalAmplitude * Math.sin(timeOffset);
        break;
    }
    
    depth += temporalFactor;
  }

  // Apply spatial effects
  if (depthSpatialMode !== 'none') {
    let spatialFactor = 1;
    const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    
    switch (depthSpatialMode) {
      case 'center':
        spatialFactor = 1 - distance * depthDistanceFactor;
        break;
      case 'edges':
        spatialFactor = distance * depthDistanceFactor;
        break;
      case 'diagonal':
        spatialFactor = Math.abs(normalizedX + normalizedY) * depthDistanceFactor;
        break;
      case 'corners':
        spatialFactor = Math.max(Math.abs(normalizedX), Math.abs(normalizedY)) * depthDistanceFactor;
        break;
      case 'asymmetric':
        spatialFactor = (normalizedX * depthAsymmetry + normalizedY) * depthDistanceFactor;
        break;
    }
    
    depth *= spatialFactor;
  }

  // Apply flow effects
  if (depthFlowIntensity > 0) {
    const flowAngle = (depthFlowDirection * Math.PI) / 180;
    const flowDirection = normalizedX * Math.cos(flowAngle) + normalizedY * Math.sin(flowAngle);
    const flowEffect = Math.sin(flowDirection * Math.PI * 2 + time) * depthFlowIntensity;
    
    // Add turbulence
    const turbulenceX = Math.sin(normalizedX * Math.PI * 4 + time * 2) * depthTurbulence;
    const turbulenceY = Math.cos(normalizedY * Math.PI * 4 + time * 2) * depthTurbulence;
    
    depth += flowEffect + turbulenceX + turbulenceY;
  }

  // Normalize and scale to depth range
  const normalizedDepth = Math.max(-1, Math.min(1, depth));
  return depthMin + (normalizedDepth + 1) * 0.5 * (depthMax - depthMin);
};

export default function LabCanvas() {
  const { controls, updateControl, updateColorConfig, updateAnimationProp, changeColorMode, resetToDefaults, applyPreset, colorEngine } = useLabControls();
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [loopDuration, setLoopDuration] = useState(10);
  const [lengthDynamicsTab, setLengthDynamicsTab] = useState('Oscillation');
  const [depthTab, setDepthTab] = useState('Patterns');
  const [animatedVectors, setAnimatedVectors] = useState<Vector[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isGradientEditorOpen, setIsGradientEditorOpen] = useState(false);
  const [customGradients, setCustomGradients] = useState<Record<string, GradientColor>>({});

  useEffect(() => {
    try {
      const savedGradients = localStorage.getItem('flynn-custom-gradients');
      if (savedGradients) setCustomGradients(JSON.parse(savedGradients));
    } catch (error) { console.error("Failed to load custom gradients", error); }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setTime(prev => isLooping && prev + 0.016 * controls.animationSpeed >= loopDuration ? (prev + 0.016 * controls.animationSpeed) % loopDuration : prev + 0.016 * controls.animationSpeed), 16);
    return () => clearInterval(interval);
  }, [controls.animationSpeed, isPlaying, isLooping, loopDuration]);

  const { vectors: flynVectors, layoutInfo } = useVectorGrid({ 
    gridMode: controls.gridMode,
    gridSize: controls.gridSize,
    gridPattern: controls.gridPattern,
    gridScale: controls.gridScale,
    colorMode: controls.colorConfig.mode === 'hsl' || controls.colorConfig.mode === 'dynamic' ? 'solid' : controls.colorConfig.mode,
    solidColor: controls.colorConfig.color.type === 'solid' ? controls.colorConfig.color.value : '#10b981',
    gradientPalette: 'flow',
    lengthMin: controls.lengthMin,
    lengthMax: controls.lengthMax,
    fibonacciDensity: controls.fibonacciDensity,
    fibonacciRadius: controls.fibonacciRadius,
    fibonacciAngle: controls.fibonacciAngle,
    radialPatternBias: controls.radialPatternBias,
    radialMaxRadius: controls.radialMaxRadius,
    polarDistribution: controls.polarDistribution,
    polarRadialBias: controls.polarRadialBias,
    goldenExpansion: controls.goldenExpansion,
    goldenRotation: controls.goldenRotation,
    goldenCompression: controls.goldenCompression,
    spiralTightness: controls.spiralTightness,
    spiralArms: controls.spiralArms,
    spiralStartRadius: controls.spiralStartRadius,
    hexagonalSpacing: controls.hexagonalSpacing,
    hexagonalOffset: controls.hexagonalOffset,
    concentricSquaresNumSquares: controls.concentricSquaresNumSquares,
    concentricSquaresRotation: controls.concentricSquaresRotation,
    voronoiSeed: controls.voronoiSeed,
    dimensions: { width: 800, height: 600 }
  });

  const baseVectors = useMemo((): Vector[] => flynVectors.map((v, i) => ({ ...v, id: `v-${i}`, row: Math.floor(i / Math.sqrt(controls.gridSize)), col: i % Math.sqrt(controls.gridSize) })), [flynVectors, controls.gridSize]);

  // Create a checksum of vector positions to detect grid changes
  const gridChecksum = useMemo(() => {
    if (baseVectors.length === 0) return 0;
    return baseVectors.reduce((acc, v) => acc + v.x + v.y, 0);
  }, [baseVectors]);

  useEffect(() => {
    if (controls.animationType === 'none') { setAnimatedVectors(baseVectors); return; }
    const animationMeta = getAllAnimations().find(a => a.id === controls.animationType);
    if (!animationMeta) { setAnimatedVectors(baseVectors); return; }
    const animationResult = applyAnimation(controls.animationType, { 
      vectors: baseVectors, 
      time, 
      dimensions: { width: 800, height: 600 }, 
      mousePos: { x: null, y: null }, 
      props: { 
        ...animationMeta.defaultProps, 
        ...controls.animationProps, 
        speed: controls.animationSpeed, 
        intensity: controls.animationIntensity 
      }, 
      layout: layoutInfo || undefined,
      gridChecksum // Pass the checksum here
    });
    setAnimatedVectors(animationResult.vectors);
  }, [controls.animationType, controls.animationIntensity, controls.animationSpeed, controls.animationProps, baseVectors, time, layoutInfo, gridChecksum]);

  const { gridPositions, gridRotations, vectorColors } = useMemo(() => {
    const positions = animatedVectors.map((v, i) => {
      let finalX = v.x;
      let finalY = v.y;
      
      // Apply vortex animation if enabled
      if (controls.vortexStrength > 0) {
        const centerX = 400 + controls.vortexCenterX * 400; // Convert from -1,1 to canvas coords
        const centerY = 300 + controls.vortexCenterY * 300;
        
        const dx = finalX - centerX;
        const dy = finalY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(400 * 400 + 300 * 300);
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Vortex effect decreases with distance
        const vortexIntensity = controls.vortexStrength * (1 - normalizedDistance);
        const angle = Math.atan2(dy, dx);
        const vortexAngle = angle + (controls.vortexRotation * Math.PI / 180) + time * vortexIntensity;
        
        // Apply vortex displacement
        const vortexRadius = distance * (1 + Math.sin(time * 2 + normalizedDistance * Math.PI) * 0.1);
        finalX = centerX + Math.cos(vortexAngle) * vortexRadius;
        finalY = centerY + Math.sin(vortexAngle) * vortexRadius;
      }
      
      const baseZ = calculate3DDepth(
        { x: finalX, y: finalY },
        i,
        time,
        controls,
        800,
        600
      );
      
      return {
        x: (finalX - 400) * 0.02,
        y: (finalY - 300) * 0.02,
        z: baseZ * 0.1 // Scale depth appropriately for 3D scene
      };
    });
    
    let rotations = animatedVectors.map(v => v.angle);
    
    // Apply vortex rotation if enabled
    if (controls.vortexStrength > 0) {
      rotations = rotations.map((rotation, i) => {
        const centerX = 400 + controls.vortexCenterX * 400;
        const centerY = 300 + controls.vortexCenterY * 300;
        
        const dx = animatedVectors[i].x - centerX;
        const dy = animatedVectors[i].y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(400 * 400 + 300 * 300);
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        const vortexRotationEffect = (controls.vortexRotation * Math.PI / 180) * controls.vortexStrength * (1 - normalizedDistance);
        return rotation + vortexRotationEffect + time * controls.vortexStrength * 0.5;
      });
    }
    
    const colors = positions.map((p, i) => {
      const colorResult = colorEngine.processColor(controls.colorConfig.color, { vectorIndex: i, totalVectors: positions.length, vectorPosition: p, animationIntensity: controls.animationIntensity, time, canvasDimensions: { width: 800, height: 600 } });
      return processColorToThree(colorResult, p, time, controls.colorConfig.color, i);
    });
    return { gridPositions: positions, gridRotations: rotations, vectorColors: colors };
  }, [animatedVectors, controls, time, colorEngine]);

  const lab3DConfig: Lab3DConfig = { ...controls, time, canvasWidth: 800, canvasHeight: 600 };
  const availableAnimations = useMemo(() => [{ value: 'none', label: 'Ninguna' }, ...getAllAnimations().map(a => ({ value: a.id, label: a.name }))], []);
  const currentAnimationMeta = useMemo(() => getAllAnimations().find(a => a.id === controls.animationType), [controls.animationType]);

  // Debug log to see what's happening with gridSize
  useEffect(() => {
    console.log('🔍 DEBUG VECTOR COUNT:');
    console.log('  controls.gridSize:', controls.gridSize);
    console.log('  flynVectors.length:', flynVectors.length);
    console.log('  baseVectors.length:', baseVectors.length);
    console.log('  animatedVectors.length:', animatedVectors.length);
    console.log('  gridPositions.length:', gridPositions.length);
    console.log('  controls.gridMode:', controls.gridMode);
    console.log('  controls.gridPattern:', controls.gridPattern);
  }, [controls.gridSize, flynVectors.length, baseVectors.length, animatedVectors.length, gridPositions.length, controls.gridMode, controls.gridPattern]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: flynnStyles }} />
      <div className="flex h-screen bg-black text-white">
        <main className="flex-1 h-screen relative bg-black">
          <Canvas camera={{ position: [0, 0, 20], fov: 75 }} style={{ background: '#000000' }} onCreated={({ gl }) => setCanvasRef(gl.domElement)}>
            <ambientLight intensity={0.8} />
            <pointLight position={[15, 15, 15]} intensity={1.5} />
            <InstancedVectorGrid positions={gridPositions} rotations={gridRotations} colors={vectorColors} controls={controls} time={time} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>

          <PanelProvider>
            <FloatingPanel title="Configuración Esencial" defaultPosition={{ x: 20, y: 20 }} defaultWidth={380}>
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">CUADRÍCULA</h3>
                  <div className="space-y-4">
                    <SelectControl
                      label="Modo de Cuadrícula"
                      value={controls.gridMode}
                      options={[
                        { value: 'basic', label: 'Básico (Filas/Columnas)' },
                        { value: 'math', label: 'Matemático (Patrones)' }
                      ]}
                      onChange={(value) => updateControl('gridMode', value as 'basic' | 'math')}
                    />

                    {controls.gridMode === 'basic' && (
                      <>
                        <SliderWithInput label="Filas" value={controls.rows} min={1} max={100} step={1} onChange={(value) => updateControl('rows', value)} />
                        <SliderWithInput label="Columnas" value={controls.cols} min={1} max={100} step={1} onChange={(value) => updateControl('cols', value)} />
                        <SliderWithInput label="Espaciado" value={controls.spacing} min={1} max={100} step={1} onChange={(value) => updateControl('spacing', value)} />
                      </>
                    )}

                    {controls.gridMode === 'math' && (
                      <>
                        <SelectControl
                          label="Patrón Matemático"
                          value={controls.gridPattern}
                          options={[
                            { value: 'fibonacci', label: 'Fibonacci (Phyllotaxis)' },
                            { value: 'golden', label: 'Golden Angle' },
                            { value: 'radial', label: 'Radial' },
                            { value: 'polar', label: 'Coordenadas Polares' },
                            { value: 'logSpiral', label: 'Espiral Logarítmica' },
                            { value: 'hexagonal', label: 'Hexagonal' },
                            { value: 'triangular', label: 'Triangular' },
                            { value: 'concentricSquares', label: 'Cuadrados Concéntricos' },
                            { value: 'voronoi', label: 'Voronoi (Experimental)' }
                          ]}
                          onChange={(value) => updateControl('gridPattern', value as any)}
                        />
                        <SelectControl
                          label="Densidad de Vectores"
                          value={controls.gridSize.toString()}
                          options={[
                            { value: '100', label: '100 (10x10)' },
                            { value: '400', label: '400 (20x20)' },
                            { value: '900', label: '900 (30x30)' },
                            { value: '1600', label: '1600 (40x40)' },
                            { value: '2500', label: '2500 (50x50)' },
                            { value: '3600', label: '3600 (60x60)' },
                            { value: '4900', label: '4900 (70x70)' },
                            { value: '6400', label: '6400 (80x80)' },
                            { value: '8100', label: '8100 (90x90)' },
                            { value: '10000', label: '10000 (100x100)' }
                          ]}
                          onChange={(value) => updateControl('gridSize', parseInt(value))}
                        />

                        {controls.gridPattern === 'fibonacci' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Densidad Espiral" value={controls.fibonacciDensity} min={0.1} max={2.0} step={0.1} onChange={(value) => updateControl('fibonacciDensity', value)} />
                            <SliderWithInput label="Radio Máximo" value={controls.fibonacciRadius} min={0.3} max={1.0} step={0.05} onChange={(value) => updateControl('fibonacciRadius', value)} />
                            <SliderWithInput label="Ángulo Dorado" value={controls.fibonacciAngle} min={130} max={145} step={0.5} onChange={(value) => updateControl('fibonacciAngle', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'radial' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Proporción Radial" value={controls.radialPatternBias} min={-1} max={1} step={0.1} onChange={(value) => updateControl('radialPatternBias', value)} />
                            <SliderWithInput label="Radio Máximo" value={controls.radialMaxRadius} min={0.5} max={1.0} step={0.05} onChange={(value) => updateControl('radialMaxRadius', value)} />
                          </div>
                        )}

                         {controls.gridPattern === 'golden' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Factor de Expansión" value={controls.goldenExpansion} min={0.5} max={2.0} step={0.1} onChange={(value) => updateControl('goldenExpansion', value)} />
                            <SliderWithInput label="Rotación Base" value={controls.goldenRotation} min={0} max={360} step={5} onChange={(value) => updateControl('goldenRotation', value)} />
                            <SliderWithInput label="Compresión" value={controls.goldenCompression} min={0.5} max={1.5} step={0.05} onChange={(value) => updateControl('goldenCompression', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'polar' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SelectControl
                              label="Distribución"
                              value={controls.polarDistribution}
                              options={[
                                { value: 'uniform', label: 'Uniforme' },
                                { value: 'logarithmic', label: 'Logarítmica' }
                              ]}
                              onChange={(value) => updateControl('polarDistribution', value as any)}
                            />
                            <SliderWithInput label="Sesgo Radial" value={controls.polarRadialBias} min={-1} max={1} step={0.1} onChange={(value) => updateControl('polarRadialBias', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'logSpiral' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Ajuste Espiral" value={controls.spiralTightness} min={0.1} max={1.0} step={0.05} onChange={(value) => updateControl('spiralTightness', value)} />
                            <SliderWithInput label="Brazos Espiral" value={controls.spiralArms} min={1} max={8} step={1} onChange={(value) => updateControl('spiralArms', value)} />
                            <SliderWithInput label="Radio Inicial" value={controls.spiralStartRadius} min={1} max={20} step={1} onChange={(value) => updateControl('spiralStartRadius', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'hexagonal' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Espaciado Hexagonal" value={controls.hexagonalSpacing} min={0.5} max={2.0} step={0.1} onChange={(value) => updateControl('hexagonalSpacing', value)} />
                            <SliderWithInput label="Desplazamiento" value={controls.hexagonalOffset} min={0} max={1} step={0.05} onChange={(value) => updateControl('hexagonalOffset', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'concentricSquares' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Número de Cuadrados" value={controls.concentricSquaresNumSquares} min={2} max={10} step={1} onChange={(value) => updateControl('concentricSquaresNumSquares', value)} />
                            <SliderWithInput label="Rotación" value={controls.concentricSquaresRotation} min={0} max={180} step={5} onChange={(value) => updateControl('concentricSquaresRotation', value)} />
                          </div>
                        )}

                        {controls.gridPattern === 'voronoi' && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            <SliderWithInput label="Semilla Voronoi" value={controls.voronoiSeed} min={1} max={100} step={1} onChange={(value) => updateControl('voronoiSeed', value)} />
                          </div>
                        )}
                      </>
                    )}
                    <SliderWithInput label="Escala Global" value={controls.gridScale} min={0.1} max={3.0} step={0.1} onChange={(v) => updateControl('gridScale', v)} />
                  </div>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">ANIMACIÓN</h3>
                  <div className="space-y-4">
                    <SelectControl label="" value={controls.animationType} options={availableAnimations} onChange={(v) => updateControl('animationType', v)} />
                    <SliderWithInput label="Velocidad" value={controls.animationSpeed} min={0} max={5} step={0.1} onChange={(v) => updateControl('animationSpeed', v)} />
                    <SliderWithInput label="Intensidad" value={controls.animationIntensity} min={0} max={2} step={0.1} onChange={(v) => updateControl('animationIntensity', v)} />
                  </div>
                </section>
                {currentAnimationMeta?.controls && (
                  <section>
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">{currentAnimationMeta.name.toUpperCase()}</h3>
                    <div className="space-y-4">
                      {currentAnimationMeta.controls.map(c => {
                        if (c.type === 'slider') {
                          return <SliderWithInput key={c.id} label={c.label} value={controls.animationProps[c.id] ?? c.defaultValue} min={c.min} max={c.max} step={c.step} onChange={v => updateAnimationProp(c.id, v)} />;
                        } else if (c.type === 'button') {
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                // Trigger pulse by setting pulseState
                                updateAnimationProp('pulseState', { active: true, startMs: Date.now() });
                                // Auto-disable after pulse duration
                                setTimeout(() => {
                                  updateAnimationProp('pulseState', { active: false, startMs: 0 });
                                }, 3000); // 3 seconds pulse duration
                              }}
                              className="w-full px-4 py-3 bg-orange-600/80 hover:bg-orange-500 active:bg-orange-700 transition-colors rounded-lg font-medium text-white border border-orange-500/50"
                            >
                              {c.label}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </section>
                )}
              </div>
            </FloatingPanel>

            <FloatingPanel title="Presets Inteligentes" defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 20 }} defaultWidth={380}>
              <IntelligentPresetsPanel onApplyPreset={(presetId) => applyPreset(presetId)} />
            </FloatingPanel>

            <FloatingPanel title="Estilo y Dinámica" defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 260 }} defaultWidth={380}>
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">SISTEMA DE COLORES</h3>
                  <div className="space-y-4">
                    <SelectControl label="" value={controls.colorConfig.mode} options={[{ value: 'solid', label: 'Sólido' }, { value: 'gradient', label: 'Gradiente' }, { value: 'hsl', label: 'HSL Animado' }, { value: 'dynamic', label: 'Dinámico' }]} onChange={(v) => changeColorMode(v as any)} />
                    {controls.colorConfig.mode === 'solid' && (
                      <div className="space-y-2">
                        <label className="block flynn-label">Color Personalizado</label>
                        <input type="color" value={controls.colorConfig.color.type === 'solid' ? controls.colorConfig.color.value : '#10b981'} onChange={(e) => updateColorConfig({ color: { type: 'solid', value: e.target.value } })} className="w-full h-10 p-0 border-none cursor-pointer" />
                      </div>
                    )}
                    {controls.colorConfig.mode === 'gradient' && (
                      <div className="space-y-4">
                        <SelectControl label="Preset de Gradiente" value={Object.keys(GRADIENT_PRESETS).find(k => JSON.stringify(GRADIENT_PRESETS[k]) === JSON.stringify(controls.colorConfig.color)) || 'sunset'} options={Object.keys(GRADIENT_PRESETS).map(k => ({ value: k, label: `${getGradientEmoji(k)} ${k.charAt(0).toUpperCase() + k.slice(1)}` }))} onChange={v => updateColorConfig({ color: GRADIENT_PRESETS[v] })} />
                        <div className="w-full h-8 rounded border border-neutral-600" style={{ background: createGradientPreview(controls.colorConfig.color as GradientColor) }} />
                        {Object.keys(customGradients).length > 0 && (
                          <div>
                            <label className="block flynn-label">Mis Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(customGradients).map(([name, grad]) => <button key={name} onClick={() => updateColorConfig({ color: grad })} className="w-full h-8 rounded border border-neutral-600" style={{ background: createGradientPreview(grad) }} title={name} />)}
                            </div>
                          </div>
                        )}
                        <button onClick={() => setIsGradientEditorOpen(true)} className="w-full px-3 py-2 bg-neutral-700/50 hover:bg-neutral-700 rounded text-xs">Editar Gradiente</button>
                      </div>
                    )}
                     {controls.colorConfig.color.type === 'hsl' && (
                        <div className="space-y-4">
                          <SliderWithInput label="Tono Base" value={(controls.colorConfig.color as any).hue ?? 0} min={0} max={360} step={1} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, hue: v} as any})} />
                          <SliderWithInput label="Velocidad" value={(controls.colorConfig.color as any).speed ?? 0.5} min={0.01} max={1.0} step={0.01} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, speed: v} as any})} />
                          <SliderWithInput label="Saturación" value={(controls.colorConfig.color as any).saturation ?? 80} min={20} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, saturation: v} as any})} />
                        </div>
                     )}
                     {controls.colorConfig.color.type === 'dynamic' && (
                        <div className="space-y-4">
                           <SliderWithInput label="Sensibilidad" value={(controls.colorConfig.color as any).intensityResponse ?? 0.5} min={0.1} max={1.5} step={0.1} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, intensityResponse: v} as any})} />
                           <SliderWithInput label="Color Base" value={(controls.colorConfig.color as any).hue ?? 0} min={0} max={360} step={10} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, hue: v} as any})} />
                           <SliderWithInput label="Saturación" value={(controls.colorConfig.color as any).saturation ?? 70} min={0} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, saturation: v} as any})} />
                           <SliderWithInput label="Luminosidad" value={(controls.colorConfig.color as any).lightness ?? 50} min={0} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, lightness: v} as any})} />
                        </div>
                     )}
                  </div>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">FORMA DEL VECTOR</h3>
                  <div className="space-y-4">
                    <SelectControl
                      label="Forma"
                      value={controls.vectorShape}
                      options={[
                        { value: 'straight', label: 'Línea Recta' },
                        { value: 'arrow', label: 'Flecha' },
                        { value: 'wave', label: 'Onda' },
                        { value: 'organic', label: 'Orgánico' },
                        { value: 'bezier', label: 'Bezier' },
                        { value: 'zigzag', label: 'Zigzag' }
                      ]}
                      onChange={(value) => updateControl('vectorShape', value as any)}
                    />
                    <SliderWithInput label="Grosor" value={controls.vectorThickness} min={0.001} max={0.1} step={0.001} onChange={(v) => updateControl('vectorThickness', v)} />
                  </div>
                </section>
              </div>
            </FloatingPanel>

            <FloatingPanel title="Profundidad 3D" defaultPosition={{ x: 20, y: 500 }} defaultWidth={380}>
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">PROFUNDIDAD BASE</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Profundidad Mín" value={controls.depthMin} min={-50} max={0} step={1} onChange={(v) => updateControl('depthMin', v)} />
                    <SliderWithInput label="Profundidad Máx" value={controls.depthMax} min={0} max={50} step={1} onChange={(v) => updateControl('depthMax', v)} />
                    <SelectControl
                      label="Patrón de Profundidad"
                      value={controls.depthPattern}
                      options={[
                        { value: 'waves', label: '🌊 Ondas' },
                        { value: 'perlin', label: '🌫️ Perlin' },
                        { value: 'spiral', label: '🌀 Espiral' },
                        { value: 'vortex', label: '🌪️ Vórtice' },
                        { value: 'fractal', label: '❄️ Fractal' },
                        { value: 'ridges', label: '⛰️ Crestas' }
                      ]}
                      onChange={(value) => updateControl('depthPattern', value as any)}
                    />
                    <SliderWithInput label="Escala de Ruido" value={controls.depthNoiseScale} min={0} max={3} step={0.1} onChange={(v) => updateControl('depthNoiseScale', v)} />
                    {(controls.depthPattern === 'perlin' || controls.depthPattern === 'fractal') && (
                      <SliderWithInput label="Capas" value={controls.depthLayers} min={1} max={6} step={1} onChange={(v) => updateControl('depthLayers', v)} />
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">EFECTOS TEMPORALES</h3>
                  <div className="space-y-4">
                    <SelectControl
                      label="Modo Temporal"
                      value={controls.depthTemporalMode}
                      options={[
                        { value: 'none', label: 'Ninguno' },
                        { value: 'pulse', label: '💓 Pulso' },
                        { value: 'wave', label: '🌊 Onda' },
                        { value: 'spiral', label: '🌀 Espiral' },
                        { value: 'earthquake', label: '🏔️ Terremoto' }
                      ]}
                      onChange={(value) => updateControl('depthTemporalMode', value as any)}
                    />
                    {controls.depthTemporalMode !== 'none' && (
                      <>
                        <SliderWithInput label="Velocidad Temporal" value={controls.depthTemporalSpeed} min={0.1} max={5} step={0.1} onChange={(v) => updateControl('depthTemporalSpeed', v)} />
                        <SliderWithInput label="Amplitud Temporal" value={controls.depthTemporalAmplitude} min={0} max={2} step={0.1} onChange={(v) => updateControl('depthTemporalAmplitude', v)} />
                      </>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">EFECTOS ESPACIALES</h3>
                  <div className="space-y-4">
                    <SelectControl
                      label="Modo Espacial"
                      value={controls.depthSpatialMode}
                      options={[
                        { value: 'none', label: 'Ninguno' },
                        { value: 'center', label: '🎯 Centro' },
                        { value: 'edges', label: '📐 Bordes' },
                        { value: 'diagonal', label: '📏 Diagonal' },
                        { value: 'corners', label: '📍 Esquinas' },
                        { value: 'asymmetric', label: '🔀 Asimétrico' }
                      ]}
                      onChange={(value) => updateControl('depthSpatialMode', value as any)}
                    />
                    {controls.depthSpatialMode !== 'none' && (
                      <>
                        <SliderWithInput label="Factor de Distancia" value={controls.depthDistanceFactor} min={0.1} max={3} step={0.1} onChange={(v) => updateControl('depthDistanceFactor', v)} />
                        {controls.depthSpatialMode === 'asymmetric' && (
                          <SliderWithInput label="Asimetría" value={controls.depthAsymmetry} min={-2} max={2} step={0.1} onChange={(v) => updateControl('depthAsymmetry', v)} />
                        )}
                      </>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">FLUJO 3D</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Intensidad de Flujo" value={controls.depthFlowIntensity} min={0} max={3} step={0.1} onChange={(v) => updateControl('depthFlowIntensity', v)} />
                    {controls.depthFlowIntensity > 0 && (
                      <>
                        <SliderWithInput label="Dirección (°)" value={controls.depthFlowDirection} min={0} max={360} step={5} onChange={(v) => updateControl('depthFlowDirection', v)} />
                        <SliderWithInput label="Turbulencia" value={controls.depthTurbulence} min={0} max={2} step={0.1} onChange={(v) => updateControl('depthTurbulence', v)} />
                      </>
                    )}
                  </div>
                </section>
              </div>
            </FloatingPanel>

            <FloatingPanel title="Dinámicas de Vector" defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 520 }} defaultWidth={380}>
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">VECTOR AVANZADO</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Longitud Base" value={controls.vectorLength} min={0.1} max={5.0} step={0.1} onChange={(v) => updateControl('vectorLength', v)} />
                    <SelectControl
                      label="Origen de Rotación"
                      value={controls.rotationOrigin}
                      options={[
                        { value: 'start', label: '🔹 Inicio' },
                        { value: 'center', label: '🔘 Centro' },
                        { value: 'end', label: '🔸 Final' }
                      ]}
                      onChange={(value) => updateControl('rotationOrigin', value as any)}
                    />
                    {(controls.vectorShape === 'wave' || controls.vectorShape === 'zigzag' || controls.vectorShape === 'triangleWave' || controls.vectorShape === 'organic' || controls.vectorShape === 'spring') && (
                      <>
                        <SliderWithInput label="Frecuencia" value={controls.frequency} min={0.5} max={8} step={0.1} onChange={(v) => updateControl('frequency', v)} />
                        <SliderWithInput label="Amplitud" value={controls.amplitude} min={0.01} max={0.5} step={0.01} onChange={(v) => updateControl('amplitude', v)} />
                      </>
                    )}
                    {(controls.vectorShape === 'bezier' || controls.vectorShape === 'arc' || controls.vectorShape === 'organic') && (
                      <SliderWithInput label="Curvatura" value={controls.curvature} min={0.1} max={2.0} step={0.1} onChange={(v) => updateControl('curvature', v)} />
                    )}
                    {controls.vectorShape !== 'straight' && (
                      <SliderWithInput label="Segmentos" value={controls.segments} min={3} max={32} step={1} onChange={(v) => updateControl('segments', v)} />
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">DINÁMICAS BÁSICAS</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Variación" value={controls.lengthVariation} min={0} max={2} step={0.1} onChange={(v) => updateControl('lengthVariation', v)} />
                    <SliderWithInput label="Oscilación" value={controls.lengthOscillation} min={0} max={2} step={0.1} onChange={(v) => updateControl('lengthOscillation', v)} />
                    <SliderWithInput label="Pulso" value={controls.lengthPulse} min={0} max={2} step={0.1} onChange={(v) => updateControl('lengthPulse', v)} />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">SISTEMA FLYNN</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Frecuencia Oscilación" value={controls.oscillationFreq} min={0.1} max={3} step={0.1} onChange={(v) => updateControl('oscillationFreq', v)} />
                    <SliderWithInput label="Amplitud Oscilación" value={controls.oscillationAmp} min={0} max={2} step={0.1} onChange={(v) => updateControl('oscillationAmp', v)} />
                    <SliderWithInput label="Velocidad Pulso" value={controls.pulseSpeed} min={0.1} max={5} step={0.1} onChange={(v) => updateControl('pulseSpeed', v)} />
                    <SliderWithInput label="Factor Espacial" value={controls.spatialFactor} min={0} max={2} step={0.1} onChange={(v) => updateControl('spatialFactor', v)} />
                    <SelectControl
                      label="Modo Espacial"
                      value={controls.spatialMode}
                      options={[
                        { value: 'edge', label: '📐 Bordes' },
                        { value: 'center', label: '🎯 Centro' },
                        { value: 'mixed', label: '🔀 Mixto' }
                      ]}
                      onChange={(value) => updateControl('spatialMode', value as any)}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">INTERACCIÓN</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Influencia Ratón" value={controls.mouseInfluence} min={0} max={2} step={0.1} onChange={(v) => updateControl('mouseInfluence', v)} />
                    {controls.mouseInfluence > 0 && (
                      <SelectControl
                        label="Modo Ratón"
                        value={controls.mouseMode}
                        options={[
                          { value: 'attract', label: '🧲 Atraer' },
                          { value: 'repel', label: '⚡ Repeler' },
                          { value: 'stretch', label: '↔️ Estirar' }
                        ]}
                        onChange={(value) => updateControl('mouseMode', value as any)}
                      />
                    )}
                    <SelectControl
                      label="Modo Físico"
                      value={controls.physicsMode}
                      options={[
                        { value: 'none', label: 'Ninguno' },
                        { value: 'velocity', label: '🏃 Velocidad' },
                        { value: 'pressure', label: '💨 Presión' },
                        { value: 'field', label: '⚡ Campo' }
                      ]}
                      onChange={(value) => updateControl('physicsMode', value as any)}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">ANIMACIÓN VÓRTICE</h3>
                  <div className="space-y-4">
                    <SliderWithInput label="Fuerza Vórtice" value={controls.vortexStrength} min={0} max={3} step={0.1} onChange={(v) => updateControl('vortexStrength', v)} />
                    {controls.vortexStrength > 0 && (
                      <>
                        <SliderWithInput label="Rotación" value={controls.vortexRotation} min={0} max={360} step={5} onChange={(v) => updateControl('vortexRotation', v)} />
                        <SliderWithInput label="Centro X" value={controls.vortexCenterX} min={-1} max={1} step={0.1} onChange={(v) => updateControl('vortexCenterX', v)} />
                        <SliderWithInput label="Centro Y" value={controls.vortexCenterY} min={-1} max={1} step={0.1} onChange={(v) => updateControl('vortexCenterY', v)} />
                      </>
                    )}
                  </div>
                </section>
              </div>
            </FloatingPanel>
          </PanelProvider>

          <div className="absolute bottom-4 right-4 flex gap-3">
            <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 bg-emerald-700/80 hover:bg-emerald-600 border-emerald-600 rounded-lg flex items-center gap-2">
              📦 Exportar 3D
            </button>
            <button onClick={resetToDefaults} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border-neutral-600 rounded-lg">Reset</button>
          </div>
        </main>
      </div>

      {isExportModalOpen && (<Lab3DExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} config={lab3DConfig} animatedVectors={animatedVectors} gridPositions={gridPositions} vectorColors={vectorColors} canvas={canvasRef ?? undefined} />)}
      {isGradientEditorOpen && controls.colorConfig.color.type === 'gradient' && (
        <GradientEditor isOpen={isGradientEditorOpen} onClose={() => setIsGradientEditorOpen(false)} initialGradient={controls.colorConfig.color} onSave={(newGradient) => updateColorConfig({ color: newGradient })} onSaveAsCustom={(name, newGradient) => {
          const newCustomGradients = { ...customGradients, [name]: newGradient };
          setCustomGradients(newCustomGradients);
          try { localStorage.setItem('flynn-custom-gradients', JSON.stringify(newCustomGradients)); } catch (error) { console.error("Failed to save custom gradients", error); }
        }}/>
      )}
    </>
  );
}