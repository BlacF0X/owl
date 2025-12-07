'use client';

import React from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, GitCompare } from 'lucide-react';

export type ViewMode = 'current' | 'max' | 'min' | 'avg' | 'comparison';

interface DashboardViewButtonsProps {
  currentMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  showComparison?: boolean;
}

export default function DashboardViewButtons({
  currentMode,
  onChange,
  showComparison = true,
}: DashboardViewButtonsProps) {
  const buttons: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'current', icon: Activity, label: 'Temps Réel' },
    { mode: 'max', icon: TrendingUp, label: 'Maximale' },
    { mode: 'min', icon: TrendingDown, label: 'Minimale' },
    { mode: 'avg', icon: BarChart3, label: 'Moyenne' },
  ];

  if (showComparison) {
    buttons.push({ mode: 'comparison', icon: GitCompare, label: 'Comparaison' });
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {buttons.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
            ${
              currentMode === mode
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }
          `}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
