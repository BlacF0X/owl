import rateLimit from 'express-rate-limit';

// Configuration du limiteur
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre de 15min
  standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  message: {
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
  },
  // Fonction pour gérer ce qui se passe quand la limite est atteinte
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
