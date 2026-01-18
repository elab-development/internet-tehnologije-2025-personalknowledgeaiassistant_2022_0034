import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as questionController from "../controllers/question.controller.js";

const router = Router();

router.post("/", authMiddleware, questionController.askQuestion);

router.get("/", authMiddleware, questionController.getQuestions);

export default router;
