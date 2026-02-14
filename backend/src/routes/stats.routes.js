import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as statsController from "../controllers/stats.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Model usage statistics
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get usage statistics for all AI models
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of AI model usage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       modelName:
 *                         type: string
 *                       usage:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", authMiddleware, statsController.getStats);


export default router;
