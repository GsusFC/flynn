"use client";

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLabControls } from './hooks/useLabControls';
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

  const { vectors: flynVectors, layoutInfo } = useVectorGrid({ ...controls, dimensions: { width: 100, height: 100 } });

  const baseVectors = useMemo((): Vector[] => flynVectors.map((v, i) => ({ ...v, id: `v-${i}`, row: Math.floor(i / Math.sqrt(controls.gridSize)), col: i % Math.sqrt(controls.gridSize) })), [flynVectors, controls.gridSize]);

  useEffect(() => {
    if (controls.animationType === 'none') { setAnimatedVectors(baseVectors); return; }
    const animationMeta = getAllAnimations().find(a => a.id === controls.animationType);
    if (!animationMeta) { setAnimatedVectors(baseVectors); return; }
    const animationResult = applyAnimation(controls.animationType, { vectors: baseVectors, time, dimensions: { width: 100, height: 100 }, mousePos: { x: null, y: null }, props: { ...animationMeta.defaultProps, ...controls.animationProps, speed: controls.animationSpeed, intensity: controls.animationIntensity }, layout: layoutInfo || undefined });
    setAnimatedVectors(animationResult.vectors);
  }, [controls.animationType, controls.animationIntensity, controls.animationSpeed, controls.animationProps, baseVectors, time, layoutInfo]);

  const { gridPositions, gridRotations, vectorColors } = useMemo(() => {
    const positions = animatedVectors.map(v => ({ x: (v.x - 50) * 0.2, y: (v.y - 50) * 0.2, z: 0 }));
    const rotations = animatedVectors.map(v => v.angle);
    const colors = positions.map((p, i) => {
      const colorResult = colorEngine.processColor(controls.colorConfig.color, { vectorIndex: i, totalVectors: positions.length, vectorPosition: p, animationIntensity: controls.animationIntensity, time, canvasDimensions: { width: 100, height: 100 } });
      return processColorToThree(colorResult, p, time, controls.colorConfig.color, i);
    });
    return { gridPositions: positions, gridRotations: rotations, vectorColors: colors };
  }, [animatedVectors, controls, time, colorEngine]);

  const lab3DConfig: Lab3DConfig = { ...controls, time, canvasWidth: 800, canvasHeight: 600 };
  const availableAnimations = useMemo(() => [{ value: 'none', label: 'Ninguna' }, ...getAllAnimations().map(a => ({ value: a.id, label: a.name }))], []);
  const currentAnimationMeta = useMemo(() => getAllAnimations().find(a => a.id === controls.animationType), [controls.animationType]);

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
            <FloatingPanel id="config-panel" title="Configuración Esencial" defaultPosition={{ x: 20, y: 20 }} defaultWidth={380}>
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">CUADRÍCULA</h3>
                  <div className="space-y-4">
                    <SelectControl label="" value={controls.gridSize.toString()} options={[{ value: '900', label: '900 vectores' }, { value: '2500', label: '2500 vectores' }]} onChange={(v) => updateControl('gridSize', parseInt(v))} />
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
                      {currentAnimationMeta.controls.map(c => c.type === 'slider' && <SliderWithInput key={c.id} label={c.label} value={controls.animationProps[c.id] ?? c.defaultValue} min={c.min} max={c.max} step={c.step} onChange={v => updateAnimationProp(c.id, v)} />)}
                    </div>
                  </section>
                )}
              </div>
            </FloatingPanel>

            <FloatingPanel id="presets-panel" title="Presets Inteligentes" defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 20 }} defaultWidth={380}>
              <IntelligentPresetsPanel onApplyPreset={(presetId) => applyPreset(presetId)} />
            </FloatingPanel>

            <FloatingPanel id="style-panel" title="Estilo y Dinámica" defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 260 }} defaultWidth={380}>
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
                          <SliderWithInput label="Tono Base" value={controls.colorConfig.color.hue ?? 0} min={0} max={360} step={1} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, hue: v}})} />
                          <SliderWithInput label="Velocidad" value={controls.colorConfig.color.speed ?? 0.5} min={0.01} max={1.0} step={0.01} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, speed: v}})} />
                          <SliderWithInput label="Saturación" value={controls.colorConfig.color.saturation ?? 80} min={20} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, saturation: v}})} />
                        </div>
                     )}
                     {controls.colorConfig.color.type === 'dynamic' && (
                        <div className="space-y-4">
                           <SliderWithInput label="Sensibilidad" value={controls.colorConfig.color.intensityResponse ?? 0.5} min={0.1} max={1.5} step={0.1} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, intensityResponse: v}})} />
                           <SliderWithInput label="Color Base" value={controls.colorConfig.color.hue ?? 0} min={0} max={360} step={10} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, hue: v}})} />
                           <SliderWithInput label="Saturación" value={controls.colorConfig.color.saturation ?? 70} min={0} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, saturation: v}})} />
                           <SliderWithInput label="Luminosidad" value={controls.colorConfig.color.lightness ?? 50} min={0} max={100} step={5} onChange={v => updateColorConfig({color: {...controls.colorConfig.color, lightness: v}})} />
                        </div>
                     )}
                  </div>
                </section>
              </div>
            </FloatingPanel>
          </PanelProvider>

          <div className="absolute bottom-4 right-4">
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