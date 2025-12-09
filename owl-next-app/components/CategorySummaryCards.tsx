'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  sensors: Sensor[];
  openWindowsCount: number;
  avgTemp: number | null;
  avgHumidity: number | null;
  avgCo2: number | null;
  co2Unit: string;
}

export default function CategorySummaryCards({ 
  sensors, 
  openWindowsCount, 
  avgTemp, 
  avgHumidity, 
  avgCo2,
  co2Unit 
}: Props) {

  const countByType = (key: string) => sensors.filter(s => s.type.type_key === key).length;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
      
      {/* --- 1. CARTE FENÊTRES (Style Alerte ou Sécurité) --- */}
      <div className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        openWindowsCount > 0 
          ? 'bg-gradient-to-br from-red-50 to-white border-red-100' 
          : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
      }`}>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500 bg-current" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-xl ${openWindowsCount > 0 ? 'bg-red-100/50 text-red-600' : 'bg-emerald-100/50 text-emerald-600'}`}>
                    <Square className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Sécurité</h3>
             </div>
             <p className="mt-4 text-5xl font-black text-slate-800 tracking-tight">
               {openWindowsCount}
             </p>
             <p className={`mt-2 font-medium flex items-center gap-1.5 ${openWindowsCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {openWindowsCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {openWindowsCount > 0 ? 'Fenêtres ouvertes' : 'Tout est fermé'}
             </p>
          </div>
          {/* Icône Géante Décorative */}
          <Square className={`absolute right-4 top-1/2 -translate-y-1/2 h-24 w-24 opacity-5 stroke-1 ${openWindowsCount > 0 ? 'text-red-900' : 'text-emerald-900'}`} />
        </div>
      </div>

      {/* --- 2. CARTE TEMPÉRATURE (Style Chaleureux) --- */}
      <div className="group relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1">
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-orange-100 to-transparent opacity-50 rounded-bl-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shadow-sm shadow-orange-100">
                <Thermometer className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Température</h3>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-800 tracking-tight">
                {avgTemp !== null ? avgTemp : '-'}
            </span>
            <span className="text-xl font-bold text-orange-500">°C</span>
          </div>
          <p className="mt-2 text-sm text-slate-400 font-medium">Moyenne globale</p>
        </div>
        <Thermometer className="absolute right-4 bottom-4 h-20 w-20 text-orange-500 opacity-5 stroke-1 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      </div>

      {/* --- 3. CARTE HUMIDITÉ (Style Eau/Frais) --- */}
      <div className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1">
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-blue-100 to-transparent opacity-50 rounded-bl-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
                <Droplets className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Humidité</h3>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-800 tracking-tight">
                {avgHumidity !== null ? avgHumidity : '-'}
            </span>
            <span className="text-xl font-bold text-blue-500">%</span>
          </div>
          <p className="mt-2 text-sm text-slate-400 font-medium">Zone de confort : 40-60%</p>
        </div>
        <Droplets className="absolute right-4 bottom-4 h-20 w-20 text-blue-500 opacity-5 stroke-1 group-hover:scale-110 transition-transform duration-500" />
      </div>

      {/* --- 4. CARTE QUALITÉ AIR (Style Organique) --- */}
      <div className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
         avgCo2 && avgCo2 > 1000 ? 'border-red-100 bg-red-50/30' : 'border-green-100 bg-white'
      }`}>
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-green-100 to-transparent opacity-50 rounded-bl-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className={`p-2 rounded-xl shadow-sm ${avgCo2 && avgCo2 > 1000 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <Wind className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Qualité de l'air</h3>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-black tracking-tight ${avgCo2 && avgCo2 > 1000 ? 'text-red-700' : 'text-slate-800'}`}>
                {avgCo2 !== null ? avgCo2 : '-'}
            </span>
            <span className={`text-sm font-bold uppercase ${avgCo2 && avgCo2 > 1000 ? 'text-red-500' : 'text-green-500'}`}>{co2Unit}</span>
          </div>
          <p className={`mt-2 text-sm font-medium ${avgCo2 && avgCo2 > 1000 ? 'text-red-500' : 'text-green-600'}`}>
            {avgCo2 && avgCo2 > 1000 ? 'Attention : Aérez la pièce !' : 'Air sain'}
          </p>
        </div>
        <Wind className="absolute right-4 bottom-4 h-20 w-20 text-green-500 opacity-5 stroke-1 -translate-x-2 group-hover:translate-x-0 transition-transform duration-500" />
      </div>

    </div>
  );
}