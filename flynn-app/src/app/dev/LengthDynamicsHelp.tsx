'use client';

import { useState } from 'react';

interface LengthDynamicsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LengthDynamicsHelp({ isOpen, onClose }: LengthDynamicsHelpProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'physics' | 'examples'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              🎛️
            </div>
            <h2 className="text-xl font-bold text-white">Length Dynamics Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: '📖 Overview', icon: '📖' },
            { id: 'controls', label: '🎚️ Controls', icon: '🎚️' },
            { id: 'physics', label: '⚡ Physics', icon: '⚡' },
            { id: 'examples', label: '🎯 Examples', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">What is Length Dynamics?</h3>
              <p className="text-gray-300 mb-4">
                Length Dynamics controls how vector lengths change over time and space. Instead of static vectors, 
                you can create breathing, pulsing, oscillating, and interactive effects.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">🌊 Temporal Effects</h4>
                  <p className="text-sm text-gray-300">
                    Oscillations, pulses, and time-based changes that make vectors "breathe" and flow.
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🎯 Spatial Effects</h4>
                  <p className="text-sm text-gray-300">
                    Length changes based on position - center vs edges, distance relationships.
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">🖱️ Interactive</h4>
                  <p className="text-sm text-gray-300">
                    Mouse influence makes vectors respond to cursor position in real-time.
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-400 mb-2">⚡ Physics</h4>
                  <p className="text-sm text-gray-300">
                    Simulate velocity, pressure waves, and electromagnetic field intensities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Control Reference</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">📏 Base Length Range</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Min (1-20):</strong> Shortest possible vector length</p>
                    <p><strong>Max (20-80):</strong> Longest possible vector length</p>
                    <p className="text-blue-300">💡 Tip: Wider range = more dramatic effects</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">🌊 Oscillation</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Frequency (0.1-5):</strong> How fast vectors oscillate</p>
                    <p><strong>Amplitude (0-1):</strong> How much they stretch/shrink</p>
                    <p className="text-blue-300">💡 Tip: High freq + low amp = subtle vibration</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">💓 Pulse & Spatial</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Pulse Speed:</strong> Global breathing effect speed</p>
                    <p><strong>Spatial Factor:</strong> Center vs edge length difference</p>
                    <p className="text-blue-300">💡 Tip: Spatial=0 for uniform, Spatial=2 for dramatic radial effect</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🖱️ Mouse Influence</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Range (0-1):</strong> How much mouse affects vector lengths</p>
                    <p><strong>Behavior:</strong> Vectors near cursor become longer</p>
                    <p className="text-blue-300">💡 Tip: 0.5 = subtle, 1.0 = dramatic mouse interaction</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'physics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Physics Modes</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-gray-500">
                  <h4 className="font-semibold text-gray-400 mb-2">🔸 None</h4>
                  <p className="text-sm text-gray-300">
                    No physics simulation. Pure mathematical oscillations and spatial effects.
                    <br/><strong>Best for:</strong> Clean, predictable patterns
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-400 mb-2">⚡ Velocity</h4>
                  <p className="text-sm text-gray-300">
                    Simulates velocity-based length. Faster moving vectors appear longer.
                    <br/><strong>Best for:</strong> Flow fields, wind effects, motion blur
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-400 mb-2">💨 Pressure</h4>
                  <p className="text-sm text-gray-300">
                    Simulates pressure waves. Creates compression/expansion effects.
                    <br/><strong>Best for:</strong> Sound waves, gas dynamics, explosions
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-400 mb-2">🌊 Field</h4>
                  <p className="text-sm text-gray-300">
                    Simulates electromagnetic field intensity based on position.
                    <br/><strong>Best for:</strong> Magnetic fields, electric forces, signal strength
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Example Configurations</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">🌊 Gentle Ocean Waves</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Min: 10, Max: 30 | Osc Freq: 0.8, Amp: 0.3</p>
                    <p>Pulse: 1.2, Spatial: 0.2 | Physics: None</p>
                    <p className="text-blue-300">Creates subtle, calming wave motions</p>
                  </div>
                </div>

                <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                  <h4 className="font-semibold text-red-400 mb-2">⚡ Electromagnetic Storm</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Min: 5, Max: 50 | Osc Freq: 3, Amp: 0.8</p>
                    <p>Pulse: 2, Spatial: 1.5 | Physics: Field</p>
                    <p className="text-red-300">Chaotic, high-energy field visualization</p>
                  </div>
                </div>

                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2">🖱️ Interactive Playground</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Min: 8, Max: 35 | Osc Freq: 1.5, Amp: 0.4</p>
                    <p>Mouse: 0.7, Spatial: 0.3 | Physics: Velocity</p>
                    <p className="text-purple-300">Vectors follow your mouse movements</p>
                  </div>
                </div>

                <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2">💨 Pressure Waves</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Min: 12, Max: 25 | Osc Freq: 2, Amp: 0.6</p>
                    <p>Pulse: 3, Spatial: 0.8 | Physics: Pressure</p>
                    <p className="text-green-300">Simulates sound or shock waves</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">🎯 Pro Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Start with presets, then enable Custom Mode to experiment</li>
                  <li>• Combine low oscillation with high spatial for radial effects</li>
                  <li>• Use mouse influence for interactive demos</li>
                  <li>• Physics modes work best with matching animations (dipole + field)</li>
                  <li>• Extreme values create interesting glitch effects</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}