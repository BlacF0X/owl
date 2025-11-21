'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, History, BarChart3 } from 'lucide-react';
import { Sensor, SensorReading } from '@/src/types';
import { fetchFromApi } from '@/src/lib/apiClient';
import { useAuth } from '@clerk/nextjs';

interface SensorDetailsModalProps {
  sensor: Sensor;
  onClose: () => void;
  referenceDate?: Date;
}

export default function SensorDetailsModal({
  sensor,
  onClose,
  referenceDate,
}: SensorDetailsModalProps) {
  const { getToken } = useAuth();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des données au montage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getToken();

        // Construction de l'URL avec le paramètre refDate si nécessaire
        let url = `/api/sensors/${sensor.sensor_id}/readings?period=24h`;

        // En dev, si on a une date de ref, on l'ajoute
        if (process.env.NODE_ENV === 'development' && referenceDate) {
          url += `&refDate=${referenceDate.toISOString()}`;
        }

        const data = await fetchFromApi<SensorReading[]>(url, token);
        setReadings(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [sensor.sensor_id, getToken, referenceDate]);

  // Calcul des statistiques simples
  // Note : On considère "Open" comme value_bool === true
  const openEvents = readings.filter((r) => r.value_bool === true);
  const openCount = openEvents.length;

  // Formatage date
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b bg-slate-50 p-4">
          <h3 className="text-lg font-bold text-slate-900">{sensor.name}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">Erreur : {error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                  <BarChart3 className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                  <p className="text-2xl font-bold text-slate-800">{openCount}</p>
                  <p className="text-xs text-slate-500">Ouvertures (24h)</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                  <History className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                  <p className="text-2xl font-bold text-slate-800">
                    {readings.length > 0 ? formatTime(readings[0].timestamp) : '-'}
                  </p>
                  <p className="text-xs text-slate-500">Dernière activité</p>
                </div>
              </div>

              {/* Liste Historique */}
              <div>
                <h4 className="mb-3 font-semibold text-slate-800">Journal d'activité récent</h4>
                <div className="max-h-60 overflow-y-auto rounded-md border border-slate-100 pr-2">
                  {readings.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      Aucune activité récente.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {readings.map((reading) => (
                        <li
                          key={reading.reading_id}
                          className="flex items-center justify-between p-3 text-sm"
                        >
                          <span
                            className={`font-medium ${
                              reading.value_bool ? 'text-orange-600' : 'text-green-600'
                            }`}
                          >
                            {reading.value_bool ? 'Ouverte' : 'Fermée'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(reading.timestamp).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
