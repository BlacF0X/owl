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

type FilterType = 'all' | 'high' | 'low';

const TemperatureAlertLog: React.FC<Props> = ({ sensors, token }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<FilterType>('all');

  const MIN_THRESHOLD = 19;
  const MAX_THRESHOLD = 25;

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
      
      const dateStr = selectedDate.toISOString().split('T')[0];

      try {
        const promises = sensors.map(async (sensor) => {
          try {
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

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true;
    return alert.type === filterType;
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 mt-8 border border-red-100">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Journal des Alertes
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          
          {/* FILTRES */}
          <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterType('high')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'high' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'
              }`}
            >
              Trop hautes
            </button>
            <button
              onClick={() => setFilterType('low')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'low' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              Trop basses
            </button>
          </div>

          {/* SELECTEUR DE DATE FIXE */}
          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1 self-start sm:self-auto">
            <button 
              onClick={goToPreviousDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <span className="w-[200px] text-sm font-semibold text-slate-700 text-center truncate px-2">
              {displayDate}
            </span>
            
            <button 
              onClick={goToNextDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

        </div>
      </div>
      
      {/* LISTE */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Chargement des alertes...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          {filterType === 'all' 
            ? "Aucune alerte pour cette journée."
            : filterType === 'high' 
                ? "Aucune alerte de type 'Trop chaud' (> 25°C)." 
                : "Aucune alerte de type 'Trop froid' (< 19°C)."
          }
        </div>
      ) : (
        <div className="overflow-hidden">
          <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {filteredAlerts.map((alert) => (
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
