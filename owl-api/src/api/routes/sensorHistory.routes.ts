import { Router } from 'express';
import { getSensorHistory } from '../controllers/sensorHistory.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Route pour récupérer l'historique d'un capteur
// GET /api/sensors/:sensorId/history
router.get('/:sensorId/history', clerkAuthMiddleware, getSensorHistory);

export default router;
