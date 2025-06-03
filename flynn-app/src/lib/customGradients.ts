// Sistema de almacenamiento para gradientes personalizados
import type { GradientColor } from '@/domain/color/types';

const STORAGE_KEY = 'flynn-custom-gradients';

export interface CustomGradient {
  id: string;
  name: string;
  gradient: GradientColor;
  createdAt: number;
  updatedAt: number;
}

// Cargar gradientes personalizados del localStorage
export const loadCustomGradients = (): CustomGradient[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const gradients = JSON.parse(stored);
    return Array.isArray(gradients) ? gradients : [];
  } catch (error) {
    console.warn('[CustomGradients] Error loading custom gradients:', error);
    return [];
  }
};

// Guardar gradientes personalizados al localStorage
export const saveCustomGradients = (gradients: CustomGradient[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gradients));
  } catch (error) {
    console.error('[CustomGradients] Error saving custom gradients:', error);
  }
};

// Agregar un nuevo gradiente personalizado
export const addCustomGradient = (name: string, gradient: GradientColor): CustomGradient => {
  const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  const customGradient: CustomGradient = {
    id,
    name,
    gradient,
    createdAt: now,
    updatedAt: now
  };
  
  const existing = loadCustomGradients();
  const updated = [...existing, customGradient];
  saveCustomGradients(updated);
  
  return customGradient;
};

// Actualizar un gradiente personalizado existente
export const updateCustomGradient = (id: string, updates: Partial<Pick<CustomGradient, 'name' | 'gradient'>>): boolean => {
  const existing = loadCustomGradients();
  const index = existing.findIndex(g => g.id === id);
  
  if (index === -1) return false;
  
  existing[index] = {
    ...existing[index],
    ...updates,
    updatedAt: Date.now()
  };
  
  saveCustomGradients(existing);
  return true;
};

// Eliminar un gradiente personalizado
export const deleteCustomGradient = (id: string): boolean => {
  const existing = loadCustomGradients();
  const filtered = existing.filter(g => g.id !== id);
  
  if (filtered.length === existing.length) return false; // No se encontró
  
  saveCustomGradients(filtered);
  return true;
};

// Obtener un gradiente personalizado por ID
export const getCustomGradient = (id: string): CustomGradient | null => {
  const existing = loadCustomGradients();
  return existing.find(g => g.id === id) || null;
};

// Verificar si un nombre ya existe
export const isNameTaken = (name: string, excludeId?: string): boolean => {
  const existing = loadCustomGradients();
  return existing.some(g => g.name.toLowerCase() === name.toLowerCase() && g.id !== excludeId);
};

// Generar un nombre único
export const generateUniqueName = (baseName: string): string => {
  let name = baseName;
  let counter = 1;
  
  while (isNameTaken(name)) {
    name = `${baseName} ${counter}`;
    counter++;
  }
  
  return name;
};

// Exportar gradiente como JSON
export const exportCustomGradient = (id: string): string | null => {
  const gradient = getCustomGradient(id);
  if (!gradient) return null;
  
  return JSON.stringify(gradient, null, 2);
};

// Importar gradiente desde JSON
export const importCustomGradient = (jsonString: string): CustomGradient | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validar estructura básica
    if (!data.name || !data.gradient || !data.gradient.type || !data.gradient.stops) {
      throw new Error('Invalid gradient structure');
    }
    
    // Generar nuevo ID y nombre único si es necesario
    const uniqueName = generateUniqueName(data.name);
    
    return addCustomGradient(uniqueName, data.gradient);
  } catch (error) {
    console.error('[CustomGradients] Error importing gradient:', error);
    return null;
  }
};

// Hook personalizado para usar gradientes custom
export const useCustomGradients = () => {
  const [gradients, setGradients] = React.useState<CustomGradient[]>([]);
  
  React.useEffect(() => {
    setGradients(loadCustomGradients());
  }, []);
  
  const refresh = React.useCallback(() => {
    setGradients(loadCustomGradients());
  }, []);
  
  const add = React.useCallback((name: string, gradient: GradientColor) => {
    const result = addCustomGradient(name, gradient);
    refresh();
    return result;
  }, [refresh]);
  
  const update = React.useCallback((id: string, updates: Partial<Pick<CustomGradient, 'name' | 'gradient'>>) => {
    const result = updateCustomGradient(id, updates);
    if (result) refresh();
    return result;
  }, [refresh]);
  
  const remove = React.useCallback((id: string) => {
    const result = deleteCustomGradient(id);
    if (result) refresh();
    return result;
  }, [refresh]);
  
  return {
    gradients,
    add,
    update,
    remove,
    refresh,
    isNameTaken: (name: string, excludeId?: string) => isNameTaken(name, excludeId),
    generateUniqueName
  };
};

// React import for hook
import React from 'react';