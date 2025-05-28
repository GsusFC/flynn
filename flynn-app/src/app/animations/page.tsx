'use client';

import { useState } from 'react';
import { SimpleVectorGridOptimized } from '@/components/features/vector-grid/simple/SimpleVectorGridOptimized';
import { 
  getAllAnimations, 
  getDefaultProps
} from '@/components/features/vector-grid/simple/animations';
import type { 
  GridConfig, 
  VectorConfig,
  AnimationType
} from '@/components/features/vector-grid/simple/simpleTypes';

// Configuraciones predefinidas
const gridConfigs: Record<string, GridConfig> = {
  small: { rows: 8, cols: 12, spacing: 25, margin: 15 },
  medium: { rows: 12, cols: 18, spacing: 30, margin: 20 },
  large: { rows: 16, cols: 24, spacing: 35, margin: 25 },
  dense: { rows: 20, cols: 30, spacing: 20, margin: 10 }
};

export default function AnimationsPage() {
  const [selectedGrid, setSelectedGrid] = useState<keyof typeof gridConfigs>('medium');
  const [selectedAnimation, setSelectedAnimation] = useState<string>('smoothWaves');

  const currentGridConfig = gridConfigs[selectedGrid];
  const availableAnimations = getAllAnimations();
  const currentAnimationProps = getDefaultProps(selectedAnimation);

  const vectorConfig: VectorConfig = {
    shape: 'line',
    length: 18,
    width: 2,
    color: '#3b82f6',
    rotationOrigin: 'center',
    strokeLinecap: 'butt'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Galería de Animaciones
        </h1>
        
        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white rounded-lg shadow">
          {/* Tamaño del Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tamaño del Grid</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gridConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedGrid(key as keyof typeof gridConfigs)}
                  className={`p-3 rounded border text-sm ${
                    selectedGrid === key 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium capitalize">{key}</div>
                  <div className="text-xs">{config.rows}×{config.cols}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Animación */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Animación</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableAnimations.map((animation) => (
                <button
                  key={animation.id}
                  onClick={() => setSelectedAnimation(animation.id)}
                  className={`p-3 rounded border text-sm ${
                    selectedAnimation === animation.id 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{animation.icon} {animation.name}</div>
                  <div className="text-xs">{animation.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Vectores */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center">
            <SimpleVectorGridOptimized
              gridConfig={currentGridConfig}
              vectorConfig={vectorConfig}
              animationType={selectedAnimation as AnimationType}
              animationProps={{
                type: selectedAnimation,
                ...currentAnimationProps
              } as any}
              width={Math.min(1000, currentGridConfig.cols * currentGridConfig.spacing + currentGridConfig.margin * 2)}
              height={Math.min(600, currentGridConfig.rows * currentGridConfig.spacing + currentGridConfig.margin * 2)}
              backgroundColor="#f9fafb"
              debugMode={false}
            />
          </div>
        </div>

        {/* Información */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Configuración Actual</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Grid:</strong> {currentGridConfig.rows}×{currentGridConfig.cols}</div>
              <div><strong>Espaciado:</strong> {currentGridConfig.spacing}px</div>
              <div><strong>Margen:</strong> {currentGridConfig.margin}px</div>
              <div><strong>Animación:</strong> {selectedAnimation}</div>
              <div><strong>Vectores totales:</strong> {currentGridConfig.rows * currentGridConfig.cols}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Controles</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• Haz clic en diferentes tamaños para cambiar la densidad</div>
              <div>• Selecciona animaciones para ver diferentes efectos</div>
              <div>• Mueve el mouse sobre el grid para interacciones</div>
              <div>• El sistema optimiza automáticamente el renderizado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}