'use client';

import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('./globe'), {
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-gray-100 rounded-full" />
});

export default Globe;
