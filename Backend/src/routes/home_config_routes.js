import { Router } from "express";
import { obtenerHomeConfig, actualizarHomeConfig } from "../controllers/home_config_controller.js";
import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const homeConfigRouter = Router();

homeConfigRouter.get("/",  obtenerHomeConfig);
homeConfigRouter.put("/",  requireAuth, requireRole(...ACCESS.PRODUCTOS_UPDATE), actualizarHomeConfig);
