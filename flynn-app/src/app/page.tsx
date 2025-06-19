"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import pages to reduce initial load
const DevPage = dynamic(() => import('./dev-page'));
const LabPage = dynamic(() => import('./dev/lab-page'));

export default function Home() {
  const [activePage, setActivePage] = useState<'home' | 'dev' | 'lab'>('home'); // Start at home
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main>
      {/* Minimal Navigation - Much less intrusive */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 16, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Home button */}
        <button 
          onClick={() => setActivePage('home')}
          style={{ 
            width: isHovered ? 'auto' : '32px',
            height: '32px',
            padding: isHovered ? '0 12px' : '0',
            background: activePage === 'home' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(26, 26, 26, 0.8)', 
            color: activePage === 'home' ? '#10b981' : '#888', 
            border: '1px solid rgba(68, 68, 68, 0.5)', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
          title="Inicio"
        >
          <span style={{ fontSize: '16px' }}>🏠</span>
          {isHovered && <span style={{ fontSize: '12px' }}>Inicio</span>}
        </button>
        
        {/* Dev button */}
        <button 
          onClick={() => setActivePage('dev')}
          style={{ 
            width: isHovered ? 'auto' : '32px',
            height: '32px',
            padding: isHovered ? '0 12px' : '0',
            background: activePage === 'dev' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(26, 26, 26, 0.8)', 
            color: activePage === 'dev' ? '#10b981' : '#888', 
            border: '1px solid rgba(68, 68, 68, 0.5)', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
          title="Flynn Dev (2D)"
        >
          <span style={{ fontSize: '16px' }}>📐</span>
          {isHovered && <span style={{ fontSize: '12px' }}>Dev</span>}
        </button>
        
        {/* Lab button */}
        <button 
          onClick={() => setActivePage('lab')}
          style={{ 
            width: isHovered ? 'auto' : '32px',
            height: '32px',
            padding: isHovered ? '0 12px' : '0',
            background: activePage === 'lab' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(26, 26, 26, 0.8)', 
            color: activePage === 'lab' ? '#3b82f6' : '#888', 
            border: '1px solid rgba(68, 68, 68, 0.5)', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
          title="Flynn Lab (3D)"
        >
          <span style={{ fontSize: '16px' }}>🧪</span>
          {isHovered && <span style={{ fontSize: '12px' }}>Lab</span>}
        </button>
      </div>
      
      {activePage === 'home' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: 'white',
          fontFamily: 'Geist Mono, monospace'
        }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '2rem', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Flynn
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '4rem', color: '#888' }}>
            Elige tu experiencia de visualización de vectores
          </p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div 
              onClick={() => setActivePage('dev')}
              style={{
                padding: '2rem',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                border: '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
                width: '300px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #10b981';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid #333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#10b981' }}>Flynn Dev</h2>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>Interfaz 2D clásica</p>
              <ul style={{ textAlign: 'left', color: '#888', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                <li>• Renderizado SVG/Canvas</li>
                <li>• Paneles flotantes</li>
                <li>• Exportación GIF/SVG</li>
                <li>• Sistema de gradientes</li>
              </ul>
            </div>
            
            <div 
              onClick={() => setActivePage('lab')}
              style={{
                padding: '2rem',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                border: '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
                width: '300px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #3b82f6';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid #333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#3b82f6' }}>Flynn Lab</h2>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>Laboratorio 3D avanzado</p>
              <ul style={{ textAlign: 'left', color: '#888', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                <li>• Renderizado Three.js</li>
                <li>• Profundidad 3D real</li>
                <li>• Presets inteligentes</li>
                <li>• Efectos temporales</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {activePage === 'dev' && <DevPage />}
      {activePage === 'lab' && <LabPage />}
    </main>
  );
}