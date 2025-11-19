import { Sensor } from '@/src/types';
import { DoorOpen, DoorClosed, Clock, Server } from 'lucide-react';

// Fonction utilitaire pour formater la date de manière lisible
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

// Fonction utilitaire pour calculer la durée (identique à celle de votre page dashboard)
const calculateDuration = (since: string | null): string => {
  if (!since) return '';
  const sinceDate = new Date(since);
  const now = new Date();
  const diffMs = now.getTime() - sinceDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  let duration = '';
  if (diffHours > 0) duration += `${diffHours}h `;
  if (diffMins > 0 || diffHours === 0) duration += `${diffMins}min`;
  return duration.trim();
};

const WindowSensorCard: React.FC<{ sensor: Sensor }> = ({ sensor }) => {
  const isOpen = sensor.displayValue === 'Ouvert';
  const statusColor = isOpen ? 'text-orange-600' : 'text-green-600';
  const bgColor = isOpen ? 'bg-orange-50' : 'bg-green-50';
  const borderColor = isOpen ? 'border-orange-400' : 'border-green-400';

  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm border-l-4 ${borderColor} flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{sensor.name}</h3>
          {isOpen ? (
            <DoorOpen className={`h-8 w-8 ${statusColor}`} />
          ) : (
            <DoorClosed className={`h-8 w-8 ${statusColor}`} />
          )}
        </div>

        <div className={`rounded-md ${bgColor} p-4 text-center`}>
          <p className={`text-2xl font-extrabold ${statusColor}`}>{sensor.displayValue}</p>
          {isOpen && sensor.state_changed_at && (
            <p className="mt-1 text-sm font-semibold text-slate-700">
              depuis {calculateDuration(sensor.state_changed_at)}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6 space-y-3 text-slate-600">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-slate-400" />
          <p>
            Dernier changement :{' '}
            <span className="font-semibold">{formatDateTime(sensor.state_changed_at)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5 text-slate-400" />
          <p>
            Boîtier central : <span className="font-semibold">{sensor.hub.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowSensorCard;
