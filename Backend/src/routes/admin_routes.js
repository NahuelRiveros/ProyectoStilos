// =============================================================
// routes/admin_routes.js
//
// Rutas de administración del sistema.
//
// Jerarquía de roles → ADM:
//   GET  /api/admin/roles/jerarquia      → estructura y permisos de cada nivel
//
// Suscripción → solo SADM (Super Admin, dueño del sistema):
//   GET  /api/admin/suscripcion          → estado actual
//   POST /api/admin/suscripcion/activar  → activar/renovar N días
//   PUT  /api/admin/suscripcion/gracia   → cambiar días de gracia
// =============================================================

import { Router } from "express";

import {
  estadoSuscripcionController,
  activarSuscripcionController,
  actualizarGraciaController,
} from "../controllers/suscripcion_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ROLES, NIVELES } from "./access_roles.js";

export const adminRouter = Router();

// ── Jerarquía de roles — disponible para ADM y SADM ─────────
adminRouter.get("/roles/jerarquia", requireAuth, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), (_req, res) => {
  return res.json({
    ok: true,
    data: {
      descripcion: "Los roles tienen niveles numéricos: mayor nivel = más permisos. Un usuario puede tener varios roles activos a la vez.",
      jerarquia: [
        {
          abreviatura: "SADM",
          nombre:      "Super Administrador",
          nivel:       NIVELES.SUPER_ADMIN,
          creado_por:  "Sistema (automático)",
          permisos: [
            "Todo lo que puede ADM",
            "Ver y gestionar la suscripción del sistema",
            "Activar / renovar suscripción",
            "Modificar días de gracia",
          ],
          notas: "Se crea automáticamente al iniciar el sistema. No puede editarse ni eliminarse vía API.",
        },
        {
          abreviatura: "ADM",
          nombre:      "Administrador",
          nivel:       NIVELES.ADMIN,
          creado_por:  "Sistema (automático) o manualmente por SADM",
          permisos: [
            "Gestionar usuarios (crear, editar, eliminar, asignar roles)",
            "Gestionar catálogos (categorías, talles, colores, marcas, etc.)",
            "Gestionar productos, stock y precios",
            "Ver y gestionar órdenes",
            "Configurar puntos de venta y opciones de envío",
            "Crear y administrar roles personalizados",
          ],
          notas: "No puede acceder a la suscripción del sistema. No puede editarse ni eliminarse vía API.",
        },
        {
          abreviatura: "STF (ejemplo)",
          nombre:      "Staff / roles personalizados",
          nivel:       NIVELES.STAFF,
          creado_por:  "Manualmente por ADM o SADM vía POST /api/catalogos/roles",
          permisos: [
            "Acceso intermedio según configuración del proyecto",
            "Nivel 50 por convención, ajustable al crear el rol",
            "Los permisos exactos dependen de la matriz ACCESS en access_roles.js",
          ],
          notas: "Ejemplos: Vendedor (VND), Repositor (REP), Recepcionista (RCP). Pueden editarse y eliminarse.",
        },
        {
          abreviatura: "USR",
          nombre:      "Usuario",
          nivel:       NIVELES.USR,
          creado_por:  "Sistema (automático al registrarse)",
          permisos: [
            "Navegar el catálogo de productos",
            "Gestionar su propio carrito",
            "Crear y ver sus propias órdenes",
            "Editar su perfil y contraseña",
          ],
          notas: "Rol por defecto para cualquier usuario que se registra. No puede editarse ni eliminarse vía API.",
        },
      ],
      como_crear_rol_personalizado: {
        metodo: "POST",
        url:    "/api/catalogos/roles",
        body:   { AUTH01_NOMBRE: "Vendedor", AUTH01_ABREVIATURA: "VND", AUTH01_NIVEL: 50 },
        notas:  "AUTH01_NIVEL entre 11 y 99 para roles de staff. La abreviatura debe ser única.",
      },
    },
  });
});

// ── Suscripción — exclusivo del Super Admin (SADM) ──────────
adminRouter.get( "/suscripcion",         requireAuth, requireRole(ROLES.SUPER_ADMIN), estadoSuscripcionController);
adminRouter.post("/suscripcion/activar", requireAuth, requireRole(ROLES.SUPER_ADMIN), activarSuscripcionController);
adminRouter.put( "/suscripcion/gracia",  requireAuth, requireRole(ROLES.SUPER_ADMIN), actualizarGraciaController);
