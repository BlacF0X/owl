import rateLimit from 'express-rate-limit';

// Configuration du limiteur
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Fenêtre de 5 minutes
  max: 1000, // Limite chaque IP à 1000 requêtes par fenêtre de 5min
  standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  message: {
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
  },
  // Fonction pour gérer ce qui se passe quand la limite est atteinte
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
  skip: (req) => {
    // Si le header x-api-key est présent et correspond à la clé secrète du serveur,
    // on ignore le rate limiting pour cette requête.
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.OWL_API_KEY_BOT;

    // Comparaison stricte et sécurisée (on s'assure que validApiKey existe)
    if (validApiKey && apiKey === validApiKey) {
      return true; // SKIP le limiteur
    }
    return false; // APPLIQUE le limiteur
  },
});
