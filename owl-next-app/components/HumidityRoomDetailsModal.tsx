'use client';

import React from 'react';
import { X } from 'lucide-react';
import { HumidityRoom } from './HumidityRoomCard';

interface HumidityRoomDetailsModalProps {
  room: HumidityRoom;
  onClose: () => void;
}

export default function HumidityRoomDetailsModal({
  room,
  onClose,
}: HumidityRoomDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-slate-50 p-4">
          <h3 className="text-lg font-bold text-slate-900">{room.name}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{room.humidity}%</p>
              <p className="text-xs text-slate-500">Humidité actuelle</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-lg font-bold text-slate-800">
                {room.status === 'optimal'
                  ? 'Optimal'
                  : room.status === 'warning'
                  ? 'Alerte'
                  : 'Critique'}
              </p>
              <p className="text-xs text-slate-500">Statut</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              {room.status === 'optimal' && '✓ Humidité idéale pour le confort et la santé'}
              {room.status === 'warning' && '⚠️ L\'humidité est élevée, aérez la pièce'}
              {room.status === 'danger' && '⚠️ Humidité trop élevée, risque de moisissures'}
            </p>
          </div>

          {room.lastUpdate && (
            <div className="text-sm text-slate-600">
              <p>
                <span className="font-semibold">Dernier relevé:</span> {room.lastUpdate}
              </p>
              {room.hubName && (
                <p>
                  <span className="font-semibold">Boîtier:</span> {room.hubName}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t bg-slate-50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}