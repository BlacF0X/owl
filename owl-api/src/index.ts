console.log('--- ✅ API ENTRY POINT REACHED ---');

// =================================================================
// Imports
// =================================================================
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source.js';
import apiRouter from './api/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import { apiLimiter } from './api/middlewares/rateLimiter.middleware.js';

// =================================================================
// Initialisation Globale
// =================================================================
dotenv.config();

// On vérifie si la source de données n'est PAS déjà initialisée.
// Cela empêche de créer une nouvelle connexion à chaque invocation de la fonction serverless.
if (!AppDataSource.isInitialized) {
  // Le code à l'intérieur de ce `if` ne s'exécutera que lors d'un "cold start".
  await AppDataSource.initialize()
    .then(() =>
      console.log('✅ Source de données initialisée pour cette instance.')
    )
    .catch((err) =>
      console.error(
        "❌ Erreur lors de l'initialisation de la source de données :",
        err
      )
    );
}

// =================================================================
// Configuration de l'application Express
// =================================================================
// Définition des origines autorisées selon l'environnement
const getCorsOrigins = () => {
  // 1. PRODUCTION
  if (process.env.NODE_ENV === 'production') {
    return 'https://project-owl.vercel.app';
  }

  // 2. PREVIEW
  if (process.env.NODE_ENV === 'preview') {
    return 'https://project-owl-preview.vercel.app';
  }

  // 3. DÉVELOPPEMENT LOCAL
  return [
    'http://localhost:3000', // Votre frontend Next.js
    'http://localhost:8080', // Pour les tests d'API en local
  ];
};

const app = express();

app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
  })
);

// Appliquer le rate limiting à toutes les requêtes commençant par /api
app.use('/api', apiLimiter);
// --------------------

// Route pour la documentation
if (process.env.NODE_ENV === 'dev') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📚 Documentation Swagger activée sur /api-docs');
}

// On branche notre routeur d'API sur le préfixe '/api'
// Toutes les routes définies dans apiRouter commenceront par /api
app.use('/api', apiRouter);

// =================================================================
// Démarrage Conditionnel & Export
// =================================================================
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(
      `🦉 API démarrée (local) et à l'écoute sur http://localhost:${PORT}`
    );
  });
}

export default app;
