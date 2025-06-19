import type { LabControls } from '../hooks/useLabControls';

export interface ControlVisibility {
  section: string;
  controls: string[];
  reason: string;
}

export interface ContextualControls {
  visible: ControlVisibility[];
  hidden: ControlVisibility[];
  suggestions: string[];
}

// Define which controls are relevant for each pattern
export const PATTERN_CONTROLS: Record<string, string[]> = {
  fibonacci: ['fibonacciDensity', 'fibonacciRadius', 'fibonacciAngle'],
  golden: ['goldenExpansion', 'goldenRotation', 'goldenCompression'],
  radial: ['radialPatternBias', 'radialMaxRadius'],
  polar: ['polarDistribution', 'polarRadialBias'],
  logSpiral: ['spiralTightness', 'spiralArms', 'spiralStartRadius'],
  hexagonal: ['hexagonalSpacing', 'hexagonalOffset'],
  triangular: [],
  concentricSquares: ['concentricSquaresNumSquares', 'concentricSquaresRotation'],
  voronoi: ['voronoiSeed'],
  regular: [], // Basic grid
  staggered: [] // Basic grid variation
};

// Define which controls are relevant for each animation
export const ANIMATION_CONTROLS: Record<string, string[]> = {
  none: [],
  rotation: ['animationSpeed'],
  static: [],
  vortex: ['vortexStrength', 'vortexRotation', 'vortexCenterX', 'vortexCenterY'],
  spiral: ['animationSpeed', 'animationIntensity'],
  wave: ['animationSpeed', 'animationIntensity'],
  smoothWaves: ['animationSpeed', 'animationIntensity'],
  seaWaves: ['animationSpeed', 'animationIntensity'],
  turbulence: ['animationSpeed', 'animationIntensity'],
  perlinFlow: ['animationSpeed', 'animationIntensity'],
  curlNoise: ['animationSpeed', 'animationIntensity'],
  pathFlow: ['animationSpeed', 'animationIntensity'],
  inkFlow: ['animationSpeed', 'animationIntensity'],
  geometricPattern: ['animationSpeed', 'animationIntensity'],
  pinwheels: ['animationSpeed', 'animationIntensity'],
  gaussianGradient: ['animationSpeed', 'animationIntensity'],
  pulse: ['animationSpeed', 'animationIntensity'],
  rippleEffect: ['animationSpeed', 'animationIntensity'],
  flocking: ['animationSpeed', 'animationIntensity'],
  cellularAutomata: ['animationSpeed', 'animationIntensity'],
  oceanCurrents: ['animationSpeed', 'animationIntensity']
};

// Define which controls are relevant for each vector shape
export const SHAPE_CONTROLS: Record<string, string[]> = {
  straight: [],
  wave: ['frequency', 'amplitude'],
  spiral: ['frequency', 'amplitude'],
  bezier: ['curvature'],
  arc: ['curvature'],
  organic: ['curvature'],
  zigzag: ['frequency', 'amplitude'],
  dash: ['segments'],
  spring: ['frequency', 'amplitude'],
  triangleWave: ['frequency', 'amplitude'],
  double: []
};

// Define which controls are relevant for each color mode
export const COLOR_MODE_CONTROLS: Record<string, string[]> = {
  solid: [], // Color picker only
  gradient: [], // Preset selector only
  hsl: ['speed', 'saturation'], // From HSL color properties
  dynamic: ['intensityResponse', 'hue'] // From dynamic color properties
};

// Define which 3D controls are relevant for each depth pattern
export const DEPTH_PATTERN_CONTROLS: Record<string, string[]> = {
  waves: ['depthNoiseScale'],
  perlin: ['depthNoiseScale', 'depthLayers'],
  spiral: ['depthNoiseScale'],
  vortex: ['depthNoiseScale'],
  fractal: ['depthNoiseScale', 'depthLayers'],
  ridges: ['depthNoiseScale']
};

export class ControlContextManager {
  
