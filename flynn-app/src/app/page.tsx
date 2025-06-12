'use client';

import dynamic from 'next/dynamic';

const DevPageWithNoSSR = dynamic(
  () => import('./dev-page'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <p>Loading Visual Synthesizer...</p>
      </div>
    )
  }
);

export default function Page() {
  return <DevPageWithNoSSR />;
}