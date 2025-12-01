import type { Request, Response } from 'express';
import AppDataSource from '@/config/data-source.js';
import Sensor as SensorEntity from '@/entities/Sensor.js';
import SensorReading from '@/entities/SensorReading.js';
import { Between } from 'typeorm';

/**
 * Récupère UNIQUEMENT les capteurs d'humidité pour l'utilisateur authentifié.
 */
export const getHumiditySensorsForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'ID utilisateur manquant.' });

    const sensorRepository = AppDataSource.getRepository(SensorEntity);
    const humiditySensorsFromDb = await sensorRepository.find({
      relations: ['hub', 'hub.user', 'sensorType'],
      where: {
        hub: { user: { clerkuserid: userId } },
        sensorType: { typekey: 'humidity' },
      },
    });

    const formattedSensors = humiditySensorsFromDb.map((sensor) => ({
      sensorid: sensor.sensorid,
      hub: { hubid: sensor.hub.hubid, name: sensor.hub.name },
      name: sensor.name,
      displayValue: sensor.currentstatenum?.toString() || '0',
      statechangedat: sensor.statechangedat,
      type: {
        typekey: sensor.sensorType.typekey,
        name: sensor.sensorType.name,
        unit: sensor.sensorType.unit,
      },
    }));

    res.status(200).json(formattedSensors);
  } catch (error) {
    console.error('Erreur humidité:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

/**
 * Récupère lévolution de lhumidité sur 24h pour un capteur spécifique.
 */
export const getHumidityEvolution = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { sensorId } = req.params;
    const { period = '24h', refDate } = req.query as { period?: string; refDate?: string };

    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Détermination de la date de fin
    let endDate = new Date();
    if (isDevelopment && refDate) {
      const parsedDate = new Date(refDate as string);
      if (!isNaN(parsedDate.getTime())) {
        endDate = parsedDate;
      }
    }

    // Calcul de la date de début
    const startDate = new Date(endDate);
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setTime(startDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const readingRepository = AppDataSource.getRepository(SensorReading);
    const readings = await readingRepository.find({
      where: {
        sensor: { sensorid: sensorId },
        hub: { user: { clerkuserid: userId } },
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
      take: 100,
    });

    res.status(200).json(readings);
  } catch (error) {
    console.error('Erreur évolution humidité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};