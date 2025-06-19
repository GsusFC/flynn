// @ts-nocheck
"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { LabControls } from '../hooks/useLabControls';

interface InstancedVectorGridProps {
  positions: Array<{ x: number; y: number; z: number }>;
  rotations: number[]; // Pre-calculated rotations from animation system
  colors: THREE.Color[];
  controls: LabControls;
  time: number;
}

// Calculate position offset based on rotation origin (like Flynn's calculateCoordsForOrigin)
const calculatePositionOffset = (
  length: number,
  rotationAngle: number,
  origin: 'start' | 'center' | 'end'
): { x: number; y: number } => {
  const halfLength = length / 2;
  switch (origin) {
    case 'start':
      // To pivot from the start, we shift the vector forward by half its length
      return {
        x: Math.cos(rotationAngle) * halfLength,
        y: Math.sin(rotationAngle) * halfLength,
      };
    case 'center':
      // The geometry is already centered, so no offset is needed for center rotation
      return { x: 0, y: 0 };
    case 'end':
      // To pivot from the end, we shift the vector backward by half its length
      return {
        x: -Math.cos(rotationAngle) * halfLength,
        y: -Math.sin(rotationAngle) * halfLength,
      };
    default:
      return { x: 0, y: 0 };
  }
};

// Flynn's Dynamic Length Calculation (adapted for 3D)
const calculateDynamicLength = (
  position: { x: number; y: number; z: number },
  index: number,
  time: number,
  mousePos: { x: number; y: number } | null,
  canvasDimensions: { width: number; height: number },
  controls: LabControls
): number => {
  const {
    lengthMin,
    lengthMax,
    lengthVariation,
    lengthOscillation,
    lengthPulse,
    oscillationFreq,
    oscillationAmp,
    pulseSpeed,
    spatialFactor,
    spatialMode,
    mouseInfluence,
    mouseMode,
    physicsMode
  } = controls;

  // Base length with variation
  let baseLength = lengthMin + ((lengthMax - lengthMin) * 0.5);
  
  // Add basic dynamics
  if (lengthVariation > 0) {
    // Random variation per vector (stable seed based on index)
    const randomSeed = Math.sin(index * 12.9898) * 43758.5453;
    const randomVariation = (randomSeed - Math.floor(randomSeed)) * 2 - 1; // -1 to 1
    baseLength += randomVariation * lengthVariation * (lengthMax - lengthMin) * 0.5;
  }
  
  if (lengthOscillation > 0) {
    // Simple oscillation per vector
    const oscillation = Math.sin(time * 2 + index * 0.3) * lengthOscillation * (lengthMax - lengthMin) * 0.3;
    baseLength += oscillation;
  }
  
  if (lengthPulse > 0) {
    // Global pulse effect
    const pulse = Math.sin(time * 3) * lengthPulse * (lengthMax - lengthMin) * 0.2;
    baseLength += pulse;
  }
  
  // 1. Complex Oscillation (Flynn's signature multi-wave system)
  const basePhase = index * 0.1;
  const spatialPhaseX = position.x * 0.01;
  const spatialPhaseY = position.y * 0.01;
  const combinedPhase = basePhase + spatialPhaseX + spatialPhaseY;
  
  // Three layered sine waves for organic movement
  const wave1 = Math.sin(time * oscillationFreq + combinedPhase);
  const wave2 = Math.sin(time * oscillationFreq * 1.618 + combinedPhase * 0.5) * 0.3;
  const wave3 = Math.cos(time * oscillationFreq * 0.7 + combinedPhase * 1.5) * 0.2;
  const complexOscillation = (wave1 + wave2 + wave3) * oscillationAmp * (lengthMax - lengthMin);
  
  // 2. Global Pulse
  const pulse = Math.sin(time * pulseSpeed) * 0.3 + 1;
  
  // 3. Spatial Modifiers
  const centerX = canvasDimensions.width / 2;
  const centerY = canvasDimensions.height / 2;
  const distanceFromCenter = Math.sqrt((position.x - centerX) ** 2 + (position.y - centerY) ** 2);
  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  const normalizedDistance = maxDistance > 0 ? distanceFromCenter / maxDistance : 0;
  
  let spatialModifier = 1;
  if (spatialMode === 'edge') {
    spatialModifier = 1 + normalizedDistance * spatialFactor;
  } else if (spatialMode === 'center') {
    spatialModifier = 1 + (1 - normalizedDistance) * spatialFactor;
  } else if (spatialMode === 'mixed') {
    spatialModifier = 1 + Math.sin(normalizedDistance * Math.PI) * spatialFactor;
  }
  
  // 4. Mouse Influence
  let mouseModifier = 1;
  if (mouseInfluence > 0 && mousePos) {
    const dx = position.x - mousePos.x;
    const dy = position.y - mousePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influenceRadius = 200;
    
    if (dist < influenceRadius) {
      const factor = (1 - dist / influenceRadius);
      if (mouseMode === 'stretch') {
        mouseModifier = 1 + factor * mouseInfluence * 2;
      } else if (mouseMode === 'attract') {
        mouseModifier = 1 + factor * mouseInfluence;
      } else if (mouseMode === 'repel') {
        mouseModifier = 1 - factor * mouseInfluence * 0.5;
      }
    }
  }
  
  // 5. Physics Mode
  let physicsModifier = 1;
  if (physicsMode === 'velocity') {
    // Simulate velocity-based length changes
    const velocityFactor = Math.abs(Math.sin(time * 2 + index * 0.1)) * 0.5 + 0.5;
    physicsModifier = 0.7 + velocityFactor * 0.6;
  } else if (physicsMode === 'pressure') {
    // Simulate pressure wave effects
    const pressureWave = Math.sin(time * 0.5 + normalizedDistance * Math.PI * 2) * 0.3 + 1;
    physicsModifier = pressureWave;
  } else if (physicsMode === 'field') {
    // Simulate electromagnetic field intensity
    const fieldIntensity = Math.sin(time + position.x * 0.1) * Math.cos(time + position.y * 0.1);
    physicsModifier = 1 + fieldIntensity * 0.4;
  }
  
  // Combine all effects
  let finalLength = (baseLength + complexOscillation) * pulse * spatialModifier * mouseModifier * physicsModifier;
  
  // Clamp to min/max bounds
  finalLength = Math.max(lengthMin, Math.min(finalLength, lengthMax));
  
  return finalLength;
};

