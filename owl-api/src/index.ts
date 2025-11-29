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
import { specs } from './config/swagger.js';

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

// Route pour la documentation
if (process.env.NODE_ENV !== 'production') {
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // 2. Servir une page HTML pure qui initialise Swagger UI via CDN
  app.get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Project OwL API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
        <style>
          body { margin: 0; padding: 0; }
          #swagger-ui { max-width: 100%; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/api-docs/swagger.json', // Pointe vers notre route JSON
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout",
            });
          };
        </script>
      </body>
      </html>
    `);
  });

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
