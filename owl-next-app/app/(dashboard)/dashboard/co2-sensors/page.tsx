'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, LineChart, AlertTriangle, Clock, Home, Briefcase } from 'lucide-react';

import { StatCard } from '@/components/Co2StatCard';
import { SensorCard } from '@/components/Co2SensorCard';
import { EvolutionChart } from '@/components/Co2EvolutionChart';
import { AlertHistory } from '@/components/Co2AlertHistory';
import { HistoryModal } from '@/components/Co2HistoryModal';
import {
  Sensor,
  RoomData,
  AlertData,
  EvolutionData,
  SensorHistoryResponse,
} from '@/components/Co2Types';

const SensorSection: React.FC<{
  title: string;
  icon: React.ElementType;
  rooms: RoomData[];
  onSelectSensor: (id: string) => void;
  selectedId: string | null;
  onTestHistory: (id: string) => void;
  loadingHistoryId: string | null;
}> = ({
  title,
  icon: Icon,
  rooms,
  onSelectSensor,
  selectedId,
  onTestHistory,
  loadingHistoryId,
}) => {
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

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const chartData: EvolutionData[] = data.history
        .filter((item) => {
          const itemDate = new Date(item.timestamp);
          const val = Number(item.value);
          return !isNaN(val) && itemDate >= twentyFourHoursAgo;
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((item) => {
          const dateObj = new Date(item.timestamp);
          return {
            hour: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            height: 0,
            ppm: Number(item.value),
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
        const isOffice =
          sensor.name.toLowerCase().includes('bureau') ||
          sensor.hub?.name.toLowerCase().includes('bureau');

        return {
          id: sensor.sensor_id,
          name: sensor.name,
          value: val,
          status: val < 800 ? 'good' : val < 1200 ? 'medium' : 'bad',
          location: isOffice ? 'Bureau' : 'Maison',
        };
      });

      setHomeRooms(processedRooms.filter((r) => r.location === 'Maison'));
      setOfficeRooms(processedRooms.filter((r) => r.location === 'Bureau'));

      const generatedAlerts: AlertData[] = processedRooms
        .filter((room) => room.status !== 'good')
        .map((room) => ({
          room: room.name,
          message: room.status === 'bad' ? `CO₂ critique (>1200)` : `Aération nécessaire`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }));
      setAlerts(generatedAlerts);
      setActiveAlerts(generatedAlerts.length);

      const criticalRoom = processedRooms.find((r) => r.value > 1500);
      if (criticalRoom) {
        setBannerAlert(
          `Attention : Qualité d'air très dégradée dans ${criticalRoom.name} (${criticalRoom.value} ppm)`
        );
      } else {
        setBannerAlert(null);
      }
    };

    fetchSensors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  if (loading)
    return <div className="flex justify-center h-screen items-center">Chargement...</div>;
  if (error)
    return <div className="flex justify-center h-screen items-center">Erreur: {error}</div>;

  return (
    <div className="space-y-8 pb-12 w-full px-4 sm:px-6 lg:px-10 pt-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-blue-600" />
            Qualité de l'Air
          </h1>
          <p className="mt-1 text-slate-500">Surveillance en temps réel des niveaux de CO₂</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={LineChart} title="Moyenne Globale" value={`${average} ppm`} />
        <StatCard icon={AlertTriangle} title="Zones à surveiller" value={activeAlerts} />
        <StatCard icon={Clock} title="Dernier relevé" value={lastUpdate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <SensorSection
              title="Résidence"
              icon={Home}
              rooms={homeRooms}
              onSelectSensor={(id) =>
                handleSelectSensor(id, homeRooms.find((r) => r.id === id)?.name)
              }
              selectedId={selectedSensorId}
              onTestHistory={fetchSensorHistory}
              loadingHistoryId={loadingHistorySensorId}
            />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <SensorSection
              title="Bureaux"
              icon={Briefcase}
              rooms={officeRooms}
              onSelectSensor={(id) =>
                handleSelectSensor(id, officeRooms.find((r) => r.id === id)?.name)
              }
              selectedId={selectedSensorId}
              onTestHistory={fetchSensorHistory}
              loadingHistoryId={loadingHistorySensorId}
            />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex-1 min-h-[300px]">
            <AlertHistory alerts={alerts} />
          </div>
        </div>
      </div>

      <div className="w-full h-[450px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <EvolutionChart
          data={evolutionData}
          loading={isGraphLoading}
          titleSuffix={selectedSensorName ? `Capteur : ${selectedSensorName}` : ''}
        />
      </div>

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
            className="text-slate-400 hover:text-slate-600"
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
