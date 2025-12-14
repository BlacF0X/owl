'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TemperatureCircle from '@/components/TemperatureCircle';
import DashboardViewButtons, { ViewMode } from '@/components/TemperatureViewButtons';
import AlertLog from '@/components/TemperatureAlertLog';

import dynamic from 'next/dynamic';

const TemperatureDayChart = dynamic(() => import('@/components/TemperatureDayChart'), {
  loading: () => (
    <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
      Chargement...
    </div>
  ),
  ssr: false,
});

const TemperatureComparisonChart = dynamic(
  () => import('@/components/TemperatureComparisonChart'),
  {
    loading: () => (
      <div className="h-[500px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
    ),
    ssr: false,
  }
);

// --- Types ---
export interface TemperatureSensor {
  sensor_id: string;
  name: string;
  displayValue: string;
  hub_id?: string;
  hub?: {
    hub_id: string;
    name: string;
  };
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

interface HubSummary {
  hub_id: string;
  hub_name: string;
  sensor_count: number;
  current_temp: number;
  avg_temp_7d: number;
  max_temp_7d: number;
  min_temp_7d: number;
  chartData24h: ChartDataPoint[];
  chartData7dAvg: ChartDataPoint[];
  chartData7dMax: ChartDataPoint[];
  chartData7dMin: ChartDataPoint[];
}

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

// --- Composant Carte Hub ---
const HubCard = ({ hub, viewMode }: { hub: HubSummary; viewMode: ViewMode }) => {
  let temperature = hub.avg_temp_7d;
  let chartData = hub.chartData7dAvg;
  let subtitle = 'Moyenne 7 jours';

  if (viewMode === 'current') {
    temperature = hub.current_temp;
    chartData = hub.chartData24h;
    subtitle = 'Température actuelle (24h)';
  } else if (viewMode === 'max') {
    temperature = hub.max_temp_7d;
    chartData = hub.chartData7dMax;
    subtitle = 'Maximum 7 jours';
  } else if (viewMode === 'min') {
    temperature = hub.min_temp_7d;
    chartData = hub.chartData7dMin;
    subtitle = 'Minimum 7 jours';
  } else if (viewMode === 'avg') {
    temperature = hub.avg_temp_7d;
    chartData = hub.chartData7dAvg;
    subtitle = 'Moyenne 7 jours';
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8">
      <div className="w-full lg:w-auto lg:min-w-[300px] flex justify-center shrink-0">
        <TemperatureCircle
          sensorName={hub.hub_name}
          temperature={temperature}
          min={15}
          max={30}
          subtitle={subtitle}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2 h-[250px]">
          <TemperatureDayChart data={chartData} currentHour={null} />
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 min-w-[200px]">
          <p className="text-5xl font-extrabold text-blue-600">{hub.sensor_count}</p>
          <p className="text-sm font-semibold text-blue-800 mt-2">
            Capteur{hub.sensor_count > 1 ? 's' : ''} connecté{hub.sensor_count > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Composant Carte Individuelle (Capteur) ---
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

        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.warn(`❌ Échec 7j pour ${sensor.name}: ${res.status}`);
          setError('Données indisponibles');
          setLoading(false);
          return;
        }

        const rawData: HistoryItem[] = await res.json();

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
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">{sensor.name}</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <p className="text-xs text-slate-400 mt-1">
            Température actuelle : {sensor.displayValue}°C
          </p>
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

// --- Composant de vue Comparison ---
const ComparisonView = ({
  sensors,
  token,
}: {
  sensors: TemperatureSensor[];
  token: string | null;
}) => {
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [sensorsData, setSensorsData] = useState<
    Array<{ sensorName: string; data: (number | null)[] }>
  >([]);
  const [averageData, setAverageData] = useState<(number | null)[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        // Charger les données pour chaque capteur
        const allSensorsData = await Promise.all(
          sensors.map(async (sensor) => {
            try {
              const res = await fetch(
                `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (!res.ok) return null;

              const rawData: HistoryItem[] = await res.json();
              const sortedData = rawData.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );

              // Grouper par jour
              const tempsByDay = new Map<string, number[]>();
              sortedData.forEach((item) => {
                const d = new Date(item.timestamp);
                const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

                if (!tempsByDay.has(dayKey)) {
                  tempsByDay.set(dayKey, []);
                }

                const val = Number(item.value_num);
                if (!isNaN(val)) {
                  tempsByDay.get(dayKey)?.push(val);
                }
              });

              // Calculer la moyenne par jour
              const dayLabels: string[] = [];
              const dayAverages: number[] = [];

              tempsByDay.forEach((temps, dayKey) => {
                if (temps.length > 0) {
                  dayLabels.push(dayKey);
                  dayAverages.push(temps.reduce((a, b) => a + b, 0) / temps.length);
                }
              });

              return {
                sensorName: sensor.name,
                labels: dayLabels.slice(-7),
                data: dayAverages.slice(-7),
              };
            } catch (err) {
              console.warn(`Erreur pour ${sensor.name}:`, err);
              return null;
            }
          })
        );

        const validData = allSensorsData.filter(Boolean) as Array<{
          sensorName: string;
          labels: string[];
          data: number[];
        }>;

        if (validData.length === 0) {
          setLoading(false);
          return;
        }

        // Utiliser les labels du premier capteur
        const commonLabels = validData[0].labels;
        setLabels(commonLabels);

        // Préparer les données de chaque capteur
        const sensorsChartData = validData.map((sensor) => ({
          sensorName: sensor.sensorName,
          data: sensor.data as (number | null)[],
        }));

        // Calculer la moyenne globale pour chaque jour
        const avgByDay: (number | null)[] = commonLabels.map((_, index) => {
          const values = validData.map((sensor) => sensor.data[index]).filter((v) => v != null);
          if (values.length === 0) return null;
          return values.reduce((a, b) => a + b, 0) / values.length;
        });

        setSensorsData(sensorsChartData);
        setAverageData(avgByDay);
      } catch (err) {
        console.error('Erreur chargement comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sensors, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
        Chargement de la comparaison...
      </div>
    );
  }

  return (
    <TemperatureComparisonChart
      labels={labels}
      sensorsData={sensorsData}
      averageData={averageData}
    />
  );
};

// --- Composant Principal ---
export default function TemperatureDashboard({ initialSensors, token }: Props) {
  const searchParams = useSearchParams();
  const hubId = searchParams?.get('hubId');

  const [viewMode, setViewMode] = useState<ViewMode>('current');

  // États pour le mode "Tous les hubs"
  const [hubSummaries, setHubSummaries] = useState<HubSummary[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubsError, setHubsError] = useState<string | null>(null);

  // Charger les stats par hub UNIQUEMENT si on est en mode "Tous les hubs" (pas de hubId)
  useEffect(() => {
    if (!hubId && token) {
      const loadHubSummaries = async () => {
        setHubsLoading(true);
        setHubsError(null);

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

          // Grouper les capteurs par hub
          const hubMap = new Map<string, TemperatureSensor[]>();

          initialSensors.forEach((sensor) => {
            const hId = sensor.hub?.hub_id || sensor.hub_id || 'unknown';
            if (!hubMap.has(hId)) {
              hubMap.set(hId, []);
            }
            hubMap.get(hId)?.push(sensor);
          });

          // Charger les données pour chaque hub
          const hubPromises = Array.from(hubMap.entries()).map(async ([hId, sensors]) => {
            try {
              const hubName = sensors[0]?.hub?.name || `Hub ${hId.slice(0, 8)}`;
              const sensorCount = sensors.length;

              // Charger les données de tous les capteurs du hub
              const sensorDataPromises = sensors.map(async (sensor) => {
                try {
                  const res = await fetch(
                    `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (!res.ok) return null;

                  const rawData: HistoryItem[] = await res.json();
                  return rawData;
                } catch (err) {
                  console.warn(`Erreur capteur ${sensor.name}:`, err);
                  return null;
                }
              });

              const allSensorData = await Promise.all(sensorDataPromises);
              const validData = allSensorData.filter(Boolean).flat() as HistoryItem[];

              if (validData.length === 0) {
                return {
                  hub_id: hId,
                  hub_name: hubName,
                  sensor_count: sensorCount,
                  current_temp: 0,
                  avg_temp_7d: 0,
                  max_temp_7d: 0,
                  min_temp_7d: 0,
                  chartData24h: [],
                  chartData7dAvg: [],
                  chartData7dMax: [],
                  chartData7dMin: [],
                };
              }

              // Trier par timestamp
              const sortedData = validData.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );

              const lastDataPoint = sortedData[sortedData.length - 1];
              const referenceDate = new Date(lastDataPoint.timestamp);

              // === CALCUL TEMPS RÉEL (24h) ===
              const refHour = referenceDate.getHours();
              const chartData24h: ChartDataPoint[] = [];

              for (let hour = 0; hour <= 23; hour++) {
                const hourLabel = `${hour.toString().padStart(2, '0')}h`;

                if (hour > refHour) {
                  chartData24h.push({ label: hourLabel, value: null });
                  continue;
                }

                const hourData = sortedData.filter((d) => {
                  const dTime = new Date(d.timestamp);
                  return (
                    dTime.getDate() === referenceDate.getDate() &&
                    dTime.getMonth() === referenceDate.getMonth() &&
                    dTime.getHours() === hour
                  );
                });

                if (hourData.length > 0) {
                  const avgHour =
                    hourData.reduce((sum, d) => sum + Number(d.value_num), 0) / hourData.length;
                  chartData24h.push({ label: hourLabel, value: avgHour });
                } else {
                  const prev =
                    chartData24h.length > 0 ? chartData24h[chartData24h.length - 1].value : null;
                  chartData24h.push({ label: hourLabel, value: prev });
                }
              }

              // Température actuelle = moyenne de la dernière heure
              const lastHourData = sortedData.filter((d) => {
                const dTime = new Date(d.timestamp);
                return (
                  dTime.getDate() === referenceDate.getDate() &&
                  dTime.getMonth() === referenceDate.getMonth() &&
                  dTime.getHours() === refHour
                );
              });
              const currentTemp =
                lastHourData.length > 0
                  ? lastHourData.reduce((sum, d) => sum + Number(d.value_num), 0) /
                    lastHourData.length
                  : 0;

              // === CALCUL PAR JOUR (7j) ===
              const tempsByDay = new Map<string, number[]>();
              const dayKeysInOrder = new Set<string>();

              sortedData.forEach((item) => {
                const d = new Date(item.timestamp);
                const dayKey = d.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                });

                if (!tempsByDay.has(dayKey)) {
                  tempsByDay.set(dayKey, []);
                  dayKeysInOrder.add(dayKey);
                }

                const val = Number(item.value_num);
                if (!isNaN(val)) {
                  tempsByDay.get(dayKey)?.push(val);
                }
              });

              // Calculer MAX, MIN, AVG par jour
              const chartData7dMax: ChartDataPoint[] = [];
              const chartData7dMin: ChartDataPoint[] = [];
              const chartData7dAvg: ChartDataPoint[] = [];

              let totalAvg = 0;
              let totalMax = -Infinity;
              let totalMin = Infinity;
              let dayCount = 0;

              dayKeysInOrder.forEach((dayKey) => {
                const temps = tempsByDay.get(dayKey);
                if (temps && temps.length > 0) {
                  const max = Math.max(...temps);
                  const min = Math.min(...temps);
                  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

                  chartData7dMax.push({ label: dayKey, value: max });
                  chartData7dMin.push({ label: dayKey, value: min });
                  chartData7dAvg.push({ label: dayKey, value: avg });

                  totalAvg += avg;
                  totalMax = Math.max(totalMax, max);
                  totalMin = Math.min(totalMin, min);
                  dayCount++;
                }
              });

              const last7DaysMax = chartData7dMax.slice(-7);
              const last7DaysMin = chartData7dMin.slice(-7);
              const last7DaysAvg = chartData7dAvg.slice(-7);

              const avg7d = dayCount > 0 ? totalAvg / dayCount : 0;
              const max7d = totalMax !== -Infinity ? totalMax : 0;
              const min7d = totalMin !== Infinity ? totalMin : 0;

              return {
                hub_id: hId,
                hub_name: hubName,
                sensor_count: sensorCount,
                current_temp: currentTemp,
                avg_temp_7d: avg7d,
                max_temp_7d: max7d,
                min_temp_7d: min7d,
                chartData24h: chartData24h,
                chartData7dAvg: last7DaysAvg,
                chartData7dMax: last7DaysMax,
                chartData7dMin: last7DaysMin,
              };
            } catch (err) {
              console.warn(`Erreur hub ${hId}:`, err);
              return null;
            }
          });

