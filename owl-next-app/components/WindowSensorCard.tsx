import { Sensor } from '@/src/types';
import { DoorOpen, DoorClosed, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

const calculateDuration = (since: string | null, referenceDate: Date = new Date()): string => {
  if (!since) return '';
  const sinceDate = new Date(since);

  // On utilise referenceDate au lieu de new Date()
  const diffMs = referenceDate.getTime() - sinceDate.getTime();

  // Sécurité : si la diff est négative (bug de données), on met 0
  const safeDiffMs = Math.max(0, diffMs);

  const diffHours = Math.floor(safeDiffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((safeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  let duration = '';
  if (diffHours > 0) duration += `${diffHours}h `;
  if (diffMins > 0 || diffHours === 0) duration += `${diffMins}min`;
  return duration.trim();
};

const WindowSensorCard: React.FC<{ sensor: Sensor; referenceDate?: Date }> = ({
  sensor,
  referenceDate = new Date(), // Par défaut, c'est maintenant
}) => {
  const isOpen = sensor.displayValue === 'Ouvert';
  let statusColor: string;
  let borderColor: string;
  let StatusIcon: React.ElementType;

  const LONG_OPEN_THRESHOLD_MINUTES = 60;

  if (isOpen) {
    const durationInMinutes = sensor.state_changed_at
      ? (referenceDate.getTime() - new Date(sensor.state_changed_at).getTime()) / 60000
      : 0;

    if (durationInMinutes > LONG_OPEN_THRESHOLD_MINUTES) {
      // État 3 : ALERTE (ouvert depuis longtemps)
      statusColor = 'text-red-600';
      borderColor = 'border-red-400';
      StatusIcon = AlertTriangle; // Icône d'alerte
    } else {
      // État 2 : INFO (ouvert récemment)
      statusColor = 'text-amber-600';
      borderColor = 'border-amber-400';
      StatusIcon = DoorOpen;
    }
  } else {
    // État 1 : SÛR (fermé)
    statusColor = 'text-green-600';
    borderColor = 'border-green-400';
    StatusIcon = DoorClosed;
  }

  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-sm border-l-4 ${borderColor} flex flex-col justify-between`}
    >
      <div>
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{sensor.name}</h3>
          {/* L'icône est maintenant dynamique */}
          <StatusIcon className={`h-8 w-8 flex-shrink-0 ${statusColor}`} />
        </div>

        {/* --- SECTION DE STATUT --- */}
        <div className="mt-4 text-center">
          <p className={`text-3xl font-extrabold ${statusColor}`}>{sensor.displayValue}</p>

          {isOpen && sensor.state_changed_at ? (
            // Cas "Ouvert"
            <>
              <p className="mt-1 text-sm text-slate-500">depuis</p>
              <p className={`text-2xl font-bold ${statusColor}`}>
                {calculateDuration(sensor.state_changed_at, referenceDate)}
              </p>
            </>
          ) : (
            // 2. Cas "Fermé" : afficher un statut positif
            !isOpen && (
              <div className="mt-2 flex flex-col items-center text-slate-500">
                <ShieldCheck className="h-7 w-7" />
                <p className="mt-1 text-sm font-semibold">Confort préservé</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 border-t pt-4 text-slate-600">
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
