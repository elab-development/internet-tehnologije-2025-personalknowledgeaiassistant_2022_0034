import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as questionController from "../controllers/question.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Ask questions and retrieve previous questions
 */

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Ask a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - model
 *               - chatId
 *             properties:
 *               query:
 *                 type: string
 *                 example: What is described in the uploaded document?
 *               model:
 *                 type: string
 *                 example: llama3
 *               chatId:
 *                 type: string
 *                 example: 4c2c2c12-7a11-4a55-bb22-acde12345678
 *     responses:
 *       200:
 *         description: Question answered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: object
 *                 answer:
 *                   type: string
 *                   example: This document describes...
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       documentId:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       segmentId:
 *                         type: string
 *                       preview:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.post("/", authMiddleware, questionController.askQuestion);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all user questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, questionController.getQuestions);

export default router;
