/**
 * Flynn Web Export - Standalone JavaScript Generator
 * Generates self-contained HTML + JS + CSS for web embedding
 */

import type { GridConfig, VectorConfig, AnimationType } from '@/components/features/vector-grid/simple/simpleTypes';

export interface StandaloneConfig {
  // Grid Configuration
  gridConfig: {
    rows: number;
    cols: number;
    spacing: number;
    margin: number;
    pattern?: 'regular' | 'fibonacci' | 'radial' | 'hexagonal';
  };
  
  // Vector Configuration
  vectorConfig: {
    length: number;
    width: number;
    color: string;
    shape: 'line' | 'arrow' | 'circle' | 'dash';
    opacity: number;
  };
  
  // Animation Configuration
  animation: {
    type: AnimationType;
    speed: number;
    intensity: number;
    props?: Record<string, any>;
  };
  
  // Canvas Configuration
  canvas: {
    width: number;
    height: number;
    background: string;
    responsive: boolean;
  };
  
  // Interaction Configuration
  interaction: {
    clickToPause: boolean;
    mouseInfluence: boolean;
    autoStart: boolean;
  };
}

export interface StandaloneExportResult {
  html: string;
  js: string;
  css: string;
  demo: string;
  config: string;
  instructions: string;
  bundleSize: number; // estimated in KB
}

export class StandaloneGenerator {
  /**
   * Main generation method
   */
  static async generate(config: StandaloneConfig): Promise<StandaloneExportResult> {
    const js = this.generateJS(config);
    const css = this.generateCSS(config);
    const html = this.generateHTML(config);
    const demo = this.generateDemo(config);
    const configJson = this.generateConfig(config);
    const instructions = this.generateInstructions(config);
    
    // Estimate bundle size
    const bundleSize = Math.round((js.length + css.length + html.length) / 1024);
    
    return {
      html,
      js,
      css,
      demo,
      config: configJson,
      instructions,
      bundleSize
    };
  }

