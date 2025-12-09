'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square } from 'lucide-react';

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

  // Compte des capteurs par type pour info
  const countByType = (key: string) => sensors.filter(s => s.type.type_key === key).length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* 1. Bloc Fenêtres */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Sécurité</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Fenêtres</h3>
          </div>
          <div className={`rounded-full p-2 ${openWindowsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <Square className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${openWindowsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {openWindowsCount}
                </span>
                <span className="text-sm font-medium text-slate-500">ouvertes</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Sur {countByType('window')} capteurs installés</p>
        </div>
        {/* Barre décorative en bas */}
        <div className={`absolute bottom-0 left-0 h-1 w-full ${openWindowsCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
      </div>

      {/* 2. Bloc Température */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Confort</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Température</h3>
          </div>
          <div className="rounded-full bg-orange-100 p-2 text-orange-600">
            <Thermometer className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                    {avgTemp !== null ? avgTemp : '-'}
                </span>
                <span className="text-lg font-medium text-slate-500">°C</span>
            </div>
             <p className="mt-2 text-xs text-slate-400">Moyenne sur {countByType('temperature')} zones</p>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500" />
      </div>

      {/* 3. Bloc Humidité */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Air ambiant</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Humidité</h3>
          </div>
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Droplets className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                    {avgHumidity !== null ? avgHumidity : '-'}
                </span>
                <span className="text-lg font-medium text-slate-500">%</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Moyenne sur {countByType('humidity')} zones</p>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500" />
      </div>

      {/* 4. Bloc Qualité d'Air */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Santé</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Qualité de l'air</h3>
          </div>
          <div className={`rounded-full p-2 ${avgCo2 && avgCo2 > 1000 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <Wind className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
             <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${avgCo2 && avgCo2 > 1000 ? 'text-red-600' : 'text-slate-900'}`}>
                    {avgCo2 !== null ? avgCo2 : '-'}
                </span>
                <span className="text-lg font-medium text-slate-500">{co2Unit}</span>
            </div>
             <p className="mt-2 text-xs text-slate-400">Moyenne sur {countByType('air_quality')} zones</p>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full ${avgCo2 && avgCo2 > 1000 ? 'bg-red-500' : 'bg-green-500'}`} />
      </div>
    </div>
  );
}