'use client';

import React from 'react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { formatDateTime } from '@/src/utils/formatters';

export interface HumidityRoom {
  id: string;
  name: string;
  humidity: number;
  status: 'optimal' | 'warning' | 'danger';
  lastUpdate?: string;
  hubName?: string;
}

interface HumidityRoomCardProps {
  room: HumidityRoom;
  onClick?: () => void;
}

const HumidityRoomCard: React.FC<HumidityRoomCardProps> = ({
  room,
  onClick,
}) => {
  let statusColor = '';
  let borderColor = '';
  let StatusIcon: React.ElementType;
  let statusMessage = '';

  switch (room.status) {
    case 'optimal':
      statusColor = 'text-green-600';
      borderColor = 'border-l-4 border-green-500';
      StatusIcon = CheckCircle;
      statusMessage = 'Humidité optimale (40-60%)';
      break;
    case 'warning':
      statusColor = 'text-amber-600';
      borderColor = 'border-l-4 border-amber-500';
      StatusIcon = AlertTriangle;
      statusMessage = 'Surveillance recommandée (60-70%)';
      break;
    case 'danger':
      statusColor = 'text-red-600';
      borderColor = 'border-l-4 border-red-500';
      StatusIcon = AlertTriangle;
      statusMessage = 'Action nécessaire (>70%)';
      break;
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-lg bg-white p-6 shadow-sm ${borderColor} flex flex-col justify-between h-full ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
        <StatusIcon className={`h-8 w-8 flex-shrink-0 ${statusColor}`} />
      </div>

      <div className="mt-4 text-center">
        <p className={`text-3xl font-extrabold ${statusColor}`}>
          {room.humidity}%
        </p>
      </div>

      <div className="mt-2">
        <p className={`text-xs font-medium ${statusColor} text-center`}>
          {statusMessage}
        </p>
      </div>

      <div className="mt-6 border-t pt-4 text-slate-600">
        <div className="flex items-center gap-3 text-sm">
          <Droplets className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-medium">
              Taux actuel : <span className="font-bold">{room.humidity}%</span>
            </p>
            {room.lastUpdate && (
              <p className="text-xs text-slate-400 mt-1">
                Dernier relevé : {formatDateTime(room.lastUpdate)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumidityRoomCard;
