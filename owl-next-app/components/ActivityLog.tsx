'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchFromApi } from '@/src/lib/apiClient';
import { WindowActivityEvent } from '@/src/types';
import { DoorOpen, DoorClosed, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityLogProps {
  initialDate?: Date; // Pour le mode DEV
}

export default function ActivityLog({ initialDate = new Date() }: ActivityLogProps) {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<WindowActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  // Fonction pour changer de jour
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // Format YYYY-MM-DD pour l'API
        const dateString = currentDate.toISOString().split('T')[0];
        const data = await fetchFromApi<WindowActivityEvent[]>(
          `/api/sensors/windows/history?date=${dateString}`,
          token
        );
        setEvents(data);
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [currentDate, getToken]);

  // Formatage pour l'affichage
  const dateLabel = currentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm mt-10">
      {/* En-tête avec contrôles de date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-800">Journal d'Activité</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[180px] text-center font-medium text-slate-700 capitalize select-none">
            {dateLabel}
          </span>
          <button 
            onClick={() => changeDate(1)}
            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
            // Désactiver "demain" si on est "aujourd'hui" (optionnel, dépend si on a des données futures)
            // disabled={currentDate.toDateString() === new Date().toDateString()} 
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex h-full items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <p>Aucune activité enregistrée pour cette date.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 py-2">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-center pl-6 group">
                {/* Point sur la timeline */}
                <div className={`absolute -left-[9px] h-4 w-4 rounded-full border-2 border-white ${
                  event.state === 'Ouvert' ? 'bg-orange-500' : 'bg-green-500'
                } shadow-sm`}></div>

                <div className="flex flex-1 items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-slate-200 hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    {event.state === 'Ouvert' ? (
                      <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                        <DoorOpen className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-green-100 p-2 text-green-600">
                        <DoorClosed className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{event.sensorName}</p>
                      <p className="text-xs text-slate-500">{event.hubName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mb-1 ${
                      event.state === 'Ouvert' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {event.state}
                    </span>
                    <p className="text-sm font-mono text-slate-600">
                      {new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
