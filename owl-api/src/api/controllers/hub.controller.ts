import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Hub } from '../../entities/Hub.js';
import { User } from '../../entities/User.js';
import { ProvisionPayload } from '../../types/ingest.js';
import { HubStatus } from '../../entities/types/hub-status.enum.js';

export const provisionHub = async (req: Request, res: Response) => {
  const { hub_serial, email } = req.body as ProvisionPayload;

  if (!hub_serial || !email) {
    return res.status(400).json({ message: 'Serial number et Email requis.' });
  }

  const hubRepo = AppDataSource.getRepository(Hub);
  const userRepo = AppDataSource.getRepository(User);

  try {
    // 1. Trouver l'utilisateur via l'email
    // Note: L'utilisateur doit s'être déjà connecté une fois au Dashboard pour exister en BDD via le webhook Clerk
    const user = await userRepo.findOneBy({ email: email });

    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur introuvable. Veuillez d\'abord créer un compte sur le Dashboard.' 
      });
    }

    // 2. Trouver ou Créer le Hub
    let hub = await hubRepo.findOne({ 
      where: { serial_number: hub_serial },
      relations: ['user']
    });

    if (hub) {
      // Sécurité basique : Si le hub appartient déjà à quelqu'un d'autre
      if (hub.user && hub.user.clerk_user_id !== user.clerk_user_id) {
        return res.status(403).json({ message: 'Ce Hub est déjà associé à un autre utilisateur.' });
      }
      // Mise à jour
      hub.user = user;
      hub.status = HubStatus.ONLINE; // On le passe en ligne car il vient de nous contacter
      hub.last_seen_at = new Date();
    } else {
      // Création
      hub = hubRepo.create({
        serial_number: hub_serial,
        name: `Hub ${hub_serial}`, // Nom par défaut
        status: HubStatus.ONLINE,
        last_seen_at: new Date(),
        user: user
      });
    }

    await hubRepo.save(hub);

    console.log(`✅ Hub ${hub_serial} associé à l'utilisateur ${email}`);
    return res.status(200).json({ message: 'Hub configuré et associé avec succès.' });

  } catch (error) {
    console.error('Erreur provisioning Hub:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du provisioning.' });
  }
};

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
        created_at: true,
      },
    });

    res.status(200).json(hubs);
  } catch (error) {
    console.error('Erreur lors de la récupération des hubs :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};