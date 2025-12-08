import { Router } from 'express';
import { authPusher } from '../controllers/pusher.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Route POST /api/pusher/auth
// Protégée par Clerk, car il faut être connecté pour s'abonner
router.post('/auth', clerkAuthMiddleware, authPusher);

export default router;