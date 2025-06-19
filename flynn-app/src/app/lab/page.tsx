"use client";

import dynamic from 'next/dynamic';

// Cargamos el canvas de Three.js de forma dinámica y solo en cliente
const LabCanvas = dynamic(() => import('@/lab/LabCanvas'), { ssr: false });

export default function LabPage() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="absolute top-4 left-4 z-10 text-white">
        🧪 Flynn Lab
      </div>
      <LabCanvas />
    </div>
  );
} 