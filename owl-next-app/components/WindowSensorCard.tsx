import { Sensor } from '@/src/types';
import { DoorOpen, DoorClosed, Clock, ShieldCheck } from 'lucide-react';

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

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
  const borderColor = isOpen ? 'border-orange-400' : 'border-green-400';

  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-sm border-l-4 ${borderColor} flex flex-col justify-between`}
    >
      <div>
        {/* --- En-tête de la carte --- */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{sensor.name}</h3>
          {isOpen ? (
            <DoorOpen className={`h-8 w-8 flex-shrink-0 ${statusColor}`} />
          ) : (
            <DoorClosed className={`h-8 w-8 flex-shrink-0 ${statusColor}`} />
          )}
        </div>

        {/* --- SECTION DE STATUT--- */}
        <div className="mt-4 text-center">
          <p className={`text-3xl font-extrabold ${statusColor}`}>{sensor.displayValue}</p>

          {isOpen && sensor.state_changed_at ? (
            // Cas "Ouvert"
            <>
              <p className="mt-1 text-sm text-slate-500">depuis</p>
              <p className={`text-2xl font-bold ${statusColor}`}>
                {calculateDuration(sensor.state_changed_at)}
              </p>
            </>
          ) : (
            // Cas "Fermé" : afficher un statut positif
            !isOpen && (
              <div className="mt-2 flex flex-col items-center text-slate-500">
                <ShieldCheck className="h-7 w-7" />
                <p className="mt-1 text-sm font-semibold">Confort préservé</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Informations supplémentaires en bas de la carte */}
      <div className="mt-6 space-y-3 border-t pt-4 text-slate-600">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-5 w-5 text-slate-400" />
          <p>
            Dernier changement :{' '}
            <span className="font-semibold">{formatDateTime(sensor.state_changed_at)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowSensorCard;
