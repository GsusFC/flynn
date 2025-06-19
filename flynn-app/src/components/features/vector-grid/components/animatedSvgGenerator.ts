import type { SimpleVector, GridConfig, VectorConfig, AnimationType } from '../simple/simpleTypes';
import { isHSLColor, isGradientConfig, type GradientConfig, type HSLColor } from '../types/gradientTypes';

interface AnimatedSVGData {
  vectors: SimpleVector[];
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationType: AnimationType;
  canvasWidth: number;
  canvasHeight: number;
  animationProps: Record<string, unknown>;
  animationDuration?: number; // in seconds
  loopForever?: boolean;
}

// Helper to get animation parameters based on animation type
const getAnimationParams = (animationType: AnimationType, animationProps: Record<string, unknown>) => {
  const defaultDuration = 4;
  const defaultSpeed = Number(animationProps.speed) || 1;
  
  switch (animationType) {
    case 'rotation':
      return {
        duration: defaultDuration / defaultSpeed,
        easing: 'linear',
        keyframes: [
          { time: 0, rotation: 0 },
          { time: 1, rotation: 360 }
        ]
      };
      
    case 'wave':
    case 'smoothWaves':
      return {
        duration: (Number(animationProps.period) || 4) / defaultSpeed,
        amplitude: Number(animationProps.amplitude) || 30,
        frequency: Number(animationProps.frequency) || 0.01,
        easing: 'ease-in-out'
      };
      
    case 'vortex':
      return {
        duration: 10 / defaultSpeed,
        strength: Number(animationProps.strength) || 1,
        rotationSpeed: Number(animationProps.rotationSpeed) || 50,
        easing: 'linear'
      };
      
    case 'pulse':
    case 'centerPulse':
      return {
        duration: (Number(animationProps.period) || 2) / defaultSpeed,
        amplitude: Number(animationProps.amplitude) || 45,
        easing: 'ease-in-out'
      };
      
    case 'perlinFlow':
      return {
        duration: 8 / defaultSpeed,
        complexity: Number(animationProps.complexity) || 0.02,
        easing: 'linear'
      };
      
    default:
      return {
        duration: defaultDuration,
        easing: 'linear'
      };
  }
};

