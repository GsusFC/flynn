// @ts-nocheck
"use client";
import React, { useState, useCallback } from 'react';
import type { VectorColor, ColorMode } from '@/domain/color/types';
import { 
  SOLID_PRESETS, 
  GRADIENT_PRESETS, 
  HSL_PRESETS, 
  DYNAMIC_PRESETS 
} from '@/domain/color/ColorPresets';
import { 
  SolidColor, 
  GradientColor, 
  DynamicColor,
  HSLColor
} from '@/domain/color/types';
import { ColorEngine } from '@/domain/color/ColorEngine';
import { INTELLIGENT_PRESETS, type IntelligentPreset } from '../presets/intelligentPresets';

// Extend VectorColor for HSL to include hue
type LabVectorColor = VectorColor | (Extract<VectorColor, { type: 'hsl' }> & { hue: number });

// Lab-specific types extending Flynn's color system
export interface LabColorConfig {
  mode: 'solid' | 'gradient' | 'hsl' | 'dynamic';
  color: SolidColor | GradientColor | HSLColor | DynamicColor;
}

export interface LabControls {
  // Flynn's Grid System - Exact Copy
  gridMode: 'basic' | 'math';
  
  // Basic Mode
  rows: number;
  cols: number;
  spacing: number;
  
  // Math Mode
  gridSize: number;
  gridPattern: 'fibonacci' | 'golden' | 'radial' | 'polar' | 'logSpiral' | 'hexagonal' | 'triangular' | 'staggered' | 'concentricSquares' | 'voronoi';
  gridScale: number;
  
  // Pattern-specific parameters (Flynn's exact parameters)
  // Fibonacci
  fibonacciDensity: number;
  fibonacciRadius: number;
  fibonacciAngle: number;
  
  // Radial
  radialPatternBias: number;
  radialMaxRadius: number;
  
  // Polar
  polarDistribution: 'uniform' | 'logarithmic';
  polarRadialBias: number;
  
  // Golden
  goldenExpansion: number;
  goldenRotation: number;
  goldenCompression: number;
  
  // Log Spiral
  spiralTightness: number;
  spiralArms: number;
  spiralStartRadius: number;
  
  // Hexagonal
  hexagonalSpacing: number;
  hexagonalOffset: number;
  
  // Concentric Squares
  concentricSquaresNumSquares: number;
  concentricSquaresRotation: number;
  
  // Voronoi
  voronoiSeed: number;
  
  // Vector Appearance
  vectorThickness: number;
  vectorShape: 'straight' | 'wave' | 'spiral' | 'bezier' | 'arc' | 'organic' | 'zigzag' | 'dash' | 'spring' | 'triangleWave' | 'double';
  vectorLength: number;
  rotationOrigin: 'start' | 'center' | 'end';
  
  // Shape Parameters (for complex vector types)
  frequency: number;    // For wave, zigzag, triangleWave
  amplitude: number;    // For wave, zigzag, triangleWave
  curvature: number;    // For bezier, arc, organic
  segments: number;     // For all complex shapes
  
  // Animation
  animationType: string; // Extensible to all Flynn animations
  animationSpeed: number;
  animationIntensity: number;
  
  // Vortex Animation
  vortexStrength: number;
  vortexRotation: number;
  vortexCenterX: number;
  vortexCenterY: number;
  
  // Length Dynamics
  lengthVariation: number;
  lengthOscillation: number;
  lengthPulse: number;
  
  // Flynn's Complete Length Dynamics System
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
  
  // 3D Depth - Expanded System (Fixed)
  depthNoiseScale: number;
  depthMin: number;      // Real minimum depth
  depthMax: number;      // Real maximum depth
  
  // 3D Pattern Type
  depthPattern: 'waves' | 'perlin' | 'spiral' | 'vortex' | 'fractal' | 'ridges';
  depthLayers: number;
  
  // 3D Temporal Controls
  depthTemporalMode: 'none' | 'pulse' | 'wave' | 'spiral' | 'earthquake';
  depthTemporalSpeed: number;
  depthTemporalAmplitude: number;
  
  // 3D Spatial Controls
  depthSpatialMode: 'none' | 'center' | 'edges' | 'diagonal' | 'corners' | 'asymmetric';
  depthDistanceFactor: number;
  depthAsymmetry: number;
  
  // 3D Flow Controls
  depthFlowDirection: number; // degrees
  depthFlowIntensity: number;
  depthTurbulence: number;
  
