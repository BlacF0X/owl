import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Nécessaire pour les connexions à des services comme Supabase/Heroku
  },
  extra: {
    family: 4
  },
  // IMPORTANT : Mettre à `false` en production !
  // `true` synchronise automatiquement votre schéma de BDD avec vos entités.
  // Idéal pour le développement, mais risqué en production (peut effacer des données).
  synchronize: true, 
  logging: false, // Mettre à `true` pour voir les requêtes SQL dans la console
  entities: [
    'src/entities/**/*.ts' // Chemin vers vos fichiers d'entités
  ],
  migrations: [],
  subscribers: [],
});
