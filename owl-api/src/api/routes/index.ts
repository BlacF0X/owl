import express, { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';

const apiRouter = Router();

// On met la route la plus spécifique et la plus sensible (qui a besoin du corps brut) EN PREMIER.
apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

// Les autres routeurs qui utilisent des middlewares plus généraux (comme express.json) viennent APRÈS.
apiRouter.use(express.json());
apiRouter.use(testRouter);

export default apiRouter;
