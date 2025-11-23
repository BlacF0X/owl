import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { Between } from 'typeorm';

/**
 * @description Récupère UNIQUEMENT les capteurs de type 'fenêtre' pour l'utilisateur authentifié.
 */
export const getWindowSensorsForUser = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer l'ID de l'utilisateur (identique à l'autre contrôleur)
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    // 2. Utiliser TypeORM avec un filtre plus spécifique
    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const windowSensorsFromDb = await sensorRepository.find({
      relations: ['hub', 'hub.user', 'sensorType'],
      where: {
        // Filtre par l'utilisateur connecté
        hub: {
          user: {
            clerk_user_id: userId,
          },
        },
        // ET filtre par le type de capteur 'window'
        sensorType: {
          type_key: 'window',
        },
      },
    });

    // 3. Transformer les données (la logique est la même)
    const formattedSensors = windowSensorsFromDb.map((sensor) => {
      // Pour un capteur de fenêtre, le displayValue est toujours 'Ouvert' or 'Fermé'
      const displayValue = sensor.current_state_bool ? 'Ouvert' : 'Fermé';

      return {
        sensor_id: sensor.sensor_id,
        hub: {
          hub_id: sensor.hub.hub_id,
          name: sensor.hub.name,
        },
        name: sensor.name,
        displayValue: displayValue,
        state_changed_at: sensor.state_changed_at,
        type: {
          type_key: sensor.sensorType.type_key,
          name: sensor.sensorType.name,
          unit: sensor.sensorType.unit,
        },
      };
    });

    // 4. Renvoyer la réponse
    res.status(200).json(formattedSensors);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des capteurs de fenêtre :',
      error
    );
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * @description Récupère l'historique de TOUTES les fenêtres pour une date donnée.
 * URL: GET /api/sensors/windows/history?date=2025-11-20
 */
export const getWindowsHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const dateQuery = req.query.date as string; // Format YYYY-MM-DD

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    // 1. Déterminer la plage de temps (de 00:00 à 23:59 pour la date donnée)
    let targetDate = new Date();
    if (dateQuery) {
      targetDate = new Date(dateQuery);
    }

    // Début de la journée
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Fin de la journée
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const readingRepository = AppDataSource.getRepository(SensorReading);

    // 2. Requête optimisée
    const history = await readingRepository.find({
      where: {
        sensor: {
          // Filtre : Capteurs de ce user ET de type 'window'
          hub: { user: { clerk_user_id: userId } },
          sensorType: { type_key: 'window' },
        },
        timestamp: Between(startOfDay, endOfDay),
      },
      relations: ['sensor', 'sensor.hub'], // On a besoin du nom du capteur et du hub
      order: {
        timestamp: 'DESC',
      },
    });

    // 3. Formatage léger pour le front
    const formattedHistory = history.map((reading) => ({
      id: reading.reading_id,
      timestamp: reading.timestamp,
      state: reading.value_bool ? 'Ouvert' : 'Fermé',
      sensorName: reading.sensor.name,
      hubName: reading.sensor.hub.name,
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Erreur historique windows:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
