// src/api/controllers/temperature.controller.ts
import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
// L'import de 'Between' a été supprimé ici

/**
 * Récupère UNIQUEMENT les capteurs de type température
 */
export const getTemperatureSensorsForUser = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const tempSensorsFromDb = await sensorRepository.find({
      relations: ['hub', 'hub.user', 'sensorType'],
      where: {
        hub: { user: { clerk_user_id: userId } },
        sensorType: { type_key: 'temperature' },
      },
    });

    const formattedSensors = tempSensorsFromDb.map((sensor) => {
      const displayValue = sensor.current_state_num?.toString() || '0';
      return {
        sensor_id: sensor.sensor_id,
        hub: {
          hub_id: sensor.hub.hub_id,
          name: sensor.hub.name,
        },
        name: sensor.name,
        displayValue,
        state_changed_at: sensor.state_changed_at,
        type: {
          type_key: sensor.sensorType.type_key,
          name: sensor.sensorType.name,
          unit: sensor.sensorType.unit,
        },
      };
    });

    res.status(200).json(formattedSensors);
  } catch (error) {
    console.error('Erreur capteurs température:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * Stats horaires température - 7 derniers jours
 */
export const getTemperatureHourlyStats = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    const refDateQuery = req.query.refDate as string | undefined;

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const readingRepository = AppDataSource.getRepository(SensorReading);
    let endDate = new Date();
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment && refDateQuery) {
      const parsedDate = new Date(refDateQuery);
      if (!isNaN(parsedDate.getTime())) {
        endDate = parsedDate;
        console.log(
          `[TEMPERATURE STATS DEV] Date référence: ${endDate.toISOString()}`
        );
      }
    }

    const sevenDaysAgo = new Date(endDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawStats = await readingRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.sensor', 'sensor')
      .leftJoin('sensor.hub', 'hub')
      .leftJoin('hub.user', 'user')
      .leftJoin('sensor.sensorType', 'type')
      .where('user.clerk_user_id = :userId', { userId })
      .andWhere("type.type_key = 'temperature'")
      .andWhere('reading.timestamp >= :startDate', { startDate: sevenDaysAgo })
      .andWhere('reading.timestamp <= :endDate', { endDate })
      .select('EXTRACT(HOUR FROM reading.timestamp)', 'hour')
      .addSelect('AVG(reading.value_num)', 'avgTemperature')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    const formattedStats = rawStats.map((stat) => ({
      hour: parseInt(stat.hour, 10),
      count: Math.round(parseFloat(stat.avgTemperature || 0)),
    }));

    const completeStats = Array.from({ length: 24 }, (_, i) => {
      const found = formattedStats.find((s) => s.hour === i);
      return {
        hour: i,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json(completeStats);
  } catch (error) {
    console.error('Erreur stats température:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
