import { Router } from 'express';
import { getSensorsForUser, getSensorReadings } from '../controllers/sensor.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';
import windowsRouter from './windows.routes.js';

const router = Router();

router.get('/', clerkAuthMiddleware, getSensorsForUser);
router.get('/:sensorId/readings', clerkAuthMiddleware, getSensorReadings);
router.use('/windows', windowsRouter);

export default router;
