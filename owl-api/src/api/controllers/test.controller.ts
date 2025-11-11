import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { SensorType } from '../../entities/SensorType.js';

/**
 * @description Vérifie la connexion à la base de données en comptant les SensorTypes.
 */
export const getDbConnectionTest = async (req: Request, res: Response) => {
  try {
    const sensorTypeRepository = AppDataSource.getRepository(SensorType);
    const count = await sensorTypeRepository.count();
    
    res.status(200).json({
      message: 'Connexion à Supabase réussie !',
      sensorTypesInDatabase: count
    });
  } catch (error) {
    console.error("Erreur lors du test de la base de données :", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      message: 'Échec de la connexion à la base de données.',
      error: errorMessage
    });
  }
};
