import { useEffect, useState } from 'react';
import { usePusher } from '@/components/providers/PusherProvider';

export interface RealtimeUpdate {
  sensor_id: string;
  name: string;
  value: string | number;
  type: string;
  timestamp: string;
  hub_id: string;
}

/**
 * Hook pour écouter les mises à jour d'un capteur spécifique
 * @param sensorId L'ID du capteur à surveiller
 * @param initialValue La valeur initiale (venant du Server Component)
 * @returns La valeur actuelle (initiale ou mise à jour) et le timestamp
 */
export const useRealtimeSensor = (
  sensorId: string,
  initialValue: string | number,
  initialDate: string | null
) => {
  const { channel } = usePusher();
  const [value, setValue] = useState(initialValue);
  const [lastUpdate, setLastUpdate] = useState<string | null>(initialDate);
  const [isLive, setIsLive] = useState(false); // Pour afficher un petit indicateur visuel

  useEffect(() => {
    if (!channel) return;

    const handleUpdate = (data: RealtimeUpdate[]) => {
      // Pusher envoie un tableau de mises à jour (batch)
      // On cherche si NOTRE capteur est dedans
      const update = data.find((d) => d.sensor_id === sensorId);

      if (update) {
        console.log(`⚡️ Update reçu pour ${update.name}:`, update.value);
        setValue(update.value);
        setLastUpdate(update.timestamp);

        // Petit effet "flash"
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
      }
    };

    // On écoute l'événement global
    channel.bind('sensors:update', handleUpdate);

    return () => {
      channel.unbind('sensors:update', handleUpdate);
    };
  }, [channel, sensorId]);

  return { value, lastUpdate, isLive };
};
