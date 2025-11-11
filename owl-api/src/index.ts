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
// Initialisation Globale
// =================================================================
dotenv.config();

// On initialise la connexion à la BDD une seule fois au démarrage
// L'utilisation de `await` au premier niveau est possible avec les modules ES modernes
await AppDataSource.initialize()
  .then(() => console.log('✅ Source de données initialisée !'))
  .catch((err) => console.error('❌ Erreur d\'initialisation de la source de données :', err));


// =================================================================
// Configuration de l'application Express
// =================================================================
const app = express();

// Middlewares Globaux
app.use(cors());
// Le middleware express.json() est déjà dans votre index.ts principal, 
// mais on le laisse ici pour être complet. Si votre route de webhook est bien avant, c'est parfait.
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('🦉 API OwL est en ligne !');
});
app.use('/api', apiRouter);


// =================================================================
// EXPORT DE L'APP (la partie la plus importante pour Vercel)
// =================================================================
// On n'appelle PAS app.listen(). On exporte l'instance `app`.
// Vercel utilisera cet export pour gérer les requêtes.
export default app;
