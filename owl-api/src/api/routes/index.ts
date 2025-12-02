import express, { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';
import sensorRouter from './sensor.routes.js';
import co2Router from './co2.routes.js';
import humidityRouter from './humidity.routes.js';
const apiRouter = Router();

/**
 * @swagger
 * tags:
 *   name: General
 *   description: Routes générales
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Vérification de l'état de l'API
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: L'API est en ligne
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: API OwL online.
 */
apiRouter.get('/', (req, res) => res.send('API OwL online.'));

// On met la route la plus spécifique (webhook) en premier
apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

// Les autres routeurs qui ont besoin du parser JSON
apiRouter.use(express.json());
apiRouter.use('/test', testRouter);
apiRouter.use('/sensors', sensorRouter);
apiRouter.use('/co2', co2Router);
apiRouter.use('/humidity', humidityRouter);

export default apiRouter;
