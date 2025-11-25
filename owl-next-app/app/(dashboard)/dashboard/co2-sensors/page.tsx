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
  Building2
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
  hub?: {
    name: string;
  };
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: SensorType;
}

interface RoomData {
  id: string;        // <-- Ajout critique pour éviter l'erreur 404
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
      return { borderColor: 'border-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50' };
    case 'medium':
      return { borderColor: 'border-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    case 'bad':
      return { borderColor: 'border-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' };
  }
};

interface RoomMapProps {
  title: string;
  icon: React.ElementType;
  rooms: RoomData[];
  onTestHistory?: (sensorId: string, sensorName: string) => void;
  loadingHistory?: string | null;
}

const RoomMap: React.FC<RoomMapProps> = ({ title, icon: Icon, rooms, onTestHistory, loadingHistory }) => (
  <div className="rounded-xl bg-white p-7 shadow-sm mb-8">
    <div className="flex items-center gap-3 mb-5">
      <Icon className="h-7 w-7 text-slate-700" />
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    </div>
    {rooms.length === 0 ? (
      <p className="text-slate-600 italic">Aucun capteur détecté pour cette zone.</p>
    ) : (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {rooms.map((room) => {
          const styles = getStatusStyles(room.status);
          return (
            <div
              key={room.id} // <-- Utilisation de l'ID comme clé
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

              {onTestHistory && (
                <button
                  onClick={() => onTestHistory(room.id, room.name)}
                  disabled={loadingHistory === room.id}
                  className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                    loadingHistory === room.id
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {loadingHistory === room.id ? 'Chargement...' : 'Voir historique'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    )}
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
          <li key={index} className="flex items-center justify-between text-base border-b border-slate-100 pb-3">
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

// --- COMPOSANT GRAPHIQUE SECURISÉ ---
const EvolutionChart: React.FC<{ data: EvolutionData[]; loading: boolean }> = ({ data, loading }) => {
  const yAxisLabels = ['1500', '1000', '500', '0'];

  return (
    <div className="rounded-xl bg-white p-7 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-5">
        <BarChart2 className="h-7 w-7 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-800">Évolution (24h)</h2>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 mr-2"></div> Chargement...
        </div>
      ) : (!data || data.length === 0) ? (
        <div className="flex h-56 flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <BarChart2 className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Aucune donnée sur les dernières 24h</p>
        </div>
      ) : (
        <div className="flex pt-4">
          <div className="flex h-56 flex-col justify-between pr-4 text-right text-sm text-slate-500">
            {yAxisLabels.map((label) => <span key={label}>{label}</span>)}
          </div>

          <div className="relative w-full h-56 border-l-2 border-b-2 border-gray-200">
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

// --- COMPOSANT MODAL HISTORIQUE SÉCURISÉ ---
const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, historyData, isLoading, error, onClose }) => {
  if (!isOpen) return null;

  const sensorName = historyData?.sensor?.name || 'Capteur';
  const sensorType = historyData?.sensor?.type?.name || '-';
  const sensorUnit = historyData?.sensor?.type?.unit || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-slate-900">Historique : {sensorName}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl px-2">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Chargement...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-center">
              <strong>Erreur : </strong>{error}
            </div>
          )}

          {!isLoading && !error && (!historyData || !historyData.history || historyData.history.length === 0) && (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p>Aucun historique disponible pour ce capteur.</p>
            </div>
          )}

          {!isLoading && !error && historyData && historyData.history && historyData.history.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg flex justify-between text-sm text-blue-800 font-medium">
                <p>Type : {sensorType}</p>
                <p>Unité : {sensorUnit}</p>
                <p>Enregistrements : {historyData.history.length}</p>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Valeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyData.history.map((reading, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">
                          {reading.timestamp ? new Date(reading.timestamp).toLocaleString('fr-FR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {typeof reading.value === 'boolean'
                            ? (reading.value ? 'Ouvert' : 'Fermé')
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end z-10">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 shadow-sm">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

const CO2SensorsPage = () => {
  const { getToken } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
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

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<SensorHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistorySensorId, setLoadingHistorySensorId] = useState<string | null>(null);

  const fetchEvolutionData = async (sensorId: string) => {
    try {
      setIsGraphLoading(true);
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/co2/${sensorId}/evolution`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur fetch évolution');
      const data: EvolutionData[] = await response.json();
      setEvolutionData(data);
    } catch (err) {
      console.error("Erreur graph CO2", err);
      setEvolutionData([]); // Reset en cas d'erreur pour afficher le graph vide
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
        
        const response = await fetch(`${apiUrl}/api/sensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
        const data: Sensor[] = await response.json();
        setSensors(data);
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

      // 1. Graphique
      fetchEvolutionData(co2Sensors[0].sensor_id);

      // 2. Moyenne & Date
      const values = co2Sensors.map((s) => Number(s.displayValue));
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      setAverage(Math.round(avg));

      const latestDate = co2Sensors
        .map((s) => s.state_changed_at && new Date(s.state_changed_at))
        .filter(Boolean)
        .sort((a, b) => (b!.getTime() - a!.getTime()))[0];
      setLastUpdate(latestDate ? latestDate.toLocaleTimeString('fr-FR') : 'N/A');

      // 3. Tri dynamique (Maison / Bureau)
      const homeData: RoomData[] = [];
      const officeData: RoomData[] = [];
      const otherData: RoomData[] = [];

      co2Sensors.forEach((sensor) => {
        const roomData: RoomData = {
          id: sensor.sensor_id, // <-- ID critique ajouté ici
          name: sensor.name,
          value: Number(sensor.displayValue),
          status: Number(sensor.displayValue) < 800 ? 'good' : Number(sensor.displayValue) < 1200 ? 'medium' : 'bad',
        };

        const hubName = sensor.hub?.name?.toLowerCase() || '';

        if (hubName.includes('maison') || hubName.includes('home') || hubName.includes('appart')) {
          homeData.push(roomData);
        } else if (hubName.includes('bureau') || hubName.includes('office') || hubName.includes('lab')) {
          officeData.push(roomData);
        } else {
          otherData.push(roomData);
        }
      });

      setHomeRooms([...homeData, ...otherData]);
      setOfficeRooms(officeData);

      // 4. Alertes
      const allRooms = [...homeData, ...officeData, ...otherData];
      const generatedAlerts: AlertData[] = allRooms
        .filter((room) => room.status !== 'good')
        .map((room) => ({
          room: room.name,
          message: room.status === 'bad' ? `CO₂ > 1200 ppm` : `CO₂ > 800 ppm`,
          time: new Date().toLocaleTimeString('fr-FR'),
        }));
      setAlerts(generatedAlerts);
      setActiveAlerts(generatedAlerts.length);

      // 5. Bannière
      if (allRooms.length > 0) {
        const highestRoom = allRooms.reduce((prev, curr) => (prev.value > curr.value ? prev : curr));
        if (highestRoom.value > 1000) {
          setBannerAlert(`Pic de CO₂ détecté (${highestRoom.value} ppm) dans : ${highestRoom.name}. Pensez à aérer.`);
        } else {
          setBannerAlert(null);
        }
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
      setHistoryModalOpen(true); // Ouvrir tout de suite pour montrer le chargement

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

  if (loading) return <div className="flex justify-center min-h-screen items-center"><p className="text-xl text-slate-600">Chargement...</p></div>;
  if (error) return <div className="flex justify-center min-h-screen items-center text-red-600">Erreur : {error}</div>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">Qualité de l'Air</h1>
        <p className="mt-2 text-lg text-slate-600">Surveillance en temps réel</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="col-span-1 space-y-10 lg:col-span-2">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <StatCard icon={LineChart} title="Moyenne Globale" value={`${average} ppm`} />
            <StatCard icon={AlertTriangle} title="Zones à aérer" value={activeAlerts} />
            <StatCard icon={Clock} title="Dernier relevé" value={lastUpdate} />
          </div>

          {homeRooms.length > 0 && (
            <RoomMap
              title="Maison"
              icon={Home}
              rooms={homeRooms}
              onTestHistory={fetchSensorHistory}
              loadingHistory={loadingHistorySensorId}
            />
          )}

          {officeRooms.length > 0 && (
            <RoomMap
              title="Bureau"
              icon={Building2}
              rooms={officeRooms}
              onTestHistory={fetchSensorHistory}
              loadingHistory={loadingHistorySensorId}
            />
          )}

          <AlertHistory alerts={alerts} />
        </div>

        <div className="col-span-1">
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
