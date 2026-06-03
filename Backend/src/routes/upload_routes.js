import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { uploadImagen } from "../middleware/upload_middleware.js";
import { subir, eliminar } from "../controllers/upload_controller.js";
import { ACCESS } from "./access_roles.js";

export const uploadRouter = Router();

// POST /api/upload/imagen
// multipart/form-data — campo "imagen" — máx 5 MB — solo admin
uploadRouter.post(
  "/imagen",
  requireAuth,
  requireRole(...ACCESS.UPLOAD),
  (req, res, next) => {
    // Captura errores de multer (tipo no permitido, tamaño excedido)
    uploadImagen(req, res, (err) => {
      if (!err) return next();
      const mensaje =
        err.code === "LIMIT_FILE_SIZE"   ? "La imagen supera el límite de 5 MB" :
        err.code === "TIPO_NO_PERMITIDO" ? err.message :
        "Error al procesar el archivo";
      return res.status(400).json({ ok: false, mensaje });
    });
  },
  subir
);

// DELETE /api/upload/imagen
// Body: { public_id } — solo admin
uploadRouter.delete(
  "/imagen",
  requireAuth,
  requireRole(...ACCESS.UPLOAD),
  eliminar
);
