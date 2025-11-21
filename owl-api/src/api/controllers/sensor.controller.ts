import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { MoreThanOrEqual, Between, LessThanOrEqual } from 'typeorm';

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
 * @description Récupère l'historique des lectures.
 * Accepte ?period=24h (défaut) ou 7d.
 * Accepte ?refDate=ISOSTRING (optionnel, DEV seulement) pour simuler "maintenant".
 */
export const getSensorReadings = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { sensorId } = req.params;
    const period = req.query.period === '7d' ? '7d' : '24h';
    // Récupération de la date de référence optionnelle
    const refDateQuery = req.query.refDate as string | undefined;

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Détermination de la date de fin ("maintenant")
    let endDate = new Date();

    // Logique spécifique DEV : Si une refDate est fournie, on l'utilise
    if (isDevelopment && refDateQuery) {
      const parsedDate = new Date(refDateQuery);
      if (!isNaN(parsedDate.getTime())) {
        endDate = parsedDate;
        console.log(`[DEV] Utilisation de la date de référence simulée : ${endDate.toISOString()}`);
      }
    } else if (isDevelopment) {
      // Fallback DEV : Si pas de refDate fournie, on cherche la dernière donnée en base
      // (C'est votre logique existante intelligente)
      const readingRepository = AppDataSource.getRepository(SensorReading);
      const result = await readingRepository.query(
        'SELECT MAX(timestamp) as "maxTimestamp" FROM sensorreadings'
      );
      if (result[0]?.maxTimestamp) {
        endDate = new Date(result[0].maxTimestamp);
        console.log(`[DEV] Auto-détection date max : ${endDate.toISOString()}`);
      }
    }

    // Calcul de la date de début en fonction de la date de fin
    const startDate = new Date(endDate);
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      // 24h exactes en arrière
      startDate.setTime(startDate.getTime() - (24 * 60 * 60 * 1000));
    }

    const readingRepository = AppDataSource.getRepository(SensorReading);
    
    const readings = await readingRepository.find({
      where: {
        sensor: {
          sensor_id: sensorId,
          hub: { user: { clerk_user_id: userId } },
        },
        // On cherche les lectures ENTRE date_début et date_fin
        timestamp: Between(startDate, endDate),
      },
      order: {
        timestamp: 'DESC',
      },
      take: 100, // Sécurité
    });

    res.status(200).json(readings);
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
