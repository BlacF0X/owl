console.log('--- ✅ API ENTRY POINT REACHED ---');

// =================================================================
// Imports
// =================================================================
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source.js';
import apiRouter from './api/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

// =================================================================
// Initialisation Globale
// =================================================================
dotenv.config();

// On vérifie si la source de données n'est PAS déjà initialisée.
// Cela empêche de créer une nouvelle connexion à chaque invocation de la fonction serverless.
if (!AppDataSource.isInitialized) {
  // Le code à l'intérieur de ce `if` ne s'exécutera que lors d'un "cold start".
  await AppDataSource.initialize()
    .then(() =>
      console.log('✅ Source de données initialisée pour cette instance.')
    )
    .catch((err) =>
      console.error(
        "❌ Erreur lors de l'initialisation de la source de données :",
        err
      )
    );
}

// =================================================================
// Configuration de l'application Express
// =================================================================
const app = express();

app.use(cors());

// Route pour la documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📚 Documentation Swagger activée sur /api-docs');
}

// On branche notre routeur d'API sur le préfixe '/api'
// Toutes les routes définies dans apiRouter commenceront par /api
app.use('/api', apiRouter);

// =================================================================
// Démarrage Conditionnel & Export
// =================================================================
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(
      `🦉 API démarrée (local) et à l'écoute sur http://localhost:${PORT}`
    );
  });
}

// ============================================
// Types pour les capteurs d'humidité
// ============================================

/**
 * Représente une lecture individuelle d'un capteur d'humidité
 */
export interface HumidityReading {
  /** Identifiant unique de la lecture */
  id: string;
  /** Identifiant de la pièce */
  roomId: string;
  /** Nom de la pièce */
  roomName: string;
  /** Pourcentage d'humidité (0-100) */
  humidity: number;
  /** Température optionnelle (en °C) */
  temperature?: number;
  /** Horodatage de la lecture */
  timestamp: Date;
}

/**
 * Statistiques globales d'humidité
 */
export interface HumidityStats {
  /** Humidité moyenne sur toutes les pièces (%) */
  averageHumidity: number;
  /** Nombre d'alertes actives */
  activeAlerts: number;
  /** Horodatage de la dernière mise à jour */
  lastUpdate: Date;
}

/**
 * Statut de l'humidité d'une pièce
 */
export type HumidityStatus = 'optimal' | 'warning' | 'danger';

/**
 * Représente l'état d'humidité d'une pièce
 */
export interface HumidityRoom {
  /** Identifiant unique de la pièce */
  id: string;
  /** Nom de la pièce */
  name: string;
  /** Pourcentage d'humidité actuel (0-100) */
  humidity: number;
  /** Statut de l'humidité */
  status: HumidityStatus;
}

/**
 * Point de données pour le graphique d'évolution
 */
export interface HumidityDataPoint {
  /** Heure (0-23) */
  hour: number;
  /** Pourcentage d'humidité (0-100) */
  value: number;
}

/**
 * Seuils d'humidité pour déterminer le statut
 */
export interface HumidityThreshold {
  /** Plage optimale */
  optimal: {
    min: number;
    max: number;
  };
  /** Plage de surveillance */
  warning: {
    min: number;
    max: number;
  };
  /** Plage critique */
  danger: {
    min: number;
    max: number;
  };
}

/**
 * Seuils par défaut pour l'humidité
 */
export const DEFAULT_HUMIDITY_THRESHOLDS: HumidityThreshold = {
  optimal: { min: 40, max: 60 },
  warning: { min: 60, max: 70 },
  danger: { min: 70, max: 100 },
};

/**
 * Helper function pour déterminer le statut selon le pourcentage d'humidité
 */
export function getHumidityStatus(humidity: number): HumidityStatus {
  if (humidity >= 40 && humidity <= 60) {
    return 'optimal';
  } else if (humidity > 60 && humidity <= 70) {
    return 'warning';
  } else {
    return 'danger';
  }
}

/**
 * Helper function pour obtenir le message de statut
 */
export function getHumidityStatusMessage(status: HumidityStatus): string {
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
}

export default app;
