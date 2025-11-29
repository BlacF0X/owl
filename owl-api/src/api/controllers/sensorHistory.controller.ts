import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';

/**
 * @description Récupère l'historique d'un capteur spécifique pour l'utilisateur authentifié.
 */
export const getSensorHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'ID utilisateur manquant.' });
    }

    const { sensorId } = req.params;

    // 1. Vérifier que le capteur appartient bien à l'utilisateur
    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const sensor = await sensorRepository.findOne({
      where: {
        sensor_id: sensorId,
        hub: {
          user: {
            clerk_user_id: userId,
          },
        },
      },
      relations: ['hub', 'hub.user', 'sensorType'],
    });

    if (!sensor) {
      return res
        .status(404)
        .json({ message: 'Capteur non trouvé ou non autorisé.' });
    }

    // 2. Récupérer l'historique du capteur
    const readingRepository = AppDataSource.getRepository(SensorReading);
    const readings = await readingRepository.find({
      where: { sensor: { sensor_id: sensorId } },
      order: { timestamp: 'DESC' },
      take: 100, // Limite aux 100 dernières lectures
    });

    // 3. Formatter la réponse
    const formattedHistory = readings.map((reading) => ({
      timestamp: reading.timestamp,
      value:
        sensor.sensorType.type_key === 'window'
          ? reading.value_bool
          : reading.value_num,
    }));

    const response = {
      sensor: {
        sensor_id: sensor.sensor_id,
        name: sensor.name,
        type: {
          type_key: sensor.sensorType.type_key,
          name: sensor.sensorType.name,
          unit: sensor.sensorType.unit,
        },
      },
      history: formattedHistory,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique du capteur :",
      error
    );
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