// Generate geometry based on vector shape
const generateVectorGeometry = (
  shape: LabControls['vectorShape'],
  length: number,
  thickness: number,
  frequency: number,
  amplitude: number,
  curvature: number,
  segments: number
): THREE.BufferGeometry => {
  switch (shape) {
    case 'straight':
      return new THREE.BoxGeometry(length, thickness, thickness);
      
    case 'wave': {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-length/2, 0, 0),
        new THREE.Vector3(0, amplitude * Math.sin(frequency), 0),
        new THREE.Vector3(length/2, amplitude * Math.sin(frequency * 2), 0)
      );
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'spiral': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * frequency * Math.PI * 2;
        const radius = amplitude * t;
        const x = (t - 0.5) * length;
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'bezier': {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-length/2, 0, 0),
        new THREE.Vector3(-length/4, amplitude * curvature, 0),
        new THREE.Vector3(length/4, -amplitude * curvature, 0),
        new THREE.Vector3(length/2, 0, 0)
      );
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'arc': {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-length/2, 0, 0),
        new THREE.Vector3(0, amplitude * curvature, 0),
        new THREE.Vector3(length/2, 0, 0)
      );
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'zigzag': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * length;
        const y = amplitude * Math.sign(Math.sin(t * frequency * Math.PI * 2));
        points.push(new THREE.Vector3(x, y, 0));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'triangleWave': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * length;
        const phase = t * frequency * Math.PI * 2;
        const y = amplitude * (2 * Math.abs(2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5))) - 1);
        points.push(new THREE.Vector3(x, y, 0));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'organic': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * length;
        // Create organic variation using multiple sine waves
        const y = amplitude * curvature * (
          Math.sin(t * frequency * Math.PI) * 0.5 +
          Math.sin(t * frequency * Math.PI * 2.1) * 0.3 +
          Math.sin(t * frequency * Math.PI * 3.7) * 0.2
        );
        const z = amplitude * curvature * 0.3 * Math.sin(t * frequency * Math.PI * 1.3);
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'dash': {
      // Create dashed line effect with gaps
      const dashLength = length / frequency;
      const gapLength = dashLength * 0.3;
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      
      for (let i = 0; i < frequency; i++) {
        const startX = -length/2 + i * (dashLength + gapLength);
        const endX = startX + dashLength;
        
        // Each dash as a small box
        positions.push(startX, 0, 0);
        positions.push(endX, 0, 0);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      return geometry;
    }
    
    case 'spring': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * length;
        const angle = t * frequency * Math.PI * 4; // More rotations for spring effect
        const radius = amplitude * (1 - Math.abs(t - 0.5) * 2); // Taper at ends
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, thickness, 8);
    }
    
    case 'double': {
      // Create two parallel lines
      const offset = thickness * 2;
      const geometry = new THREE.BufferGeometry();
      const positions = [
        -length/2, offset, 0,
        length/2, offset, 0,
        -length/2, -offset, 0,
        length/2, -offset, 0
      ];
      const indices = [0, 1, 2, 1, 3, 2];
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      return geometry;
    }
    
    default:
      return new THREE.BoxGeometry(length, thickness, thickness);
  }
};

