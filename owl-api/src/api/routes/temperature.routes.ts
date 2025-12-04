import Router from 'express';
import {
  getTemperatureSensorsForUser,
  getTemperatureHourlyStats,
} from '../controllers/temperature.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Temperature
 *   description: Routes capteurs température (pattern windows)
 */
router.get('/', clerkAuthMiddleware, getTemperatureSensorsForUser);
router.get('/stats', clerkAuthMiddleware, getTemperatureHourlyStats);

export default router;
