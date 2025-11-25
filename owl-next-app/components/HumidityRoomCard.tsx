import React from 'react';

export type HumidityStatus = 'optimal' | 'warning' | 'danger';

export interface HumidityRoom {
  id: string;
  name: string;
  humidity: number;
  status: HumidityStatus;
}

interface HumidityRoomCardProps {
  room: HumidityRoom;
}

// Helper function pour déterminer les classes CSS selon le statut
const getStatusClasses = (status: HumidityStatus) => {
  const baseClasses = 'rounded-xl border-2 p-5 transition-all hover:shadow-md';
  
  switch (status) {
    case 'optimal':
      return `${baseClasses} bg-green-50 border-green-500`;
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-500`;
    case 'danger':
      return `${baseClasses} bg-red-50 border-red-500`;
    default:
      return baseClasses;
  }
};

// Helper function pour obtenir le texte du statut
const getStatusText = (status: HumidityStatus): string => {
  switch (status) {
    case 'optimal':
      return 'Humidité optimale';
    case 'warning':
      return 'Surveillance recommandée';
    case 'danger':
      return 'Action nécessaire';
    default:
      return 'Statut inconnu';
  }
};

// Helper function pour obtenir la couleur du texte du statut
const getStatusTextColor = (status: HumidityStatus): string => {
  switch (status) {
    case 'optimal':
      return 'text-green-700';
    case 'warning':
      return 'text-yellow-700';
    case 'danger':
      return 'text-red-700';
    default:
      return 'text-slate-700';
  }
};

const HumidityRoomCard: React.FC<HumidityRoomCardProps> = ({ room }) => {
  return (
    <div className={getStatusClasses(room.status)}>
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
      </div>
      <div className="mb-3">
        <p className={`text-xs font-medium ${getStatusTextColor(room.status)}`}>
          {getStatusText(room.status)}
        </p>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{room.humidity}%</p>
      </div>
    </div>
  );
};

export default HumidityRoomCard;