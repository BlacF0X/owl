import { Router } from 'express';
import {
  getSensorsForUser,
  getWindowSensorsForUser,
} from '../controllers/sensor.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les requêtes GET sur la racine de ce routeur ('/')
// passeront d'abord par le middleware d'authentification,
// puis seront gérées par le contrôleur getSensorsForUser.
router.get('/', clerkAuthMiddleware, getSensorsForUser);
router.get('/windows', clerkAuthMiddleware, getWindowSensorsForUser);

export default router;
