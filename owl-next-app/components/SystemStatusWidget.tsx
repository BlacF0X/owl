'use client';

import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'error' | 'loading';
}

const servicesToCheck = [
  { name: 'Vercel', url: 'https://www.vercel-status.com/api/v2/status.json' },
  { name: 'Supabase', url: 'https://status.supabase.com/api/v2/status.json' },
  { name: 'Clerk', url: 'https://status.clerk.com/api/v2/status.json' },
  { name: 'Pusher', url: 'https://status.pusher.com/api/v2/status.json' },
];

export default function SystemStatusWidget() {
  const [services, setServices] = useState<ServiceStatus[]>(
    servicesToCheck.map((s) => ({ ...s, status: 'loading' }))
  );

  const isLoading = services.every((s) => s.status === 'loading');
  const hasIssues = services.some((s) => s.status === 'degraded' || s.status === 'error');

  useEffect(() => {
    const checkStatuses = async () => {
      const results = await Promise.all(
        servicesToCheck.map(async (service) => {
          try {
            const res = await fetch(service.url, { next: { revalidate: 300 } });
            if (!res.ok) throw new Error('Err');
            const data = await res.json();
            const isOk = data.status.indicator === 'none';
            return { ...service, status: isOk ? 'operational' : 'degraded' } as ServiceStatus;
          } catch {
            return { ...service, status: 'error' } as ServiceStatus;
          }
        })
      );
      setServices(results);
    };

    checkStatuses();
  }, []);

  let dotColor = 'bg-slate-300';
  let statusText = 'Connexion...';

  if (!isLoading) {
    if (hasIssues) {
      dotColor = 'bg-amber-500';
      statusText = 'Services perturbés';
    } else {
      dotColor = 'bg-emerald-500';
      statusText = 'Systèmes opérationnels';
    }
  }

  return (
    <a
      href="https://owl.betteruptime.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex cursor-pointer justify-center py-1 transition-opacity opacity-60 hover:opacity-100"
      title="Voir le statut détaillé"
    >
      <div className="flex items-center gap-2">
        <span className={`relative flex h-2 w-2`}>
          {hasIssues && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}></span>
        </span>
        <span className="text-[10px] font-medium text-slate-500">{statusText}</span>
      </div>
    </a>
  );
}
