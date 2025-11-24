import { Router, raw } from 'express';
import { handleClerkWebhook } from '../controllers/clerk.controller.js';

const router = Router();

/**
 * @swagger
 * /webhooks/clerk:
 *   post:
 *     summary: Endpoint pour les webhooks de Clerk
 *     tags: [General]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload envoyé par Clerk
 *     responses:
 *       200:
 *         description: Webhook traité avec succès
 *       400:
 *         description: Signature invalide ou données manquantes
 */
router.post('/', raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
