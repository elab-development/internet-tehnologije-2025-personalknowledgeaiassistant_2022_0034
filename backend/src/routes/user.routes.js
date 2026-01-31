import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authMiddleware, userController.profile);
router.put("/me", authMiddleware, userController.update);
router.get("/",authMiddleware, requireAdmin, userController.getAllUsers);

router.put("/:id", authMiddleware, requireAdmin, userController.updateUserByAdmin);
router.delete("/:id", authMiddleware, requireAdmin, userController.deleteUserByAdmin); 

export default router;