  // Flynn Color System
  colorConfig: LabColorConfig;
  
  // Animation-specific props
  animationProps: Record<string, any>;
}

const defaultColorConfig: LabColorConfig = {
  mode: 'dynamic',
  color: { 
    type: 'dynamic', 
    hue: 200, 
    saturation: 70, 
    lightness: 60,
    intensityResponse: 0.5,
    effect: 'hue'
  } as DynamicColor
};

export const useLabControls = () => {
  const [controls, setControls] = useState<LabControls>({
    // Flynn's Grid System - Default to Math mode with Fibonacci
    gridMode: 'math',
    
    // Basic Mode defaults
    rows: 10,
    cols: 10,
    spacing: 50,
    
    // Math Mode defaults
    gridSize: 900,
    gridPattern: 'fibonacci',
    gridScale: 1,
    
    // Fibonacci defaults (Flynn's exact values)
    fibonacciDensity: 1.0,
    fibonacciRadius: 0.8,
    fibonacciAngle: 137.5,
    
    // Radial defaults
    radialPatternBias: 0,
    radialMaxRadius: 0.9,
    
    // Polar defaults
    polarDistribution: 'uniform',
    polarRadialBias: 0,
    
    // Golden defaults
    goldenExpansion: 1.0,
    goldenRotation: 0,
    goldenCompression: 1.0,
    
    // Log Spiral defaults
    spiralTightness: 0.2,
    spiralArms: 2,
    spiralStartRadius: 5,
    
    // Hexagonal defaults
    hexagonalSpacing: 1.0,
    hexagonalOffset: 0.5,
    
    // Concentric Squares defaults
    concentricSquaresNumSquares: 5,
    concentricSquaresRotation: 0,
    
    // Voronoi defaults
    voronoiSeed: 1,
    
    // Vector Appearance - Visible thickness for 3D
    vectorThickness: 0.02,
    vectorShape: 'straight',
    vectorLength: 1.0,
    rotationOrigin: 'start',
    
    // Shape Parameters
    frequency: 2,
    amplitude: 0.1,
    curvature: 0.5,
    segments: 8,
    
    // Animation - Static by default
    animationType: 'none',
    animationSpeed: 1,
    animationIntensity: 0,
    
    // Vortex - Disabled by default
    vortexStrength: 0,
    vortexRotation: 0,
    vortexCenterX: 0,
    vortexCenterY: 0,
    
    // Length Dynamics - Fixed length, no variation
    lengthVariation: 0.5,
    lengthOscillation: 0,
    lengthPulse: 0,
    
    // Flynn's Complete Length Dynamics System
    lengthMin: 0.3,
    lengthMax: 4.0,
    oscillationFreq: 0.5,
    oscillationAmp: 0.5,
    pulseSpeed: 1,
    spatialFactor: 0.5,
    spatialMode: 'edge',
    mouseInfluence: 0.5,
    mouseMode: 'attract',
    physicsMode: 'none',
    
    // 3D Depth - Flat on Z plane by default
    depthNoiseScale: 0,
    depthMin: -5,
    depthMax: 5,
    
    // 3D Pattern defaults
    depthPattern: 'waves',
    depthLayers: 1,
    
    // 3D Temporal defaults
    depthTemporalMode: 'none',
    depthTemporalSpeed: 1.0,
    depthTemporalAmplitude: 0.5,
    
    // 3D Spatial defaults
    depthSpatialMode: 'none',
    depthDistanceFactor: 1.0,
    depthAsymmetry: 0,
    
    // 3D Flow defaults
    depthFlowDirection: 0,
    depthFlowIntensity: 0,
    depthTurbulence: 0,
    
    // Color System
    colorConfig: defaultColorConfig,
    
    // Animation-specific props
    animationProps: {}
  });

  const colorEngine = new ColorEngine();

  // Update individual control
  const updateControl = useCallback(<K extends keyof LabControls>(
    key: K,
    value: LabControls[K]
  ) => {
    setControls(prev => {
      const newState = { ...prev, [key]: value };
      
      // When grid mode changes, set a sensible default pattern
      if (key === 'gridMode') {
        if (value === 'basic') {
          newState.gridPattern = 'regular';
        } else if (value === 'math') {
          newState.gridPattern = 'fibonacci'; // Default to a common math pattern
        }
      }
      
      return newState;
    });
  }, []);

  // Update color configuration
  const updateColorConfig = useCallback((updates: Partial<LabColorConfig>) => {
    setControls(prevControls => ({
      ...prevControls,
      colorConfig: {
        ...prevControls.colorConfig,
        ...updates
      }
    }));
  }, []);

  // Update animation-specific props
  const updateAnimationProp = useCallback((propName: string, value: any) => {
    setControls(prevControls => ({
      ...prevControls,
      animationProps: {
        ...prevControls.animationProps,
        [propName]: value
      }
    }));
  }, []);

  // Change color mode and set a default preset - Simplified
  const changeColorMode = useCallback((mode: 'solid' | 'gradient' | 'hsl' | 'dynamic') => {
    let defaultPreset;
    switch (mode) {
      case 'solid':
        defaultPreset = { type: 'solid', value: '#10b981' } as SolidColor;
        break;
      case 'gradient':
        defaultPreset = GRADIENT_PRESETS.sunset;
        break;
      case 'hsl':
        defaultPreset = HSL_PRESETS.rainbow;
        break;
      case 'dynamic':
        defaultPreset = { 
          type: 'dynamic', 
          hue: 200, 
          saturation: 70, 
          lightness: 60,
          intensityResponse: 0.5,
          effect: 'hue'
        } as DynamicColor;
        break;
      default:
        defaultPreset = { type: 'solid', value: '#10b981' } as SolidColor;
    }
    
    updateColorConfig({ mode, color: defaultPreset });
  }, [updateColorConfig]);

  // Apply intelligent preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = INTELLIGENT_PRESETS[presetId];
    if (!preset) {
      console.warn(`Preset ${presetId} not found`);
      return;
    }

    // Apply the preset configuration, merging with current state
    setControls(prevControls => ({
      ...prevControls,
      ...preset.config,
      // Preserve animation props if not specified in preset
      animationProps: preset.config.animationProps || {}
    }));
  }, []);

  // Reset to Flynn's defaults
  const resetToDefaults = useCallback(() => {
    setControls({
      gridMode: 'math',
      rows: 10,
      cols: 10,
      spacing: 50,
      gridSize: 900,
      gridPattern: 'fibonacci',
      gridScale: 1,
      fibonacciDensity: 1.0,
      fibonacciRadius: 0.8,
      fibonacciAngle: 137.5,
      radialPatternBias: 0,
      radialMaxRadius: 0.9,
      polarDistribution: 'uniform',
      polarRadialBias: 0,
      goldenExpansion: 1.0,
      goldenRotation: 0,
      goldenCompression: 1.0,
      spiralTightness: 0.2,
      spiralArms: 2,
      spiralStartRadius: 5,
      hexagonalSpacing: 1.0,
      hexagonalOffset: 0.5,
      concentricSquaresNumSquares: 5,
      concentricSquaresRotation: 0,
      voronoiSeed: 1,
      vectorThickness: 0.02,
      vectorShape: 'straight',
      vectorLength: 1.0,
      rotationOrigin: 'start',
      frequency: 2,
      amplitude: 0.1,
      curvature: 0.5,
      segments: 8,
      animationType: 'none',
      animationSpeed: 1,
      animationIntensity: 0,
      vortexStrength: 0,
      vortexRotation: 0,
      vortexCenterX: 0,
      vortexCenterY: 0,
      lengthVariation: 0.5,
      lengthOscillation: 0,
      lengthPulse: 0,
      lengthMin: 0.3,
      lengthMax: 4.0,
      oscillationFreq: 0.5,
      oscillationAmp: 0.5,
      pulseSpeed: 1,
      spatialFactor: 0.5,
      spatialMode: 'edge',
      mouseInfluence: 0.5,
      mouseMode: 'attract',
      physicsMode: 'none',
      depthNoiseScale: 0,
      depthMin: -5,
      depthMax: 5,
      depthPattern: 'waves',
      depthLayers: 1,
      depthTemporalMode: 'none',
      depthTemporalSpeed: 1.0,
      depthTemporalAmplitude: 0.5,
      depthSpatialMode: 'none',
      depthDistanceFactor: 1.0,
      depthAsymmetry: 0,
      depthFlowDirection: 0,
      depthFlowIntensity: 0,
      depthTurbulence: 0,
      colorConfig: defaultColorConfig,
      animationProps: {}
    });
  }, []);

  return {
    controls,
    updateControl,
    updateColorConfig,
    updateAnimationProp,
    changeColorMode,
    resetToDefaults,
    applyPreset,
    colorEngine
  };
}; 