  /**
   * Generate core JavaScript engine
   */
  private static generateJS(config: StandaloneConfig): string {
    return `/**
 * Flynn Vector Grid - Standalone Web Export
 * Generated: ${new Date().toISOString()}
 * Config: ${config.animation.type} animation, ${config.gridConfig.rows}x${config.gridConfig.cols} grid
 */

(function(window) {
  'use strict';

  // Core Flynn Vector Grid Engine
  class Flynn {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.config = this.mergeConfig(options);
      this.canvas = null;
      this.ctx = null;
      this.vectors = [];
      this.animationId = null;
      this.isPlaying = false;
      this.time = 0;
      this.mouse = { x: 0, y: 0 };
      
      this.init();
    }

    // Default configuration merged with user options
    mergeConfig(options) {
      const defaults = ${JSON.stringify(config, null, 6)};
      return this.deepMerge(defaults, options);
    }

    deepMerge(target, source) {
      const output = Object.assign({}, target);
      if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this.isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] });
            else
              output[key] = this.deepMerge(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }

    isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Initialize the Flynn instance
    init() {
      if (!this.container) {
        console.error('Flynn: Container not found');
        return;
      }

      this.setupCanvas();
      this.generateVectors();
      this.setupEventListeners();
      
      if (this.config.interaction.autoStart) {
        this.start();
      }
    }

    // Setup canvas element
    setupCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'flynn-canvas';
      this.ctx = this.canvas.getContext('2d');
      
      // Set canvas size
      if (this.config.canvas.responsive) {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
      } else {
        this.canvas.width = this.config.canvas.width;
        this.canvas.height = this.config.canvas.height;
      }
      
      this.container.appendChild(this.canvas);
    }

    // Responsive canvas sizing
    resizeCanvas() {
      const rect = this.container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      this.ctx.scale(dpr, dpr);
    }

    // Generate vector grid
    generateVectors() {
      this.vectors = [];
      const { rows, cols, spacing, margin } = this.config.gridConfig;
      const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
      
      const gridWidth = (cols - 1) * spacing;
      const gridHeight = (rows - 1) * spacing;
      const startX = (canvasWidth - gridWidth) / 2;
      const startY = (canvasHeight - gridHeight) / 2;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * spacing;
          const y = startY + row * spacing;
          
          this.vectors.push({
            id: \`v-\${row}-\${col}\`,
            x: x,
            y: y,
            angle: Math.random() * Math.PI * 2, // Initial random angle
            initialAngle: Math.random() * Math.PI * 2,
            length: this.config.vectorConfig.length,
            initialLength: this.config.vectorConfig.length,
            color: this.config.vectorConfig.color,
            row: row,
            col: col
          });
        }
      }
    }

    // Animation engine with multiple animation types
    updateVectors() {
      const { type, speed, intensity, props = {} } = this.config.animation;
      
      this.vectors.forEach((vector, index) => {
        switch (type) {
          case 'wave':
            this.applyWaveAnimation(vector, index, speed, intensity, props);
            break;
          case 'vortex':
            this.applyVortexAnimation(vector, index, speed, intensity, props);
            break;
          case 'rotation':
            this.applyRotationAnimation(vector, index, speed, intensity, props);
            break;
          case 'spiral':
            this.applySpiralAnimation(vector, index, speed, intensity, props);
            break;
          case 'ripple':
            this.applyRippleAnimation(vector, index, speed, intensity, props);
            break;
          case 'turbulence':
            this.applyTurbulenceAnimation(vector, index, speed, intensity, props);
            break;
          case 'none':
          default:
            // Static - no animation
            break;
        }
        
        // Apply mouse influence if enabled
        if (this.config.interaction.mouseInfluence) {
          this.applyMouseInfluence(vector);
        }
      });
    }

    // Wave animation
    applyWaveAnimation(vector, index, speed, intensity, props) {
      const waveFreq = props.frequency || 0.1;
      const waveAmp = intensity * (props.amplitude || 45);
      const offset = props.offset || 0;
      
      vector.angle = vector.initialAngle + 
        Math.sin(this.time * speed + vector.x * waveFreq + offset) * (waveAmp * Math.PI / 180);
    }

    // Vortex animation
    applyVortexAnimation(vector, index, speed, intensity, props) {
      const centerX = props.centerX || this.canvas.width / 2;
      const centerY = props.centerY || this.canvas.height / 2;
      const radius = props.radius || Math.min(this.canvas.width, this.canvas.height) / 4;
      
      const dx = vector.x - centerX;
      const dy = vector.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance / radius);
      
      const vortexAngle = Math.atan2(dy, dx) + Math.PI / 2; // Perpendicular to radius
      const rotationSpeed = this.time * speed * intensity * influence;
      
      vector.angle = vector.initialAngle + vortexAngle + rotationSpeed;
    }

    // Rotation animation
    applyRotationAnimation(vector, index, speed, intensity, props) {
      const rotationSpeed = speed * intensity * (props.speedMultiplier || 1);
      vector.angle = vector.initialAngle + this.time * rotationSpeed;
    }

    // Spiral animation
    applySpiralAnimation(vector, index, speed, intensity, props) {
      const spiralTightness = props.tightness || 0.1;
      const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
      const spiralAngle = distance * spiralTightness + this.time * speed;
      
      vector.angle = vector.initialAngle + spiralAngle * intensity;
    }

    // Ripple animation
    applyRippleAnimation(vector, index, speed, intensity, props) {
      const centerX = props.centerX || this.canvas.width / 2;
      const centerY = props.centerY || this.canvas.height / 2;
      const frequency = props.frequency || 0.05;
      
      const dx = vector.x - centerX;
      const dy = vector.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const ripple = Math.sin(distance * frequency - this.time * speed) * intensity;
      vector.angle = vector.initialAngle + ripple;
    }

    // Turbulence animation
    applyTurbulenceAnimation(vector, index, speed, intensity, props) {
      const noiseScale = props.noiseScale || 0.01;
      const turbulenceSpeed = speed * (props.speedMultiplier || 1);
      
      // Simple noise simulation using sine functions
      const noise1 = Math.sin(vector.x * noiseScale + this.time * turbulenceSpeed);
      const noise2 = Math.cos(vector.y * noiseScale + this.time * turbulenceSpeed * 0.7);
      const noise3 = Math.sin((vector.x + vector.y) * noiseScale * 0.5 + this.time * turbulenceSpeed * 1.3);
      
      const turbulence = (noise1 + noise2 + noise3) / 3 * intensity;
      vector.angle = vector.initialAngle + turbulence;
    }

    // Mouse influence
    applyMouseInfluence(vector) {
      const dx = this.mouse.x - vector.x;
      const dy = this.mouse.y - vector.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance / 100); // 100px influence radius
      
      const mouseAngle = Math.atan2(dy, dx);
      vector.angle = vector.angle * (1 - influence * 0.3) + mouseAngle * influence * 0.3;
    }

    // Render vectors
    render() {
      if (!this.ctx) return;
      
      // Clear canvas
      this.ctx.fillStyle = this.config.canvas.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw vectors
      this.vectors.forEach(vector => {
        this.drawVector(vector);
      });
    }

    // Draw individual vector
    drawVector(vector) {
      const { length, width, color, shape, opacity } = this.config.vectorConfig;
      
      this.ctx.save();
      this.ctx.translate(vector.x, vector.y);
      this.ctx.rotate(vector.angle);
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.globalAlpha = opacity;
      this.ctx.lineCap = 'round';
      
      switch (shape) {
        case 'arrow':
          this.drawArrow(length);
          break;
        case 'circle':
          this.drawCircle(length);
          break;
        case 'dash':
          this.drawDash(length);
          break;
        case 'line':
        default:
          this.drawLine(length);
          break;
      }
      
      this.ctx.restore();
    }

    drawLine(length) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(length, 0);
      this.ctx.stroke();
    }

    drawArrow(length) {
      const arrowSize = Math.min(length * 0.3, 8);
      
      // Main line
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(length, 0);
      this.ctx.stroke();
      
      // Arrow head
      this.ctx.beginPath();
      this.ctx.moveTo(length, 0);
      this.ctx.lineTo(length - arrowSize, -arrowSize / 2);
      this.ctx.moveTo(length, 0);
      this.ctx.lineTo(length - arrowSize, arrowSize / 2);
      this.ctx.stroke();
    }

    drawCircle(length) {
      this.ctx.beginPath();
      this.ctx.arc(length / 2, 0, length / 8, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    drawDash(length) {
      const dashLength = length / 4;
      this.ctx.setLineDash([dashLength, dashLength]);
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(length, 0);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Animation loop
    animate() {
      if (!this.isPlaying) return;
      
      this.time += 0.016; // ~60fps
      this.updateVectors();
      this.render();
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Event listeners setup
    setupEventListeners() {
      // Click to pause/play
      if (this.config.interaction.clickToPause) {
        this.canvas.addEventListener('click', () => {
          this.isPlaying ? this.pause() : this.start();
        });
      }
      
      // Mouse tracking
      if (this.config.interaction.mouseInfluence) {
        this.canvas.addEventListener('mousemove', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
          this.mouse.x = this.canvas.width / 2;
          this.mouse.y = this.canvas.height / 2;
        });
      }
    }

    // Control methods
    start() {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.animate();
      }
      return this;
    }

    pause() {
      this.isPlaying = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      return this;
    }

    stop() {
      this.pause();
      this.time = 0;
      this.updateVectors();
      this.render();
      return this;
    }

    // Update configuration
    updateConfig(newConfig) {
      this.config = this.deepMerge(this.config, newConfig);
      this.generateVectors();
      this.render();
      return this;
    }

    // Destroy instance
    destroy() {
      this.pause();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      window.removeEventListener('resize', this.resizeCanvas);
    }
  }

  // Static factory method
  Flynn.create = function(container, options = {}) {
    return new Flynn(container, options);
  };

  // Auto-initialization from data attributes
  Flynn.autoInit = function() {
    const elements = document.querySelectorAll('[data-flynn]');
    const instances = [];
    
    elements.forEach(element => {
      try {
        const config = JSON.parse(element.getAttribute('data-flynn') || '{}');
        const instance = new Flynn(element, config);
        instances.push(instance);
      } catch (error) {
        console.error('Flynn auto-init error:', error);
      }
    });
    
    return instances;
  };

  // Export to global scope
  window.Flynn = Flynn;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Flynn.autoInit);
  } else {
    Flynn.autoInit();
  }

})(window);`;
  }

