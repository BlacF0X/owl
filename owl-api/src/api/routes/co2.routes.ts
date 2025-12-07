import { Router } from 'express';
import { getCo2History } from '../controllers/co2.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /co2/{sensorId}/history:
 *   get:
 *     summary: Récupère l'historique d'un capteur CO2
 *     tags: [CO2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique récupéré
 */
router.get('/:sensorId/history', clerkAuthMiddleware, getCo2History);

export default router;
