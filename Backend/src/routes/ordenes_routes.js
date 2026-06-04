// =============================================================
// routes/ordenes_routes.js
// =============================================================

import { Router } from "express";

import {
  crearOrden,
  getMisOrdenes,
  getOrden,
  cancelarOrden,
  getTodasOrdenes,
  actualizarEstadoOrden,
} from "../controllers/ordenes_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const ordenesRouter = Router();

// Todas las rutas de órdenes requieren autenticación
ordenesRouter.use(requireAuth);

// =============================================================
// USUARIO — opera sobre sus propias órdenes
// POST   /ordenes                → crear orden desde carrito
// GET    /ordenes                → historial propio (?page=1&limit=10)
// GET    /ordenes/:id            → detalle de una orden
// PUT    /ordenes/:id/cancelar   → cancelar si está "pendiente"
// =============================================================

ordenesRouter.post( "/",               requireRole(...ACCESS.ORDENES_CREATE), crearOrden);
ordenesRouter.get(  "/",               requireRole(...ACCESS.ORDENES_READ),   getMisOrdenes);
ordenesRouter.get(  "/:id",            requireRole(...ACCESS.ORDENES_READ),   getOrden);
ordenesRouter.put(  "/:id/cancelar",   requireRole(...ACCESS.ORDENES_READ),   cancelarOrden);

// =============================================================
// ADMIN — gestión completa
// GET /ordenes/admin/todas            → todas las órdenes (?estado=pendiente)
// PUT /ordenes/admin/:id/estado       → cambiar estado
// =============================================================

// IMPORTANTE: la ruta /admin/todas debe ir ANTES de /:id
// para que Express no interprete "admin" como un :id
ordenesRouter.get("/admin/todas",       requireRole(...ACCESS.ORDENES_ADMIN), getTodasOrdenes);
ordenesRouter.put("/admin/:id/estado",  requireRole(...ACCESS.ORDENES_ADMIN), actualizarEstadoOrden);
