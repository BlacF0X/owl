// FILE: routes/co2.routes.ts
import { Router } from 'express';
import { getCo2Evolution } from '../controllers/co2.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/co2/:sensorId/evolution
router.get('/:sensorId/evolution', clerkAuthMiddleware, getCo2Evolution);

export default router;
