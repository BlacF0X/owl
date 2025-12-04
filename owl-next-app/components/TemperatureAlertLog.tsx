'use client';

import React, { useEffect, useState } from 'react';

// --- Types ---
interface AlertItem {
  id: string;
  sensorName: string;
  value: number;
  timestamp: Date;
  type: 'high' | 'low';
}

interface Props {
  sensors: { sensor_id: string; name: string }[];
  token: string | null;
}

const AlertLog: React.FC<Props> = ({ sensors, token }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Seuils définis comme dans TemperatureCircle
  const MIN_THRESHOLD = 19;
  const MAX_THRESHOLD = 25;

  useEffect(() => {
    if (!token || sensors.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAllAlerts = async () => {
      setLoading(true);
      const allAlerts: AlertItem[] = [];
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        // On récupère les données pour chaque capteur en parallèle
        const promises = sensors.map(async (sensor) => {
          try {
            const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;

            const data = await res.json();
            
            // Filtrage des anomalies
            data.forEach((reading: { value_num: number | string; timestamp: string }) => {
              const val = Number(reading.value_num);
              if (isNaN(val)) return;

              if (val < MIN_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensor_id}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'low'
                });
              } else if (val > MAX_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensor_id}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'high'
                });
              }
            });
          } catch (err) {
            console.error(`Erreur alertes ${sensor.name}`, err);
          }
        });

        await Promise.all(promises);

        // Tri : Du plus récent au plus ancien
        allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // On garde par exemple les 20 dernières alertes pour pas spammer
        setAlerts(allAlerts.slice(0, 50)); 

      } catch (err) {
        console.error("Erreur globale alertes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAlerts();
  }, [sensors, token]);

  if (loading) return <div className="p-4 text-center text-slate-400 text-sm">Analyse des alertes en cours...</div>;
  if (alerts.length === 0) return null; // Rien à afficher si tout va bien

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 mt-8 border border-red-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Journal des Alertes (7 jours)
      </h3>
      
      <div className="overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <li key={alert.id} className="py-3 flex justify-between items-center hover:bg-slate-50 transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${alert.type === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{alert.sensorName}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {alert.timestamp.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                alert.type === 'high' 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {alert.value.toFixed(1)}°C
                <span className="ml-1 text-xs opacity-75">
                  {alert.type === 'high' ? '(Trop chaud)' : '(Trop froid)'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlertLog;
