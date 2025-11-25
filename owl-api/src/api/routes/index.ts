import express, { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';
import sensorRouter from './sensor.routes.js';
import co2Router from './co2.routes.js'
const apiRouter = Router();


// On met la route la plus spécifique (webhook) en premier
apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

// Les autres routeurs qui ont besoin du parser JSON
apiRouter.use(express.json());
apiRouter.use(testRouter);
apiRouter.use('/sensors', sensorRouter);
apiRouter.use('/co2', co2Router); 

export default apiRouter;
