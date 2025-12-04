import React from 'react';

// On garde le type exporté ici, c'est pratique
export type ViewMode = 'current' | 'max' | 'min' | 'avg';

interface DashboardViewButtonsProps {
  currentMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const DashboardViewButtons: React.FC<DashboardViewButtonsProps> = ({ currentMode, onChange }) => {
  const buttons: { id: ViewMode; label: string }[] = [
    { id: 'current', label: 'Temps Réel (24h)' },
    { id: 'avg', label: 'Moyenne (7j)' },
    { id: 'max', label: 'Max (7j)' },
    { id: 'min', label: 'Min (7j)' },
  ];

  return (
    <div className="self-center flex bg-slate-100 p-1.5 rounded-xl shadow-inner border border-slate-200 mb-4 overflow-x-auto max-w-full">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onChange(btn.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap
            ${currentMode === btn.id 
              ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
          `}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default DashboardViewButtons;
