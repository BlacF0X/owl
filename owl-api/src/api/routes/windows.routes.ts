import { Router } from 'express';
import {
  getWindowSensorsForUser,
  getWindowsHistory,
  getWindowsHourlyStats,
} from '../controllers/windows.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', clerkAuthMiddleware, getWindowSensorsForUser);
router.get('/history', clerkAuthMiddleware, getWindowsHistory);
router.get('/stats', clerkAuthMiddleware, getWindowsHourlyStats);

export default router;
