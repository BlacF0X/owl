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
  value: number;
}

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

const SensorCard = ({ sensor, token }: { sensor: TemperatureSensor; token: string | null }) => {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const rawData: HistoryItem[] = await res.json();
          
          if (rawData.length === 0) {
            setHistory([]);
            setLoading(false);
            return;
          }

          // 1. On trie par date
          const sortedData = rawData.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          // 2. On détecte le "Jour de référence" basé sur la dernière donnée
          const lastDataPoint = sortedData[sortedData.length - 1];
          const referenceDate = new Date(lastDataPoint.timestamp); // ex: 20 Nov
          
          // 3. On prépare la courbe fixe de 00h à 23h pour ce jour là
          const chartPoints: ChartDataPoint[] = [];

          // Boucle fixe de 0 à 23
          for (let hour = 0; hour <= 23; hour++) {
            const targetTime = new Date(referenceDate);
            targetTime.setHours(hour, 0, 0, 0); // ex: 20 Nov à 00:00, 01:00...

            // Label formaté "00h", "01h"...
            const hourLabel = `${hour.toString().padStart(2, '0')}h`;

            // Recherche de la donnée correspondante (même jour, même heure)
            const match = sortedData.find(d => {
              const dTime = new Date(d.timestamp);
              return dTime.getDate() === targetTime.getDate() && 
                     dTime.getMonth() === targetTime.getMonth() &&
                     dTime.getHours() === hour;
            });

            if (match) {
              chartPoints.push({ label: hourLabel, value: match.value_num });
            } else {
              // Si pas de donnée pour cette heure (ex: futur ou trou), on essaie de lisser
              // Uniquement si l'heure cible est AVANT la dernière donnée reçue
              // (pour ne pas inventer le futur)
              if (targetTime <= referenceDate && chartPoints.length > 0) {
                 chartPoints.push({ 
                    label: hourLabel, 
                    value: chartPoints[chartPoints.length - 1].value 
                 });
              } else {
                 // Sinon on met null ou on ignore (Chart.js gère les trous ou on met 0)
                 // Pour garder l'axe fixe, il vaut mieux mettre une valeur par défaut ou null
                 // Ici je choisis de mettre la valeur précédente si dispo, sinon rien
                 if (chartPoints.length > 0) {
                     chartPoints.push({ label: hourLabel, value: chartPoints[chartPoints.length-1].value });
                 } else {
                     // Si c'est le tout début (00h) et qu'on a pas de donnée, on cherche la première dispo de la journée
                     // pour initialiser la courbe
                     const firstVal = sortedData.find(d => new Date(d.timestamp).getDate() === referenceDate.getDate())?.value_num || 0;
                     chartPoints.push({ label: hourLabel, value: firstVal });
                 }
              }
            }
          }

          setHistory(chartPoints);
        }
      } catch (err) {
        console.error(`Erreur historique ${sensor.name}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sensor.sensor_id, token, sensor.name]);

  const currentTemp = parseFloat(sensor.displayValue) || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center w-full md:w-3/4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        <TemperatureCircle
          sensorName={sensor.name}
          temperature={currentTemp}
          min={15}
          max={30}
        />
      </div>
      
      <div className="w-full md:w-2/3 h-[250px] md:h-[200px] pl-0 md:pl-6">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
            Chargement...
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm bg-slate-50 rounded-lg">
            Aucune donnée disponible
          </div>
        ) : (
          <TemperatureDayChart data={history} />
        )}
      </div>
    </div>
  );
};

export default function TemperatureDashboard({ initialSensors, token }: Props) {
  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center w-full pb-10">
      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} />
      ))}
    </div>
  );
}
