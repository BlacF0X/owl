import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';

/**
 * @description Récupère l'historique complet formaté pour un capteur CO2
 * Utilisé par le graphique et la modale de la page CO2
 */
export const getCo2History = async (req: Request, res: Response) => {
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

    // 2. Récupérer l'historique du capteur (ex: 100 dernières valeurs)
    const readingRepository = AppDataSource.getRepository(SensorReading);
    const readings = await readingRepository.find({
      where: { sensor: { sensor_id: sensorId } },
      order: { timestamp: 'DESC' },
      take: 100,
    });

    // 3. Formater la réponse comme attendu par le frontend (SensorHistoryResponse)
    const formattedHistory = readings.map((reading) => ({
      timestamp: reading.timestamp,
      value: reading.value_num ?? 0, // On s'assure d'avoir un nombre pour le CO2
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
      "Erreur lors de la récupération de l'historique CO2 :",
      error
    );
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// (Si vous aviez d'autres fonctions comme getCo2Evolution ici, gardez-les ou remplacez-les selon besoin)
