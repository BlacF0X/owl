import { Router } from 'express';
import {
  getHumiditySensorsForUser,
  getHumidityEvolution,
} from '@/api/controllers/humidity.controller.js';
import { clerkAuthMiddleware } from '@/api/middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/humidity/sensors:
 *   get:
 *     summary: Récupère les capteurs d'humidité
 *     tags: [Humidity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des capteurs d'humidité
 *       401:
 *         description: Non autorisé
 */
router.get('/', clerkAuthMiddleware, getHumiditySensorsForUser);

/**
 * @swagger
 * /api/humidity/{sensorId}/evolution:
 *   get:
 *     summary: Récupère lévolution d'humidité
 *     tags: [Humidity]
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d]
 *           default: 24h
 *       - in: query
 *         name: refDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: DEV ONLY
 *     security:
 *       - bearerAuth: []
 */
router.get('/:sensorId/evolution', clerkAuthMiddleware, getHumidityEvolution);

export default router;