import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as documentController from "../controllers/document.controller.js";

const router = Router();
const upload = multer();

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  documentController.uploadDocument,
);
router.get("/", authMiddleware, documentController.getDocuments);
router.get("/:id", authMiddleware, documentController.getDocumentsByUser);
router.get("/:id", authMiddleware, documentController.getDocument);
router.delete("/:id", authMiddleware, documentController.deleteDocument);

export default router;
