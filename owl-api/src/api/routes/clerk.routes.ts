import { Router, raw } from 'express';
import { handleClerkWebhook } from '../controllers/clerk.controller.js';

const router = Router();

// Le middleware `raw` est appliqué UNIQUEMENT à cette route.
// Il est configuré pour ne s'appliquer qu'aux requêtes dont le Content-Type est 'application/json'.
router.post(
  '/', 
  raw({ type: 'application/json' }), 
  handleClerkWebhook
);

export default router;
