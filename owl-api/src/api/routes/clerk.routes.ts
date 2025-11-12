import { Router, raw } from 'express';
import { handleClerkWebhook } from '../controllers/clerk.controller.js';

const router = Router();

// Le middleware `raw` est appliqué uniquement à cette route.
// Il est nécessaire pour que la librairie `svix` puisse vérifier la signature du webhook.
router.post('/', raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
