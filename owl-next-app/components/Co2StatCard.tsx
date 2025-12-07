import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.01]">
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);
