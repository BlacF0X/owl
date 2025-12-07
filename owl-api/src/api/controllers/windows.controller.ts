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

/**
 * @description Récupère les statistiques d'ouverture par heure sur les 7 derniers jours.
 * URL: GET /api/sensors/windows/stats
 */
export const getWindowsHourlyStats = async (req: Request, res: Response) => {
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
    // On veut : L'heure (0-23) et le nombre d'événements "Ouvert" (true)
    const rawStats = await readingRepository
      .createQueryBuilder('reading')
      // Jointure pour filtrer par utilisateur et type de capteur
      .leftJoin('reading.sensor', 'sensor')
      .leftJoin('sensor.hub', 'hub')
      .leftJoin('hub.user', 'user')
      .leftJoin('sensor.sensorType', 'type')
      .where('user.clerk_user_id = :userId', { userId })
      .andWhere("type.type_key = 'window'")
      // On ne regarde que les 7 derniers jours
      .andWhere('reading.timestamp >= :startDate', { startDate: sevenDaysAgo })
      .andWhere('reading.timestamp <= :endDate', { endDate: endDate })
      // On ne compte que les ouvertures (value_bool = true)
      .andWhere('reading.value_bool = :isOpen', { isOpen: true })
      // On extrait l'heure du timestamp (spécifique à PostgreSQL)
      .select('EXTRACT(HOUR FROM reading.timestamp)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();
    // getRawMany est important car le résultat n'est pas une entité SensorReading standard

    // --- FORMATAGE ---
    // TypeORM renvoie 'hour' comme string parfois, on s'assure que ce sont des nombres
    const formattedStats = rawStats.map((stat) => ({
      hour: parseInt(stat.hour, 10),
      count: parseInt(stat.count, 10),
    }));

    // --- NORMALISATION (Optionnel mais recommandé côté Back) ---
    // On s'assure d'avoir un tableau complet de 0 à 23h, même s'il y a des trous
    const completeStats = Array.from({ length: 24 }, (_, i) => {
      const found = formattedStats.find((s) => s.hour === i);
      return {
        hour: i,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json(completeStats);
  } catch (error) {
    console.error('Erreur stats windows:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getTemperaturesHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const dateQuery = req.query.date as string; // Format YYYY-MM-DD

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    // 1. Déterminer la plage de temps (de 00:00 à 23:59 pour la date donnée)
    let targetDate = new Date();
    if (dateQuery) {
      // On s'assure que la date est valide
      const parsedDate = new Date(dateQuery);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }

    // Début de la journée
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Fin de la journée
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const readingRepository = AppDataSource.getRepository(SensorReading);

    // 2. Requête optimisée pour les températures
    const history = await readingRepository.find({
      where: {
        sensor: {
          // Filtre : Capteurs de ce user ET de type 'temperature' (ou la clé que tu utilises)
          hub: { user: { clerk_user_id: userId } },
          sensorType: { type_key: 'temperature' }, // Assure-toi que 'temperature' est la bonne clé dans ta DB
        },
        timestamp: Between(startOfDay, endOfDay),
      },
      relations: ['sensor', 'sensor.hub'], // Pour récupérer le nom du capteur et du hub
      order: {
        timestamp: 'DESC', // Plus récent en premier
      },
    });

    // 3. Formatage pour le front
    const formattedHistory = history.map((reading) => ({
      id: reading.reading_id,
      timestamp: reading.timestamp,
      value: Number(reading.value_num), // On renvoie la valeur numérique
      unit: '°C', // Tu peux aussi le récupérer via reading.sensor.sensorType.unit si tu l'as jointe
      sensorName: reading.sensor.name,
      hubName: reading.sensor.hub.name,
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Erreur historique temperatures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
