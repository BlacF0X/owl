import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { AppDataSource } from '../../config/data-source.js';
import { User } from '../../entities/User.js';

// Le type de l'événement Clerk après vérification
type ClerkEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: Record<string, any>;
};

export const handleClerkWebhook = async (req: Request, res: Response) => {
  // 1. Vérification du Webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('Le secret du webhook Clerk n\'est pas configuré.');
    return res.status(500).json({ message: 'Configuration serveur incomplète.' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: 'En-têtes de webhook manquants.' });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkEvent;

  try {
    // Le corps de la requête est un Buffer ici, on le convertit en string
    const payload = req.body.toString('utf8');
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkEvent;
  } catch (err) {
    console.error('Erreur de vérification du webhook :', (err as Error).message);
    return res.status(400).json({ message: 'Webhook invalide.' });
  }

  // 2. Traitement de l'événement
  const { type, data } = evt;
  console.log(`Webhook reçu : ${type}`);

  const userRepository = AppDataSource.getRepository(User);

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const { id, first_name, email_addresses } = data;
        const email = email_addresses[0]?.email_address;
        if (!email) {
            return res.status(400).json({ message: 'Adresse email manquante.' });
        }

        let user = await userRepository.findOneBy({ clerk_user_id: id });
        if (!user) {
          user = userRepository.create({ clerk_user_id: id });
        }
        
        user.first_name = first_name;
        user.email = email;
        await userRepository.save(user);
        break;
      }

      case 'user.deleted': {
        // Clerk peut envoyer un événement de suppression pour un utilisateur qui n'a jamais été synchronisé.
        // La suppression ne doit pas échouer si l'utilisateur n'existe pas dans notre BDD.
        const { id } = data;
        await userRepository.delete({ clerk_user_id: id });
        break;
      }
    }
    res.status(200).json({ message: 'Webhook traité avec succès.' });

  } catch (dbError) {
    console.error('Erreur de base de données lors du traitement du webhook :', dbError);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
