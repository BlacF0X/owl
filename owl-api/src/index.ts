// =================================================================
// Imports
// =================================================================
import 'reflect-metadata'; 
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source.js';
import { SensorType } from './entities/SensorType.js';

// =================================================================
// Initialisation Globale
// =================================================================
dotenv.config();

// La connexion à la BDD est initialisée au démarrage, que ce soit en local ou sur Vercel
await AppDataSource.initialize()
  .then(() => console.log('✅ Source de données initialisée avec succès !'))
  .catch((err) => console.error('❌ Erreur lors de l\'initialisation de la source de données :', err));

// =================================================================
// Configuration de l'application Express (identique pour les deux envs)
// =================================================================
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('🦉 API OwL est en ligne !'));

app.get('/api/db-test', async (req, res) => {
  try {
    const sensorTypeRepository = AppDataSource.getRepository(SensorType);
    const count = await sensorTypeRepository.count();
    res.status(200).json({ message: 'Connexion à Supabase réussie !', sensorTypesInDatabase: count });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Échec de la connexion à la base de données.', error: errorMessage });
  }
});

// =================================================================
// DÉMARRAGE CONDITIONNEL DU SERVEUR
// =================================================================

// Ce bloc ne s'exécute QUE si on n'est PAS sur Vercel (donc en local)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🦉 API démarrée (local) et à l'écoute sur http://localhost:${PORT}`);
  });
}

// =================================================================
// EXPORT POUR VERCEL
// =================================================================
// Cet export est utilisé par Vercel. En local, il est simplement ignoré.
export default app;
