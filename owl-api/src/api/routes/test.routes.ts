import { Router } from 'express';
import { getDbConnectionTest } from '../controllers/test.controller.js';

const router = Router();

router.get('/db', getDbConnectionTest);

export default router;
