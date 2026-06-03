// =============================================================
// routes/comprobantes_routes.js
//
// /comprobantes/admin/todas → solo admin
// /comprobantes/:id         → usuario (scoped) o admin
// /comprobantes             → GET mis comprobantes / POST emitir (admin)
// =============================================================

import { Router } from "express";

import {
  getMisComprobantes,
  getComprobante,
  getTodasComprobantes,
  emitirComprobante,
  descargarPdf,
} from "../controllers/comprobantes_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const comprobantesRouter = Router();

// Todas las rutas requieren autenticación
comprobantesRouter.use(requireAuth);

// =============================================================
// IMPORTANTE: la ruta estática /admin/todas debe ir ANTES de /:id
// =============================================================

comprobantesRouter.get("/admin/todas", requireRole(...ACCESS.COMPROBANTES_EMITIR), getTodasComprobantes);

comprobantesRouter.get(  "/",        requireRole(...ACCESS.COMPROBANTES_READ),   getMisComprobantes);
comprobantesRouter.post( "/",        requireRole(...ACCESS.COMPROBANTES_EMITIR), emitirComprobante);
comprobantesRouter.get(  "/:id/pdf", requireRole(...ACCESS.COMPROBANTES_READ),   descargarPdf);
comprobantesRouter.get(  "/:id",     requireRole(...ACCESS.COMPROBANTES_READ),   getComprobante);
