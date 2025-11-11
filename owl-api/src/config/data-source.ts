import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Obtient le chemin du répertoire du fichier actuel dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calcule le chemin racine du projet de manière fiable.
// Depuis '/src/config', il faut remonter de deux niveaux.
const projectRoot = path.join(__dirname, '..', '..');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    family: 4 // Pour les problèmes de connexion en local (IPv6)
  },
  synchronize: !isProduction,
  logging: !isProduction,

  // CHEMIN DYNAMIQUE CORRIGÉ :
  // On construit le chemin absolu à partir de la racine du projet.
  entities: [
    isProduction
      ? path.join(projectRoot, 'dist/entities/**/*.js') // Pour la prod
      : path.join(projectRoot, 'src/entities/**/*.ts')  // Pour le dev
  ],

  migrations: [],
  subscribers: [],
});
