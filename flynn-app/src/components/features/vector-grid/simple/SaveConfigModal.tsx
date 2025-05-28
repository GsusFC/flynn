'use client';

import React, { useState } from 'react';
import { X, Save, Globe, Lock, Tag } from 'lucide-react';
import { SavedAnimation, GridConfig, VectorConfig, AnimationConfig, ZoomConfig } from './simpleTypes';
import { ConfigurationManager } from '@/utils/configManager';

interface SaveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridConfig: GridConfig;
  vectorConfig: VectorConfig;
  animationConfig: AnimationConfig;
  zoomConfig: ZoomConfig;
  onSaved?: (config: SavedAnimation) => void;
}

export default function SaveConfigModal({
  isOpen,
  onClose,
  gridConfig,
  vectorConfig,
  animationConfig,
  zoomConfig,
  onSaved
}: SaveConfigModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const configManager = new ConfigurationManager();

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Configuration name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    const configToSave: Omit<SavedAnimation, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'> = {
      name: name.trim(),
      description: description.trim(),
      gridConfig,
      vectorConfig,
      animationConfig,
      zoomConfig,
      isPublic,
      tags
    };

    try {
      let savedConfig: SavedAnimation;

      if (isPublic) {
        savedConfig = await configManager.savePublicConfig(configToSave);
      } else {
        savedConfig = await configManager.savePrivateConfig(configToSave);
      }

      onSaved?.(savedConfig);
      handleClose();
    } catch (error) {
      console.error('Error saving configuration:', error);
      if (error instanceof Error) {
        if (error.message.includes('Vercel KV')) {
          setError('Public sharing requires Vercel KV setup. Configuration saved locally instead.');
          // Fallback to private save
          try {
            const fallbackSavedConfig = await configManager.savePrivateConfig({ ...configToSave, isPublic: false });
            onSaved?.(fallbackSavedConfig);
            handleClose();
            return;
          } catch (fallbackError) {
            setError('Failed to save configuration');
          }
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to save configuration');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setTags([]);
    setTagInput('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Save Configuration</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Name *
            </label>
            <input
              id="config-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My awesome animation"
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="config-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="config-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your configuration..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags (max 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag..."
                maxLength={20}
                disabled={tags.length >= 5}
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5 || tags.includes(tagInput.trim().toLowerCase())}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="mr-3"
                />
                <Lock size={16} className="mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">Private</div>
                  <div className="text-sm text-gray-500">Only you can see this configuration</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="mr-3"
                />
                <Globe size={16} className="mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-sm text-gray-500">Anyone can view and use this configuration</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}