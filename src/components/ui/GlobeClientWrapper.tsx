'use client';

import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('./globe'), {
  ssr: false,
  loading: () => (
    <div className="w-80 h-80 bg-gray-100 rounded-full flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading globe...</div>
    </div>
  )
});

export default Globe;