export const InstancedVectorGrid: React.FC<InstancedVectorGridProps> = ({
  positions,
  rotations,
  colors,
  controls,
  time
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Generate geometry based on current vector shape settings
  const geometry = useMemo(() => {
    return generateVectorGeometry(
      controls.vectorShape,
      controls.vectorLength,
      controls.vectorThickness,
      controls.frequency,
      controls.amplitude,
      controls.curvature,
      controls.segments
    );
  }, [
    controls.vectorShape,
    controls.vectorLength,
    controls.vectorThickness,
    controls.frequency,
    controls.amplitude,
    controls.curvature,
    controls.segments
  ]);

  // Create material with opacity support
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 1, // Hardcoded opacity
      metalness: 0.1,
      roughness: 0.7
    });
  }, []); // No dependency on controls.colorConfig.opacity anymore

  // Update instance transforms and colors
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    
    positions.forEach((position, i) => {
      // Use pre-calculated rotation from Flynn Animation System
      const rotationZ = rotations[i] || 0;
      
      // Calculate position offset based on rotation origin
      const positionOffset = calculatePositionOffset(
        controls.vectorLength,
        rotationZ,
        controls.rotationOrigin
      );
      
      // Set position with origin offset
      dummy.position.set(
        position.x + positionOffset.x, 
        position.y + positionOffset.y, 
        position.z
      );
      
      dummy.rotation.z = rotationZ;
      
      // Apply Flynn's Dynamic Length System
      const dynamicLength = calculateDynamicLength(
        position,
        i,
        time,
        null, // TODO: Add mouse position support
        { width: 100, height: 100 }, // Canvas dimensions (normalized)
        controls
      );
      
      // Scale the vector based on dynamic length calculation
      const lengthScale = dynamicLength / controls.vectorLength;
      dummy.scale.set(lengthScale, 1, 1);
      
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      
      // Set color for this instance
      if (colors[i]) {
        mesh.setColorAt(i, colors[i]);
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [positions, rotations, colors, controls, time]);

  // Animation frame updates
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Opacity is now fixed, no need to update it every frame
    // if (materialRef.current) {
    //   materialRef.current.opacity = controls.colorConfig.opacity;
    // }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, positions.length]}
      material={material}
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        ref={materialRef}
        attach="material"
        transparent={true}
        opacity={1} // Hardcoded opacity
        metalness={0.1}
        roughness={0.7}
      />
    </instancedMesh>
  );
}; 