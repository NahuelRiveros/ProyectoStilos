// =============================================================
// routes/catalogos_routes.js
//
// Catálogos base del sistema usando el CRUD genérico.
// Para agregar un catálogo nuevo:
//   1. Crear el modelo en models/
//   2. Agregarlo a models/index.js y database/bootstrap.js
//   3. Definir su CONFIG acá y registrar las rutas
// =============================================================

import { Router } from "express";

import { Auth01Rol } from "../models/index.js";

import {
  crearListController,
  crearListPaginadoController,
  crearGetByIdController,
  crearCreateController,
  crearUpdateController,
  crearSoftDeleteController,
  crearReactivarController,
} from "../controllers/generic_controller.js";

import { requireAuth, requireAccess } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const catalogosRouter = Router();

// Todas las rutas de catálogos requieren estar autenticado
catalogosRouter.use(requireAuth);

// =============================================================
// ROLES
// GET    /catalogos/roles               → listar activos
// GET    /catalogos/roles/paginado      → paginado (?page=1&limit=10&q=texto)
// GET    /catalogos/roles/:id           → obtener uno
// POST   /catalogos/roles               → crear             [SOLO_ADMIN]
// PUT    /catalogos/roles/:id           → editar            [SOLO_ADMIN] *
// DELETE /catalogos/roles/:id           → baja lógica       [SOLO_ADMIN] *
// PUT    /catalogos/roles/:id/reactivar → reactivar         [SOLO_ADMIN]
//
// * Las abreviaturas en ROLES_SISTEMA están protegidas (no se pueden
//   editar ni dar de baja — son necesarias para el funcionamiento del sistema).
// =============================================================

// Abreviaturas de roles del sistema que no se pueden eliminar ni renombrar.
// Agregar aquí si en el futuro se suman roles fijos.
const ROLES_SISTEMA = ["ADM", "USR"];

async function protegerRolSistema(req, res, next) {
  const rol = await Auth01Rol.findByPk(req.params.id, {
    attributes: ["AUTH01_NOMBRE", "AUTH01_ABREVIATURA"],
  });
  if (!rol) return next(); // el generic controller devuelve 404

  if (ROLES_SISTEMA.includes(rol.AUTH01_ABREVIATURA)) {
    return res.status(403).json({
      ok: false,
      codigo: "ROL_PROTEGIDO",
      mensaje: `El rol "${rol.AUTH01_NOMBRE}" es del sistema y no puede modificarse ni eliminarse`,
    });
  }
  next();
}

const ROLES_CONFIG = {
  model:          Auth01Rol,
  nombre:         "roles",
  where:          { AUTH01_FECHABAJA: null },
  attributes:     ["ID_AUTH01", "AUTH01_NOMBRE", "AUTH01_ABREVIATURA", "AUTH01_NIVEL"],
  order:          [["AUTH01_NOMBRE", "ASC"]],
  campoBusqueda:  "AUTH01_NOMBRE",
  campoFechaBaja: "AUTH01_FECHABAJA",
  allowHardDelete: false,
  createFields:   ["AUTH01_NOMBRE", "AUTH01_ABREVIATURA", "AUTH01_NIVEL"],
  updateFields:   ["AUTH01_NOMBRE", "AUTH01_ABREVIATURA", "AUTH01_NIVEL"],
};

catalogosRouter.get("/roles",          requireAccess(ACCESS.ROLES_GET), crearListController(ROLES_CONFIG));
catalogosRouter.get("/roles/paginado", requireAccess(ACCESS.ROLES_GET), crearListPaginadoController(ROLES_CONFIG));
catalogosRouter.get("/roles/:id",      requireAccess(ACCESS.ROLES_GET), crearGetByIdController(ROLES_CONFIG));
catalogosRouter.post("/roles",         requireAccess(ACCESS.ROLES_CREATE), crearCreateController(ROLES_CONFIG));

// Rutas que modifican o eliminan un rol — protegidas para roles del sistema
catalogosRouter.put(   "/roles/:id",           requireAccess(ACCESS.ROLES_UPDATE), protegerRolSistema, crearUpdateController(ROLES_CONFIG));
catalogosRouter.delete("/roles/:id",           requireAccess(ACCESS.ROLES_DELETE), protegerRolSistema, crearSoftDeleteController(ROLES_CONFIG));
catalogosRouter.put(   "/roles/:id/reactivar", requireAccess(ACCESS.ROLES_DELETE), protegerRolSistema, crearReactivarController(ROLES_CONFIG));
