import { Router } from 'express';
import testRouter from './test.routes.js';
import clerkWebhookRouter from './clerk.routes.js';

const apiRouter = Router();

// On "monte" le routeur de test. Toutes ses routes seront accessibles.
apiRouter.use(testRouter);

apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

export default apiRouter;
