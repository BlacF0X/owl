'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square, AlertTriangle, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
      
      {/* --- 1. SÉCURITÉ (FENÊTRES) --- */}
      <div className={`group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] ${
         openWindowsCount > 0 ? 'border-red-100 shadow-red-500/10' : 'border-emerald-100 shadow-emerald-500/10'
      }`}>
        <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${
            openWindowsCount > 0 ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-green-500'
        }`} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <div className={`rounded-2xl p-3 ${
                 openWindowsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
             }`}>
                <Square className="h-8 w-8" />
             </div>
             <div className="text-right">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Sécurité</h3>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                    openWindowsCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                   {openWindowsCount > 0 ? 'Attention' : 'Sécurisé'}
                </span>
             </div>
          </div>

          <div className="text-center py-4">
             <span className="text-7xl font-black tracking-tighter text-slate-800">
               {openWindowsCount}
             </span>
             <p className="text-sm font-bold text-slate-400 uppercase mt-1">Fenêtres Ouvertes</p>
          </div>
        </div>
      </div>

      {/* --- 2. TEMPÉRATURE --- */}
      <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border border-orange-100 shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02]">
         <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-orange-500 to-amber-500" />
         
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div className="rounded-2xl p-3 bg-orange-50 text-orange-600">
                  <Thermometer className="h-8 w-8" />
               </div>
               <div className="text-right">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Température</h3>
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded-md bg-orange-100 text-orange-700">
                     Moyenne
                  </span>
               </div>
            </div>

            <div className="text-center py-4">
               <div className="flex items-center justify-center gap-1">
                  <span className="text-7xl font-black tracking-tighter text-slate-800">{avgTemp ?? '-'}</span>
                  <span className="text-3xl font-bold text-orange-500 mb-6">°</span>
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase mt-1">Globale</p>
            </div>
         </div>
      </div>

      {/* --- 3. HUMIDITÉ --- */}
      <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border border-blue-100 shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02]">
         <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-blue-500 to-cyan-500" />

         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div className="rounded-2xl p-3 bg-blue-50 text-blue-600">
                  <Droplets className="h-8 w-8" />
               </div>
               <div className="text-right">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Humidité</h3>
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                     Moyenne
                  </span>
               </div>
            </div>

            <div className="text-center py-4">
               <div className="flex items-center justify-center gap-1">
                  <span className="text-7xl font-black tracking-tighter text-slate-800">{avgHumidity ?? '-'}</span>
                  <span className="text-3xl font-bold text-blue-500 mb-6">%</span>
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase mt-1">Saturation</p>
            </div>
         </div>
      </div>

      {/* --- 4. CO2 (Déjà validé, on garde le même style) --- */}
      <div className={`group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] ${
         avgCo2 && avgCo2 > 1000 ? 'border-red-100 shadow-red-500/10' : 'border-green-100 shadow-green-500/10'
      }`}>
         <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${avgCo2 && avgCo2 > 1000 ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500'}`} />
         
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div className={`rounded-2xl p-3 ${avgCo2 && avgCo2 > 1000 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  <Wind className="h-8 w-8" />
               </div>
               <div className="text-right">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Qualité Air</h3>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${avgCo2 && avgCo2 > 1000 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                     {avgCo2 && avgCo2 > 1000 ? 'Médiocre' : 'Excellente'}
                  </span>
               </div>
            </div>

            <div className="text-center py-4">
               <span className="text-7xl font-black tracking-tighter text-slate-800">
                  {avgCo2 ?? '-'}
               </span>
               <p className="text-sm font-bold text-slate-400 uppercase mt-1">{co2Unit}</p>
            </div>
         </div>
      </div>

    </div>
  );
}