import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as documentController from "../controllers/document.controller.js";

const router = Router();
const upload = multer();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload and management
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  documentController.uploadDocument
);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents of the logged-in user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, documentController.getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get documents by user ID (admin only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's documents
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, documentController.getDocumentsByUser);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document by document ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 */
router.delete("/:id", authMiddleware, documentController.deleteDocument);

export default router;
