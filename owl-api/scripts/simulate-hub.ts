// Exécuter avec : doppler run -- npx tsx scripts/simulate-hub.ts

import dotenv from 'dotenv';

dotenv.config();

// Construction correcte de l'URL pour éviter les 404
const API_URL =
  (process.env.API_URL || 'http://localhost:8080') + '/api/ingest';
const API_KEY = process.env.OWL_API_KEY_BOT;

// Configuration de la simulation
const HUBS_CONFIG = [
  { serial: 'HUB-SIMU-001', prefix: 'Maison' },
  { serial: 'HUB-SIMU-002', prefix: 'Bureau' },
];

const SENSOR_TYPES = [
  'window',
  'temperature',
  'humidity',
  'air_quality',
] as const;
const SENSORS_PER_TYPE = 5;

if (!API_KEY) {
  console.error('❌ Erreur : OWL_API_KEY_BOT manquant dans le .env');
  process.exit(1);
}

console.log(`🚀 Démarrage du simulateur "Project OwL"`);
console.log(
  `🎯 Cible : ${HUBS_CONFIG.length} Hubs | ${SENSORS_PER_TYPE} capteurs/type | Total : ${HUBS_CONFIG.length * SENSOR_TYPES.length * SENSORS_PER_TYPE} capteurs`
);

/**
 * Génère une valeur réaliste selon le type de capteur
 * CORRECTION : Suppression de 'iteration', utilisation du temps réel pour le cycle
 */
const generateValue = (type: string, timestamp?: Date): string | number => {
  const now = timestamp || new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const minuteOfDay = hour * 60;

  // CORRECTION MAJEURE ICI :
  // On calcule le "cycle" basé sur les minutes réelles écoulées (UNIX time).
  // Cela remplace l'argument 'iteration' qui valait toujours 0.
  // Le % 720 assure un cycle qui se répète toutes les 12 heures (720 minutes).
  const timeBasedCycle = Math.floor(now.getTime() / 60000) % 720;

  switch (type) {
    case 'window':
      return minuteOfDay > 480 && minuteOfDay < 1080 && Math.random() > 0.85
        ? 'Ouvert'
        : 'Fermé';

    case 'temperature': {
      let baseTemp = 20.5;

      // Utilisation du cycle basé sur le temps
      if (timeBasedCycle < 60) {
        baseTemp = 15.2; // ALERTE FROID (Pendant les 60 premières minutes du cycle de 12h)
      } else if (timeBasedCycle > 660) {
        baseTemp = 26.8; // ALERTE CHAUD (Pendant la dernière heure du cycle)
      } else if (minuteOfDay > 840 && Math.random() > 0.9) {
        baseTemp -= 3.5; // Fenêtre ouverte aléatoire après 14h
      }

      const dailyVariation = 1.2 * Math.sin((2 * Math.PI * (hour - 6)) / 24);
      const noise = (Math.random() - 0.5) * 0.8;
      const temperatureValue = Math.max(
        10,
        Math.min(35, baseTemp + dailyVariation + noise)
      );

      return temperatureValue.toFixed(1);
    }

    case 'humidity': {
      // Calculer température d'abord pour corrélation
      // Note: Cela génère une nouvelle valeur aléatoire de temp pour le calcul
      const tempValue = parseFloat(generateValue('temperature', now) as string);
      return (
        tempValue < 18 ? 65 + Math.random() * 15 : 40 + Math.random() * 20
      ).toFixed(0);
    }

    case 'air_quality':
      return Math.floor(350 + Math.random() * 800).toString();

    default:
      return '0';
  }
};

/**
 * Génère la liste des lectures pour un Hub donné
 */
const generatePayloadForHub = (hubConfig: {
  serial: string;
  prefix: string;
}) => {
  const readings = [];
  const now = new Date(); // On fige le temps pour ce hub
  const timestampIso = now.toISOString();

  for (const type of SENSOR_TYPES) {
    for (let i = 1; i <= SENSORS_PER_TYPE; i++) {
      const sensorName = `${hubConfig.prefix} - ${type} ${i.toString().padStart(2, '0')}`;

      readings.push({
        sensor_name: sensorName,
        type: type,
        value: generateValue(type, now), // On passe 'now' explicitement
        timestamp: timestampIso,
      });
    }
  }

  return {
    hub_serial: hubConfig.serial,
    readings: readings,
  };
};

/**
 * Envoie les données pour tous les hubs configurés.
 * Retourne true si succès total, false si au moins une erreur.
 */
const runSimulationCycle = async (): Promise<boolean> => {
  let globalSuccess = true;

  for (const hub of HUBS_CONFIG) {
    const payload = generatePayloadForHub(hub);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(
          `✅ [${new Date().toLocaleTimeString()}] ${hub.prefix} (${hub.serial}) : Envoyé ${payload.readings.length} mesures.`
        );
      } else {
        const txt = await res.text();
        console.error(`❌ Erreur sur ${hub.serial} (${res.status}):`, txt);
        globalSuccess = false; // On marque l'erreur
      }
    } catch (err) {
      console.error(`❌ Erreur réseau sur ${hub.serial}:`, err);
      globalSuccess = false; // On marque l'erreur
    }
  }

  return globalSuccess;
};

const run = async () => {
  // Exécution immédiate
  const isSuccess = await runSimulationCycle();

  // Si on est en mode "CRON" (défini dans les variables d'env)
  if (process.env.SIMULATION_MODE === 'CRON') {
    if (isSuccess) {
      console.log('🏁 Mode CRON terminé avec SUCCÈS.');
      process.exit(0); // GitHub Action Vert ✅
    } else {
      console.error('🏁 Mode CRON terminé avec ERREURS.');
      process.exit(1); // GitHub Action Rouge ❌
    }
  }
};

// Lancement
run();

// Si on n'est PAS en mode CRON, on active la boucle infinie
if (process.env.SIMULATION_MODE !== 'CRON') {
  console.log('🔄 Mode CONTINU activé (Ctrl+C pour arrêter)');
  setInterval(runSimulationCycle, 10000); // Toutes les 10s en local
}
