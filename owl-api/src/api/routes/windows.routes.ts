import { Router } from 'express';
import { getWindowSensorsForUser } from '../controllers/sensor.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', clerkAuthMiddleware, getWindowSensorsForUser);

export default router;
