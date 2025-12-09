import type { Request, Response } from 'express';
import { pusher } from '../../config/pusher.js';

export const authPusher = async (req: Request, res: Response) => {
  try {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;

    // L'ID utilisateur vient du middleware Clerk (clerkAuthMiddleware)
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }

    // Sécurité : On vérifie que le canal demandé correspond bien à l'utilisateur connecté
    // Format attendu du canal : private-user-{userId}
    const expectedChannel = `private-user-${userId}`;

    if (channel !== expectedChannel) {
      console.warn(
        `⛔ Tentative d'accès non autorisé Pusher. User: ${userId}, Channel demandé: ${channel}`
      );
      return res.status(403).json({ message: 'Accès au canal refusé.' });
    }

    const authResponse = pusher.authorizeChannel(socketId, channel);
    res.send(authResponse);
  } catch (error) {
    console.error('Erreur auth Pusher:', error);
    res.status(500).json({ message: 'Erreur interne.' });
  }
};
