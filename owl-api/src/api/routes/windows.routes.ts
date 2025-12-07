import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getWindowSensorsForUser,
  getWindowsHistory,
  getWindowsHourlyStats,
} from '../controllers/windows.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Define rate limiter: max 100 requests per 15 mins (per IP)
const windowsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
/**
 * @swagger
 * tags:
 *   name: Windows
 *   description: Routes spécifiques aux capteurs de fenêtre
 */

/**
 * @swagger
 * /sensors/windows:
 *   get:
 *     summary: Récupère uniquement les capteurs de fenêtre
 *     tags: [Windows]
 *     responses:
 *       200:
 *         description: Liste des capteurs de fenêtre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sensor'
 */
router.get('/', windowsLimiter, clerkAuthMiddleware, getWindowSensorsForUser);

/**
 * @swagger
 * /sensors/windows/history:
 *   get:
 *     summary: Historique global d'activité des fenêtres pour une date donnée
 *     tags: [Windows]
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
 *                   state: { type: string, enum: [Ouvert, Fermé] }
 *                   sensorName: { type: string }
 *                   hubName: { type: string }
 */
router.get('/history', windowsLimiter, clerkAuthMiddleware, getWindowsHistory);

/**
 * @swagger
 * /sensors/windows/stats:
 *   get:
 *     summary: Statistiques horaires des ouvertures (7 derniers jours)
 *     tags: [Windows]
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
 *                   count: { type: integer, example: 12 }
 */
router.get('/stats', windowsLimiter, clerkAuthMiddleware, getWindowsHourlyStats);

export default router;
