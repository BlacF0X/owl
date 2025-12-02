'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  LineChart,
  AlertTriangle,
  Bell,
  Clock,
  BarChart2,
  Home,
  Briefcase,
  Calendar,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download
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
  location: 'Maison' | 'Bureau';
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

interface HistoryModalProps {
  isOpen: boolean;
  historyData: SensorHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

// --- Styles Utilitaires ---
const getStatusStyles = (status: RoomStatus) => {
  switch (status) {
    case 'good':
      return {
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        indicator: 'bg-emerald-500'
      };
    case 'medium':
      return {
        borderColor: 'border-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        indicator: 'bg-amber-500'
      };
    case 'bad':
      return { 
        borderColor: 'border-rose-500', 
        textColor: 'text-rose-700', 
        bgColor: 'bg-rose-50', 
        indicator: 'bg-rose-500' 
      };
  }
};

// --- Composants ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({
  icon: Icon,
  title,
  value,
}) => (
  <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.01]">
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

const SensorCard: React.FC<{
  room: RoomData;
  isSelected: boolean;
  onSelect: () => void;
  onHistory: () => void;
  loadingHistory: boolean;
}> = ({ room, isSelected, onSelect, onHistory, loadingHistory }) => {
  const styles = getStatusStyles(room.status);

  return (
    <div
      onClick={onSelect}
      className={`
        group relative flex flex-col justify-between rounded-xl p-5 border transition-all cursor-pointer duration-200
        ${isSelected 
          ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30 shadow-md' 
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${styles.indicator} ${isSelected ? 'animate-pulse' : ''}`}></span>
          <h3 className="font-bold text-slate-800 truncate text-sm sm:text-base">{room.name}</h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles.borderColor} ${styles.bgColor} ${styles.textColor}`}>
          {room.value} ppm
        </span>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">État de l'air</p>
        <p className={`text-sm font-semibold ${styles.textColor}`}>
           {room.status === 'good' && '🌿 Excellent'}
           {room.status === 'medium' && '⚠️ Moyen'}
           {room.status === 'bad' && '🚨 Critique'}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onHistory();
        }}
        disabled={loadingHistory}
        className={`
          w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2
          ${loadingHistory 
            ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-sm'
          }
        `}
      >
        {loadingHistory ? (
          <div className="h-4 w-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <>
            <BarChart2 className="h-3.5 w-3.5" />
            Analyse détaillée
          </>
        )}
      </button>
    </div>
  );
};

const SensorSection: React.FC<{
  title: string;
  icon: React.ElementType;
  rooms: RoomData[];
  onSelectSensor: (id: string) => void;
  selectedId: string | null;
  onTestHistory: (id: string) => void;
  loadingHistoryId: string | null;
}> = ({ title, icon: Icon, rooms, onSelectSensor, selectedId, onTestHistory, loadingHistoryId }) => {
  if (rooms.length === 0) return null;

  return (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
           <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
          {rooms.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <SensorCard
            key={room.id}
            room={room}
            isSelected={selectedId === room.id}
            onSelect={() => onSelectSensor(room.id)}
            onHistory={() => onTestHistory(room.id)}
            loadingHistory={loadingHistoryId === room.id}
          />
        ))}
      </div>
    </div>
  );
};

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
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 13, weight: 'bold', family: 'Inter, sans-serif' },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.raw} ppm`,
          title: (items) => `Heure : ${items[0].label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2000,
        border: { display: false },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#64748b', padding: 10 },
      },
      x: {
        type: 'category',
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
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
          if (d.ppm > 1200) return '#f43f5e';
          if (d.ppm > 800) return '#f59e0b';
          return '#10b981';
        }),
        borderRadius: 4,
        barThickness: 'flex' as const,
        maxBarThickness: 32,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Évolution 24h</h2>
            {titleSuffix && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">{titleSuffix}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &lt; 800
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 800-1200
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> &gt; 1200
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full min-h-[320px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Chargement des données...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <BarChart2 className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Aucune donnée récente</p>
          </div>
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </div>
  );
};

const AlertHistory: React.FC<{ alerts: AlertData[] }> = ({ alerts }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 h-full flex flex-col">
    <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
      <Bell className="h-5 w-5 text-slate-500" />
      <h2 className="text-lg font-bold text-slate-800">Alertes actives</h2>
    </div>
    {alerts.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 min-h-[200px]">
        <Bell className="h-8 w-8 mb-2 opacity-20" />
        <span className="text-sm italic">Aucune alerte en cours.</span>
      </div>
    ) : (
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100/50 transition-colors hover:bg-red-100/50"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{alert.room}</p>
              <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
            </div>
            <p className="text-xs font-medium text-slate-400 whitespace-nowrap bg-white/50 px-1.5 py-0.5 rounded">{alert.time}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// --- COMPOSANT MODALE CORRIGÉ (V3) ---
const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  historyData,
  isLoading,
  error,
  onClose,
}) => {
  if (!isOpen) return null;

  const sensorName = historyData?.sensor?.name || 'Chargement...';
  const sensorUnit = historyData?.sensor?.type?.unit || 'ppm';
  
  // 1. CORRECTION : Conversion plus souple des données
  const allHistory = historyData?.history || [];
  
  // On extrait les valeurs numériques pour les stats, en convertissant si nécessaire
  const validValues = allHistory
    .map(h => Number(h.value)) // Force la conversion en nombre
    .filter(v => !isNaN(v));   // Garde seulement les vrais nombres

  const count = validValues.length;
  const hasData = allHistory.length > 0; // On vérifie s'il y a des lignes brutes, même non numériques

  // Stats de base
  const latest = count > 0 ? validValues[0] : 0;
  const previous = count > 1 ? validValues[1] : latest;
  const min = count > 0 ? Math.min(...validValues) : 0;
  const max = count > 0 ? Math.max(...validValues) : 0;
  const avg = count > 0 ? Math.round(validValues.reduce((a, b) => a + b, 0) / count) : 0;

  // Tendance
  const trend = latest - previous;
  const trendIcon = trend > 0 ? <ArrowUpRight className="h-4 w-4 text-red-500" /> : trend < 0 ? <ArrowDownRight className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4 text-slate-400" />;
  const trendText = trend > 0 ? 'En hausse' : trend < 0 ? 'En baisse' : 'Stable';
  const trendColor = trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-slate-500';

  // Répartition Qualité
  const goodCount = validValues.filter(v => v < 800).length;
  const mediumCount = validValues.filter(v => v >= 800 && v <= 1200).length;
  const badCount = validValues.filter(v => v > 1200).length;
  
  const goodPercent = count > 0 ? (goodCount / count) * 100 : 0;
  const mediumPercent = count > 0 ? (mediumCount / count) * 100 : 0;
  const badPercent = count > 0 ? (badCount / count) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden z-[100000]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Analyse détaillée</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
               <p className="text-sm font-medium text-slate-500">{sensorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-6">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-sm font-medium text-slate-500">Chargement...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100 mx-auto max-w-md">
              <p>Erreur : {error}</p>
            </div>
          )}

          {!isLoading && !error && !hasData && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Calendar className="h-12 w-12 mb-3 opacity-10" />
                <p className="font-medium">Aucune donnée brute reçue.</p>
             </div>
          )}

          {!isLoading && !error && hasData && (
            <div className="space-y-6">
              
              {/* STATS (Affichées uniquement si on a des nombres valides) */}
              {count > 0 && (
                <>
                  {/* 1. Cartes KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Moyenne</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{avg}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Minimum</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-emerald-600">{min}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Maximum</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-rose-600">{max}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tendance</p>
                      <div className="flex items-center gap-2">
                        {trendIcon}
                        <span className={`text-sm font-bold ${trendColor}`}>{trendText}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Analyse Répartition */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-800 mb-4">Qualité de l'air</h4>
                     <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
                        <div style={{ width: `${goodPercent}%` }} className="bg-emerald-500" title="Bonne"></div>
                        <div style={{ width: `${mediumPercent}%` }} className="bg-amber-500" title="Moyenne"></div>
                        <div style={{ width: `${badPercent}%` }} className="bg-rose-500" title="Critique"></div>
                     </div>
                     <div className="flex justify-between mt-3 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Excellente ({Math.round(goodPercent)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moyenne ({Math.round(mediumPercent)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critique ({Math.round(badPercent)}%)</div>
                     </div>
                  </div>
                </>
              )}

              {/* 3. Tableau Détails (Toujours affiché s'il y a des lignes) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Historique brut</h4>
                  <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
                    {allHistory.length} lignes
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-xs sticky top-0">
                        <tr>
                          <th className="px-6 py-3 w-1/2 bg-slate-50">Date & Heure</th>
                          <th className="px-6 py-3 w-1/2 text-right bg-slate-50">Valeur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {allHistory.map((reading, index) => {
                          // Conversion locale pour l'affichage
                          const valNum = Number(reading.value);
                          const isNum = !isNaN(valNum);
                          
                          return (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-3 text-slate-600 font-mono text-xs sm:text-sm">
                                {reading.timestamp 
                                  ? new Date(reading.timestamp).toLocaleString('fr-FR', {
                                      day: '2-digit', month: '2-digit', year: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    }) 
                                  : '-'}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                    isNum && valNum > 1200 ? 'bg-rose-100 text-rose-700' :
                                    isNum && valNum > 800 ? 'bg-amber-100 text-amber-700' :
                                    isNum ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'
                                  }`}>
                                  {isNum ? valNum : String(reading.value)} {isNum ? sensorUnit : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Fixe */}
        <div className="bg-white border-t border-slate-100 p-4 flex justify-end z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 hover:border-slate-400 font-medium transition-all shadow-sm"
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
  
  const [homeRooms, setHomeRooms] = useState<RoomData[]>([]);
  const [officeRooms, setOfficeRooms] = useState<RoomData[]>([]);

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

  // --- LOGIQUE GRAPHIQUE (24H GLISSANTES) ---
  const handleSelectSensor = async (sensorId: string, sensorName?: string) => {
    if (sensorId === selectedSensorId && evolutionData.length > 0) return;
    
    setSelectedSensorId(sensorId);
    if (sensorName) setSelectedSensorName(sensorName);
    setIsGraphLoading(true);
    
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/co2/${sensorId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Erreur de récupération');
      
      const data: SensorHistoryResponse = await response.json();
      
      // CALCUL DES 24 DERNIÈRES HEURES POUR LE GRAPHIQUE
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const chartData: EvolutionData[] = data.history
        .filter((item) => {
           const itemDate = new Date(item.timestamp);
           return typeof item.value === 'number' && itemDate >= twentyFourHoursAgo;
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((item) => {
          const dateObj = new Date(item.timestamp);
          return {
            hour: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            height: 0,
            ppm: item.value as number,
          };
        });

      setEvolutionData(chartData);
    } catch (err) {
      console.error('Erreur graph CO2', err);
      setEvolutionData([]);
    } finally {
      setIsGraphLoading(false);
    }
  };

  // --- LOGIQUE MODALE ---
  const fetchSensorHistory = async (sensorId: string) => {
    try {
      setLoadingHistorySensorId(sensorId);
      setHistoryLoading(true);
      setHistoryError(null);
      setHistoryData(null);
      setHistoryModalOpen(true);
      
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/co2/${sensorId}/history`, {
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
        .map((s) => (s.state_changed_at ? new Date(s.state_changed_at) : null))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      setLastUpdate(latestDate ? latestDate.toLocaleTimeString('fr-FR') : 'N/A');

      const processedRooms: RoomData[] = co2Sensors.map((sensor) => {
        const val = Number(sensor.displayValue);
        const isOffice = sensor.name.toLowerCase().includes('bureau') || sensor.hub?.name.toLowerCase().includes('bureau');

        return {
          id: sensor.sensor_id,
          name: sensor.name,
          value: val,
          status: val < 800 ? 'good' : val < 1200 ? 'medium' : 'bad',
          location: isOffice ? 'Bureau' : 'Maison', 
        };
      });

      setHomeRooms(processedRooms.filter(r => r.location === 'Maison'));
      setOfficeRooms(processedRooms.filter(r => r.location === 'Bureau'));

      const generatedAlerts: AlertData[] = processedRooms
        .filter((room) => room.status !== 'good')
        .map((room) => ({
          room: room.name,
          message: room.status === 'bad' ? `CO₂ critique (>1200)` : `Aération nécessaire`,
          time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
        }));
      setAlerts(generatedAlerts);
      setActiveAlerts(generatedAlerts.length);

      const criticalRoom = processedRooms.find(r => r.value > 1500);
      if (criticalRoom) {
        setBannerAlert(`Attention : Qualité d'air très dégradée dans ${criticalRoom.name} (${criticalRoom.value} ppm)`);
      } else {
        setBannerAlert(null);
      }
    };

    fetchSensors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center bg-slate-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
    
  if (error)
    return (
      <div className="flex justify-center h-screen items-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Une erreur est survenue</h3>
            <p className="text-slate-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Réessayer</button>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <LayoutDashboard className="h-7 w-7 text-blue-600" />
                Qualité de l'Air
            </h1>
            <p className="mt-1 text-slate-500">Surveillance en temps réel des niveaux de CO₂</p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={LineChart} title="Moyenne Globale" value={`${average} ppm`} />
        <StatCard icon={AlertTriangle} title="Zones à surveiller" value={activeAlerts} />
        <StatCard icon={Clock} title="Dernier relevé" value={lastUpdate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Section Maison */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <SensorSection 
                    title="Résidence"
                    icon={Home}
                    rooms={homeRooms}
                    onSelectSensor={(id) => handleSelectSensor(id, homeRooms.find(r => r.id === id)?.name)}
                    selectedId={selectedSensorId}
                    onTestHistory={fetchSensorHistory}
                    loadingHistoryId={loadingHistorySensorId}
                />
                {homeRooms.length === 0 && <p className="text-slate-400 italic text-sm px-2">Aucun capteur résidentiel détecté.</p>}
            </div>

            {/* Section Bureau */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <SensorSection 
                    title="Bureaux"
                    icon={Briefcase}
                    rooms={officeRooms}
                    onSelectSensor={(id) => handleSelectSensor(id, officeRooms.find(r => r.id === id)?.name)}
                    selectedId={selectedSensorId}
                    onTestHistory={fetchSensorHistory}
                    loadingHistoryId={loadingHistorySensorId}
                />
                {officeRooms.length === 0 && <p className="text-slate-400 italic text-sm px-2">Aucun capteur de bureau détecté.</p>}
            </div>

        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex-1 min-h-[300px]">
             <AlertHistory alerts={alerts} />
          </div>
        </div>
      </div>

      {/* GRAPHIQUE */}
      <div className="w-full h-[450px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <EvolutionChart
          data={evolutionData}
          loading={isGraphLoading}
          titleSuffix={selectedSensorName ? `Capteur : ${selectedSensorName}` : ''}
        />
      </div>

      {/* Notification flottante */}
      {bannerAlert && (
        <div className="fixed bottom-6 right-6 max-w-md w-full bg-white border-l-4 border-red-500 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-10 p-4 flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800">Alerte Critique</h4>
                <p className="text-sm text-slate-600 mt-1">{bannerAlert}</p>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
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
  