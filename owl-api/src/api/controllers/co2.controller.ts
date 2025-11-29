import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Sensor as SensorEntity } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';

/**
 * @description Récupère l'évolution du CO2 pour le graphique.
 * Version CORRIGÉE : Conversion explicite des nombres et gestion des erreurs de type.
 */
export const getCo2Evolution = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { sensorId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé.' });
    }

    // 1. Vérification capteur
    const sensorRepo = AppDataSource.getRepository(SensorEntity);
    const sensor = await sensorRepo.findOne({
      where: {
        sensor_id: sensorId,
        hub: { user: { clerk_user_id: userId } },
      },
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Capteur introuvable.' });
    }

    // 2. Récupération des 100 dernières valeurs
    const readingRepo = AppDataSource.getRepository(SensorReading);
    const readings = await readingRepo.find({
      where: {
        sensor: { sensor_id: sensorId },
      },
      order: { timestamp: 'DESC' },
      take: 100,
    });

    if (readings.length === 0) {
      return res.status(200).json([]);
    }

    // On remet dans l'ordre chronologique
    readings.reverse();

    // 3. Agrégation par heure avec sécurisation des nombres
    const groupedData: Record<string, number[]> = {};

    readings.forEach((r) => {
      // Sécurité : on force la conversion en nombre et on vérifie que c'est valide
      const val = Number(r.value_num);

      if (!isNaN(val) && val > 0) {
        // On ignore les 0 ou les null
        const dateObj = new Date(r.timestamp);
        const hourKey = `${dateObj.getHours()}h`;

        if (!groupedData[hourKey]) {
          groupedData[hourKey] = [];
        }
        groupedData[hourKey].push(val);
      }
    });

    // 4. Calcul des moyennes et hauteurs
    const MAX_CHART_PPM = 1500; // Échelle max (correspond au haut du graph)

    const evolutionData = Object.keys(groupedData).map((hour) => {
      const values = groupedData[hour];

      // Calcul de la moyenne sécurisé
      const sum = values.reduce((a, b) => a + b, 0);
      const avgPpm = Math.round(sum / values.length);

      // Calcul de la hauteur
      // Si avgPpm = 900, height = (900 / 1500) * 100 = 60%
      let height = (avgPpm / MAX_CHART_PPM) * 100;

      // Bornage entre 0 et 100% pour éviter les débordements CSS
      if (height > 100) height = 100;
      if (height < 0) height = 0;

      return {
        hour: hour,
        ppm: avgPpm,
        height: Math.round(height),
      };
    });

    console.log(
      `✅ Données envoyées pour ${sensorId}: ${evolutionData.length} points.`
    );

    res.status(200).json(evolutionData);
  } catch (error) {
    console.error('❌ Erreur CO2 Controller:', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
};
