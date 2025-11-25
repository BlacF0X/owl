import { Router } from 'express';
import {
  getSensorsForUser,
  getSensorReadings,
} from '../controllers/sensor.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';
import windowsRouter from './windows.routes.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sensors
 *   description: Gestion des capteurs
 */

/**
 * @swagger
 * /sensors:
 *   get:
 *     summary: Récupère tous les capteurs de l'utilisateur
 *     tags: [Sensors]
 *     responses:
 *       200:
 *         description: Liste des capteurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sensor'
 *       401:
 *         description: Non autorisé
 */
router.get('/', clerkAuthMiddleware, getSensorsForUser);

/**
 * @swagger
 * /sensors/{sensorId}/readings:
 *   get:
 *     summary: Récupère l'historique des lectures d'un capteur
 *     tags: [Sensors]
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID du capteur
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d]
 *           default: 24h
 *         description: Période de l'historique
 *       - in: query
 *         name: refDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: (DEV ONLY) Date de référence pour simuler le temps présent
 *     responses:
 *       200:
 *         description: Historique des lectures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SensorReading'
 */
router.get('/:sensorId/readings', clerkAuthMiddleware, getSensorReadings);

router.use('/windows', windowsRouter);

export default router;
