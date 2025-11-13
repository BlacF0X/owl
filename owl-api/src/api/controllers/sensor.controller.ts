import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';

/**
 * @description Récupère tous les capteurs pour l'utilisateur authentifié et les formate.
 */
export const getSensorsForUser = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer l'ID de l'utilisateur depuis le middleware d'authentification
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    // 2. Utiliser TypeORM pour faire une requête complexe
    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const sensorsFromDb = await sensorRepository.find({
      // On charge les relations 'hub' (pour remonter à l'utilisateur) et 'sensorType'
      relations: ['hub', 'hub.user', 'sensorType'],
      // On filtre pour ne récupérer que les capteurs dont le hub appartient à l'utilisateur connecté
      where: {
        hub: {
          user: {
            clerk_user_id: userId,
          },
        },
      },
    });

    // 3. Transformer les données pour qu'elles correspondent au format attendu par le frontend
    const formattedSensors = sensorsFromDb.map((sensor) => {
      let displayValue = '-';

      // Logique de transformation pour créer le `displayValue`
      if (sensor.sensorType.type_key === 'window') {
        displayValue = sensor.current_state_bool ? 'Ouvert' : 'Fermé';
      } else if (sensor.current_state_num !== null) {
        displayValue = `${sensor.current_state_num}`;
      }

      // On construit l'objet final qui correspond au type `Sensor` du frontend
      return {
        sensor_id: sensor.sensor_id,
        hub_id: sensor.hub.hub_id,
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

    // 4. Renvoyer la réponse formatée
    res.status(200).json(formattedSensors);
  } catch (error) {
    console.error('Erreur lors de la récupération des capteurs :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

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
        hub_id: sensor.hub.hub_id,
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
    console.error('Erreur lors de la récupération des capteurs de fenêtre :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
