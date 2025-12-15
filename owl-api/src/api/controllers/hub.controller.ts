import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Hub } from '../../entities/Hub.js';

/**
 * @description Récupère la liste des Hubs liés à l'utilisateur connecté.
 */
export const getHubsForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé.' });
    }

    const hubRepository = AppDataSource.getRepository(Hub);
    
    // On cherche les hubs où la relation 'user' correspond à l'ID Clerk
    const hubs = await hubRepository.find({
      where: {
        user: {
          clerk_user_id: userId,
        },
      },
      order: {
        created_at: 'DESC', // Les plus récents en premier
      },
      // On sélectionne les champs utiles pour le dashboard
      select: {
        hub_id: true,
        name: true,
        serial_number: true,
        status: true,
        last_seen_at: true,
        created_at: true
      }
    });

    res.status(200).json(hubs);
  } catch (error) {
    console.error('Erreur lors de la récupération des hubs :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
