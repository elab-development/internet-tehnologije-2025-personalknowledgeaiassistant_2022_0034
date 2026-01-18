import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authMiddleware, userController.profile);
router.put("/me", authMiddleware, userController.update);

export default router;
