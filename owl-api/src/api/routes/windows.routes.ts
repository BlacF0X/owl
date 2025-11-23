import { Router } from 'express';
import {
  getWindowSensorsForUser,
  getWindowsHistory,
} from '../controllers/windows.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', clerkAuthMiddleware, getWindowSensorsForUser);
router.get('/history', clerkAuthMiddleware, getWindowsHistory);

export default router;
