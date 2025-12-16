'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import type { TemperatureSensor } from './TemperatureSensorCard';

interface AlertItem {
  id: string;
  sensorName: string;
  value: number;
  timestamp: Date;
  type: 'high' | 'low';
}

interface Props {
  sensors: TemperatureSensor[];
}

type FilterType = 'all' | 'high' | 'low';

const ITEMS_PER_PAGE = 20; // Pagination

const TemperatureAlertLog: React.FC<Props> = ({ sensors }) => {
  const { getToken } = useAuth(); // ✅ Récupérer getToken
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle

  const MIN_THRESHOLD = 18;
  const MAX_THRESHOLD = 23;

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
    setCurrentPage(1); // Reset pagination
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    setCurrentPage(1); // Reset pagination
  };

  const formattedDateTitle = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const displayDate = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  useEffect(() => {
    if (sensors.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAlertsForDate = async () => {
      setLoading(true);

      // ✅ Récupérer un token frais
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const allAlerts: AlertItem[] = [];
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const targetDateStr = selectedDate.toISOString().split('T')[0];

      try {
        const promises = sensors.map(async (sensor) => {
          try {
            const url = `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d&refDate=${selectedDate.toISOString()}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;

            const data: Array<{ value: number | string; timestamp: string }> = await res.json();

            data.forEach((reading) => {
              const readingDateStr = new Date(reading.timestamp).toISOString().split('T')[0];

              if (readingDateStr !== targetDateStr) return;

              const val = Number(reading.value);
              if (isNaN(val)) return;

              if (val < MIN_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensor_id}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'low',
                });
              } else if (val > MAX_THRESHOLD) {
                allAlerts.push({
                  id: `${sensor.sensor_id}-${reading.timestamp}`,
                  sensorName: sensor.name,
                  value: val,
                  timestamp: new Date(reading.timestamp),
                  type: 'high',
                });
              }
            });
          } catch {
            // Erreur ignorée
          }
        });

        await Promise.all(promises);

        allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setAlerts(allAlerts);
      } catch {
        // Erreur ignorée
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsForDate();
  }, [sensors, getToken, selectedDate]); // ✅ getToken dans les deps

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'all') return true;
    return alert.type === filterType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 mt-8 border border-red-100">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Journal des Alertes</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex-shrink-0"
            aria-label="Jour précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="w-64 text-center">
            <span className="text-sm font-medium text-slate-700">{displayDate}</span>
          </div>

          <button
            onClick={goToNextDay}
            disabled={selectedDate.toDateString() === new Date().toDateString()}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Jour suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => {
            setFilterType('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => {
            setFilterType('high');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'high'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Trop hautes (&gt;{MAX_THRESHOLD}°C)
        </button>
        <button
          onClick={() => {
            setFilterType('low');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'low'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Trop basses (&lt;{MIN_THRESHOLD}°C)
        </button>
      </div>

      {/* Liste des alertes */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-slate-500">Chargement des alertes...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>Aucune alerte pour cette journée</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {paginatedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                alert.type === 'high'
                  ? 'bg-red-50 border-l-4 border-red-500'
                  : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
            >
              <div>
                <p className="font-semibold text-slate-800">{alert.sensorName}</p>
                <p className="text-sm text-slate-600">
                  {alert.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-2xl font-bold ${
                    alert.type === 'high' ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  {alert.value.toFixed(1)}°C
                </p>
                <p className="text-xs text-slate-500">
                  {alert.type === 'high' ? 'Trop chaud' : 'Trop froid'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-sm text-slate-600">
            Page {currentPage} sur {totalPages} ({filteredAlerts.length} alerte
            {filteredAlerts.length > 1 ? 's' : ''})
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default TemperatureAlertLog;
