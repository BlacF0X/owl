import React from 'react';
import { Home } from 'lucide-react';
import HumidityRoomCard, { type HumidityRoom } from './HumidityRoomCard';

interface HumidityHomeMapProps {
  rooms: HumidityRoom[];
}

const HumidityHomeMap: React.FC<HumidityHomeMapProps> = ({ rooms }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Home className="h-5 w-5 text-slate-700" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Carte de l&apos;habitation</h2>
      </div>

      {/* Room Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rooms.map((room) => (
          <HumidityRoomCard key={room.id} room={room} />
        ))}
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Seuils d&apos;humidité
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-700">40-60% : Optimal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-700">60-70% : Surveillance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-700">&gt; 70% : Action requise</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumidityHomeMap;
