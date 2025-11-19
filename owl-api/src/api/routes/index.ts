import express, { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';
import sensorRouter from './sensor.routes.js';

const apiRouter = Router();

// On met la route la plus spécifique (webhook) en premier
apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

// Les autres routeurs qui ont besoin du parser JSON
apiRouter.use(express.json());
apiRouter.use(testRouter);
apiRouter.use('/sensors', sensorRouter);

export default apiRouter;
