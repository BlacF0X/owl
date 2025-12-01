'use client';

import React, { useState } from 'react';
import HumidityRoomCard, { HumidityRoom } from './HumidityRoomCard';
import HumidityRoomDetailsModal from './HumidityRoomDetailsModal';

interface HumidityRoomsViewProps {
  roomsByHub: Record<string, HumidityRoom[]>;
}

export default function HumidityRoomsView({
  roomsByHub,
}: HumidityRoomsViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<HumidityRoom | null>(null);

  return (
    <div className="space-y-12">
      {Object.entries(roomsByHub).map(([hubName, rooms]) => (
        <section key={hubName}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3">
            {hubName}
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
              >
                <HumidityRoomCard room={room} onClick={() => setSelectedRoom(room)} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {selectedRoom && (
        <HumidityRoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}