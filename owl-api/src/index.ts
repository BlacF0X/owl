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

// Charge les variables d'environnement du fichier .env
dotenv.config();

// Initialise la connexion à la base de données avec TypeORM
AppDataSource.initialize()
  .then(() => {
    // Ce code ne s'exécute que si la connexion à la BDD est réussie
    console.log('✅ Source de données initialisée avec succès !');

    // Initialisation de l'application Express
    const app = express();
    const PORT = process.env.PORT || 8080;

    // Middlewares
    app.use(cors()); // Active CORS pour toutes les routes
    app.use(express.json()); // Permet à l'API de comprendre les corps de requête en JSON

    // =================================================================
    // Définition des Routes
    // =================================================================

    // Route principale pour vérifier que l'API est en ligne
    app.get('/', (req: Request, res: Response) => {
      res.send('🦉 API OwL est en ligne !');
    });

    // Test de la connexion à la base de données
    app.get('/api/db-test', async (req: Request, res: Response) => {
      try {
        // On récupère le "repository" pour l'entité SensorType
        // Le repository est un objet qui permet de manipuler la table correspondante
        const sensorTypeRepository = AppDataSource.getRepository(SensorType);
        
        // On effectue une opération simple : compter le nombre d'entrées dans la table
        const count = await sensorTypeRepository.count();

        // Si tout s'est bien passé, on renvoie une réponse de succès
        res.status(200).json({
          message: 'Connexion à Supabase réussie !',
          sensorTypesInDatabase: count
        });
      } catch (error) {
        // Si une erreur survient pendant l'opération, on la capture
        console.error("Erreur lors du test de la base de données :", error);
        res.status(500).json({
          message: 'Échec de la connexion à la base de données.',
          // On envoie un message d'erreur plus clair au client
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // =================================================================
    // Démarrage du Serveur
    // =================================================================

    app.listen(PORT, () => {
      console.log(`🦉 API démarrée et à l'écoute sur http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    // Ce code s'exécute si la connexion à la BDD échoue au démarrage
    console.error('❌ Erreur lors de l\'initialisation de la source de données :', err);
  });
