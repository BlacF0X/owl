'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, DoorOpen, DoorClosed, Activity } from 'lucide-react';
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
  co2Unit,
}: Props) {
  // --- CALCUL DES NOMBRES DE CAPTEURS PAR TYPE ---
  const tempSensorCount = sensors.filter((s) => s.type.type_key === 'temperature').length;
  const humSensorCount = sensors.filter((s) => s.type.type_key === 'humidity').length;
  const co2SensorCount = sensors.filter((s) => s.type.type_key === 'air_quality').length;
  const winSensorCount = sensors.filter((s) => s.type.type_key === 'window').length;

  // --- LOGIQUE COULEURS & PROGRESSION ---

  // 1. Température (Echelle arbitraire : 0°C à 35°C pour la jauge)
  let tempColor = 'emerald';
  let tempLabel = 'Idéale';
  let tempPercent = 0;

  if (avgTemp !== null) {
    // Calcul pourcentage pour la barre (min 10%, max 100%)
    tempPercent = Math.min(Math.max((avgTemp / 35) * 100, 10), 100);

    if (avgTemp < 18) {
      tempColor = 'blue';
      tempLabel = 'Fraiche';
    } else if (avgTemp > 23) {
      tempColor = 'red';
      tempLabel = 'Chaude';
    }
  }

  // 2. CO2 (Echelle : 400ppm à 2000ppm)
  let co2Color = 'emerald';
  let co2Label = 'Excellente';
  let co2Percent = 0;

  if (avgCo2 !== null) {
    co2Percent = Math.min(Math.max((avgCo2 / 2000) * 100, 10), 100);

    if (avgCo2 >= 800 && avgCo2 <= 1200) {
      co2Color = 'orange';
      co2Label = 'Moyenne';
    } else if (avgCo2 > 1200) {
      co2Color = 'red';
      co2Label = 'Médiocre';
    }
  }

  // 3. Humidité (Echelle : 0% à 100%)
  let humidityColor = 'emerald';
  let humidityLabel = 'Idéale';
  const humidityPercent = avgHumidity || 0;

  if (avgHumidity !== null) {
    if (avgHumidity < 40 || avgHumidity > 60) {
      humidityColor = 'red';
      humidityLabel = avgHumidity < 40 ? 'Trop sec' : 'Trop humide';
    }
  }

  // Helper styles
  const getStyles = (color: string) => {
    switch (color) {
      case 'red':
        return {
          iconBg: 'bg-red-50',
          iconText: 'text-red-600',
          badgeBg: 'bg-red-50',
          badgeText: 'text-red-700',
          badgeRing: 'ring-red-600/20',
          hoverBorder: 'hover:border-red-200',
          valueText: 'text-slate-900',
          barColor: 'bg-red-500',
          barBg: 'bg-red-100',
        };
      case 'orange':
        return {
          iconBg: 'bg-orange-50',
          iconText: 'text-orange-600',
          badgeBg: 'bg-orange-50',
          badgeText: 'text-orange-700',
          badgeRing: 'ring-orange-600/20',
          hoverBorder: 'hover:border-orange-200',
          valueText: 'text-slate-900',
          barColor: 'bg-orange-500',
          barBg: 'bg-orange-100',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50',
          iconText: 'text-blue-600',
          badgeBg: 'bg-blue-50',
          badgeText: 'text-blue-700',
          badgeRing: 'ring-blue-600/20',
          hoverBorder: 'hover:border-blue-200',
          valueText: 'text-slate-900',
          barColor: 'bg-blue-500',
          barBg: 'bg-blue-100',
        };
      case 'emerald':
      default:
        return {
          iconBg: 'bg-emerald-50',
          iconText: 'text-emerald-600',
          badgeBg: 'bg-emerald-50',
          badgeText: 'text-emerald-700',
          badgeRing: 'ring-emerald-600/20',
          hoverBorder: 'hover:border-emerald-200',
          valueText: 'text-slate-900',
          barColor: 'bg-emerald-500',
          barBg: 'bg-emerald-100',
        };
    }
  };

  const tempStyles = getStyles(tempColor);
  const co2Styles = getStyles(co2Color);
  const humStyles = getStyles(humidityColor);
  const winStyles = getStyles(openWindowsCount > 0 ? 'red' : 'emerald');

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-6">
      {/* --- 1. SÉCURITÉ --- */}
      <Link href="/dashboard/windows">
        <div
          className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md ${winStyles.hoverBorder}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`rounded-lg p-2.5 transition-colors ${winStyles.iconBg} ${winStyles.iconText}`}
            >
              {openWindowsCount > 0 ? (
                <DoorOpen className="h-6 w-6" />
              ) : (
                <DoorClosed className="h-6 w-6" />
              )}
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${winStyles.badgeBg} ${winStyles.badgeText} ${winStyles.badgeRing}`}
            >
              {openWindowsCount > 0 ? 'Attention' : 'Sécurisé'}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Fenêtres Ouvertes</p>
            <p className={`text-4xl font-bold tracking-tight ${winStyles.valueText}`}>
              {openWindowsCount}
              <span className="text-lg font-normal text-slate-400 ml-2">/ {winSensorCount}</span>
            </p>
          </div>

          {/* Footer Securité: Liste ou message */}
          <div className="mt-6 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="h-3.5 w-3.5" />
              <span>{openWindowsCount === 0 ? 'Tout est verrouillé' : 'Vérifiez vos accès'}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* --- 2. TEMPÉRATURE --- */}
      <Link href="/dashboard/temperatures-datas">
        <div
          className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md ${tempStyles.hoverBorder}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`rounded-lg p-2.5 transition-colors ${tempStyles.iconBg} ${tempStyles.iconText}`}
            >
              <Thermometer className="h-6 w-6" />
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tempStyles.badgeBg} ${tempStyles.badgeText} ${tempStyles.badgeRing}`}
            >
              {tempLabel}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500 mb-1">Température Moyenne</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tight ${tempStyles.valueText}`}>
                {avgTemp ?? '-'}
              </span>
              <span className="text-xl font-medium text-slate-400">°C</span>
            </div>
          </div>

          {/* Barre de progression & Footer */}
          <div className="mt-auto">
            <div className={`h-1.5 w-full rounded-full ${tempStyles.barBg} mb-3 overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${tempStyles.barColor}`}
                style={{ width: `${tempPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Basé sur {tempSensorCount} capteurs</span>
              <span>Max 35°</span>
            </div>
          </div>
        </div>
      </Link>

      {/* --- 3. HUMIDITÉ --- */}
      <Link href="/dashboard/humidity-sensors">
        <div
          className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md ${humStyles.hoverBorder}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`rounded-lg p-2.5 transition-colors ${humStyles.iconBg} ${humStyles.iconText}`}
            >
              <Droplets className="h-6 w-6" />
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${humStyles.badgeBg} ${humStyles.badgeText} ${humStyles.badgeRing}`}
            >
              {humidityLabel}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500 mb-1">Humidité Moyenne</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tight ${humStyles.valueText}`}>
                {avgHumidity ?? '-'}
              </span>
              <span className="text-xl font-medium text-slate-400">%</span>
            </div>
          </div>

          {/* Barre de progression & Footer */}
          <div className="mt-auto">
            <div className={`h-1.5 w-full rounded-full ${humStyles.barBg} mb-3 overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${humStyles.barColor}`}
                style={{ width: `${humidityPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Basé sur {humSensorCount} capteurs</span>
              <span>Zone idéale 40-60%</span>
            </div>
          </div>
        </div>
      </Link>

      {/* --- 4. CO2 --- */}
      <Link href="/dashboard/co2-sensors">
        <div
          className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md ${co2Styles.hoverBorder}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`rounded-lg p-2.5 transition-colors ${co2Styles.iconBg} ${co2Styles.iconText}`}
            >
              <Wind className="h-6 w-6" />
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${co2Styles.badgeBg} ${co2Styles.badgeText} ${co2Styles.badgeRing}`}
            >
              {co2Label}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500 mb-1">Qualité de l'Air (CO2)</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tight ${co2Styles.valueText}`}>
                {avgCo2 ?? '-'}
              </span>
              <span className="text-lg font-medium text-slate-400">{co2Unit}</span>
            </div>
          </div>

          {/* Barre de progression & Footer */}
          <div className="mt-auto">
            <div className={`h-1.5 w-full rounded-full ${co2Styles.barBg} mb-3 overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${co2Styles.barColor}`}
                style={{ width: `${co2Percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Basé sur {co2SensorCount} capteurs</span>
              <span>Seuil critique 1200</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
