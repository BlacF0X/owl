'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  LayoutDashboard, // Icône plus générique que Home
  LineChart,
  AlertTriangle,
  Bell,
  Clock,
  BarChart2,
  MousePointerClick,
  Info,
} from 'lucide-react';

// --- Imports Chart.js ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Types ---
type RoomStatus = 'good' | 'medium' | 'bad';

interface SensorType {
  type_key: string;
  name: string;
  unit: string;
}

interface Sensor {
  sensor_id: string;
  hub_id: string;
  hub?: { name: string };
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: SensorType;
}

interface RoomData {
  id: string;
  name: string;
  value: number;
  status: RoomStatus;
}

interface AlertData {
  room: string;
  message: string;
  time: string;
}

interface EvolutionData {
  hour: string;
  height: number;
  ppm: number;
}

interface SensorHistoryResponse {
  sensor: { sensor_id: string; name: string; type: SensorType };
  history: Array<{ timestamp: string; value: number | boolean }>;
}

// --- Composants ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({
  icon: Icon,
  title,
  value,
}) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
    <Icon className="mb-3 h-8 w-8 text-slate-500" />
    <p className="text-base font-medium text-slate-600">{title}</p>
    <p className="mt-1 text-4xl font-bold text-slate-900">{value}</p>
  </div>
);