  static analyzeContext(controls: LabControls): ContextualControls {
    const visible: ControlVisibility[] = [];
    const hidden: ControlVisibility[] = [];
    const suggestions: string[] = [];

    // Always visible core controls
    visible.push({
      section: 'Grid Core',
      controls: ['gridMode', 'gridSize', 'gridPattern', 'gridScale'],
      reason: 'Core grid configuration'
    });

    visible.push({
      section: 'Vector Core',
      controls: ['vectorShape', 'vectorThickness', 'rotationOrigin'],
      reason: 'Essential vector appearance'
    });

    visible.push({
      section: 'Animation Core',
      controls: ['animationType'],
      reason: 'Animation selection'
    });

    visible.push({
      section: 'Color Core',
      controls: ['colorMode'],
      reason: 'Color system selection'
    });

    // Pattern-specific controls
    const patternControls = PATTERN_CONTROLS[controls.gridPattern] || [];
    if (patternControls.length > 0) {
      visible.push({
        section: 'Pattern Controls',
        controls: patternControls,
        reason: `Specific to ${controls.gridPattern} pattern`
      });
    }

    // Animation-specific controls
    const animationControls = ANIMATION_CONTROLS[controls.animationType] || [];
    if (animationControls.length > 0) {
      visible.push({
        section: 'Animation Controls',
        controls: animationControls,
        reason: `Specific to ${controls.animationType} animation`
      });
    }

    // Shape-specific controls
    const shapeControls = SHAPE_CONTROLS[controls.vectorShape] || [];
    if (shapeControls.length > 0) {
      visible.push({
        section: 'Shape Parameters',
        controls: shapeControls,
        reason: `Specific to ${controls.vectorShape} shape`
      });
    }

    // Color mode specific controls
    const colorModeControls = COLOR_MODE_CONTROLS[controls.colorConfig.mode] || [];
    if (colorModeControls.length > 0) {
      visible.push({
        section: 'Color Mode Controls',
        controls: colorModeControls,
        reason: `Specific to ${controls.colorConfig.mode} color mode`
      });
    }

    // 3D Depth controls (conditional)
    if (controls.depthMin !== 0 || controls.depthMax !== 0 || controls.depthNoiseScale > 0) {
      visible.push({
        section: '3D Base Controls',
        controls: ['depthMin', 'depthMax'],
        reason: '3D effects are active'
      });

      const depthPatternControls = DEPTH_PATTERN_CONTROLS[controls.depthPattern] || [];
      if (depthPatternControls.length > 0) {
        visible.push({
          section: '3D Pattern Controls',
          controls: depthPatternControls,
          reason: `Specific to ${controls.depthPattern} depth pattern`
        });
      }

      // Temporal 3D controls
      if (controls.depthTemporalMode !== 'none') {
        visible.push({
          section: '3D Temporal Controls',
          controls: ['depthTemporalSpeed', 'depthTemporalAmplitude'],
          reason: `3D temporal effects (${controls.depthTemporalMode}) are active`
        });
      }

      // Spatial 3D controls
      if (controls.depthSpatialMode !== 'none') {
        visible.push({
          section: '3D Spatial Controls',
          controls: ['depthDistanceFactor', 'depthAsymmetry'],
          reason: `3D spatial effects (${controls.depthSpatialMode}) are active`
        });
      }

      // Flow 3D controls
      if (controls.depthFlowIntensity > 0) {
        visible.push({
          section: '3D Flow Controls',
          controls: ['depthFlowDirection', 'depthFlowIntensity', 'depthTurbulence'],
          reason: '3D flow effects are active'
        });
      }
    } else {
      hidden.push({
        section: '3D Controls',
        controls: ['depthMin', 'depthMax', 'depthNoiseScale'],
        reason: '3D effects are disabled'
      });
    }

    // Length dynamics (conditional)
    if (controls.lengthMin !== controls.lengthMax || 
        controls.oscillationAmp > 0 || 
        controls.spatialFactor > 0) {
      visible.push({
        section: 'Length Dynamics',
        controls: ['lengthMin', 'lengthMax', 'oscillationFreq', 'oscillationAmp'],
        reason: 'Length dynamics are active'
      });
    } else {
      hidden.push({
        section: 'Length Dynamics',
        controls: ['lengthMin', 'lengthMax', 'oscillationFreq'],
        reason: 'Length dynamics are static'
      });
    }

    // Generate smart suggestions
    this.generateSuggestions(controls, suggestions);

    return { visible, hidden, suggestions };
  }

  private static generateSuggestions(controls: LabControls, suggestions: string[]) {
    // Suggest complementary features
    if (controls.animationType === 'none') {
      suggestions.push('💡 Prueba una animación para dar vida a tu patrón');
    }

    if (controls.depthMin === 0 && controls.depthMax === 0) {
      suggestions.push('🏔️ Agrega profundidad 3D para mayor realismo');
    }

    if (controls.colorConfig.mode === 'solid') {
      suggestions.push('🌈 Experimenta con gradientes o colores HSL animados');
    }

    if (controls.gridPattern === 'fibonacci' && controls.animationType !== 'spiral') {
      suggestions.push('🌀 Fibonacci + Espiral = Combinación perfecta');
    }

    if (controls.animationType === 'vortex' && controls.depthPattern !== 'vortex') {
      suggestions.push('🌪️ Sincroniza el patrón 3D con la animación de vórtice');
    }

    if (controls.vectorShape === 'straight' && controls.animationType !== 'none') {
      suggestions.push('📐 Prueba formas de vector más complejas para efectos únicos');
    }

    // Performance suggestions
    if (controls.gridSize > 2000 && controls.animationType !== 'none') {
      suggestions.push('⚡ Considera reducir la densidad para mejor rendimiento');
    }

    // Aesthetic suggestions
    if (controls.vectorThickness < 0.01) {
      suggestions.push('👁️ Aumenta el grosor para mejor visibilidad en 3D');
    }
  }

  static getControlPriority(controlName: string, controls: LabControls): 'essential' | 'important' | 'advanced' | 'hidden' {
    const essentialControls = ['gridPattern', 'gridSize', 'animationType', 'colorMode'];
    const importantControls = ['vectorShape', 'vectorThickness', 'animationSpeed', 'animationIntensity'];

    if (essentialControls.includes(controlName)) {
      return 'essential';
    }

    if (importantControls.includes(controlName)) {
      return 'important';
    }

    // Check if control is relevant to current configuration
    const context = this.analyzeContext(controls);
    const isVisible = context.visible.some(section => 
      section.controls.includes(controlName)
    );

    if (isVisible) {
      return 'advanced';
    }

    return 'hidden';
  }

  // Get simplified control set for beginners
  static getSimplifiedControls(controls: LabControls): string[] {
    return [
      'gridPattern',
      'gridSize',
      'animationType',
      'animationSpeed',
      'vectorShape',
      'colorMode'
    ];
  }

  // Get expert control set for advanced users
  static getExpertControls(controls: LabControls): string[] {
    const context = this.analyzeContext(controls);
    return context.visible.flatMap(section => section.controls);
  }
} 