          const results = await Promise.all(hubPromises);
          const validHubs = results.filter(Boolean) as HubSummary[];

          setHubSummaries(validHubs);
        } catch (err) {
          console.warn('Erreur chargement hubs:', err);
          setHubsError('Erreur de chargement des hubs');
        } finally {
          setHubsLoading(false);
        }
      };

      loadHubSummaries();
    }
  }, [hubId, initialSensors, token]);

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  // MODE "Tous les hubs confondus" (pas de hubId)
  if (!hubId) {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons
          currentMode={viewMode}
          onChange={setViewMode}
          showComparison={false}
        />

        {hubsLoading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500">Chargement des données des hubs...</p>
          </div>
        )}

        {hubsError && (
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center text-center">
            <div>
              <div className="text-red-500 mb-2">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-800">{hubsError}</p>
            </div>
          </div>
        )}

        {!hubsLoading && !hubsError && hubSummaries.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-slate-500">Aucun hub trouvé.</p>
          </div>
        )}

        {!hubsLoading &&
          !hubsError &&
          hubSummaries.map((hub) => <HubCard key={hub.hub_id} hub={hub} viewMode={viewMode} />)}
      </div>
    );
  }

  // MODE COMPARISON (Hub spécifique)
  if (viewMode === 'comparison') {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison={true} />

        <div className="bg-white rounded-xl shadow-md p-6 w-full animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Comparaison des capteurs (7 derniers jours)
          </h3>
          <div className="w-full h-[500px]">
            <ComparisonView sensors={initialSensors} token={token} />
          </div>
        </div>

        <AlertLog sensors={initialSensors} token={token} />
      </div>
    );
  }

  // MODE "Hub spécifique" (hubId présent) → Afficher les cartes par capteur
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison={true} />

      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} viewMode={viewMode} />
      ))}

      <AlertLog sensors={initialSensors} token={token} />
    </div>
  );
}
