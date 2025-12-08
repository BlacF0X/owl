import type { Request, Response, NextFunction } from 'express';

export const apiAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Récupération du header
  // Note: Express met les headers en minuscules
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.OWL_API_KEY;

  // 2. Vérification de la configuration serveur
  if (!validApiKey) {
    console.error(
      "❌ CRITIQUE : La variable OWL_API_KEY n'est pas définie sur le serveur."
    );
    return res
      .status(500)
      .json({ message: 'Erreur de configuration serveur.' });
  }

  // 3. Comparaison sécurisée
  // On vérifie si la clé est présente et correspond exactement
  if (!apiKey || apiKey !== validApiKey) {
    console.warn(
      `⚠️ Tentative d'accès non autorisée à l'API d'ingestion. IP: ${req.ip}`
    );
    return res
      .status(401)
      .json({ message: 'Non autorisé : Clé API invalide ou manquante.' });
  }

  // 4. Accès autorisé
  next();
};
