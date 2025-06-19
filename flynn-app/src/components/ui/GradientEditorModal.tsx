'use client';

import React, { useState, useCallback } from 'react';
import { GradientEditor } from './GradientEditor';
import { useCustomGradients } from '@/lib/customGradients';
import type { GradientColor } from '@/domain/color/types';

interface GradientEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGradientCreated?: (id: string, name: string, gradient: GradientColor) => void;
  initialGradient?: GradientColor;
}

export const GradientEditorModal: React.FC<GradientEditorModalProps> = ({
  isOpen,
  onClose,
  onGradientCreated,
  initialGradient
}) => {
  const { add, isNameTaken, generateUniqueName } = useCustomGradients();
  
  const [currentGradient, setCurrentGradient] = useState<GradientColor>(
    initialGradient || {
      type: 'gradient',
      variant: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#3b82f6' },
        { offset: 1, color: '#8b5cf6' }
      ]
    }
  );

  const handleSave = useCallback((name: string, gradient: GradientColor) => {
    // Verificar si el nombre ya existe y generar uno único si es necesario
    const finalName = isNameTaken(name) ? generateUniqueName(name) : name;
    
    try {
      const customGradient = add(finalName, gradient);
      onGradientCreated?.(customGradient.id, customGradient.name, gradient);
      onClose();
    } catch (error) {
      console.error('Error saving custom gradient:', error);
    }
  }, [add, isNameTaken, generateUniqueName, onGradientCreated, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-800/70 border-b border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-200">🎨 Gradient Editor</h2>
              <p className="text-xs text-neutral-400 mt-1">Create your custom gradient</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-300 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
              title="Close editor"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <GradientEditor
            isOpen={true}
            onClose={() => {}}
            initialGradient={currentGradient}
            onSave={setCurrentGradient}
            onSaveAsCustom={handleSave}
          />
        </div>
      </div>
    </div>
  );
};