'use client';

import React from 'react';
import { Sensor } from '@/src/types';
import { DoorOpen, DoorClosed, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDateTime, calculateDuration } from '@/src/utils/formatters';
import { useRealtimeSensor } from '@/src/hooks/useRealtimeSensor'; // <--- Import

const WindowSensorCard: React.FC<{ sensor: Sensor; referenceDate?: Date }> = ({
  sensor,
  referenceDate = new Date(),
}) => {
  // Hook Realtime
  const { value, lastUpdate, isLive } = useRealtimeSensor(
    sensor.sensor_id,
    sensor.displayValue,
    sensor.state_changed_at
  );

  const isOpen = value === 'Ouvert';

  let statusColor: string;
  let borderColor: string;
  let StatusIcon: React.ElementType;

  const LONG_OPEN_THRESHOLD_MINUTES = 60;

  // Calcul dynamique basé sur lastUpdate (qui peut changer en temps réel)
  if (isOpen) {
    const durationInMinutes = lastUpdate
      ? (referenceDate.getTime() - new Date(lastUpdate).getTime()) / 60000
      : 0;

    if (durationInMinutes > LONG_OPEN_THRESHOLD_MINUTES) {
      statusColor = 'text-red-600';
      borderColor = 'border-red-400';
      StatusIcon = AlertTriangle;
    } else {
      statusColor = 'text-amber-600';
      borderColor = 'border-amber-400';
      StatusIcon = DoorOpen;
    }
  } else {
    statusColor = 'text-green-600';
    borderColor = 'border-green-400';
    StatusIcon = DoorClosed;
  }

  return (
    <div
      className={`
        rounded-lg bg-white p-6 shadow-sm border-l-4 ${borderColor} flex flex-col justify-between 
        transition-all duration-500 
        ${isLive ? 'ring-4 ring-blue-200 scale-[1.02]' : ''} 
      `}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{sensor.name}</h3>
          <StatusIcon
            className={`h-8 w-8 flex-shrink-0 ${statusColor} transition-colors duration-300`}
          />
        </div>

        <div className="mt-4 text-center">
          <p className={`text-3xl font-extrabold ${statusColor} transition-colors duration-300`}>
            {value}
          </p>

          {isOpen && lastUpdate ? (
            <>
              <p className="mt-1 text-sm text-slate-500">depuis</p>
              <p className={`text-2xl font-bold ${statusColor}`}>
                {calculateDuration(lastUpdate, referenceDate)}
              </p>
            </>
          ) : (
            !isOpen && (
              <div className="mt-2 flex flex-col items-center text-slate-500">
                <ShieldCheck className="h-7 w-7" />
                <p className="mt-1 text-sm font-semibold">Confort préservé</p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-6 border-t pt-4 text-slate-600">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-5 w-5 text-slate-400" />
          <p>
            Dernier changement : <span className="font-semibold">{formatDateTime(lastUpdate)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowSensorCard;
