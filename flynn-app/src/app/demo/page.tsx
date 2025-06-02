'use client';

import { useState, useEffect } from 'react';

// Simulated grid pattern generator for visual demo
function generatePattern(pattern: string, size: number = 10) {
  const points: Array<{x: number, y: number, id: string}> = [];
  const width = 300;
  const height = 300;
  
  switch (pattern) {
    case 'regular':
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          points.push({
            x: (j / (size - 1)) * width,
            y: (i / (size - 1)) * height,
            id: `${i}-${j}`
          });
        }
      }
      break;
      
    case 'hexagonal':
      const hexSize = Math.sqrt(size);
      for (let i = 0; i < hexSize; i++) {
        for (let j = 0; j < hexSize; j++) {
          const offsetX = (i % 2) * 0.5;
          points.push({
            x: (j + offsetX) * (width / hexSize),
            y: i * (height / hexSize) * 0.866,
            id: `${i}-${j}`
          });
        }
      }
      break;
      
    case 'fibonacci':
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2.5;
      
      for (let i = 0; i < size * 2; i++) {
        const angle = i * goldenAngle;
        const radius = maxRadius * Math.sqrt(i / (size * 2));
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          id: `fib-${i}`
        });
      }
      break;
      
    case 'radial':
      const rings = Math.sqrt(size);
      const centerXr = width / 2;
      const centerYr = height / 2;
      const maxRadiusR = Math.min(width, height) / 2.2;
      
      for (let ring = 1; ring <= rings; ring++) {
        const radius = (ring / rings) * maxRadiusR;
        const pointsInRing = Math.max(6, Math.floor(ring * 6));
        const angleStep = (2 * Math.PI) / pointsInRing;
        
        for (let i = 0; i < pointsInRing; i++) {
          const angle = i * angleStep;
          points.push({
            x: centerXr + Math.cos(angle) * radius,
            y: centerYr + Math.sin(angle) * radius,
            id: `${ring}-${i}`
          });
        }
      }
      break;
  }
  
  return points;
}

export default function DemoPage() {
  const [currentPattern, setCurrentPattern] = useState('regular');
  const [points, setPoints] = useState<Array<{x: number, y: number, id: string}>>([]);
  const [animationStep, setAnimationStep] = useState(0);

  const patterns = [
    { id: 'regular', name: '📐 Regular Grid', description: 'Uniform grid pattern' },
    { id: 'hexagonal', name: '🔶 Hexagonal', description: 'Honeycomb arrangement' },
    { id: 'fibonacci', name: '🌀 Fibonacci', description: 'Golden ratio spiral' },
    { id: 'radial', name: '⭕ Radial', description: 'Concentric circles' }
  ];

  useEffect(() => {
    setPoints(generatePattern(currentPattern));
  }, [currentPattern]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          🎯 Flynn Vector Grid Patterns
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Demostración visual de los 8 patrones matemáticos implementados
        </p>

        {/* Pattern Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Selecciona un Patrón</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {patterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => setCurrentPattern(pattern.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentPattern === pattern.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{pattern.name}</h3>
                <p className="text-sm text-gray-600">{pattern.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pattern Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Patrón: {patterns.find(p => p.id === currentPattern)?.name}</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 300 300" className="w-full h-full">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Vector Points */}
                {points.map((point, index) => {
                  const hue = (index * 137.5 + animationStep) % 360; // Golden angle color progression
                  const scale = 0.8 + 0.4 * Math.sin((animationStep + index * 10) * Math.PI / 180);
                  
                  return (
                    <g key={point.id}>
                      {/* Vector line */}
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={point.x + 15 * Math.cos((animationStep + index * 20) * Math.PI / 180)}
                        y2={point.y + 15 * Math.sin((animationStep + index * 20) * Math.PI / 180)}
                        stroke={`hsl(${hue}, 70%, 60%)`}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Vector point */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={2 * scale}
                        fill={`hsl(${hue}, 80%, 70%)`}
                        opacity="0.8"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <strong>{points.length}</strong> vectores generados • Animación en tiempo real
            </div>
          </div>

          {/* Pattern Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Información del Patrón</h3>
              
              {currentPattern === 'regular' && (
                <div className="space-y-3">
                  <div><strong>Tipo:</strong> Grid uniforme</div>
                  <div><strong>Complejidad:</strong> O(n²)</div>
                  <div><strong>Uso:</strong> Simulaciones básicas, visualizaciones simples</div>
                  <div><strong>Características:</strong> Distribución uniforme, fácil indexación</div>
                </div>
              )}
              
              {currentPattern === 'hexagonal' && (
                <div className="space-y-3">
                  <div><strong>Tipo:</strong> Lattice hexagonal</div>
                  <div><strong>Complejidad:</strong> O(n²)</div>
                  <div><strong>Uso:</strong> Estructuras cristalinas, patrones naturales</div>
                  <div><strong>Características:</strong> Máxima eficiencia de empaquetado</div>
                </div>
              )}
              
              {currentPattern === 'fibonacci' && (
                <div className="space-y-3">
                  <div><strong>Tipo:</strong> Espiral áurea</div>
                  <div><strong>Complejidad:</strong> O(n)</div>
                  <div><strong>Uso:</strong> Patrones naturales, distribuciones orgánicas</div>
                  <div><strong>Características:</strong> Golden ratio (φ = 1.618...)</div>
                </div>
              )}
              
              {currentPattern === 'radial' && (
                <div className="space-y-3">
                  <div><strong>Tipo:</strong> Círculos concéntricos</div>
                  <div><strong>Complejidad:</strong> O(n)</div>
                  <div><strong>Uso:</strong> Simulaciones radiales, ondas</div>
                  <div><strong>Características:</strong> Simetría rotacional perfecta</div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Implementación</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded font-mono">
                  generatePattern('{currentPattern}', vectorCount)
                </div>
                <div><strong>Archivo:</strong> gridUtils.ts</div>
                <div><strong>Función:</strong> generate{currentPattern.charAt(0).toUpperCase() + currentPattern.slice(1)}Grid</div>
                <div><strong>Estado:</strong> <span className="text-green-600 font-medium">✅ Implementado</span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🚀 Otros Patrones</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>🔺 Triangular Lattice</div>
                <div>📶 Staggered Grid</div>
                <div>🎲 Voronoi-inspired</div>
                <div>✨ Golden Ratio Grid</div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Total: 8 patrones matemáticos avanzados
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>🎯 Sistema Flynn Vector Grid completamente funcional</p>
          <p className="text-sm mt-1">SVG Export • Vector Dynamics • Advanced Patterns • Performance Optimization</p>
        </div>
      </div>
    </div>
  );
}