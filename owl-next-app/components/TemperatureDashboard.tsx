'use client';

import React, { useEffect, useState } from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';

// Types correspondants à ton API
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

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

// Carte individuelle qui gère son propre chargement d'historique
const SensorCard = ({ sensor, token }: { sensor: TemperatureSensor; token: string | null }) => {
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        // On utilise l'endpoint générique de lecture d'historique
        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=24h`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data: HistoryItem[] = await res.json();
          // Inversion pour l'ordre chronologique (gauche -> droite)
          const values = data.map(item => item.value_num).reverse();
          setHistory(values);
        }
      } catch (err) {
        console.error(`Erreur historique ${sensor.name}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sensor.sensor_id, token]);

  const currentTemp = parseFloat(sensor.displayValue) || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center w-full md:w-3/4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-full md:w-1/3 flex justify-center">
        <TemperatureCircle
          sensorName={sensor.name}
          temperature={currentTemp}
          min={15}
          max={30}
        />
      </div>
      <div className="w-full md:w-2/3 flex justify-center mt-6 md:mt-0 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center text-slate-400 text-sm">
            Chargement des données...
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
    <div className="flex flex-col gap-8 items-center w-full">
      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} />
      ))}
    </div>
  );
}
