import { Router } from 'express';
import { processIngest } from '../controllers/ingest.controller.js';
import { apiAuthMiddleware } from '../middlewares/apiAuth.middleware.js';
import { validateIngestPayload } from '../middlewares/ingest.middleware.js';

const router = Router();

/**
 * @swagger
 * /ingest:
 *   post:
 *     summary: Ingestion de données capteurs (Hub -> API)
 *     tags: [Ingestion]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clé API secrète du Hub
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hub_serial:
 *                 type: string
 *                 example: "HUB-12345"
 *               readings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sensor_name:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [window, temperature, humidity, air_quality]
 *                     value:
 *                       type: string
 *                       example: 21.5
 *     responses:
 *       201:
 *         description: Données traitées avec succès
 *       401:
 *         description: Clé API invalide
 *       404:
 *         description: Hub inconnu
 */
router.post('/', apiAuthMiddleware, validateIngestPayload, processIngest);

export default router;
