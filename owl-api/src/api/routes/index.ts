import express, { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';
import sensorRouter from './sensor.routes.js';

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

export default apiRouter;
