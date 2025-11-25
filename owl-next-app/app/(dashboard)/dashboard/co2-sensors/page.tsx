'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Home,
  LineChart,
  AlertTriangle,
  Bell,
  Clock,
  BarChart2,
} from 'lucide-react';

// --- Types de données ---
type RoomStatus = 'good' | 'medium' | 'bad';

interface SensorType {
  type_key: string;
  name: string;
  unit: string;
}

interface Sensor {
  sensor_id: string;
  hub_id: string;
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: SensorType;
}

interface RoomData {
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
  sensor: {
    sensor_id: string;
    name: string;
    type: SensorType;
  };
  history: Array<{
    timestamp: string;
    value: number | boolean;
  }>;
}

// --- Composants ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({
  icon: Icon,
  title,
  value,
}) => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
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

interface RoomMapProps {
  rooms: RoomData[];
  onTestHistory?: (sensorId: string, sensorName: string) => void;
  sensors?: Sensor[];
  loadingHistory?: string | null;
}

const RoomMap: React.FC<RoomMapProps> = ({ rooms, onTestHistory, sensors, loadingHistory }) => (
  <div className="rounded-xl bg-white p-7 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <Home className="h-7 w-7 text-slate-700" />
      <h2 className="text-xl font-semibold text-slate-800">Carte de l'habitation</h2>
    </div>
    {rooms.length === 0 ? (
      <p className="text-slate-600">Aucun capteur CO₂ trouvé.</p>
    ) : (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {rooms.map((room) => {
          const styles = getStatusStyles(room.status);
          const sensor = sensors?.find((s) => s.name === room.name);

          return (
            <div
              key={room.name}
              className={`flex flex-col gap-3 rounded-lg p-5 ${styles.bgColor} border-l-4 ${styles.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg text-slate-800">{room.name}</p>
                  <p className={`text-sm font-medium ${styles.textColor}`}>
                    {room.status === 'good' && 'Air sain'}
                    {room.status === 'medium' && 'Aération conseillée'}
                    {room.status === 'bad' && 'Aération nécessaire'}
                  </p>
                </div>
                <p className={`text-2xl font-bold ${styles.textColor}`}>{room.value} ppm</p>
              </div>

              {sensor && onTestHistory && (
                <button
                  onClick={() => onTestHistory(sensor.sensor_id, sensor.name)}
                  disabled={loadingHistory === sensor.sensor_id}
                  className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                    loadingHistory === sensor.sensor_id
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {loadingHistory === sensor.sensor_id ? 'Chargement...' : 'Voir historique complet'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    )}
    <div className="mt-6 space-y-2 text-base text-slate-600">
      <p>
        <span className="text-green-500">●</span> &lt; 800 ppm: Air sain
      </p>
      <p>
        <span className="text-yellow-500">●</span> 800-1200 ppm: Aération conseillée
      </p>
      <p>
        <span className="text-red-500">●</span> &gt; 1200 ppm: Aération nécessaire
      </p>
    </div>
  </div>
);

const AlertHistory: React.FC<{ alerts: AlertData[] }> = ({ alerts }) => (
  <div className="rounded-xl bg-white p-7 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <Bell className="h-7 w-7 text-slate-700" />
      <h2 className="text-xl font-semibold text-slate-800">Historique des alertes</h2>
    </div>
    {alerts.length === 0 ? (
      <p className="text-slate-600">Aucune alerte active.</p>
    ) : (
      <ul className="mt-4 space-y-4">
        {alerts.map((alert, index) => (
          <li
            key={index}
            className="flex items-center justify-between text-base border-b border-slate-100 pb-3"
          >
            <p className="text-slate-800">
              {alert.room}: <span className="font-semibold">{alert.message}</span>
            </p>
            <p className="text-slate-500">{alert.time}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EvolutionChart: React.FC<{ data: EvolutionData[]; loading: boolean }> = ({ data, loading }) => {
  const yAxisLabels = ['1500', '1000', '500', '0'];

  return (
    <div className="rounded-xl bg-white p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <BarChart2 className="h-7 w-7 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-800">Évolution (dernières 24h)</h2>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-slate-500">
          Chargement du graphique...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-slate-500">
          Pas assez de données pour afficher le graphique.
        </div>
      ) : (
        <div className="flex pt-4">
          <div className="flex h-56 flex-col justify-between pr-4 text-right text-sm text-slate-500">
            {yAxisLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="relative w-full h-56 border-l-2 border-b-2 border-gray-200">
            {/* Lignes pointillées pour les paliers */}
            <div className="absolute top-0 h-px w-full border-t border-dashed border-gray-300"></div>
            <div className="absolute top-1/3 h-px w-full border-t border-dashed border-gray-300"></div>
            <div className="absolute top-2/3 h-px w-full border-t border-dashed border-gray-300"></div>

            <div className="flex h-full items-end justify-around px-1">
              {data.map(({ hour, height, ppm }) => (
                <div
                  key={hour}
                  className="group relative flex h-full w-full flex-col items-center justify-end text-sm"
                >
                  <div className="absolute bottom-full mb-2 scale-0 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 z-10">
                    <div className="whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-white shadow-lg">
                      {ppm} ppm
                    </div>
                    <div className="mx-auto -mt-1 h-2 w-2 rotate-45 bg-slate-800"></div>
                  </div>

                  <div
                    className={`w-3/5 rounded-t-md transition-colors ${
                      ppm > 1200 ? 'bg-red-500 group-hover:bg-red-600' : 
                      ppm > 800 ? 'bg-yellow-500 group-hover:bg-yellow-600' : 
                      'bg-blue-500 group-hover:bg-blue-600'
                    }`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="mt-2 text-xs text-slate-500">{hour}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal pour afficher l'historique
interface HistoryModalProps {
  isOpen: boolean;
  historyData: SensorHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, historyData, isLoading, error, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900">
            Historique : {historyData?.sensor.name}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">✕</button>
        </div>

        <div className="p-6">
          {isLoading && <p className="text-center text-slate-600">Chargement de l'historique...</p>}
          {error && <p className="text-center text-red-600">Erreur : {error}</p>}

          {historyData && !isLoading && (
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-600">Type : <span className="font-semibold">{historyData.sensor.type.name}</span></p>
                <p className="text-sm text-slate-600">Unité : <span className="font-semibold">{historyData.sensor.type.unit}</span></p>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-600 font-semibold">Timestamp</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-semibold">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.history.map((reading, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-800">{new Date(reading.timestamp).toLocaleString('fr-FR')}</td>
                      <td className="py-2 px-3 text-right text-slate-800 font-medium">
                        {typeof reading.value === 'boolean'
                          ? reading.value ? 'Ouvert' : 'Fermé'
                          : `${reading.value} ${historyData.sensor.type.unit}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400 font-medium">Fermer</button>
        </div>
      </div>
    </div>
  );
};

// --- Composant Principal ---

const CO2SensorsPage = () => {
  const { getToken } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données dérivées
  const [average, setAverage] = useState(0);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('N/A');

  // État pour le Graphique d'évolution (Nouveau)
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);

  // État pour le modal d'historique
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<SensorHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistorySensorId, setLoadingHistorySensorId] = useState<string | null>(null);

  // Fonction pour récupérer l'évolution (Nouveau)
  const fetchEvolutionData = async (sensorId: string) => {
    try {
      setIsGraphLoading(true);
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/co2/${sensorId}/evolution`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur fetch évolution');
      
      const data: EvolutionData[] = await response.json();
      setEvolutionData(data);
    } catch (err) {
      console.error("Erreur graph CO2", err);
    } finally {
      setIsGraphLoading(false);
    }
  };

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setError(null);
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        // Note: j'ai corrigé la route ici, c'est '/api/sensors' normalement
        const response = await fetch(`${apiUrl}/api/sensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

        const data: Sensor[] = await response.json();
        setSensors(data);
        processSensorData(data);
      } catch (error) {
        console.error('Erreur récupération capteurs:', error);
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
        setEvolutionData([]); // Reset graph si pas de capteur
        return;
      }

      // --- NOUVEAU : Charger le graphique pour le premier capteur CO2 trouvé ---
      // On le fait ici car on vient de confirmer qu'on a des capteurs
      const mainSensorId = co2Sensors[0].sensor_id;
      fetchEvolutionData(mainSensorId);

      // Calcul moyenne CO2
      const values = co2Sensors.map((s) => Number(s.displayValue));
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      setAverage(Math.round(avg));

      // Dernière mise à jour
      const latestDate = co2Sensors
        .map((s) => s.state_changed_at && new Date(s.state_changed_at))
        .filter(Boolean)
        .sort((a, b) => (b!.getTime() - a!.getTime()))[0];
      setLastUpdate(latestDate ? latestDate.toLocaleTimeString('fr-FR') : 'N/A');

      // Construction des rooms
      const roomsData: RoomData[] = co2Sensors.map((s) => ({
        name: s.name,
        value: Number(s.displayValue),
        status:
          Number(s.displayValue) < 800
            ? 'good'
            : Number(s.displayValue) < 1200
            ? 'medium'
            : 'bad',
      }));
      setRooms(roomsData);

      // Génération des alertes
      const generatedAlerts: AlertData[] = roomsData
        .filter((room) => room.status !== 'good')
        .map((room) => ({
          room: room.name,
          message: room.status === 'bad' ? `CO₂ > 1200 ppm` : `CO₂ > 800 ppm (surveillance)`,
          time: new Date().toLocaleTimeString('fr-FR'),
        }));
      setAlerts(generatedAlerts);
      setActiveAlerts(generatedAlerts.length);

      // Bannière d'alerte
      const highestRoom = roomsData.reduce(
        (prev, curr) => (prev.value > curr.value ? prev : curr),
        { name: '', value: 0, status: 'good' as RoomStatus }
      );
      if (highestRoom.value > 1000) {
        setBannerAlert(
          `Le taux de CO₂ dans ${highestRoom.name} dépasse 1000 ppm – pensez à aérer pendant 10 minutes.`
        );
      } else {
        setBannerAlert(null);
      }
    };

    fetchSensors();
  }, [getToken]);

  const fetchSensorHistory = async (sensorId: string, sensorName: string) => {
    try {
      setLoadingHistorySensorId(sensorId);
      setHistoryLoading(true);
      setHistoryError(null);
      setHistoryData(null);

      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/sensors/${sensorId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

      const data: SensorHistoryResponse = await response.json();
      setHistoryData(data);
      setHistoryModalOpen(true);
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      setHistoryError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setHistoryLoading(false);
      setLoadingHistorySensorId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-slate-600">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Erreur : {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard CO₂ - Système Owl</h1>
        <p className="mt-2 text-lg text-slate-600">
          Surveillance en temps réel de la qualité de l'air intérieur
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="col-span-1 space-y-10 lg:col-span-2">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <StatCard icon={LineChart} title="Moyenne CO₂" value={`${average} ppm`} />
            <StatCard icon={AlertTriangle} title="Alertes actives" value={activeAlerts} />
            <StatCard icon={Clock} title="Dernière mise à jour" value={lastUpdate} />
          </div>
          <RoomMap
            rooms={rooms}
            sensors={sensors}
            onTestHistory={fetchSensorHistory}
            loadingHistory={loadingHistorySensorId}
          />
          <AlertHistory alerts={alerts} />
        </div>

        <div className="col-span-1">
          {/* On passe maintenant les vraies données et l'état de chargement */}
          <EvolutionChart data={evolutionData} loading={isGraphLoading} />
        </div>
      </div>

      {bannerAlert && (
        <div className="rounded-xl bg-yellow-400 p-5 text-center text-lg font-semibold text-yellow-900 shadow-md">
          <p>{bannerAlert}</p>
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
