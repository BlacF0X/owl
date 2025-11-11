// =================================================================
// Imports
// =================================================================
import 'reflect-metadata';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source.js';
import apiRouter from './api/routes/index.js';

// =================================================================
// Initialisation
// =================================================================
dotenv.config();

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Source de données initialisée avec succès !');

    const app = express();
    const PORT = process.env.PORT || 8080;

    // --- Middlewares Globaux ---
    app.use(cors());
    app.use(express.json()); // Middleware pour parser le JSON pour TOUTES les autres routes

    // =================================================================
    // Routes
    // =================================================================
    app.get('/', (req: Request, res: Response) => {
      res.send('🦉 API OwL est en ligne !');
    });

    // On branche notre routeur d'API sur le préfixe '/api'
    app.use('/api', apiRouter);

    // =================================================================
    // Démarrage du Serveur
    // =================================================================
    app.listen(PORT, () => {
      console.log(`🦉 API démarrée et à l'écoute sur http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error('❌ Erreur lors de l\'initialisation de la source de données :', err);
  });
