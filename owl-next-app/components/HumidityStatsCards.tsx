'use client';

import React from 'react';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

export interface HumidityStats {
  averageHumidity: number;
  activeAlerts: number;
  lastUpdate: string;
}

interface HumidityStatsCardsProps {
  stats: HumidityStats;
}

const HumidityStatsCards: React.FC<HumidityStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {/* Average Humidity Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
          <Activity className="h-5 w-5 text-teal-600" />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Humidité moyenne
        </p>
        <p className="text-3xl font-semibold text-slate-900">{stats.averageHumidity}%</p>
      </div>

      {/* Active Alerts Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Alertes actives
        </p>
        <p className="text-3xl font-semibold text-slate-900">{stats.activeAlerts}</p>
      </div>

      {/* Last Update Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Dernière mise à jour
        </p>
        <p className="text-2xl font-semibold text-slate-900">{stats.lastUpdate}</p>
      </div>
    </div>
  );
};

export default HumidityStatsCards;
