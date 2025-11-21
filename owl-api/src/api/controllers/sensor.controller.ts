import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { MoreThanOrEqual, Between } from 'typeorm';

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

    // 4. Renvoyer la réponse formatée
    res.status(200).json(formattedSensors);
  } catch (error) {
    console.error('Erreur lors de la récupération des capteurs :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * @description Récupère l'historique des lectures pour un capteur spécifique
 * sur une période donnée (24h ou 7j).
 * EN DÉVELOPPEMENT : Simule la date du jour comme étant la date de la dernière lecture.
 */
export const getSensorReadings = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer les informations de la requête
    const userId = req.auth?.userId;
    const { sensorId } = req.params;
    const period = req.query.period === '7d' ? '7d' : '24h';

    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }
    if (!sensorId) {
      return res.status(400).json({ message: 'ID du capteur manquant.' });
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    let referenceDate = new Date();
    const readingRepository = AppDataSource.getRepository(SensorReading);

    if (isDevelopment) {
      const result = await readingRepository.query(
        'SELECT MAX(timestamp) as "maxTimestamp" FROM sensorreadings'
      );
      const maxTimestamp = result[0]?.maxTimestamp;

      if (maxTimestamp) {
        referenceDate = new Date(maxTimestamp);
        console.log(
          `[DEV MODE] Date de référence statique trouvée : ${referenceDate.toISOString()}`
        );
      } else {
        console.log(
          '[DEV MODE] Aucune lecture trouvée, utilisation de la date actuelle.'
        );
      }
    }

    const fromDate = new Date(referenceDate);
    if (period === '7d') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else {
      fromDate.setDate(fromDate.getDate() - 1);
    }

    const timestampFilter = isDevelopment
      ? Between(fromDate, referenceDate)
      : MoreThanOrEqual(fromDate);

    const readings = await readingRepository.find({
      where: {
        sensor: {
          sensor_id: sensorId,
          hub: { user: { clerk_user_id: userId } },
        },
        timestamp: timestampFilter,
      },
      order: {
        timestamp: 'DESC',
      },
    });

    res.status(200).json(readings);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des lectures :",
      error
    );
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
