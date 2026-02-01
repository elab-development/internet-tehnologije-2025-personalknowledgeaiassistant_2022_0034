import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get('/', authMiddleware, chatController.getAllChats);
router.post('/', authMiddleware, chatController.createNewChat);
router.get('/:id', authMiddleware, chatController.getChatById);
router.delete('/:id', authMiddleware, chatController.deleteChatController);

export default router;
