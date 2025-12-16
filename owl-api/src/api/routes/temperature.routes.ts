import { Router } from 'express';
import {
  getTemperatureSensorsForUser,
  getTemperatureHourlyStats,
  getHubReadings,
} from '../controllers/temperature.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Temperature
 *   description: Routes capteurs température
 */

router.get('/', clerkAuthMiddleware, getTemperatureSensorsForUser);
router.get('/stats', clerkAuthMiddleware, getTemperatureHourlyStats);

/**
 * @swagger
 * /temperature/hubs/{hubId}/readings:
 *   get:
 *     summary: Récupère toutes les lectures de température d'un hub (optimisé)
 *     tags: [Temperature]
 */
router.get('/hubs/:hubId/readings', clerkAuthMiddleware, getHubReadings);

export default router;