  /**
   * Generate CSS styles
   */
  private static generateCSS(config: StandaloneConfig): string {
    return `/* Flynn Vector Grid - Standalone Styles */

.flynn-container {
  position: relative;
  width: 100%;
  height: ${config.canvas.responsive ? '400px' : config.canvas.height + 'px'};
  background: ${config.canvas.background};
  border-radius: 8px;
  overflow: hidden;
  cursor: ${config.interaction.clickToPause ? 'pointer' : 'default'};
}

.flynn-canvas {
  display: block;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.flynn-container:hover .flynn-canvas {
  opacity: ${config.interaction.mouseInfluence ? '0.9' : '1'};
}

/* Responsive behavior */
@media (max-width: 768px) {
  .flynn-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .flynn-container {
    height: 250px;
  }
}

/* Loading state */
.flynn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Geist Mono', monospace;
  font-size: 14px;
  color: #666;
}

.flynn-loading::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: flynn-spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes flynn-spin {
  to { transform: rotate(360deg); }
}

/* Controls (optional) */
.flynn-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.flynn-container:hover .flynn-controls {
  opacity: 1;
}

.flynn-btn {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.flynn-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}`;
  }

  /**
   * Generate minimal HTML structure
   */
  private static generateHTML(config: StandaloneConfig): string {
    return `<!-- Flynn Vector Grid Container -->
<div class="flynn-container" data-flynn='${JSON.stringify({
  animation: { type: config.animation.type, speed: config.animation.speed },
  gridConfig: { rows: config.gridConfig.rows, cols: config.gridConfig.cols }
}, null, 2)}'>
  <div class="flynn-loading">Initializing Flynn...</div>
</div>`;
  }