const getStatusStyles = (status: RoomStatus) => {
  switch (status) {
    case 'good':
      return {
        borderColor: 'border-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    case 'medium':
      return {
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    case 'bad':
      return { borderColor: 'border-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' };
  }
};

// Composant unifié pour afficher la liste des capteurs
interface SensorsGridProps {
  rooms: RoomData[];
  onTestHistory?: (id: string, name: string) => void;
  loadingHistory?: string | null;
  onSelectSensor: (id: string) => void;
  selectedId: string | null;
}

const SensorsGrid: React.FC<SensorsGridProps> = ({
  rooms,
  onTestHistory,
  loadingHistory,
  onSelectSensor,
  selectedId,
}) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 h-full">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-slate-100 rounded-lg">
        <LayoutDashboard className="h-6 w-6 text-slate-700" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800">Vue d'ensemble des capteurs</h2>
    </div>

    {rooms.length === 0 ? (
      <p className="text-slate-500 italic text-center py-12">Aucun capteur détecté.</p>
    ) : (
      // GRILLE RESPONSIVE : 1 colonne mobile, 2 colonnes desktop
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const styles = getStatusStyles(room.status);
          const isSelected = selectedId === room.id;

          return (
            <div
              key={room.id}
              onClick={() => onSelectSensor(room.id)}
              className={`
                relative flex flex-col gap-2 rounded-lg p-4 border-l-4 transition-all cursor-pointer group
                ${styles.bgColor} ${styles.borderColor}
                ${isSelected ? 'ring-2 ring-blue-500 shadow-md bg-white' : 'hover:shadow-sm hover:brightness-[0.98]'}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base text-slate-800">{room.name}</p>
                  <p className={`text-xs font-medium ${styles.textColor} mt-0.5`}>
                    {room.status === 'good' && 'Air sain'}
                    {room.status === 'medium' && 'Aération conseillée'}
                    {room.status === 'bad' && 'Aération nécessaire'}
                  </p>
                </div>
                <p className={`text-xl font-bold ${styles.textColor}`}>{room.value} ppm</p>
              </div>

              {onTestHistory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestHistory(room.id, room.name);
                  }}
                  disabled={loadingHistory === room.id}
                  className={`mt-3 w-full px-3 py-1.5 rounded text-xs font-medium transition-colors z-10 border ${
                    loadingHistory === room.id
                      ? 'bg-slate-200 text-slate-500 border-transparent'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  {loadingHistory === room.id ? '...' : 'Voir historique'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const EvolutionChart: React.FC<{
  data: EvolutionData[];
  loading: boolean;
  titleSuffix?: string;
}> = ({ data, loading, titleSuffix }) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: (context) => `${context.raw} ppm`,
          title: (items) => `Heure : ${items[0].label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1500,
        grid: { color: '#f8fafc' },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
    animation: { duration: 600, easing: 'easeOutQuart' },
  };

  const chartData = {
    labels: data.map((d) => d.hour),
    datasets: [
      {
        label: 'CO2 (ppm)',
        data: data.map((d) => d.ppm),
        backgroundColor: data.map((d) => {
          if (d.ppm > 1200) return '#ef4444';
          if (d.ppm > 800) return '#f59e0b';
          return '#10b981';
        }),
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Évolution 24h</h2>
            {titleSuffix && (
              <p className="text-xs font-medium text-blue-500 mt-0.5">{titleSuffix}</p>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt; 800
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 800-1200
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &gt; 1200
          </div>
        </div>
      </div>
      <div className="relative flex-1 w-full min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-sm font-medium">Chargement...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <BarChart2 className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">Aucune donnée disponible</p>
          </div>
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </div>
  );
};

const AlertHistory: React.FC<{ alerts: AlertData[] }> = ({ alerts }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 h-full">
    <div className="flex items-center gap-3 mb-5">
      <Bell className="h-6 w-6 text-slate-700" />
      <h2 className="text-xl font-semibold text-slate-800">Historique des alertes</h2>
    </div>
    {alerts.length === 0 ? (
      <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm border border-dashed border-slate-100 rounded-lg">
        Aucune alerte active.
      </div>
    ) : (
      <ul className="space-y-3">
        {alerts.map((alert, index) => (
          <li
            key={index}
            className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0"
          >
            <p className="text-slate-800">
              <span className="font-semibold">{alert.room}</span> : {alert.message}
            </p>
            <p className="text-slate-400 text-xs">{alert.time}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  historyData,
  isLoading,
  error,
  onClose,
}) => {
  if (!isOpen) return null;
  const sensorName = historyData?.sensor?.name || 'Capteur';
  const sensorType = historyData?.sensor?.type?.name || '-';
  const sensorUnit = historyData?.sensor?.type?.unit || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Historique</h3>
            <p className="text-sm text-slate-500">{sensorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 flex-1">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-center border border-red-100">
              <strong>Erreur : </strong>
              {error}
            </div>
          )}
          {!isLoading &&
            !error &&
            (!historyData || !historyData.history || historyData.history.length === 0) && (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                Aucun historique.
              </div>
            )}
          {!isLoading &&
            !error &&
            historyData &&
            historyData.history &&
            historyData.history.length > 0 && (
              <div className="space-y-5">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-around text-sm text-blue-900 font-medium">
                  <div className="text-center">
                    <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Type</p>
                    <p>{sensorType}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Unité</p>
                    <p>{sensorUnit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Données</p>
                    <p>{historyData.history.length}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-5">Date & Heure</th>
                        <th className="py-3 px-5 text-right">Valeur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {historyData.history.map((reading, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-5 text-slate-600 font-mono text-xs">
                            {reading.timestamp
                              ? new Date(reading.timestamp).toLocaleString('fr-FR')
                              : '-'}
                          </td>
                          <td className="py-3 px-5 text-right font-bold text-slate-800">
                            {typeof reading.value === 'boolean'
                              ? reading.value
                                ? 'Ouvert'
                                : 'Fermé'
                              : `${reading.value} ${sensorUnit}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---

const CO2SensorsPage = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [average, setAverage] = useState(0);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]); // Liste UNIFIÉE

  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('N/A');

  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [selectedSensorName, setSelectedSensorName] = useState<string>('');

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<SensorHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistorySensorId, setLoadingHistorySensorId] = useState<string | null>(null);

  const handleSelectSensor = async (sensorId: string, sensorName?: string) => {
    if (sensorId === selectedSensorId) return;
    setSelectedSensorId(sensorId);
    if (sensorName) setSelectedSensorName(sensorName);
    setIsGraphLoading(true);
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/co2/${sensorId}/evolution`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur fetch évolution');
      const data: EvolutionData[] = await response.json();
      setEvolutionData(data);
    } catch (err) {
      console.error('Erreur graph CO2', err);
      setEvolutionData([]);
    } finally {
      setIsGraphLoading(false);
    }
  };

  const fetchSensorHistory = async (sensorId: string, sensorName: string) => {
    try {
      setLoadingHistorySensorId(sensorId);
      setHistoryLoading(true);
      setHistoryError(null);
      setHistoryData(null);
      setHistoryModalOpen(true);
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/sensors/${sensorId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
      const data: SensorHistoryResponse = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error('❌ Erreur historique:', error);
      setHistoryError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setHistoryLoading(false);
      setLoadingHistorySensorId(null);
    }
  };

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setError(null);
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/sensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
        const data: Sensor[] = await response.json();
        processSensorData(data);
      } catch (error) {
        console.error('Erreur capteurs:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    const processSensorData = (data: Sensor[]) => {
      const co2Sensors = data.filter(
        (sensor) =>
          (sensor.type.type_key === 'air_quality' || sensor.type.type_key === 'co2') &&
          !isNaN(Number(sensor.displayValue))
      );

      if (co2Sensors.length === 0) {
        setEvolutionData([]);
        return;
      }

      if (!selectedSensorId) {
        handleSelectSensor(co2Sensors[0].sensor_id, co2Sensors[0].name);
      }

      const values = co2Sensors.map((s) => Number(s.displayValue));
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      setAverage(Math.round(avg));

      const latestDate = co2Sensors
        .map((s) => s.state_changed_at && new Date(s.state_changed_at))
        .filter(Boolean)
        .sort((a, b) => b!.getTime() - a!.getTime())[0];
      setLastUpdate(latestDate ? latestDate.toLocaleTimeString('fr-FR') : 'N/A');

      // --- SIMPLIFICATION : UNE SEULE LISTE ---
      const roomsData: RoomData[] = co2Sensors.map((sensor) => ({
        id: sensor.sensor_id,
        name: sensor.name,
        value: Number(sensor.displayValue),
        status:
          Number(sensor.displayValue) < 800
            ? 'good'
            : Number(sensor.displayValue) < 1200
              ? 'medium'
              : 'bad',
      }));

      setAllRooms(roomsData);

      const generatedAlerts: AlertData[] = roomsData
        .filter((room) => room.status !== 'good')
        .map((room) => ({
          room: room.name,
          message: room.status === 'bad' ? `CO₂ > 1200 ppm` : `CO₂ > 800 ppm`,
          time: new Date().toLocaleTimeString('fr-FR'),
        }));
      setAlerts(generatedAlerts);
      setActiveAlerts(generatedAlerts.length);

      if (roomsData.length > 0) {
        const highestRoom = roomsData.reduce((prev, curr) =>
          prev.value > curr.value ? prev : curr
        );
        if (highestRoom.value > 1000) {
          setBannerAlert(
            `Pic de CO₂ détecté (${highestRoom.value} ppm) dans : ${highestRoom.name}.`
          );
        } else {
          setBannerAlert(null);
        }
      }
    };

    fetchSensors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  if (loading)
    return (
      <div className="flex justify-center min-h-screen items-center">
        <p className="text-xl text-slate-600">Chargement...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center min-h-screen items-center text-red-600">
        Erreur : {error}
      </div>
    );

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Qualité de l'Air</h1>
        <p className="mt-1 text-lg text-slate-500">Dashboard de surveillance en temps réel</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard icon={LineChart} title="Moyenne Globale" value={`${average} ppm`} />
        <StatCard icon={AlertTriangle} title="Zones à surveiller" value={activeAlerts} />
        <StatCard icon={Clock} title="Dernier relevé" value={lastUpdate} />
      </div>

      {/* GRILLE PRINCIPALE : Capteurs à gauche, Alertes à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des capteurs (2/3 de la largeur) */}
        <div className="lg:col-span-2">
          <SensorsGrid
            rooms={allRooms}
            onTestHistory={fetchSensorHistory}
            loadingHistory={loadingHistorySensorId}
            onSelectSensor={(id) => handleSelectSensor(id, allRooms.find((r) => r.id === id)?.name)}
            selectedId={selectedSensorId}
          />
        </div>

        {/* Alertes (1/3 de la largeur) */}
        <div className="lg:col-span-1">
          <AlertHistory alerts={alerts} />
        </div>
      </div>

      {/* GRAPHIQUE (Pleine largeur en bas) */}
      <div className="w-full h-[450px]">
        <EvolutionChart
          data={evolutionData}
          loading={isGraphLoading}
          titleSuffix={selectedSensorName ? `Capteur : ${selectedSensorName}` : ''}
        />
      </div>

      {bannerAlert && (
        <div className="fixed bottom-6 right-6 max-w-md rounded-xl bg-yellow-50 border border-yellow-200 p-4 shadow-lg z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Alerte Qualité d'Air</h4>
              <p className="text-sm text-yellow-700 mt-1">{bannerAlert}</p>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-yellow-500 hover:text-yellow-700 ml-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <HistoryModal
        isOpen={historyModalOpen}
        historyData={historyData}
        isLoading={historyLoading}
        error={historyError}
        onClose={() => setHistoryModalOpen(false)}
      />
    </div>
  );
};

export default CO2SensorsPage;
