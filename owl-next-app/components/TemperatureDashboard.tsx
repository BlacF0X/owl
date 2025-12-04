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
  value: number | null; // Peut être null pour le futur
}

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

// --- Composant Carte Individuelle ---
const SensorCard = ({ sensor, token }: { sensor: TemperatureSensor; token: string | null }) => {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  // On stocke l'index (0-23) de l'heure considérée comme "Maintenant"
  const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // On demande une période large (7 jours)
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

          // 1. Tri chronologique
          const sortedData = rawData.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          // 2. Détection de la "Dernière Heure Connue" (Maintenant simulé)
          const lastDataPoint = sortedData[sortedData.length - 1];
          const referenceDate = new Date(lastDataPoint.timestamp);
          const refHour = referenceDate.getHours();

          // On sauvegarde cette heure pour tracer la ligne verticale
          setCurrentHourIndex(refHour);

          // 3. Construction des 24 points (00h à 23h)
          const chartPoints: ChartDataPoint[] = [];

          for (let hour = 0; hour <= 23; hour++) {
            const hourLabel = `${hour.toString().padStart(2, '0')}h`;

            // SI FUTUR : On arrête la courbe (null)
            if (hour > refHour) {
              chartPoints.push({ label: hourLabel, value: null });
              continue; // On passe à l'heure suivante
            }

            // SI PASSÉ OU PRÉSENT : On cherche la donnée
            const targetTime = new Date(referenceDate);
            targetTime.setHours(hour, 0, 0, 0);

            const match = sortedData.find((d) => {
              const dTime = new Date(d.timestamp);
              return dTime.getDate() === targetTime.getDate() && dTime.getHours() === hour;
            });

            if (match) {
              chartPoints.push({ label: hourLabel, value: match.value_num });
            } else {
              // Si trou dans le passé, on lisse avec la valeur précédente
              if (chartPoints.length > 0) {
                chartPoints.push({
                  label: hourLabel,
                  value: chartPoints[chartPoints.length - 1].value,
                });
              } else {
                // Cas initial (00h) sans donnée : on cherche la 1ère valeur dispo de la journée
                const firstVal =
                  sortedData.find(
                    (d) => new Date(d.timestamp).getDate() === referenceDate.getDate()
                  )?.value_num || 0;
                chartPoints.push({ label: hourLabel, value: firstVal });
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
        <TemperatureCircle sensorName={sensor.name} temperature={currentTemp} min={15} max={30} />
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
          // On passe l'heure actuelle au composant graphique
          <TemperatureDayChart data={history} currentHour={currentHourIndex} />
        )}
      </div>
    </div>
  );
};

// --- Composant Principal ---
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
