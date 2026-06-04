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
import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const uploadRouter = Router();

uploadRouter.post(  "/imagen", requireAuth, requireRole(...ACCESS.UPLOAD_CREATE), uploadImagen, subir);
uploadRouter.delete("/imagen", requireAuth, requireRole(...ACCESS.UPLOAD_CREATE), eliminar);
