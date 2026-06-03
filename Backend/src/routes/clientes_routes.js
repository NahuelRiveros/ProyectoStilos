// =============================================================
// routes/clientes_routes.js
//
// Perfil extendido del cliente y direcciones guardadas.
// Toda operación está scoped al usuario autenticado.
// =============================================================

import { Router } from "express";

import {
  getPerfil,
  updatePerfil,
  getDirecciones,
  crearDireccion,
  updateDireccion,
  deleteDireccion,
  setDireccionDefault,
} from "../controllers/clientes_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const clientesRouter = Router();

// Todas las rutas requieren usuario autenticado
clientesRouter.use(requireAuth, requireRole(...ACCESS.CLIENTES_PERFIL));

// =============================================================
// PERFIL
// GET /clientes/perfil   → obtener / crear perfil
// PUT /clientes/perfil   → actualizar perfil
// =============================================================

clientesRouter.get("/perfil", getPerfil);
clientesRouter.put("/perfil", updatePerfil);

// =============================================================
// DIRECCIONES
// GET    /clientes/direcciones          → listar activas
// POST   /clientes/direcciones          → crear
// PUT    /clientes/direcciones/:id      → editar
// DELETE /clientes/direcciones/:id      → soft delete
// PUT    /clientes/direcciones/:id/default → marcar como predeterminada
// =============================================================

clientesRouter.get(    "/direcciones",            getDirecciones);
clientesRouter.post(   "/direcciones",            crearDireccion);
clientesRouter.put(    "/direcciones/:id",         updateDireccion);
clientesRouter.delete( "/direcciones/:id",         deleteDireccion);
clientesRouter.put(    "/direcciones/:id/default", setDireccionDefault);
