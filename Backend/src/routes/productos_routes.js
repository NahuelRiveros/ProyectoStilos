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

import { requireAuth, requireRole, requireNivel } from "../middleware/auth_middleware.js";
import { ACCESS, NIVELES } from "./access_roles.js";

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
productosRouter.get("/stock-bajo",         requireAuth, requireNivel(NIVELES.ADMIN), stockBajo);
productosRouter.get("/:id",                obtenerProducto);

// =============================================================
// CRUD  [solo admin]
// POST   /productos
// PUT    /productos/:id
// DELETE /productos/:id
// PUT    /productos/:id/reactivar
// =============================================================

productosRouter.post(  "/",               requireAuth, requireNivel(NIVELES.ADMIN), crearProducto);
productosRouter.put(   "/:id",            requireAuth, requireNivel(NIVELES.ADMIN), actualizarProducto);
productosRouter.delete("/:id",            requireAuth, requireNivel(NIVELES.ADMIN), darDeBajaProducto);
productosRouter.put(   "/:id/reactivar",  requireAuth, requireNivel(NIVELES.ADMIN), reactivarProducto);

// =============================================================
// STOCK  [solo admin]
// GET /productos/:id/stock   → ver stock por talle
// PUT /productos/:id/stock   → upsert masivo [{ talle_id, cantidad }]
// =============================================================

productosRouter.get("/:id/stock", requireAuth, requireNivel(NIVELES.ADMIN), obtenerStock);
productosRouter.put("/:id/stock", requireAuth, requireNivel(NIVELES.ADMIN), actualizarStock);
