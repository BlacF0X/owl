import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';

// Étendre le type Request d'Express pour y attacher les informations d'authentification
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
      };
    }
  }
}

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const clerkAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res
        .status(401)
        .json({ message: 'Aucun token d’authentification fourni.' });
    }

    const token = authorizationHeader.split(' ')[1];
    const claims = await clerkClient.verifyToken(token);

    if (!claims) {
      return res.status(401).json({ message: 'Token invalide.' });
    }

    // Attache l'ID de l'utilisateur à l'objet de la requête pour un usage ultérieur
    req.auth = { userId: claims.sub };

    next(); // La vérification est réussie, on passe à la suite (le contrôleur)
  } catch (error) {
    console.error('Erreur d’authentification Clerk:', error);
    return res.status(401).json({ message: 'Authentification échouée.' });
  }
};
