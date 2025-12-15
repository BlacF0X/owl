'use client';

import React, { useEffect, useState } from 'react';
import type { TemperatureSensor } from './TemperatureSensorCard';

// --- Types ---
interface AlertItem {
  id: string;
  sensorName: string;
  value: number;
  timestamp: Date;
  type: 'high' | 'low';
}

interface Props {
  sensors: TemperatureSensor[];
  token: string | null;
}

type FilterType = 'all' | 'high' | 'low';

const TemperatureAlertLog: React.FC<Props> = ({ sensors, token }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<FilterType>('all');

  const MIN_THRESHOLD = 18;
  const MAX_THRESHOLD = 23;

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
            const res = await fetch(`${API_URL}/api/sensors/${sensor.sensorid}/readings?date=${dateStr}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;

            const data = await res.json();
            data.forEach((reading: { value_num: number | string; timestamp: string }) => {
              const val = Number(reading.value_num);
              if (isNaN(val)) return;

              if (val < MIN_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensorid}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'low',
                });
              } else if (val > MAX_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensorid}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'high',
                });
              }
            });
          } catch (err) {
            console.error(`Erreur alertes ${sensor.name}:`, err);
          }
        });

        await Promise.all(promises);
        allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setAlerts(allAlerts);
      } catch (err) {
        console.error('Erreur globale alertes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsForDate();
  }, [sensors, token, selectedDate]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'all') return true;
    return alert.type === filterType;
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 mt-8 border border-red-100">
      {/* ... reste du JSX inchangé ... */}
    </div>
  );
};

export default TemperatureAlertLog;
