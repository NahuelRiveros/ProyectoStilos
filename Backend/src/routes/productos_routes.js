// =============================================================
// routes/productos_routes.js
//
// GET (listar / detalle) → público, sin auth
// POST / PUT / DELETE    → requireAuth + requireRole ADMIN
// PUT /:id/stock         → requireAuth + requireRole ADMIN
// =============================================================

import { Router } from "express";

import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  darDeBajaProducto,
  reactivarProducto,
  obtenerStock,
  actualizarStock,
  stockBajo,
  obtenerOfertasDestacadas,
} from "../controllers/productos_controller.js";

import { requireAuth, requireRole } from "../middleware/auth_middleware.js";
import { ACCESS } from "./access_roles.js";

export const productosRouter = Router();

// =============================================================
// LISTADO Y DETALLE  [público]
// GET /productos
//   ?genero=damas  &categoria=remeras  &precio_max=5000
//   &solo_ofertas=true  &solo_stock=true
//   &orden=novedad|precio_asc|precio_desc|nombre_asc
//   &pagina=1  &por_pagina=12
//
// GET /productos/:id
// =============================================================

productosRouter.get("/",                  listarProductos);
productosRouter.get("/ofertas/destacadas", obtenerOfertasDestacadas);
productosRouter.get("/stock-bajo",         requireAuth, requireRole(...ACCESS.PRODUCTOS_STOCK), stockBajo);
productosRouter.get("/:id",                obtenerProducto);

// =============================================================
// CRUD  [solo admin]
// POST   /productos
// PUT    /productos/:id
// DELETE /productos/:id
// PUT    /productos/:id/reactivar
// =============================================================

productosRouter.post(  "/",               requireAuth, requireRole(...ACCESS.PRODUCTOS_CREATE), crearProducto);
productosRouter.put(   "/:id",            requireAuth, requireRole(...ACCESS.PRODUCTOS_UPDATE), actualizarProducto);
productosRouter.delete("/:id",            requireAuth, requireRole(...ACCESS.PRODUCTOS_DELETE), darDeBajaProducto);
productosRouter.put(   "/:id/reactivar",  requireAuth, requireRole(...ACCESS.PRODUCTOS_DELETE), reactivarProducto);

// =============================================================
// STOCK  [solo admin]
// GET /productos/:id/stock   → ver stock por talle
// PUT /productos/:id/stock   → upsert masivo [{ talle_id, cantidad }]
// =============================================================

productosRouter.get("/:id/stock", requireAuth, requireRole(...ACCESS.PRODUCTOS_STOCK), obtenerStock);
productosRouter.put("/:id/stock", requireAuth, requireRole(...ACCESS.PRODUCTOS_STOCK), actualizarStock);
