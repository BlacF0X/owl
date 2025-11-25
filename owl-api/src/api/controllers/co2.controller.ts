// FILE: controllers/co2.controller.ts
import type { Request, Response } from 'express';
import { MoreThan } from 'typeorm';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';

/**
 * @description Récupère l'évolution du CO2 sur les dernières 24h (moyenne par heure).
 */
export const getCo2Evolution = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { sensorId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé.' });
    }

    // 1. Vérifier que le capteur appartient bien à l'utilisateur
    const sensorRepo = AppDataSource.getRepository(SensorEntity);
    const sensor = await sensorRepo.findOne({
      where: {
        sensor_id: sensorId,
        hub: { user: { clerk_user_id: userId } },
      },
      relations: ['sensorType'],
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Capteur introuvable.' });
    }

    // 2. Calculer la date d'il y a 24h
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // 3. Récupérer les lectures des dernières 24h
    const readingRepo = AppDataSource.getRepository(SensorReading);
    const readings = await readingRepo.find({
      where: {
        sensor: { sensor_id: sensorId },
        timestamp: MoreThan(oneDayAgo),
      },
      order: { timestamp: 'ASC' },
    });

    // 4. Agréger les données par heure
    // On veut un tableau de 24 points (ou moins selon les données disponibles)
    const groupedData: Record<string, number[]> = {};

    readings.forEach((r) => {
      if (r.value_num !== null) {
        // On extrait l'heure (ex: "14h")
        const dateObj = new Date(r.timestamp);
        const hourKey = `${dateObj.getHours()}h`;
        
        if (!groupedData[hourKey]) {
          groupedData[hourKey] = [];
        }
        groupedData[hourKey].push(r.value_num);
      }
    });

    // 5. Construire le format final pour le frontend
    // Format attendu: { hour: string, height: number, ppm: number }
    // L'échelle max du graphique semble être 1500ppm (basé sur ton code frontend)
    const MAX_CHART_PPM = 1500;

    const evolutionData = Object.keys(groupedData).map((hour) => {
      const values = groupedData[hour];
      // Calcul de la moyenne pour cette heure-là
      const avgPpm = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      
      // Calcul de la hauteur en pourcentage (plafonnée à 100%)
      let height = (avgPpm / MAX_CHART_PPM) * 100;
      if (height > 100) height = 100;

      return {
        hour: hour,
        ppm: avgPpm,
        height: Math.round(height),
      };
    });

    // Optionnel : Trier pour avoir l'ordre chronologique correct si nécessaire,
    // mais ici l'objet map ne garantit pas l'ordre, une simple passe de tri peut aider :
    // (Simplification : on renvoie tel quel, le frontend affichera les heures présentes)

    res.status(200).json(evolutionData);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évolution CO2 :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
};
