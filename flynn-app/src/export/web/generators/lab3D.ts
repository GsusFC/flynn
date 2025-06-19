import * as THREE from 'three';

export interface Lab3DConfig {
  // Grid Configuration
  gridSize: number;
  gridPattern: string;
  gridScale: number;
  
  // 3D Depth Configuration  
  depthMin: number;
  depthMax: number;
  depthPattern: string;
  depthNoiseScale: number;
  
  // Animation Configuration
  animationType: string;
  animationSpeed: number;
  animationIntensity: number;
  time: number;
  
  // Color Configuration
  colorConfig: any;
  
  // Vector Configuration
  vectorShape: string;
  vectorThickness: number;
  
  // Canvas dimensions
  canvasWidth: number;
  canvasHeight: number;
}

export interface Lab3DExportData {
  vectors: Array<{
    position: { x: number; y: number; z: number };
    rotation: number;
    color: string;
  }>;
  metadata: {
    totalVectors: number;
    boundingBox: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
    exportDate: string;
    config: Lab3DConfig;
  };
}

export interface Lab3DExportFormats {
  obj: string;           // Wavefront OBJ format
  ply: string;           // PLY format
  json: string;          // Flynn JSON format
  canvas: string;        // Canvas capture as image
  threeScene: string;    // Three.js scene data
}

export class Lab3DGenerator {
  private config: Lab3DConfig;
  private exportData: Lab3DExportData;

  constructor(config: Lab3DConfig, vectorsData: any[], gridPositions: any[], vectorColors: THREE.Color[]) {
    this.config = config;
    this.exportData = this.processVectors(vectorsData, gridPositions, vectorColors);
  }

  private processVectors(
    vectors: any[], 
    gridPositions: any[], 
    vectorColors: THREE.Color[]
  ): Lab3DExportData {
    const processedVectors = vectors.map((vector, index) => ({
      position: gridPositions[index] || { x: 0, y: 0, z: 0 },
      rotation: vector.angle || 0,
      color: vectorColors[index] ? `#${vectorColors[index].getHexString()}` : '#ffffff'
    }));

    // Calculate bounding box
    const positions = processedVectors.map(v => v.position);
    const boundingBox = {
      min: {
        x: Math.min(...positions.map(p => p.x)),
        y: Math.min(...positions.map(p => p.y)),
        z: Math.min(...positions.map(p => p.z))
      },
      max: {
        x: Math.max(...positions.map(p => p.x)),
        y: Math.max(...positions.map(p => p.y)),
        z: Math.max(...positions.map(p => p.z))
      }
    };

    return {
      vectors: processedVectors,
      metadata: {
        totalVectors: processedVectors.length,
        boundingBox,
        exportDate: new Date().toISOString(),
        config: this.config
      }
    };
  }

  // Generate OBJ file format
  generateOBJ(): string {
    let obj = `# Flynn Lab 3D Export - OBJ Format\n`;
    obj += `# Generated: ${this.exportData.metadata.exportDate}\n`;
    obj += `# Total Vectors: ${this.exportData.metadata.totalVectors}\n\n`;

    // Add vertices for each vector (start and end points)
    this.exportData.vectors.forEach((vector, index) => {
      const { x, y, z } = vector.position;
      const length = 1.0; // Default length, could be configurable
      
      // Calculate end point based on rotation
      const endX = x + Math.cos(vector.rotation) * length;
      const endY = y + Math.sin(vector.rotation) * length;
      const endZ = z;

      obj += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
      obj += `v ${endX.toFixed(6)} ${endY.toFixed(6)} ${endZ.toFixed(6)}\n`;
    });

    obj += `\n# Lines connecting vector points\n`;
    
    // Add lines for each vector
    for (let i = 0; i < this.exportData.vectors.length; i++) {
      const startIdx = i * 2 + 1; // OBJ indices start at 1
      const endIdx = i * 2 + 2;
      obj += `l ${startIdx} ${endIdx}\n`;
    }

    return obj;
  }

  // Generate PLY file format
  generatePLY(): string {
    const totalVertices = this.exportData.vectors.length * 2; // Start and end points
    const totalLines = this.exportData.vectors.length;

    let ply = `ply\n`;
    ply += `format ascii 1.0\n`;
    ply += `comment Flynn Lab 3D Export - PLY Format\n`;
    ply += `comment Generated: ${this.exportData.metadata.exportDate}\n`;
    ply += `element vertex ${totalVertices}\n`;
    ply += `property float x\n`;
    ply += `property float y\n`;
    ply += `property float z\n`;
    ply += `property uchar red\n`;
    ply += `property uchar green\n`;
    ply += `property uchar blue\n`;
    ply += `element edge ${totalLines}\n`;
    ply += `property int vertex1\n`;
    ply += `property int vertex2\n`;
    ply += `end_header\n`;

    // Add vertices with colors
    this.exportData.vectors.forEach((vector) => {
      const { x, y, z } = vector.position;
      const length = 1.0;
      
      // Parse color
      const color = new THREE.Color(vector.color);
      const r = Math.round(color.r * 255);
      const g = Math.round(color.g * 255);
      const b = Math.round(color.b * 255);

      // Calculate end point
      const endX = x + Math.cos(vector.rotation) * length;
      const endY = y + Math.sin(vector.rotation) * length;
      const endZ = z;

      ply += `${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)} ${r} ${g} ${b}\n`;
      ply += `${endX.toFixed(6)} ${endY.toFixed(6)} ${endZ.toFixed(6)} ${r} ${g} ${b}\n`;
    });

    // Add edges
    for (let i = 0; i < this.exportData.vectors.length; i++) {
      ply += `${i * 2} ${i * 2 + 1}\n`;
    }

    return ply;
  }

