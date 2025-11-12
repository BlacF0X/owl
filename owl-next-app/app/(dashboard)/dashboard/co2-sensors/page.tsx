import React from 'react';
import { Home, LineChart, AlertTriangle, Bell, Clock, BarChart2 } from 'lucide-react';

// --- Types de données ---
type RoomStatus = 'good' | 'medium' | 'bad';

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

// --- Données Fictives ---
const mockCO2Data = {
  average: 901,
  activeAlerts: 1,
  lastUpdate: 'Maintenant',
  rooms: [
    { name: 'Salon', value: 706, status: 'good' as RoomStatus },
    { name: 'Cuisine', value: 963, status: 'medium' as RoomStatus },
    { name: 'Chambre', value: 1348, status: 'bad' as RoomStatus },
    { name: 'Salle de bain', value: 588, status: 'good' as RoomStatus },
  ],
  alerts: [
    { room: 'Chambre', message: 'CO₂ > 1200 ppm', time: '14:30' },
    { room: 'Cuisine', message: 'CO₂ > 1000 ppm', time: '12:15' },
    { room: 'Salon', message: 'CO₂ normalisé', time: '10:45' },
  ],
  bannerAlert: 'Le taux de CO₂ dans chambre dépasse 1000 ppm – pensez à aérer pendant 10 minutes.',
  evolution: [
    { hour: '0h', height: 20, ppm: 300 }, { hour: '2h', height: 27, ppm: 405 }, 
    { hour: '4h', height: 23, ppm: 345 }, { hour: '6h', height: 33, ppm: 495 }, 
    { hour: '8h', height: 43, ppm: 645 }, { hour: '10h', height: 47, ppm: 705 },
    { hour: '12h', height: 57, ppm: 855 }, { hour: '14h', height: 63, ppm: 945 }, 
    { hour: '16h', height: 53, ppm: 795 }, { hour: '18h', height: 50, ppm: 750 }, 
    { hour: '20h', height: 40, ppm: 600 }, { hour: '22h', height: 37, ppm: 555 },
  ]
};


// --- Sous-composants ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({ icon: Icon, title, value }) => (
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

const RoomMap: React.FC<{ rooms: RoomData[] }> = ({ rooms }) => (
  <div className="rounded-xl bg-white p-7 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <Home className="h-7 w-7 text-slate-700" />
      <h2 className="text-xl font-semibold text-slate-800">Carte de l'habitation</h2>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {rooms.map((room) => {
        const styles = getStatusStyles(room.status);
        return (
          <div key={room.name} className={`flex items-center justify-between rounded-lg p-5 ${styles.bgColor} border-l-4 ${styles.borderColor}`}>
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
        );
      })}
    </div>
    <div className="mt-6 space-y-2 text-base text-slate-600">
      <p><span className="text-green-500">●</span> &lt; 800 ppm: Air sain</p>
      <p><span className="text-yellow-500">●</span> 800-1200 ppm: Aération conseillée</p>
      <p><span className="text-red-500">●</span> &gt; 1200 ppm: Aération nécessaire</p>
    </div>
  </div>
);

const AlertHistory: React.FC<{ alerts: AlertData[] }> = ({ alerts }) => (
    <div className="rounded-xl bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-5"><Bell className="h-7 w-7 text-slate-700" /><h2 className="text-xl font-semibold text-slate-800">Historique des alertes</h2></div>
        <ul className="mt-4 space-y-4">
            {alerts.map((alert, index) => (
                <li key={index} className="flex items-center justify-between text-base border-b border-slate-100 pb-3">
                    <p className="text-slate-800">{alert.room}: <span className="font-semibold">{alert.message}</span></p>
                    <p className="text-slate-500">{alert.time}</p>
                </li>
            ))}
        </ul>
    </div>
);

const EvolutionChart: React.FC<{ data: EvolutionData[] }> = ({ data }) => {
    const yAxisLabels = ['1500', '1000', '500', '0'];

    return (
        <div className="rounded-xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <BarChart2 className="h-7 w-7 text-slate-700" />
                <h2 className="text-xl font-semibold text-slate-800">Évolution (dernières 24h)</h2>
            </div>
            
            <div className="flex pt-4">
                <div className="flex h-56 flex-col justify-between pr-4 text-right text-sm text-slate-500">
                    {yAxisLabels.map(label => <span key={label}>{label}</span>)}
                </div>

                <div className="relative w-full h-56 border-l-2 border-b-2 border-gray-200">
                    <div className="absolute top-0 h-px w-full border-t border-dashed border-gray-300"></div>
                    <div className="absolute top-1/3 h-px w-full border-t border-dashed border-gray-300"></div>
                    <div className="absolute top-2/3 h-px w-full border-t border-dashed border-gray-300"></div>
                    
                    <div className="flex h-full items-end justify-around px-1">
                        {data.map(({ hour, height, ppm }) => (
                            <div key={hour} className="group relative flex h-full w-full flex-col items-center justify-end text-sm">
                                <div className="absolute bottom-full mb-2 scale-0 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                                    <div className="whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-white shadow-lg">
                                        {ppm} ppm
                                    </div>
                                    <div className="mx-auto -mt-1 h-2 w-2 rotate-45 bg-slate-800"></div>
                                </div>
                                
                                <div 
                                    className="w-3/5 rounded-t-md bg-blue-500 transition-colors group-hover:bg-blue-600" 
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="mt-2 text-slate-500">{hour}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Composant Principal de la Page ---

const CO2SensorsPage = () => {
  const { average, activeAlerts, lastUpdate, rooms, alerts, bannerAlert, evolution } = mockCO2Data;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard CO₂ - Système Owl</h1>
        <p className="mt-2 text-lg text-slate-600">Surveillance en temps réel de la qualité de l'air intérieur</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="col-span-1 space-y-10 lg:col-span-2">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <StatCard icon={LineChart} title="Moyenne CO₂" value={`${average} ppm`} />
            <StatCard icon={AlertTriangle} title="Alertes actives" value={activeAlerts} />
            <StatCard icon={Clock} title="Dernière mise à jour" value={lastUpdate} />
          </div>
          <RoomMap rooms={rooms} />
          <AlertHistory alerts={alerts} />
        </div>

        <div className="col-span-1">
            <EvolutionChart data={evolution}/>
        </div>
      </div>
      
      {bannerAlert && (
        <div className="rounded-xl bg-yellow-400 p-5 text-center text-lg font-semibold text-yellow-900 shadow-md">
          <p>{bannerAlert}</p>
        </div>
      )}
    </div>
  );
};

export default CO2SensorsPage;
