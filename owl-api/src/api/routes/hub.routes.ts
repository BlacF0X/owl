import { Router } from 'express';
import { getHubsForUser } from '../controllers/hub.controller.js';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hubs
 *   description: Gestion des boîtiers centraux
 */

/**
 * @swagger
 * /hubs:
 *   get:
 *     summary: Récupère la liste des hubs de l'utilisateur
 *     tags: [Hubs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des hubs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hub_id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   serial_number:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [online, offline, pending]
 *                   last_seen_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/', clerkAuthMiddleware, getHubsForUser);

export default router;
