import { Router } from "express";

import {
  loginController,
  meController,
  logoutController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth_controller.js";

import { ACCESS } from "./access_roles.js";
import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
export const authRouter = Router();

// ==========================================================
// AUTH
// ==========================================================

authRouter.post("/login", loginController);

authRouter.post("/register", registerController);

authRouter.get("/me", requireAuth, meController);

authRouter.post("/logout", requireAuth, logoutController);

// ==========================================================
// RECUPERACIÓN DE CONTRASEÑA
// ==========================================================

authRouter.post("/forgot-password", forgotPasswordController);

authRouter.post("/reset-password", resetPasswordController);