  /**
   * Generate complete demo HTML page
   */
  private static generateDemo(config: StandaloneConfig): string {
    const js = this.generateJS(config);
    const css = this.generateCSS(config);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flynn Vector Grid - Web Export Demo</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Geist Mono', monospace;
            background: #0a0a0a;
            color: #ffffff;
        }
        
        .demo-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .demo-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .demo-title {
            font-size: 2rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #10b981, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .demo-subtitle {
            font-size: 1rem;
            opacity: 0.7;
        }
        
        .demo-grid {
            display: grid;
            gap: 30px;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            margin-bottom: 40px;
        }
        
        .demo-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
        }
        
        .demo-card h3 {
            margin-top: 0;
            font-size: 1.2rem;
            color: #10b981;
        }
        
        .demo-info {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .demo-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .stat {
            text-align: center;
            padding: 10px;
            background: #0a0a0a;
            border-radius: 8px;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #10b981;
        }
        
        .stat-label {
            font-size: 0.8rem;
            opacity: 0.7;
        }
        
        ${css}
    </style>
</head>
<body>
    <div class="demo-container">
        <div class="demo-header">
            <h1 class="demo-title">Flynn Vector Grid</h1>
            <p class="demo-subtitle">Interactive Vector Field Animation System</p>
        </div>
        
        <div class="demo-grid">
            <div class="demo-card">
                <h3>🌊 ${config.animation.type.charAt(0).toUpperCase() + config.animation.type.slice(1)} Animation</h3>
                <div class="flynn-container" data-flynn='${JSON.stringify({
                  animation: config.animation,
                  gridConfig: config.gridConfig,
                  vectorConfig: config.vectorConfig,
                  canvas: config.canvas,
                  interaction: config.interaction
                })}'>
                    <div class="flynn-loading">Loading Flynn...</div>
                </div>
            </div>
            
            <div class="demo-card">
                <h3>🎯 Custom Configuration</h3>
                <div class="flynn-container" data-flynn='${JSON.stringify({
                  animation: { type: 'vortex', speed: 1.5, intensity: 0.8 },
                  gridConfig: { rows: 8, cols: 8, spacing: 40, margin: 20 },
                  vectorConfig: { ...config.vectorConfig, color: '#3b82f6' },
                  canvas: config.canvas,
                  interaction: { ...config.interaction, mouseInfluence: true }
                })}'>
                    <div class="flynn-loading">Loading Flynn...</div>
                </div>
            </div>
        </div>
        
        <div class="demo-info">
            <h3>📊 Export Information</h3>
            <div class="demo-stats">
                <div class="stat">
                    <div class="stat-value">${config.gridConfig.rows * config.gridConfig.cols}</div>
                    <div class="stat-label">Vectors</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${config.animation.type}</div>
                    <div class="stat-label">Animation</div>
                </div>
                <div class="stat">
                    <div class="stat-value">~50KB</div>
                    <div class="stat-label">Bundle Size</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${config.canvas.responsive ? 'Yes' : 'No'}</div>
                    <div class="stat-label">Responsive</div>
                </div>
            </div>
            
            <h4>🚀 Quick Integration</h4>
            <pre style="background: #0a0a0a; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>&lt;!-- Include Flynn in your HTML --&gt;
