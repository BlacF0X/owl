'use client';

import React, { useEffect, useState } from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';

// --- Types ---
export interface TemperatureSensor {
  sensor_id: string;
  name: string;
  displayValue: string;
  type: {
    unit: string;
  };
}

interface HistoryItem {
  value_num: number;
  timestamp: string;
}

interface ChartDataPoint {
  label: string;
  value: number | null;
}

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

// --- Composant Carte Individuelle ---
const SensorCard = ({ sensor, token, viewMode }: { sensor: TemperatureSensor; token: string | null; viewMode: 'current' | 'max' }) => {
  const [loading, setLoading] = useState(true);
  
  // États pour les deux jeux de données
  const [data24h, setData24h] = useState<ChartDataPoint[]>([]);
  const [data7dMax, setData7dMax] = useState<ChartDataPoint[]>([]);
  
  // États pour les valeurs du cercle
  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [maxTempToday, setMaxTempToday] = useState<number | null>(null);
  
  // État pour la ligne "Maintenant"
  const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        // On demande toujours 7 jours
        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('API fetch failed');
        
        const rawData: HistoryItem[] = await res.json();
        if (rawData.length === 0) return;

        // Tri chronologique
        const sortedData = rawData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const lastDataPoint = sortedData[sortedData.length - 1];
        const referenceDate = new Date(lastDataPoint.timestamp);
        
        setCurrentTemp(parseFloat(sensor.displayValue) || 0);

        // --- 1. Logique pour la vue 24h "Temps Réel" ---
        const refHour = referenceDate.getHours();
        setCurrentHourIndex(refHour);
        const chartPoints24h: ChartDataPoint[] = [];
        
        for (let hour = 0; hour <= 23; hour++) {
          const hourLabel = `${hour.toString().padStart(2, '0')}h`;
          
          // Si c'est le futur (par rapport à la dernière donnée), on arrête
          if (hour > refHour) {
            chartPoints24h.push({ label: hourLabel, value: null });
            continue;
          }
          
          // Recherche de la donnée précise
          const match = sortedData.find(d => {
            const dTime = new Date(d.timestamp);
            return dTime.getDate() === referenceDate.getDate() && dTime.getHours() === hour;
          });
          
          if (match) {
            chartPoints24h.push({ label: hourLabel, value: match.value_num });
          } else if (chartPoints24h.length > 0) {
            // Lissage avec valeur précédente
            chartPoints24h.push({ label: hourLabel, value: chartPoints24h[chartPoints24h.length - 1].value });
          } else {
            // Cas 00h vide : on prend la premiere valeur dispo du jour
            const firstVal = sortedData.find(d => new Date(d.timestamp).getDate() === referenceDate.getDate())?.value_num || 0;
            chartPoints24h.push({ label: hourLabel, value: firstVal });
          }
        }
        setData24h(chartPoints24h);

        // --- 2. Logique pour la vue 7j "Max" ---
        const tempsByDay = new Map<string, number[]>();
        sortedData.forEach(item => {
          const d = new Date(item.timestamp);
          const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }); // Ex: "Lun 20"
          if (!tempsByDay.has(dayKey)) tempsByDay.set(dayKey, []);
          tempsByDay.get(dayKey)?.push(item.value_num);
        });

        const chartPoints7d: ChartDataPoint[] = [];
        tempsByDay.forEach((temps, day) => {
          chartPoints7d.push({
            label: day,
            value: Math.max(...temps),
          });
        });
        setData7dMax(chartPoints7d);

        // Temp max du jour J pour le cercle
        const todayKeyStr = referenceDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        const todayTemps = tempsByDay.get(todayKeyStr) || [];
        if (todayTemps.length > 0) setMaxTempToday(Math.max(...todayTemps));

      } catch (err) {
        console.error(`Erreur historique ${sensor.name}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [sensor.sensor_id, token, sensor.name, sensor.displayValue]);

  const dataForChart = viewMode === 'current' ? data24h : data7dMax;
  const tempForCircle = viewMode === 'current' ? currentTemp : (maxTempToday ?? 0);
  const circleLabel = viewMode === 'current' ? sensor.name : `${sensor.name} (Max)`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center w-full md:w-3/4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        <TemperatureCircle
          sensorName={circleLabel}
          temperature={tempForCircle}
          min={15}
          max={30}
        />
      </div>
      <div className="w-full md:w-2/3 h-[250px] md:h-[200px] pl-0 md:pl-6">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">Chargement...</div>
        ) : (
          <TemperatureDayChart 
            data={dataForChart} 
            currentHour={viewMode === 'current' ? currentHourIndex : null} 
          />
        )}
      </div>
    </div>
  );
};

// --- Composant Principal ---
export default function TemperatureDashboard({ initialSensors, token }: Props) {
  const [viewMode, setViewMode] = useState<'current' | 'max'>('current');

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center w-full pb-10">
      {/* --- BOUTON SWITCH --- */}
      <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner mb-4">
        <button
          onClick={() => setViewMode('current')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            viewMode === 'current' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Temps Réel (24h)
        </button>
        <button
          onClick={() => setViewMode('max')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            viewMode === 'max' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Max Journalier (7j)
        </button>
      </div>

      {/* --- LISTE DES CAPTEURS --- */}
      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} viewMode={viewMode} />
      ))}
    </div>
  );
}
