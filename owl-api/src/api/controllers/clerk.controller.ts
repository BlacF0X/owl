import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { AppDataSource } from '../../config/data-source.js';
import { User } from '../../entities/User.js';

type ClerkEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: Record<string, any>;
};

export const handleClerkWebhook = async (req: Request, res: Response) => {
  // 1. Vérification de la configuration
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: 'Le secret du webhook Clerk n\'est pas configuré.' });
  }

  // 2. Extraire les en-têtes requis individuellement
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  // 3. Valider la présence des en-têtes
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: 'Erreur : en-têtes de webhook manquants.' });
  }
  
  // 4. Construire l'objet d'en-têtes que svix attend
  const headersForSvix = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  };

  const payload = req.body.toString('utf8');
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkEvent;

  try {
    // 5. Passer le nouvel objet d'en-têtes à la méthode de vérification
    evt = wh.verify(payload, headersForSvix) as ClerkEvent;
  } catch (err) {
    console.error('Erreur de vérification du webhook :', (err as Error).message);
    return res.status(400).json({ message: 'Webhook invalide.' });
  }

  // 6. Traitement de l'événement (le reste du code est inchangé)
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
          return res.status(400).json({ message: 'Adresse email manquante dans le webhook.' });
        }

        const user = await userRepository.findOneBy({ clerk_user_id: id }) ?? userRepository.create({ clerk_user_id: id });
        
        user.first_name = first_name;
        user.email = email;
        await userRepository.save(user);
        break;
      }
      case 'user.deleted': {
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
