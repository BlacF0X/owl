'use client';

import React, { useEffect, useState } from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';
import TemperatureComparisonChart from '@/components/TemperatureComparisonChart';
import DashboardViewButtons, { ViewMode } from '@/components/TemperatureViewButtons';
import AlertLog from '@/components/TemperatureAlertLog';

// --- Types ---
export interface TemperatureSensor {
  sensor_id: string;
  name: string;
  displayValue: string;
  type: { unit: string };
}

interface HistoryItem {
  value_num: number | string;
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
const SensorCard = ({
  sensor,
  token,
  viewMode,
}: {
  sensor: TemperatureSensor;
  token: string | null;
  viewMode: ViewMode;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data24h, setData24h] = useState<ChartDataPoint[]>([]);
  const [data7dMax, setData7dMax] = useState<ChartDataPoint[]>([]);
  const [data7dMin, setData7dMin] = useState<ChartDataPoint[]>([]);
  const [data7dAvg, setData7dAvg] = useState<ChartDataPoint[]>([]);

  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [maxTempToday, setMaxTempToday] = useState<number | null>(null);
  const [minTempToday, setMinTempToday] = useState<number | null>(null);
  const [avgTempToday, setAvgTempToday] = useState<number | null>(null);
  const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        let rawData: HistoryItem[] = [];
        let res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=30d`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn(`Echec 30j, tentative 7j...`);
          res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (!res.ok) {
          console.warn(`Echec 7j, pas de donnees historiques`);
          setError(`Erreur de chargement (${res.status})`);
          setLoading(false);
          return;
        }

        rawData = await res.json();

        if (!rawData || rawData.length === 0) {
          console.warn(`Aucune donnee pour le capteur ${sensor.name}`);
          setError('Aucune donnee disponible');
          setLoading(false);
          return;
        }

        const sortedData = rawData.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const lastDataPoint = sortedData[sortedData.length - 1];
        const referenceDate = new Date(lastDataPoint.timestamp);
        const referenceDayKey = referenceDate.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
        });

        setCurrentTemp(parseFloat(sensor.displayValue) || 0);

        // 1. Temps Réel (24h)
        const refHour = referenceDate.getHours();
        setCurrentHourIndex(refHour);

        const chartPoints24h: ChartDataPoint[] = [];
        for (let hour = 0; hour <= 23; hour++) {
          const hourLabel = `${hour.toString().padStart(2, '0')}h`;

          if (hour > refHour) {
            chartPoints24h.push({ label: hourLabel, value: null });
            continue;
          }

          const match = sortedData.find((d) => {
            const dTime = new Date(d.timestamp);
            return (
              dTime.getDate() === referenceDate.getDate() &&
              dTime.getMonth() === referenceDate.getMonth() &&
              dTime.getHours() === hour
            );
          });

          if (match) {
            chartPoints24h.push({ label: hourLabel, value: Number(match.value_num) });
          } else {
            const prev =
              chartPoints24h.length > 0 ? chartPoints24h[chartPoints24h.length - 1].value : null;
            chartPoints24h.push({ label: hourLabel, value: prev });
          }
        }
        setData24h(chartPoints24h);

        // 2. Stats JOURNALIÈRES (7j)
        const tempsByDay = new Map<string, number[]>();
        const dayKeysInOrder = new Set<string>();

        sortedData.forEach((item) => {
          const d = new Date(item.timestamp);
          const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

          if (!tempsByDay.has(dayKey)) {
            tempsByDay.set(dayKey, []);
            dayKeysInOrder.add(dayKey);
          }

          const val = Number(item.value_num);
          if (!isNaN(val)) {
            tempsByDay.get(dayKey)?.push(val);
          }
        });

        const chartPointsMax: ChartDataPoint[] = [];
        const chartPointsMin: ChartDataPoint[] = [];
        const chartPointsAvg: ChartDataPoint[] = [];

        dayKeysInOrder.forEach((key) => {
          const temps = tempsByDay.get(key);
          if (temps && temps.length > 0) {
            const max = Math.max(...temps);
            const min = Math.min(...temps);
            const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
            chartPointsMax.push({ label: key, value: max });
            chartPointsMin.push({ label: key, value: min });
            chartPointsAvg.push({ label: key, value: avg });
          }
        });

        const sliceLast7 = (arr: ChartDataPoint[]) => arr.slice(-7);
        setData7dMax(sliceLast7(chartPointsMax));
        setData7dMin(sliceLast7(chartPointsMin));
        setData7dAvg(sliceLast7(chartPointsAvg));

        // 3. Stats du CERCLE
        const lastDayTemps = tempsByDay.get(referenceDayKey);
        if (lastDayTemps && lastDayTemps.length > 0) {
          setMaxTempToday(Math.max(...lastDayTemps));
          setMinTempToday(Math.min(...lastDayTemps));
          setAvgTempToday(lastDayTemps.reduce((a, b) => a + b, 0) / lastDayTemps.length);
        } else {
          setMaxTempToday(0);
          setMinTempToday(0);
          setAvgTempToday(0);
        }
      } catch (err) {
        console.warn(`Erreur historique ${sensor.name}:`, err);
        setError('Erreur de traitement des donnees');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [sensor.sensor_id, token, sensor.name, sensor.displayValue]);

  let dataForChart = data24h;
  let tempForCircle = currentTemp;
  let statusLabel = 'Température en temps réel';

  if (viewMode === 'max') {
    dataForChart = data7dMax;
    tempForCircle = maxTempToday ?? 0;
    statusLabel = 'Température maximale';
  } else if (viewMode === 'min') {
    dataForChart = data7dMin;
    tempForCircle = minTempToday ?? 0;
    statusLabel = 'Température minimale';
  } else if (viewMode === 'avg') {
    dataForChart = data7dAvg;
    tempForCircle = avgTempToday ?? 0;
    statusLabel = 'Température moyenne';
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center w-full h-[280px] animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="text-orange-500 mb-2">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">{sensor.name}</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <p className="text-xs text-slate-400 mt-1">Température actuelle : {sensor.displayValue}°C</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8">
      <div className="w-full lg:w-auto lg:min-w-[300px] flex justify-center shrink-0">
        <TemperatureCircle
          sensorName={sensor.name}
          temperature={tempForCircle}
          min={15}
          max={30}
          subtitle={statusLabel}
        />
      </div>
      <div className="w-full h-[250px] lg:h-[280px] pl-0 lg:pl-6 flex-1 max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
            Chargement...
          </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'comparison' && token) {
      const loadAllSensorsData = async () => {
        setComparisonLoading(true);
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

          const promises = initialSensors.map(async (sensor) => {
            try {
              let res = await fetch(
                `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=24h`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (!res.ok) {
                res = await fetch(
                  `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              }

