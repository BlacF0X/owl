import { Router } from 'express';
import {
  getHumiditySensorsForUser,
  getHumidityHistory,
  getHumidityHourlyStats,
} from '../controllers/humidity.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Humidity
 *   description: Routes spécifiques aux capteurs d'humidité
 */

/**
 * @swagger
 * /sensors/humidity:
 *   get:
 *     summary: Récupère uniquement les capteurs d'humidité
 *     tags: [Humidity]
 *     responses:
 *       200:
 *         description: Liste des capteurs d'humidité
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sensor'
 */
router.get('/', clerkAuthMiddleware, getHumiditySensorsForUser);

/**
 * @swagger
 * /sensors/humidity/history:
 *   get:
 *     summary: Historique global d'activité de l'humidité pour une date donnée
 *     tags: [Humidity]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-20
 *         required: true
 *         description: Date cible (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   timestamp: { type: string, format: date-time }
 *                   value: { type: string }
 *                   sensorName: { type: string }
 *                   hubName: { type: string }
 */
router.get('/history', clerkAuthMiddleware, getHumidityHistory);

/**
 * @swagger
 * /sensors/humidity/stats:
 *   get:
 *     summary: Statistiques horaires de l'humidité moyenne (7 derniers jours)
 *     tags: [Humidity]
 *     parameters:
 *       - in: query
 *         name: refDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: (DEV ONLY) Date de référence
 *     responses:
 *       200:
 *         description: Tableau de 24 heures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hour: { type: integer, example: 8 }
 *                   avgHumidity: { type: integer, example: 65 }
 */
router.get('/stats', clerkAuthMiddleware, getHumidityHourlyStats);

export default router;
