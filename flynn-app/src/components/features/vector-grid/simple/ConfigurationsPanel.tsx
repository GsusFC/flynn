'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, Lock, Eye, Calendar, Tag, Trash2, ExternalLink, Download } from 'lucide-react';
import { SavedAnimation, ConfigFilters } from './simpleTypes';
import { ConfigurationManager } from '@/utils/configManager';

interface ConfigurationsPanelProps {
  onLoadConfig: (config: SavedAnimation) => void;
  onDeleteConfig?: (configId: string, isPublic: boolean) => void;
}

export default function ConfigurationsPanel({ onLoadConfig, onDeleteConfig }: ConfigurationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [privateConfigs, setPrivateConfigs] = useState<SavedAnimation[]>([]);
  const [publicConfigs, setPublicConfigs] = useState<SavedAnimation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kvNotConfigured, setKvNotConfigured] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ConfigFilters>({});
  
  const configManager = new ConfigurationManager();

  // Load configurations
  useEffect(() => {
    loadConfigurations();
  }, [activeTab, filters]);

  const loadConfigurations = async () => {
    setLoading(true);
    setError('');
    setKvNotConfigured(false);

    try {
      if (activeTab === 'private') {
        const configs = await configManager.getPrivateConfigs(filters);
        setPrivateConfigs(configs);
      } else {
        // Check if public configs are available
        const response = await fetch('/api/configs/public');
        if (response.status === 503) {
          setKvNotConfigured(true);
          setPublicConfigs([]);
        } else {
          const configs = await configManager.getPublicConfigs(filters);
          setPublicConfigs(configs);
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      if (activeTab === 'public') {
        setKvNotConfigured(true);
      } else {
        setError('Failed to load configurations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term || undefined }));
  };

  const handleAnimationTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      animationType: prev.animationType === type ? undefined : type as any
    }));
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'mostViewed') => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any }));
  };

  const handleLoadConfig = async (config: SavedAnimation) => {
    try {
      // If it's a public config, increment view count
      if (config.isPublic) {
        await fetch(`/api/configs/${config.id}`, { method: 'GET' });
      }
      onLoadConfig(config);
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const handleDeleteConfig = async (configId: string, isPublic: boolean) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      if (isPublic) {
        await fetch(`/api/configs/${configId}`, { method: 'DELETE' });
      } else {
        await configManager.deletePrivateConfig(configId);
      }
      
      onDeleteConfig?.(configId, isPublic);
      await loadConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setError('Failed to delete configuration');
    }
  };

  const handleShareConfig = async (config: SavedAnimation) => {
    if (config.isPublic) {
      const url = `${window.location.origin}?config=${config.id}`;
      await navigator.clipboard.writeText(url);
      // TODO: Show toast notification
    }
  };

  const configs = activeTab === 'private' ? privateConfigs : publicConfigs;
  const filteredConfigs = configs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const animationTypes = ['wave', 'spiral', 'orbit', 'pulse', 'flow', 'geometric', 'seaWaves', 'geometricPattern'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Saved Configurations</h3>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'private'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock size={16} className="mr-2" />
            Private ({privateConfigs.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'public'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe size={16} className="mr-2" />
            Public ({publicConfigs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Animation Type</span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, animationType: undefined }))}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {animationTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleAnimationTypeFilter(type)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filters.animationType === type
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="mt-3">
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            {activeTab === 'public' && <option value="mostViewed">Most Viewed</option>}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Vercel KV Not Configured Message */}
      {kvNotConfigured && activeTab === 'public' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
          <h4 className="font-medium mb-2">⚙️ Setup Required</h4>
          <p className="mb-2">
            Public configurations require Vercel KV to be configured.
          </p>
          <p className="text-xs">
            See <code className="bg-yellow-100 px-1 rounded">SAVED_CONFIGS_SETUP.md</code> for setup instructions.
          </p>
        </div>
      )}

      {/* Configurations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading configurations...</div>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-center">
              {configs.length === 0 ? (
                <div>
                  <div>No configurations found</div>
                  <div className="text-xs mt-1">Save your first configuration to get started</div>
                </div>
              ) : (
                'No configurations match your search'
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConfigs.map((config) => (
              <div
                key={config.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{config.name}</h4>
                    {config.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{config.description}</p>
                    )}
                  </div>
                  <div className="flex items-center ml-2">
                    {config.isPublic ? (
                      <Globe size={14} className="text-green-600" />
                    ) : (
                      <Lock size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Tags */}
                {config.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {config.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                    {config.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{config.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(config.createdAt).toLocaleDateString()}
                  </div>
                  {config.isPublic && config.viewCount > 0 && (
                    <div className="flex items-center">
                      <Eye size={12} className="mr-1" />
                      {config.viewCount} views
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoadConfig(config)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download size={14} className="mr-1" />
                    Load
                  </button>
                  
                  {config.isPublic && (
                    <button
                      onClick={() => handleShareConfig(config)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      title="Copy share link"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteConfig(config.id, config.isPublic)}
                    className="px-3 py-1.5 border border-red-300 text-red-700 text-sm rounded-md hover:bg-red-50 transition-colors flex items-center"
                    title="Delete configuration"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}