// Generate SVG animation element based on animation type
const generateAnimationElement = (
  vector: SimpleVector,
  index: number,
  animationType: AnimationType,
  animationParams: any,
  canvasWidth: number,
  canvasHeight: number
): string => {
  const elementId = `vector-${index}`;
  
  switch (animationType) {
    case 'rotation':
      // Simple rotation animation
      return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from="0 ${vector.x} ${vector.y}"
      to="360 ${vector.x} ${vector.y}"
      dur="${animationParams.duration}s"
      repeatCount="indefinite" />`;
      
    case 'wave':
    case 'smoothWaves':
      // Wave animation using sin function approximation
      const wavePhase = vector.x * animationParams.frequency;
      const waveKeyframes = [];
      const steps = 24; // More steps for smoother animation
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.sin(t * Math.PI * 2 + wavePhase) * animationParams.amplitude;
        waveKeyframes.push(`${angle}`);
      }
      
      return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      values="${waveKeyframes.join(';')}"
      keyTimes="${Array.from({length: steps + 1}, (_, i) => i / steps).join(';')}"
      dur="${animationParams.duration}s"
      repeatCount="indefinite"
      additive="sum" />`;
      
    case 'vortex':
      // Vortex animation with continuous rotation based on distance from center
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const vortexAngle = Math.atan2(vector.y - centerY, vector.x - centerX) * 180 / Math.PI;
      const distance = Math.sqrt(Math.pow(vector.x - centerX, 2) + Math.pow(vector.y - centerY, 2));
      const rotationSpeed = animationParams.rotationSpeed * (1 - distance / Math.max(canvasWidth, canvasHeight));
      
      return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from="${vortexAngle} ${vector.x} ${vector.y}"
      to="${vortexAngle + 360} ${vector.x} ${vector.y}"
      dur="${animationParams.duration / Math.max(0.1, rotationSpeed / 50)}s"
      repeatCount="indefinite" />`;
      
    case 'pulse':
    case 'centerPulse':
      // Pulse animation based on distance from center
      const pulseCenterX = canvasWidth / 2;
      const pulseCenterY = canvasHeight / 2;
      const pulseDistance = Math.sqrt(
        Math.pow(vector.x - pulseCenterX, 2) + 
        Math.pow(vector.y - pulseCenterY, 2)
      );
      const pulseDelay = pulseDistance * 0.002; // Wave propagation delay
      const pulseKeyframes = [];
      const pulseSteps = 12;
      
      for (let i = 0; i <= pulseSteps; i++) {
        const t = i / pulseSteps;
        const angle = Math.sin(t * Math.PI * 2) * animationParams.amplitude;
        pulseKeyframes.push(`${angle}`);
      }
      
      return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      values="${pulseKeyframes.join(';')}"
      keyTimes="${Array.from({length: pulseSteps + 1}, (_, i) => i / pulseSteps).join(';')}"
      dur="${animationParams.duration}s"
      begin="${pulseDelay}s"
      repeatCount="indefinite"
      additive="sum" />`;
      
    case 'perlinFlow':
      // Simulate perlin noise with multiple sine waves
      const flowX = vector.x * animationParams.complexity;
      const flowY = vector.y * animationParams.complexity;
      const flowKeyframes = [];
      const flowSteps = 36;
      
      for (let i = 0; i <= flowSteps; i++) {
        const t = i / flowSteps;
        const angle = (
          Math.sin(flowX + t * Math.PI * 2) * 
          Math.cos(flowY + t * Math.PI * 3)
        ) * 180;
        flowKeyframes.push(`${angle}`);
      }
      
      return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      values="${flowKeyframes.join(';')}"
      keyTimes="${Array.from({length: flowSteps + 1}, (_, i) => i / flowSteps).join(';')}"
      dur="${animationParams.duration}s"
      repeatCount="indefinite"
      additive="sum" />`;
      
    default:
      return ''; // No animation
  }
};

// Generate animated SVG with SMIL animations
export const generateAnimatedSVG = (data: AnimatedSVGData): string => {
  const {
    vectors,
    vectorConfig,
    animationType,
    canvasWidth,
    canvasHeight,
    animationProps,
    animationDuration = 4,
    loopForever = true
  } = data;
  
  const animationParams = getAnimationParams(animationType, animationProps);
  
  // Generate vector elements with animations
  const vectorElements = vectors.map((vector, index) => {
    const { x, y, angle, length, width, color } = vector;
    
    // Calculate actual values
    const actualLength = length || vectorConfig.length;
    const actualWidth = width || vectorConfig.width;
    
    // Determine color
    let vectorColorValue: string = '#10b981';
    if (typeof color === 'string') {
      vectorColorValue = color;
    } else if (typeof vectorConfig.color === 'string') {
      vectorColorValue = vectorConfig.color;
    }
    
    // Calculate line endpoints based on rotation origin
    let startX = x;
    let startY = y;
    let endX = x;
    let endY = y;
    
    const baseAngle = angle || 0;
    
    switch (vectorConfig.rotationOrigin) {
      case 'start':
        endX = actualLength;
        endY = 0;
        break;
      case 'center':
        startX = -actualLength / 2;
        startY = 0;
        endX = actualLength / 2;
        endY = 0;
        break;
      case 'end':
        startX = -actualLength;
        startY = 0;
        endX = 0;
        endY = 0;
        break;
    }
    
    // Generate animation element
    const animationElement = generateAnimationElement(
      vector, 
      index, 
      animationType, 
      animationParams,
      canvasWidth,
      canvasHeight
    );
    
    // Create group with vector and its animation
    return `  <g id="vector-group-${index}" transform="translate(${x}, ${y}) rotate(${baseAngle})">
    <line 
      id="vector-${index}"
      x1="${startX}" 
      y1="${startY}" 
      x2="${endX}" 
      y2="${endY}"
      stroke="${vectorColorValue}" 
      stroke-width="${actualWidth}" 
      stroke-linecap="${vectorConfig.strokeLinecap || 'round'}"
    >${animationElement}
    </line>
  </g>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
     width="${canvasWidth}" 
     height="${canvasHeight}">
  
  <!-- Flynn Vector Grid Animated Export -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Animation: ${animationType} -->
  <!-- Duration: ${animationDuration}s -->
  
  <defs>
    <style>
      .vector-grid-bg {
        fill: #0a0a0a;
      }
    </style>
  </defs>
  
  <rect width="100%" height="100%" class="vector-grid-bg"/>
  
  <!-- Animated Vector Elements -->
${vectorElements}
  
</svg>`;
};

// Generate CSS-based animated SVG (alternative approach)
export const generateCSSAnimatedSVG = (data: AnimatedSVGData): string => {
  const {
    vectors,
    vectorConfig,
    animationType,
    canvasWidth,
    canvasHeight,
    animationProps
  } = data;
  
  const animationParams = getAnimationParams(animationType, animationProps);
  
  // Generate CSS keyframes based on animation type
  let cssAnimation = '';
  
  switch (animationType) {
    case 'rotation':
      cssAnimation = `
      @keyframes rotate-vector {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .vector-animated {
        animation: rotate-vector ${animationParams.duration}s linear infinite;
        transform-origin: center;
      }`;
      break;
      
    case 'wave':
    case 'smoothWaves':
      // Create multiple keyframes for different phases
      for (let phase = 0; phase < 8; phase++) {
        cssAnimation += `
      @keyframes wave-${phase} {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(${((animationParams as any).amplitude || 30) * Math.sin(phase * Math.PI / 4)}deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(${-((animationParams as any).amplitude || 30) * Math.sin(phase * Math.PI / 4)}deg); }
      }`;
      }
      break;
      
    case 'vortex':
      cssAnimation = `
      @keyframes vortex-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }`;
      break;
      
    case 'pulse':
      cssAnimation = `
      @keyframes pulse-rotate {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(${(animationParams as any).amplitude || 45}deg); }
      }`;
      break;
  }
  
  // Generate vector elements
  const vectorElements = vectors.map((vector, index) => {
    const { x, y, angle, length, width, color } = vector;
    
    const actualLength = length || vectorConfig.length;
    const actualWidth = width || vectorConfig.width;
    
    let vectorColorValue: string = '#10b981';
    if (typeof color === 'string') {
      vectorColorValue = color;
    } else if (typeof vectorConfig.color === 'string') {
      vectorColorValue = vectorConfig.color;
    }
    
    // Calculate animation class and delay based on type
    let animationClass = 'vector-animated';
    let animationStyle = '';
    
    switch (animationType) {
      case 'wave':
      case 'smoothWaves':
        const wavePhase = Math.floor((vector.x / canvasWidth) * 8);
        animationClass = `wave-${wavePhase}`;
        animationStyle = `animation: wave-${wavePhase} ${animationParams.duration}s ease-in-out infinite;`;
        break;
        
      case 'vortex':
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const distance = Math.sqrt(Math.pow(vector.x - centerX, 2) + Math.pow(vector.y - centerY, 2));
        const vortexSpeed = 1 - distance / Math.max(canvasWidth, canvasHeight);
        animationStyle = `animation: vortex-spin ${animationParams.duration / Math.max(0.1, vortexSpeed)}s linear infinite;`;
        break;
        
      case 'pulse':
        const pulseDistance = Math.sqrt(
          Math.pow(vector.x - canvasWidth / 2, 2) + 
          Math.pow(vector.y - canvasHeight / 2, 2)
        );
        const pulseDelay = pulseDistance * 0.002;
        animationStyle = `animation: pulse-rotate ${animationParams.duration}s ease-in-out ${pulseDelay}s infinite;`;
        break;
    }
    
    return `  <line 
    class="${animationClass}"
    style="${animationStyle} transform-origin: ${vector.x}px ${vector.y}px;"
    x1="${vector.x - Math.cos(angle * Math.PI / 180) * actualLength / 2}" 
    y1="${vector.y - Math.sin(angle * Math.PI / 180) * actualLength / 2}" 
    x2="${vector.x + Math.cos(angle * Math.PI / 180) * actualLength / 2}" 
    y2="${vector.y + Math.sin(angle * Math.PI / 180) * actualLength / 2}"
    stroke="${vectorColorValue}" 
    stroke-width="${actualWidth}" 
    stroke-linecap="${vectorConfig.strokeLinecap || 'round'}"
  />`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
     width="${canvasWidth}" 
     height="${canvasHeight}">
  
  <!-- Flynn Vector Grid CSS Animated Export -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Animation: ${animationType} -->
  
  <defs>
    <style>
      .vector-grid-bg { fill: #0a0a0a; }
      ${cssAnimation}
    </style>
  </defs>
  
  <rect width="100%" height="100%" class="vector-grid-bg"/>
  
  <!-- CSS Animated Vector Elements -->
${vectorElements}
  
</svg>`;
}; 