import { Router } from 'express';
import { getDbConnectionTest } from '../controllers/test.controller.js';

const router = Router();

/**
 * @swagger
 * /test/db:
 *   get:
 *     summary: Test de la connexion à la base de données
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sensorTypesInDatabase:
 *                   type: integer
 *       500:
 *         description: Erreur de connexion
 */
router.get('/db', getDbConnectionTest);

export default router;
