import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { Between } from 'typeorm';

// ✅ Interface pour le format de réponse
interface FormattedReading {
  timestamp: Date;
  value: number | boolean | null;
  value_num: number | null;
}

/**
 * @description Récupère tous les capteurs pour l'utilisateur authentifié et les formate.
 */
export const getSensorsForUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    const sensorRepository = AppDataSource.getRepository(SensorEntity);

    const sensorsFromDb = await sensorRepository.find({
      relations: ['hub', 'hub.user', 'sensorType'],
      where: {
        hub: {
          user: {
            clerk_user_id: userId,
          },
        },
      },
    });

    const formattedSensors = sensorsFromDb.map((sensor) => {
      let displayValue = '-';

      if (sensor.sensorType.type_key === 'window') {
        displayValue = sensor.current_state_bool ? 'Ouvert' : 'Fermé';
      } else if (sensor.current_state_num !== null) {
        displayValue = sensor.current_state_num.toString();
      }

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

    return res.status(200).json(formattedSensors);
  } catch (error) {
    console.error('Erreur lors de la récupération des capteurs : ', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * @description Récupère l'historique des lectures. Accepte ?period=24h (défaut) ou 7d.
 * Accepte ?refDate=ISOSTRING (optionnel, DEV seulement) pour simuler "maintenant".
 */
export const getSensorReadings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.auth?.userId;
    const { sensorId } = req.params;
    const period = (req.query.period === '7d' ? '7d' : '24h') as '24h' | '7d';
    const refDateQuery = req.query.refDate as string | undefined;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';

    let endDate = new Date();

    if (isDevelopment && refDateQuery) {
      const parsedDate = new Date(refDateQuery);
      if (!isNaN(parsedDate.getTime())) {
        endDate = parsedDate;
      }
    }

    const startDate = new Date(endDate);
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setTime(startDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const readingRepository = AppDataSource.getRepository(SensorReading);

    const readings = await readingRepository.find({
      where: {
        sensor: {
          sensor_id: sensorId,
          hub: { user: { clerk_user_id: userId } },
        },
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
      take: 1000,
    });

    // ✅ Formatage avec typage strict
    const formattedReadings: FormattedReading[] = readings.map((reading) => ({
      timestamp: reading.timestamp,
      value: reading.value_num ?? reading.value_bool ?? null,
      value_num: reading.value_num ?? null,
    }));

    return res.status(200).json(formattedReadings);
  } catch (error) {
    console.error('Erreur historique', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