&lt;script src="flynn-standalone.js"&gt;&lt;/script&gt;
&lt;link rel="stylesheet" href="flynn-styles.css"&gt;

&lt;!-- Add a container --&gt;
&lt;div class="flynn-container" data-flynn='{"animation":{"type":"${config.animation.type}"}}'&gt;&lt;/div&gt;

&lt;!-- Or use JavaScript API --&gt;
&lt;script&gt;
  const flynn = Flynn.create('#my-container', {
    animation: { type: '${config.animation.type}', speed: ${config.animation.speed} },
    gridConfig: { rows: ${config.gridConfig.rows}, cols: ${config.gridConfig.cols} }
  });
&lt;/script&gt;</code></pre>
        </div>
    </div>
    
    <script>
        ${js}
    </script>
</body>
</html>`;
  }

  /**
   * Generate configuration JSON
   */
  private static generateConfig(config: StandaloneConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate integration instructions
   */
  private static generateInstructions(config: StandaloneConfig): string {
    return `# Flynn Vector Grid - Integration Instructions

## 📦 Files Included

- \`flynn-standalone.js\` - Core Flynn engine (${Math.round(this.generateJS(config).length / 1024)}KB)
- \`flynn-styles.css\` - Required styles (${Math.round(this.generateCSS(config).length / 1024)}KB)
- \`demo.html\` - Complete working example
- \`config.json\` - Current configuration

## 🚀 Quick Start

### Method 1: Auto-initialization with HTML data attributes

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="flynn-styles.css">
</head>
<body>
    <!-- Flynn will auto-initialize this container -->
    <div class="flynn-container" data-flynn='{"animation":{"type":"${config.animation.type}"}}'></div>
    
    <script src="flynn-standalone.js"></script>
</body>
</html>
\`\`\`

### Method 2: JavaScript API

\`\`\`html
<div id="my-flynn-container" class="flynn-container"></div>

<script>
    // Create Flynn instance
    const flynn = Flynn.create('#my-flynn-container', {
        animation: {
            type: '${config.animation.type}',
            speed: ${config.animation.speed},
            intensity: ${config.animation.intensity}
        },
        gridConfig: {
            rows: ${config.gridConfig.rows},
            cols: ${config.gridConfig.cols},
            spacing: ${config.gridConfig.spacing}
        },
        vectorConfig: {
            length: ${config.vectorConfig.length},
            color: '${config.vectorConfig.color}',
            shape: '${config.vectorConfig.shape}'
        },
        canvas: {
            responsive: ${config.canvas.responsive},
            background: '${config.canvas.background}'
        },
        interaction: {
            clickToPause: ${config.interaction.clickToPause},
            mouseInfluence: ${config.interaction.mouseInfluence},
            autoStart: ${config.interaction.autoStart}
        }
    });
    
    // Control the animation
    flynn.start();  // Start animation
    flynn.pause(); // Pause animation
    flynn.stop();  // Stop and reset
    
    // Update configuration
    flynn.updateConfig({
        animation: { type: 'vortex', speed: 2.0 }
    });
    
    // Clean up when done
    flynn.destroy();
</script>
\`\`\`

## ⚙️ Configuration Options

### Animation Types
- \`wave\` - Sine wave patterns
- \`vortex\` - Circular vortex motion
- \`rotation\` - Simple rotation
- \`spiral\` - Spiral patterns
- \`ripple\` - Ripple effects
- \`turbulence\` - Organic turbulence
- \`none\` - Static display

### Animation Properties
- \`speed\` (0.1 - 5.0) - Animation speed
- \`intensity\` (0.1 - 2.0) - Effect intensity
- \`props\` - Animation-specific properties

### Grid Configuration
- \`rows\`, \`cols\` - Grid dimensions
- \`spacing\` - Distance between vectors
- \`margin\` - Outer margin
- \`pattern\` - Grid layout pattern

### Vector Styling
- \`length\` - Vector length in pixels
- \`width\` - Stroke width
- \`color\` - Hex color code
- \`shape\` - Vector shape: 'line', 'arrow', 'circle', 'dash'
- \`opacity\` - Transparency (0-1)

### Canvas Options
- \`width\`, \`height\` - Fixed dimensions
- \`responsive\` - Auto-resize to container
- \`background\` - Background color

### Interactions
- \`clickToPause\` - Click to pause/resume
- \`mouseInfluence\` - Mouse affects vectors
- \`autoStart\` - Start automatically

## 🎨 Customization Examples

### Different Animation Types
\`\`\`javascript
// Ocean waves
Flynn.create('#ocean', {
    animation: { type: 'wave', speed: 0.8, intensity: 1.2 },
    vectorConfig: { color: '#3b82f6', shape: 'arrow' }
});

// Energy vortex
Flynn.create('#vortex', {
    animation: { type: 'vortex', speed: 1.5, intensity: 0.9 },
    vectorConfig: { color: '#10b981', length: 15 }
});

// Gentle rotation
Flynn.create('#rotate', {
    animation: { type: 'rotation', speed: 0.5, intensity: 0.6 },
    vectorConfig: { color: '#f59e0b', shape: 'dash' }
});
\`\`\`

### Responsive Grids
\`\`\`javascript
// Mobile-friendly grid
Flynn.create('#mobile', {
    gridConfig: { rows: 8, cols: 8, spacing: 30 },
    canvas: { responsive: true },
    interaction: { clickToPause: true }
});
\`\`\`

### Interactive Effects
\`\`\`javascript
// Mouse-interactive field
Flynn.create('#interactive', {
    animation: { type: 'wave', speed: 1.0 },
    interaction: { 
        mouseInfluence: true,
        clickToPause: true 
    }
});
\`\`\`

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ Internet Explorer: Not supported

## 🔧 Performance Tips

1. **Grid Size**: Keep total vectors under 1000 for smooth performance
2. **Animation Speed**: Lower speeds are more CPU-friendly
3. **Responsive**: Enable for better mobile performance
4. **Mouse Influence**: Disable if not needed for better performance

## 📄 License

This export is generated from Flynn Vector Grid. 
Check the original project for licensing terms.

Generated: ${new Date().toISOString()}
Configuration: ${config.animation.type} animation, ${config.gridConfig.rows}x${config.gridConfig.cols} grid
`;
  }
}

/**
 * Convenience function for quick generation
 */
export async function generateStandaloneExport(config: StandaloneConfig): Promise<StandaloneExportResult> {
  return StandaloneGenerator.generate(config);
}

/**
 * Default configuration preset
 */
export const defaultStandaloneConfig: StandaloneConfig = {
  gridConfig: {
    rows: 10,
    cols: 10,
    spacing: 40,
    margin: 20,
    pattern: 'regular'
  },
  vectorConfig: {
    length: 20,
    width: 2,
    color: '#10b981',
    shape: 'line',
    opacity: 0.8
  },
  animation: {
    type: 'wave',
    speed: 1.0,
    intensity: 1.0,
    props: {}
  },
  canvas: {
    width: 800,
    height: 600,
    background: '#0a0a0a',
    responsive: true
  },
  interaction: {
    clickToPause: true,
    mouseInfluence: false,
    autoStart: true
  }
}; 