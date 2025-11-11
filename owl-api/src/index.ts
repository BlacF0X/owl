// =================================================================
// Imports
// =================================================================
import 'reflect-metadata'; 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source.js';
import apiRouter from './api/routes/index.js';

// =================================================================
// Initialisation Globale
// =================================================================
dotenv.config();

await AppDataSource.initialize()
  .then(() => console.log('✅ Source de données initialisée avec succès !'))
  .catch((err) => console.error('❌ Erreur lors de l\'initialisation de la source de données :', err));

// =================================================================
// Configuration de l'application Express
// =================================================================
const app = express();

app.use(cors());

// Routes principales (non-API)
app.get('/', (req, res) => res.send('API OwL online.'));

// On branche notre routeur d'API sur le préfixe '/api'
// Toutes les routes définies dans apiRouter commenceront par /api
app.use('/api', apiRouter);

// =================================================================
// Démarrage Conditionnel & Export
// =================================================================
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🦉 API démarrée (local) et à l'écoute sur http://localhost:${PORT}`);
  });
}

export default app;
