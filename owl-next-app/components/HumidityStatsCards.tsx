'use client';

import React from 'react';
import { Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export interface HumidityStats {
  averageHumidity: number;
  activeAlerts: number;
  lastUpdate: string;
}

interface HumidityStatsCardsProps {
  stats: HumidityStats;
}

const HumidityStatsCards: React.FC<HumidityStatsCardsProps> = ({ stats }) => {
  const hasAlerts = stats.activeAlerts > 0;

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

      {/* Active Alerts Card (Devient ROUGE si alerte) */}
      <div
        className={`rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${hasAlerts ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}
      >
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${hasAlerts ? 'bg-red-100' : 'bg-emerald-100'}`}
        >
          {hasAlerts ? (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          )}
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Alertes actives
        </p>
        <p className={`text-3xl font-semibold ${hasAlerts ? 'text-red-600' : 'text-slate-900'}`}>
          {stats.activeAlerts}
        </p>
      </div>

      {/* Last Update Card (Affiche la vraie heure) */}
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
