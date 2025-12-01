import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { Between } from 'typeorm';

/**
 * @description Récupère UNIQUEMENT les capteurs d'humidité pour l'utilisateur authentifié.
 */
export const getHumiditySensorsForUser = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer l'ID de l'utilisateur (identique à windows)
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    // 2. Utiliser TypeORM avec un filtre spécifique pour l'humidité
    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const humiditySensorsFromDb = await sensorRepository.find({
      relations: ['hub', 'hub.user', 'sensorType'],
      where: {
        // Filtre par l'utilisateur connecté
        hub: {
          user: {
            clerk_user_id: userId,
          },
        },
        // ET filtre par le type de capteur 'humidity'
        sensorType: {
          type_key: 'humidity',
        },
      },
    });

    // 3. Transformer les données
    const formattedSensors = humiditySensorsFromDb.map((sensor) => {
      // Pour un capteur d'humidité, le displayValue est une valeur numérique
      const displayValue = sensor.current_state_num?.toString() || '0';

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
      'Erreur lors de la récupération des capteurs d\'humidité :',
      error
    );
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * @description Récupère l'historique de l'humidité pour une date donnée.
 * URL: GET /api/humidity/history?date=2025-11-20
 */
export const getHumidityHistory = async (req: Request, res: Response) => {
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
          // Filtre : Capteurs de ce user ET de type 'humidity'
          hub: { user: { clerk_user_id: userId } },
          sensorType: { type_key: 'humidity' },
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
      value: reading.value_num?.toString() || '0',
      sensorName: reading.sensor.name,
      hubName: reading.sensor.hub.name,
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Erreur historique humidité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @description Récupère les statistiques d'humidité moyenne par heure sur les 7 derniers jours.
 * URL: GET /api/humidity/stats
 */
export const getHumidityHourlyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const refDateQuery = req.query.refDate as string | undefined;

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const readingRepository = AppDataSource.getRepository(SensorReading);

    // Déterminer la date de fin ("maintenant" ou simulée)
    let endDate = new Date();
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment && refDateQuery) {
      const parsedDate = new Date(refDateQuery);
      if (!isNaN(parsedDate.getTime())) {
        endDate = parsedDate;
        console.log(`[STATS DEV] Date référence : ${endDate.toISOString()}`);
      }
    }

    // Calcul de la date de début (il y a 7 jours)
    const sevenDaysAgo = new Date(endDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // --- REQUÊTE D'AGRÉGATION ---
    // On veut : L'heure (0-23) et la MOYENNE des valeurs d'humidité
    const rawStats = await readingRepository
      .createQueryBuilder('reading')
      // Jointure pour filtrer par utilisateur et type de capteur
      .leftJoin('reading.sensor', 'sensor')
      .leftJoin('sensor.hub', 'hub')
      .leftJoin('hub.user', 'user')
      .leftJoin('sensor.sensorType', 'type')
      .where('user.clerk_user_id = :userId', { userId })
      .andWhere("type.type_key = 'humidity'")
      // On ne regarde que les 7 derniers jours
      .andWhere('reading.timestamp >= :startDate', { startDate: sevenDaysAgo })
      .andWhere('reading.timestamp <= :endDate', { endDate: endDate })
      // On extrait l'heure du timestamp (spécifique à PostgreSQL)
      .select('EXTRACT(HOUR FROM reading.timestamp)', 'hour')
      .addSelect('AVG(reading.value_num)', 'avgHumidity')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // --- FORMATAGE ---
    // TypeORM renvoie 'hour' comme string parfois, on s'assure que ce sont des nombres
    const formattedStats = rawStats.map((stat) => ({
      hour: parseInt(stat.hour, 10),
      avgHumidity: Math.round(parseFloat(stat.avgHumidity) || 0),
    }));

    // --- NORMALISATION (Optionnel mais recommandé côté Back) ---
    // On s'assure d'avoir un tableau complet de 0 à 23h, même s'il y a des trous
    const completeStats = Array.from({ length: 24 }, (_, i) => {
      const found = formattedStats.find((s) => s.hour === i);
      return {
        hour: i,
        avgHumidity: found ? found.avgHumidity : 0,
      };
    });

    res.status(200).json(completeStats);
  } catch (error) {
    console.error('Erreur stats humidité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};