'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, DoorOpen, DoorClosed } from 'lucide-react';
import Link from 'next/link';

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

  // --- LOGIQUE COULEURS (Inchangée) ---
  let tempColor = 'emerald'; 
  let tempLabel = 'Idéale';
  if (avgTemp !== null) {
    if (avgTemp < 18) { tempColor = 'blue'; tempLabel = 'Fraiche'; }
    else if (avgTemp > 23) { tempColor = 'red'; tempLabel = 'Chaude'; }
  }

  let co2Color = 'emerald'; 
  let co2Label = 'Excellente';
  if (avgCo2 !== null) {
    if (avgCo2 >= 800 && avgCo2 <= 1200) { co2Color = 'orange'; co2Label = 'Moyenne'; }
    else if (avgCo2 > 1200) { co2Color = 'red'; co2Label = 'Médiocre'; }
  }

  let humidityColor = 'emerald'; 
  let humidityLabel = 'Idéale';
  if (avgHumidity !== null) {
    if (avgHumidity >= 60 && avgHumidity <= 70) { humidityColor = 'orange'; humidityLabel = 'Élevée'; }
    else if (avgHumidity < 40 || avgHumidity > 70) { humidityColor = 'red'; humidityLabel = avgHumidity < 40 ? 'Trop sec' : 'Trop humide'; }
  }
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red': return {
        border: 'border-red-100', shadow: 'shadow-red-500/10', gradient: 'from-red-500 to-rose-500', 
        bgIcon: 'bg-red-50', textIcon: 'text-red-600', bgBadge: 'bg-red-100', textBadge: 'text-red-700', textValue: 'text-red-500'
      };
      case 'orange': return {
        border: 'border-orange-100', shadow: 'shadow-orange-500/10', gradient: 'from-orange-500 to-amber-500',
        bgIcon: 'bg-orange-50', textIcon: 'text-orange-600', bgBadge: 'bg-orange-100', textBadge: 'text-orange-700', textValue: 'text-orange-500'
      };
      case 'blue': return {
        border: 'border-blue-100', shadow: 'shadow-blue-500/10', gradient: 'from-blue-500 to-cyan-500',
        bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', bgBadge: 'bg-blue-100', textBadge: 'text-blue-700', textValue: 'text-blue-500'
      };
      case 'emerald': 
      default: return {
        border: 'border-emerald-100', shadow: 'shadow-emerald-500/10', gradient: 'from-emerald-500 to-green-500',
        bgIcon: 'bg-emerald-50', textIcon: 'text-emerald-600', bgBadge: 'bg-emerald-100', textBadge: 'text-emerald-700', textValue: 'text-emerald-500'
      };
    }
  };

  const tempStyles = getColorClasses(tempColor);
  const co2Styles = getColorClasses(co2Color);
  const humStyles = getColorClasses(humidityColor);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
      
      {/* --- 1. SÉCURITÉ -> Link to /dashboard/windows --- */}
      <Link href="/dashboard/windows">
        <div className={`flex flex-col group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
           openWindowsCount > 0 ? 'border-red-100 shadow-red-500/10' : 'border-emerald-100 shadow-emerald-500/10'
        }`}>
          <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${
              openWindowsCount > 0 ? 'from-red-500 to-rose-500' : 'from-emerald-500 to-green-500'
          }`} />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between">
               <div className={`rounded-2xl p-3 ${openWindowsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {openWindowsCount > 0 ? <DoorOpen className="h-8 w-8" /> : <DoorClosed className="h-8 w-8" />}
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
            <div className="flex-1 flex flex-col items-center justify-center py-6">
               <span className="text-7xl font-black tracking-tighter text-slate-800 leading-none">{openWindowsCount}</span>
               <p className="text-sm font-bold text-slate-400 uppercase mt-2">Fenêtres Ouvertes</p>
            </div>
          </div>
        </div>
      </Link>

      {/* --- 2. TEMPÉRATURE -> Link to /dashboard/temperatures-datas --- */}
      <Link href="/dashboard/temperatures-datas">
        <div className={`flex flex-col group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer ${tempStyles.border} ${tempStyles.shadow}`}>
           <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${tempStyles.gradient}`} />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between">
                 <div className={`rounded-2xl p-3 ${tempStyles.bgIcon} ${tempStyles.textIcon}`}>
                    <Thermometer className="h-8 w-8" />
                 </div>
                 <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Température</h3>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${tempStyles.bgBadge} ${tempStyles.textBadge}`}>
                       {tempLabel}
                    </span>
                 </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                 <div className="flex items-start justify-center gap-1">
                    <span className="text-7xl font-black tracking-tighter text-slate-800 leading-none">{avgTemp ?? '-'}</span>
                    <span className={`text-3xl font-bold mt-2 ${tempStyles.textValue}`}>°</span>
                 </div>
                 <p className="text-sm font-bold text-slate-400 uppercase mt-2">Globale</p>
              </div>
           </div>
        </div>
      </Link>

      {/* --- 3. HUMIDITÉ -> Link to /dashboard/humidity-sensors --- */}
      <Link href="/dashboard/humidity-sensors">
        <div className={`flex flex-col group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer ${humStyles.border} ${humStyles.shadow}`}>
           <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${humStyles.gradient}`} />

           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between">
                 <div className={`rounded-2xl p-3 ${humStyles.bgIcon} ${humStyles.textIcon}`}>
                    <Droplets className="h-8 w-8" />
                 </div>
                 <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Humidité</h3>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${humStyles.bgBadge} ${humStyles.textBadge}`}>
                       {humidityLabel}
                    </span>
                 </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                 <div className="flex items-start justify-center gap-1">
                    <span className="text-7xl font-black tracking-tighter text-slate-800 leading-none">{avgHumidity ?? '-'}</span>
                    <span className={`text-3xl font-bold mt-2 ${humStyles.textValue}`}>%</span>
                 </div>
                 <p className="text-sm font-bold text-slate-400 uppercase mt-2">Saturation</p>
              </div>
           </div>
        </div>
      </Link>

      {/* --- 4. CO2 -> Link to /dashboard/co2-sensors --- */}
      <Link href="/dashboard/co2-sensors">
        <div className={`flex flex-col group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer ${co2Styles.border} ${co2Styles.shadow}`}>
           <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${co2Styles.gradient}`} />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between">
                 <div className={`rounded-2xl p-3 ${co2Styles.bgIcon} ${co2Styles.textIcon}`}>
                    <Wind className="h-8 w-8" />
                 </div>
                 <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Qualité Air</h3>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${co2Styles.bgBadge} ${co2Styles.textBadge}`}>
                       {co2Label}
                    </span>
                 </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                 <span className="text-7xl font-black tracking-tighter text-slate-800 leading-none">
                    {avgCo2 ?? '-'}
                 </span>
                 <p className="text-sm font-bold text-slate-400 uppercase mt-2">{co2Unit}</p>
              </div>
           </div>
        </div>
      </Link>

    </div>
  );
}