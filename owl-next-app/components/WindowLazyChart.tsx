'use client';

import dynamic from 'next/dynamic';

const WindowHourlyActivityChart = dynamic(() => import('@/components/WindowHourlyActivityChart'), {
  loading: () => (
    <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
      Chargement...
    </div>
  ),
  ssr: false,
});

export default WindowHourlyActivityChart;
