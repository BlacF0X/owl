import type { Request, Response, NextFunction } from 'express';

export const apiAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Récupération du header entrant
  const apiKey = req.headers['x-api-key'];

  // 2. Récupération des clés valides côté serveur
  const mainKey = process.env.OWL_API_KEY;
  const botKey = process.env.OWL_API_KEY_BOT;

  // 3. Vérification de la configuration serveur
  // Le serveur est mal configuré UNIQUEMENT si AUCUNE des deux clés n'est définie.
  if (!mainKey && !botKey) {
    console.error(
      "❌ CRITIQUE : Aucune clé API (OWL_API_KEY ou OWL_API_KEY_BOT) n'est définie sur le serveur."
    );
    return res
      .status(500)
      .json({ message: 'Erreur de configuration serveur.' });
  }

  // 4. Vérification de l'autorisation
  // On vérifie si la clé fournie correspond à la clé principale OU à la clé du bot
  // (On s'assure aussi que la clé serveur existe avant de comparer pour éviter undefined === undefined)
  const isValidMain = mainKey && apiKey === mainKey;
  const isValidBot = botKey && apiKey === botKey;

  if (!apiKey || (!isValidMain && !isValidBot)) {
    console.warn(
      `⚠️ Tentative d'accès non autorisée à l'API d'ingestion. IP: ${req.ip}`
    );
    return res
      .status(401)
      .json({ message: 'Non autorisé : Clé API invalide ou manquante.' });
  }

  // 5. Accès autorisé
  next();
};
