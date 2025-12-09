'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useAuth, useUser } from '@clerk/nextjs';

// Configuration (à mettre dans .env.local côté front aussi idéalement)
// NEXT_PUBLIC_PUSHER_KEY="<TA_CLE_PUBLIQUE>"
// NEXT_PUBLIC_PUSHER_CLUSTER="eu"
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || 'TA_CLE_PUSHER_ICI';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

interface PusherContextType {
  pusher: Pusher | null;
  channel: Channel | null;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  channel: null,
});

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [pusherInstance, setPusherInstance] = useState<Pusher | null>(null);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);

  useEffect(() => {
    // On ne se connecte que si l'utilisateur est connecté
    if (!isSignedIn || !user || !PUSHER_KEY) return;

    // 1. Instanciation de Pusher avec Custom Authorizer pour Clerk
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/pusher/auth`,
      // C'est ici qu'on injecte le token Clerk
      authorizer: (channel) => {
        return {
          authorize: async (socketId, callback) => {
            try {
              const token = await getToken();
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pusher/auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              });

              if (!response.ok) {
                throw new Error('Erreur auth pusher');
              }

              const authData = await response.json();
              callback(null, authData);
            } catch (error) {
              console.error('Pusher Auth Error:', error);
              callback(new Error('Erreur auth'), null);
            }
          },
        };
      },
    });

    // 2. Abonnement au canal privé de l'utilisateur
    const channelName = `private-user-${user.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Connecté au canal temps réel :', channelName);
    });

    setPusherInstance(pusher);
    setUserChannel(channel);

    // Cleanup lors du démontage ou déconnexion
    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      console.log('🔌 Déconnecté de Pusher');
    };
  }, [isSignedIn, user, getToken]);

  return (
    <PusherContext.Provider value={{ pusher: pusherInstance, channel: userChannel }}>
      {children}
    </PusherContext.Provider>
  );
};
