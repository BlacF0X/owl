import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

import { Hub } from '../entities/Hub.js';
import { Sensor } from '../entities/Sensor.js';
import { SensorReading } from '../entities/SensorReading.js';
import { SensorType } from '../entities/SensorType.js';
import { User } from '../entities/User.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

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
  entities: [
    Hub,
    Sensor,
    SensorReading,
    SensorType,
    User
  ],

  migrations: [],
  subscribers: [],
});
