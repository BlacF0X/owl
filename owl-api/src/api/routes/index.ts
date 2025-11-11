import { Router } from 'express';
import testRouter from './test.routes.js';

const apiRouter = Router();

// On "monte" le routeur de test. Toutes ses routes seront accessibles.
apiRouter.use(testRouter);

// --- PRÉPARATION POUR LE FUTUR WEBHOOK CLERK ---
// Quand vous serez prêt, vous créerez clerk.routes.ts et décommenterez ces lignes.
// import clerkWebhookRouter from './clerk.routes.js';
// apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

export default apiRouter;
