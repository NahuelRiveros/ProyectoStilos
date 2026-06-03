// =============================================================
// routes/usuarios_routes.js
// Gestión de usuarios del sistema (requiere auth en todas las rutas).
//
// Rutas:
//   GET    /api/usuarios              → listar usuarios (GESTION)
//   GET    /api/usuarios/:id          → obtener uno (GESTION)
//   POST   /api/usuarios              → crear usuario desde admin (GESTION)
//   PUT    /api/usuarios/:id          → actualizar datos (GESTION)
//   DELETE /api/usuarios/:id          → baja lógica (SOLO_ADMIN)
//   PUT    /api/usuarios/:id/reactivar → reactivar (SOLO_ADMIN)
//   PUT    /api/usuarios/:id/rol      → cambiar rol (SOLO_ADMIN)
// =============================================================

import { Router } from "express";

import {
  crearUsuarioController,
  listarUsuariosController,
  obtenerUsuarioController,
  actualizarUsuarioController,
  eliminarUsuarioController,
  reactivarUsuarioController,
  cambiarRolController,
} from "../controllers/usuarios_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const usuariosRouter = Router();

// Todas las rutas de usuarios requieren estar autenticado
usuariosRouter.use(requireAuth);

// =============================================================
// LECTURA
// =============================================================

usuariosRouter.get(
  "/",
  requireRole(...ACCESS.USUARIOS_GET),
  listarUsuariosController
);

usuariosRouter.get(
  "/:id",
  requireRole(...ACCESS.USUARIOS_GET),
  obtenerUsuarioController
);

// =============================================================
// ESCRITURA
// =============================================================

// Crear usuario desde panel de administración
usuariosRouter.post(
  "/",
  requireRole(...ACCESS.USUARIOS_CREATE),
  crearUsuarioController
);

usuariosRouter.put(
  "/:id",
  requireRole(...ACCESS.USUARIOS_UPDATE),
  actualizarUsuarioController
);

// =============================================================
// BAJA / REACTIVAR
// =============================================================

usuariosRouter.delete(
  "/:id",
  requireRole(...ACCESS.USUARIOS_DELETE),
  eliminarUsuarioController
);

// ⚠️  Reactivar va ANTES de /:id para evitar que Express capture
//     "reactivar" como un parámetro :id
usuariosRouter.put(
  "/:id/reactivar",
  requireRole(...ACCESS.USUARIOS_DELETE),
  reactivarUsuarioController
);

// =============================================================
// CAMBIAR ROL
// =============================================================

usuariosRouter.put(
  "/:id/rol",
  requireRole(...ACCESS.ROLES_UPDATE),
  cambiarRolController
);
