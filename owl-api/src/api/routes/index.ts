import { Router } from 'express';
import clerkWebhookRouter from './clerk.routes.js';

const apiRouter = Router();

// Toutes les routes définies dans clerk.routes.ts seront préfixées par /webhooks/clerk
apiRouter.use('/webhooks/clerk', clerkWebhookRouter);

// À l'avenir, vous pourriez ajouter d'autres routes ici :
// import userRoutes from './user.routes.js';
// apiRouter.use('/users', userRoutes);

export default apiRouter;
