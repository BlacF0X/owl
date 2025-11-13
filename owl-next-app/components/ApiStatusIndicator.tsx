'use client'; // Indique que c'est un Client Component

import { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';

// Les différents états possibles pour notre indicateur
type ApiStatus = 'checking' | 'online' | 'offline';

const ApiStatusIndicator = () => {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    // Cette fonction sera exécutée une seule fois au chargement du composant
    const checkApiStatus = async () => {
      // Récupère l'URL de l'API depuis les variables d'environnement
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL is not defined.');
        setStatus('offline');
        return;
      }

      try {
        // Nous "pingons" la racine de l'API. Si elle répond, c'est qu'elle est en ligne.
        const response = await fetch(apiUrl);
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        // Une erreur (ex: réseau, CORS) signifie que l'API est inaccessible
        console.error('API health check failed:', error);
        setStatus('offline');
      }
    };

    checkApiStatus();
  }, []); // Le tableau vide [] assure que l'effet ne s'exécute qu'une fois

  // Rendu conditionnel basé sur le statut
  const getStatusContent = () => {
    switch (status) {
      case 'online':
        return (
          <div
            className="flex items-center gap-2 text-sm text-green-600"
            title={`API connectée sur ${process.env.NEXT_PUBLIC_API_URL}`}
          >
            <Circle className="h-3 w-3 fill-current text-green-500" />
            <span>API Connectée</span>
          </div>
        );
      case 'offline':
        return (
          <div
            className="flex items-center gap-2 text-sm text-red-600"
            title={`Impossible de joindre l'API sur ${process.env.NEXT_PUBLIC_API_URL}`}
          >
            <Circle className="h-3 w-3 fill-current text-red-500" />
            <span>API Inaccessible</span>
          </div>
        );
      case 'checking':
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Circle className="h-3 w-3 animate-pulse fill-current text-slate-400" />
            <span>Vérification API...</span>
          </div>
        );
    }
  };

  return <div className="rounded-full bg-slate-200 px-3 py-1">{getStatusContent()}</div>;
};

export default ApiStatusIndicator;
