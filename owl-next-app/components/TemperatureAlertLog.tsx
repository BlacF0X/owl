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

const TemperatureAlertLog: React.FC<Props> = ({ sensors, token }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État pour la date sélectionnée (par défaut aujourd'hui)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const MIN_THRESHOLD = 19;
  const MAX_THRESHOLD = 25;

  // Fonctions de navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Formatage de la date pour l'affichage (ex: "Jeudi 20 Novembre")
  const formattedDateTitle = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const displayDate = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  useEffect(() => {
    if (!token || sensors.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAlertsForDate = async () => {
      setLoading(true);
      const allAlerts: AlertItem[] = [];
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Format YYYY-MM-DD pour l'API
      const dateStr = selectedDate.toISOString().split('T')[0];

      try {
        const promises = sensors.map(async (sensor) => {
          try {
            // Appel à l'API avec le filtre de date
            const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?date=${dateStr}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!res.ok) return;

            const data = await res.json();
            
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
        setAlerts(allAlerts); 

      } catch (err) {
        console.error("Erreur globale alertes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsForDate();
  }, [sensors, token, selectedDate]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 mt-8 border border-red-100">
      
      {/* HEADER : Titre + Sélecteur de date */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Journal des Alertes
        </h3>

        {/* Sélecteur de Date */}
        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
          <button 
            onClick={goToPreviousDay}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <span className="px-4 text-sm font-semibold text-slate-700 min-w-[160px] text-center">
            {displayDate}
          </span>
          
          <button 
            onClick={goToNextDay}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Chargement des alertes...</div>
      ) : alerts.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          <p>Aucune alerte de température pour cette journée.</p>
          <p className="text-xs mt-1">Tout est normal (entre {MIN_THRESHOLD}°C et {MAX_THRESHOLD}°C).</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {alerts.map((alert) => (
              <li key={alert.id} className="py-3 flex justify-between items-center hover:bg-slate-50 transition-colors px-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.type === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{alert.sensorName}</p>
                    <p className="text-xs text-slate-500">
                      {alert.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                  alert.type === 'high' 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  {alert.value.toFixed(1)}°C
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TemperatureAlertLog;
