// =============================================================
// routes/upload_routes.js
//
// POST   /api/upload/imagen   → sube una imagen a Cloudinary
// DELETE /api/upload/imagen   → elimina una imagen de Cloudinary
//
// Requieren auth + rol ADMIN.
// =============================================================

import { Router } from "express";

import { subir, eliminar } from "../controllers/upload_controller.js";
import { uploadImagen }     from "../middleware/upload_middleware.js";
import { requireAuth, requireNivel } from "../middleware/auth_middleware.js";
import { NIVELES } from "./access_roles.js";

export const uploadRouter = Router();

uploadRouter.post(  "/imagen", requireAuth, requireNivel(NIVELES.ADMIN), uploadImagen, subir);
uploadRouter.delete("/imagen", requireAuth, requireNivel(NIVELES.ADMIN), eliminar);
