// Gestor de configuraciones híbrido: localStorage + Vercel KV
import type { 
  SavedAnimation, 
  ConfigManager, 
  ConfigFilters, 
  PublicConfigsResponse 
} from '@/components/features/vector-grid/simple/simpleTypes';

// Clave para localStorage
const STORAGE_KEY = 'flynn-saved-animations';
const API_BASE = '/api/configs';

// Implementación del ConfigManager
export class ConfigurationManager implements ConfigManager {
  
  // ===============================
  // CONFIGURACIONES PRIVADAS (localStorage)
  // ===============================
  
  async savePrivate(config: SavedAnimation): Promise<void> {
    try {
      const existing = this.loadPrivate();
      const updated = existing.filter(c => c.id !== config.id);
      updated.push(config);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving private config:', error);
      throw new Error('Failed to save configuration locally');
    }
  }
  
  loadPrivate(): SavedAnimation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const configs = JSON.parse(stored) as SavedAnimation[];
      // Filtrar solo las privadas y validar estructura
      return configs.filter(config => 
        !config.isPublic && 
        this.validateConfig(config)
      ).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading private configs:', error);
      return [];
    }
  }
  
  async deletePrivate(id: string): Promise<void> {
    try {
      const existing = this.loadPrivate();
      const filtered = existing.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting private config:', error);
      throw new Error('Failed to delete configuration');
    }
  }
  
  async updatePrivate(id: string, updates: Partial<SavedAnimation>): Promise<void> {
    try {
      const existing = this.loadPrivate();
      const index = existing.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Configuration not found');
      }
      
      existing[index] = { ...existing[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error('Error updating private config:', error);
      throw new Error('Failed to update configuration');
    }
  }
  
  // ===============================
  // CONFIGURACIONES PÚBLICAS (Vercel KV)
  // ===============================
  
  async savePublic(config: SavedAnimation): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.shareUrl;
    } catch (error) {
      console.error('Error saving public config:', error);
      throw new Error('Failed to save public configuration');
    }
  }
  
  async loadPublic(filters?: ConfigFilters): Promise<PublicConfigsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.animationType) params.append('animationType', filters.animationType);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const url = `${API_BASE}/public${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading public configs:', error);
      return { configs: [], total: 0, hasMore: false };
    }
  }
  
  async loadByShareId(shareId: string): Promise<SavedAnimation | null> {
    try {
      const response = await fetch(`${API_BASE}/${shareId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading config by share ID:', error);
      return null;
    }
  }
  
  async incrementUsage(shareId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareId }),
      });
      
      if (!response.ok) {
        console.warn(`Failed to increment usage for ${shareId}`);
      }
    } catch (error) {
      console.warn('Error incrementing usage:', error);
      // No lanzar error - esto es opcional
    }
  }
  
  // ===============================
  // UTILIDADES
  // ===============================
  
  exportToJSON(config: SavedAnimation): string {
    try {
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error('Error exporting config to JSON:', error);
      throw new Error('Failed to export configuration');
    }
  }
  
  importFromJSON(json: string): SavedAnimation {
    try {
      const config = JSON.parse(json) as SavedAnimation;
      
      if (!this.validateConfig(config)) {
        throw new Error('Invalid configuration format');
      }
      
      // Regenerar ID y fecha para importación
      config.id = this.generateShareId();
      config.createdAt = new Date().toISOString();
      
      return config;
    } catch (error) {
      console.error('Error importing config from JSON:', error);
      throw new Error('Failed to import configuration');
    }
  }
  
  generateShareId(): string {
    // Generar ID único para compartir (más corto que UUID)
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  validateConfig(config: Partial<SavedAnimation>): boolean {
    try {
      // Validaciones básicas
      if (!config.id || !config.name || !config.animationConfig?.type) {
        return false;
      }
      
      if (!config.gridConfig || !config.vectorConfig || !config.zoomConfig) {
        return false;
      }
      
      // Validar estructura de gridConfig
      const grid = config.gridConfig;
      if (!grid.rows || !grid.cols || !grid.spacing || grid.margin === undefined) {
        return false;
      }
      
      // Validar estructura de vectorConfig
      const vector = config.vectorConfig;
      if (!vector.shape || !vector.length || !vector.width || !vector.color) {
        return false;
      }
      
      // Validar estructura de zoomConfig
      const zoom = config.zoomConfig;
      if (!zoom.level || !zoom.min || !zoom.max || !zoom.presets) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating config:', error);
      return false;
    }
  }

  // ===============================
  // MÉTODOS PARA CONFIGURATIONSPANEL
  // ===============================
  
  async savePrivateConfig(config: Omit<SavedAnimation, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<SavedAnimation> {
    const savedConfig: SavedAnimation = {
      ...config,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    };
    
    await this.savePrivate(savedConfig);
    return savedConfig;
  }

  async savePublicConfig(config: Omit<SavedAnimation, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<SavedAnimation> {
    const response = await fetch('/api/configs/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...config,
        id: this.generateId(),
        isPublic: true
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save public configuration');
    }

    const { config: savedConfig } = await response.json();
    return savedConfig;
  }

  async getPrivateConfigs(filters?: any): Promise<SavedAnimation[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      let configs = JSON.parse(stored) as SavedAnimation[];
      
      // Apply filters if provided
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        configs = configs.filter(config =>
          config.name.toLowerCase().includes(searchLower) ||
          config.description.toLowerCase().includes(searchLower) ||
          config.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters?.animationType) {
        configs = configs.filter(config => 
          config.animationConfig.type === filters.animationType
        );
      }
      
      // Sort configs
      switch (filters?.sortBy) {
        case 'oldest':
          configs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'name':
          configs.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
        default:
          configs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
      
      return configs;
    } catch (error) {
      console.error('Error loading private configs:', error);
      return [];
    }
  }

  async getPublicConfigs(filters?: any): Promise<SavedAnimation[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.animationType) params.append('animationType', filters.animationType);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.page) params.append('page', String(filters.page));
      
      const response = await fetch(`/api/configs/public?${params.toString()}`);
      
      if (!response.ok) {
        // Check if it's a service unavailable error (Vercel KV not configured)
        if (response.status === 503) {
          console.warn('Vercel KV not configured. Public configurations are not available.');
          return [];
        }
        throw new Error('Failed to fetch public configurations');
      }
      
      const data = await response.json();
      
      // Show message if Vercel KV is not configured
      if (data.message) {
        console.warn(data.message);
      }
      
      return data.configs || [];
    } catch (error) {
      console.warn('Public configurations are not available. Please configure Vercel KV for public sharing.');
      return [];
    }
  }

  async deletePrivateConfig(configId: string): Promise<void> {
    try {
      const configs = this.loadPrivate();
      const filteredConfigs = configs.filter(config => config.id !== configId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredConfigs));
    } catch (error) {
      console.error('Error deleting private config:', error);
      throw new Error('Failed to delete configuration');
    }
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  private get STORAGE_KEY(): string {
    return STORAGE_KEY;
  }
}

// Instancia singleton
export const configManager = new ConfigurationManager();

// Utilidades adicionales
export const createConfigFromCurrentState = (
  name: string,
  description: string,
  tags: string[],
  isPublic: boolean,
  currentState: {
    animationType: string;
    animationProps: Record<string, unknown>;
    gridConfig: any;
    vectorConfig: any;
    zoomConfig: any;
  }
): SavedAnimation => {
  return {
    id: configManager.generateShareId(),
    name: name.trim(),
    description: description.trim() || '',
    animationConfig: {
      type: currentState.animationType as any,
      props: currentState.animationProps
    },
    gridConfig: currentState.gridConfig,
    vectorConfig: currentState.vectorConfig,
    zoomConfig: currentState.zoomConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
    tags: tags.filter(tag => tag.trim()).map(tag => tag.trim()),
    isPublic
  };
};