// =============================================================
// routes/admin_routes.js
//
// Rutas de administración del sistema (solo ADM).
// Estas rutas están exentas del middleware de suscripción —
// el admin siempre puede activar/consultar aunque esté vencida.
//
// GET  /api/admin/suscripcion          → estado actual
// POST /api/admin/suscripcion/activar  → activar/renovar N días
// PUT  /api/admin/suscripcion/gracia   → cambiar días de gracia
// =============================================================

import { Router } from "express";

import {
  estadoSuscripcionController,
  activarSuscripcionController,
  actualizarGraciaController,
} from "../controllers/suscripcion_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ROLES } from "./access_roles.js";

export const adminRouter = Router();

// Todas las rutas admin requieren JWT + rol ADM
adminRouter.use(requireAuth, requireRole(ROLES.ADMIN));

// ── Suscripción ──────────────────────────────────────────────
adminRouter.get( "/suscripcion",         estadoSuscripcionController);
adminRouter.post("/suscripcion/activar", activarSuscripcionController);
adminRouter.put( "/suscripcion/gracia",  actualizarGraciaController);
