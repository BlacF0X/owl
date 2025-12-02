import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { AlertData } from './Co2Types';

export const AlertHistory: React.FC<{ alerts: AlertData[] }> = ({ alerts }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 h-full flex flex-col">
    <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
      <Bell className="h-5 w-5 text-slate-500" />
      <h2 className="text-lg font-bold text-slate-800">Alertes actives</h2>
    </div>
    {alerts.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 min-h-[200px]">
        <Bell className="h-8 w-8 mb-2 opacity-20" />
        <span className="text-sm italic">Aucune alerte en cours.</span>
      </div>
    ) : (
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100/50 transition-colors hover:bg-red-100/50"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{alert.room}</p>
              <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
            </div>
            <p className="text-xs font-medium text-slate-400 whitespace-nowrap bg-white/50 px-1.5 py-0.5 rounded">{alert.time}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
