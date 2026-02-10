import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats for authenticated user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 7c1a9c4a-8e8d-4f91-bbc7-123456789abc
 *                   title:
 *                     type: string
 *                     example: My first chat
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, chatController.getAllChats);

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Chat
 *     responses:
 *       201:
 *         description: Chat successfully created
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, chatController.createNewChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 7c1a9c4a-8e8d-4f91-bbc7-123456789abc
 *     responses:
 *       200:
 *         description: Chat with messages
 *       403:
 *         description: Access denied (IDOR protection)
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, chatController.getChatById);

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete chat by ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 7c1a9c4a-8e8d-4f91-bbc7-123456789abc
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *       403:
 *         description: Access denied (IDOR protection)
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, chatController.deleteChatController);

export default router;