              if (!res.ok) {
                console.warn(`Echec chargement comparaison: ${sensor.name}`);
                return null;
              }

              const rawData: HistoryItem[] = await res.json();
              const sortedData = rawData.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );

              if (sortedData.length === 0) return null;

              const lastDataPoint = sortedData[sortedData.length - 1];
              const referenceDate = new Date(lastDataPoint.timestamp);
              const refHour = referenceDate.getHours();

              const chartPoints: ChartDataPoint[] = [];
              for (let hour = 0; hour <= 23; hour++) {
                const hourLabel = `${hour.toString().padStart(2, '0')}h`;

                if (hour > refHour) {
                  chartPoints.push({ label: hourLabel, value: null });
                  continue;
                }

                const match = sortedData.find((d) => {
                  const dTime = new Date(d.timestamp);
                  return (
                    dTime.getDate() === referenceDate.getDate() &&
                    dTime.getMonth() === referenceDate.getMonth() &&
                    dTime.getHours() === hour
                  );
                });

                if (match) {
                  chartPoints.push({ label: hourLabel, value: Number(match.value_num) });
                } else {
                  const prev = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].value : null;
                  chartPoints.push({ label: hourLabel, value: prev });
                }
              }

              return {
                sensorName: sensor.name,
                data: chartPoints,
              };
            } catch (err) {
              console.warn(`Erreur capteur ${sensor.name}:`, err);
              return null;
            }
          });

          const results = await Promise.all(promises);
          setComparisonData(results.filter(Boolean));
        } catch (err) {
          console.warn('Erreur chargement comparaison:', err);
        } finally {
          setComparisonLoading(false);
        }
      };

      loadAllSensorsData();
    }
  }, [viewMode, initialSensors, token]);

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} />

      {viewMode === 'comparison' ? (
        <div className="bg-white rounded-xl shadow-md p-6 w-full h-[600px] animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            📊 Comparaison de tous les capteurs (24 dernières heures)
          </h2>
          <div className="w-full h-[500px]">
            <TemperatureComparisonChart
              sensorsData={comparisonData}
              loading={comparisonLoading}
            />
          </div>
        </div>
      ) : (
        initialSensors.map((sensor) => (
          <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} viewMode={viewMode} />
        ))
      )}

      <AlertLog sensors={initialSensors} token={token} />
    </div>
  );
}
