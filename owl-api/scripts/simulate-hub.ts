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
 */
const generateValue = (type: string) => {
  switch (type) {
    case 'window':
      return Math.random() > 0.95 ? 'Ouvert' : 'Fermé';
    case 'temperature':
      return (19 + Math.random() * 5).toFixed(1);
    case 'humidity':
      return Math.floor(40 + Math.random() * 25);
    case 'air_quality':
      return Math.floor(400 + Math.random() * 1000);
    default:
      return 0;
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

  for (const type of SENSOR_TYPES) {
    for (let i = 1; i <= SENSORS_PER_TYPE; i++) {
      const sensorName = `${hubConfig.prefix} - ${type} ${i.toString().padStart(2, '0')}`;

      readings.push({
        sensor_name: sensorName,
        type: type,
        value: generateValue(type),
        timestamp: new Date().toISOString(),
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
