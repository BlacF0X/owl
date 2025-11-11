import { Router } from 'express';
import { getDbConnectionTest } from '../controllers/test.controller.js';


const router = Router();

// Définit la route GET /db-test et lui attache le contrôleur
router.get('/db-test', getDbConnectionTest);

// Vous pourriez ajouter d'autres routes de test ici
// router.get('/another-test', anotherTestController);

export default router;