  // Generate Flynn JSON format
  generateJSON(): string {
    const exportPackage = {
      format: 'flynn-lab-3d',
      version: '1.0.0',
      metadata: this.exportData.metadata,
      vectors: this.exportData.vectors,
      config: this.config,
      instructions: {
        usage: 'This file contains 3D vector field data from Flynn Lab',
        coordinates: 'Positions are in Flynn coordinate space',
        colors: 'Colors are in hex format (#RRGGBB)',
        rotations: 'Rotations are in radians'
      }
    };

    return JSON.stringify(exportPackage, null, 2);
  }

  // Generate Three.js scene data
  generateThreeScene(): string {
    const sceneData = {
      metadata: {
        version: 4.5,
        type: 'Object',
        generator: 'Flynn Lab 3D Exporter'
      },
      geometries: [],
      materials: [],
      object: {
        uuid: this.generateUUID(),
        type: 'Group',
        children: this.exportData.vectors.map((vector, index) => ({
          uuid: this.generateUUID(),
          type: 'Line',
          geometry: this.generateUUID(),
          material: this.generateUUID(),
          matrix: this.getTransformMatrix(vector)
        }))
      }
    };

    return JSON.stringify(sceneData, null, 2);
  }

  // Capture canvas as image data URL
  generateCanvasCapture(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  // Generate all formats
  generateAll(canvas?: HTMLCanvasElement): Lab3DExportFormats {
    return {
      obj: this.generateOBJ(),
      ply: this.generatePLY(),
      json: this.generateJSON(),
      canvas: canvas ? this.generateCanvasCapture(canvas) : '',
      threeScene: this.generateThreeScene()
    };
  }

  // Export as ZIP package with all formats
  async generateZipPackage(canvas?: HTMLCanvasElement): Promise<Blob> {
    // Note: Would need to add JSZip dependency for actual ZIP creation
    // For now, return JSON with all formats
    const allFormats = this.generateAll(canvas);
    const packageData = {
      ...allFormats,
      metadata: this.exportData.metadata,
      readme: this.generateReadme()
    };
    
    return new Blob([JSON.stringify(packageData, null, 2)], { 
      type: 'application/json' 
    });
  }

  private generateReadme(): string {
    return `# Flynn Lab 3D Export Package

Generated: ${this.exportData.metadata.exportDate}
Total Vectors: ${this.exportData.metadata.totalVectors}
Grid Pattern: ${this.config.gridPattern}
Animation: ${this.config.animationType}

## Files Included:

- **flynn-lab-3d.obj**: Wavefront OBJ format for 3D software (Blender, Maya, etc.)
- **flynn-lab-3d.ply**: PLY format for point cloud software
- **flynn-lab-3d.json**: Flynn Lab native format with full configuration
- **flynn-lab-3d.png**: Canvas screenshot
- **flynn-lab-scene.json**: Three.js scene format

## Usage:

### In Blender:
1. File > Import > Wavefront (.obj)
2. Select flynn-lab-3d.obj

### In Three.js:
\`\`\`javascript
import { ObjectLoader } from 'three';
const loader = new ObjectLoader();
loader.load('flynn-lab-scene.json', (object) => {
  scene.add(object);
});
\`\`\`

### In Flynn Lab:
\`\`\`javascript
import flynnData from './flynn-lab-3d.json';
// Use flynnData.config to recreate the exact configuration
\`\`\`

---
Generated by Flynn Lab 3D Exporter
`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getTransformMatrix(vector: any): number[] {
    // Return a 4x4 transformation matrix for Three.js
    const { x, y, z } = vector.position;
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ];
  }

  // Static method to create generator from Lab Canvas data
  static fromLabCanvas(
    config: Lab3DConfig,
    animatedVectors: any[],
    gridPositions: any[],
    vectorColors: THREE.Color[]
  ): Lab3DGenerator {
    return new Lab3DGenerator(config, animatedVectors, gridPositions, vectorColors);
  }
}

// Export utility functions
export const Lab3DExportUtils = {
  // Download a file
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Get file extension for format
  getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      obj: 'obj',
      ply: 'ply', 
      json: 'json',
      canvas: 'png',
      threeScene: 'json'
    };
    return extensions[format] || 'txt';
  },

  // Get MIME type for format
  getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      obj: 'model/obj',
      ply: 'application/ply',
      json: 'application/json',
      canvas: 'image/png',
      threeScene: 'application/json'
    };
    return mimeTypes[format] || 'text/plain';
  }
}; 