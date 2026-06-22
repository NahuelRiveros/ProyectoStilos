// =============================================================
// routes/carrito_routes.js
//
// Todos los endpoints requieren usuario autenticado.
// Cada usuario solo opera su propio carrito
// (el controller resuelve el carrito por req.user.ID_AUTH02).
// =============================================================

import { Router } from "express";

import {
  obtenerCarrito,
  sincronizarCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito,
} from "../controllers/carrito_controller.js";

import { requireAuth, requireNivel } from "../middleware/auth_middleware.js";
import { NIVELES } from "./access_roles.js";

export const carritoRouter = Router();

// Todos los endpoints de carrito requieren auth
carritoRouter.use(requireAuth, requireNivel(NIVELES.USR));

// =============================================================
// GET  /carrito
//   → devuelve los items del carrito del usuario
//
// DELETE /carrito
//   → vacía el carrito completo
// =============================================================

carritoRouter.get(   "/", obtenerCarrito);
carritoRouter.delete("/", vaciarCarrito);

// =============================================================
// POST /carrito/sync
// Body: { items: [{ producto_id, talle_id?, cantidad, precio_unidad }] }
//   → sincroniza localStorage con el servidor al hacer login
// =============================================================

carritoRouter.post("/sync", sincronizarCarrito);

// =============================================================
// POST   /carrito/items
// Body: { producto_id, talle_id?, cantidad, precio_unidad }
//   → agrega un item (o suma cantidad si ya existe)
//
// PUT    /carrito/items/:itemId
// Body: { cantidad }
//   → actualiza la cantidad (0 = elimina)
//
// DELETE /carrito/items/:itemId
//   → elimina un item específico
// =============================================================

carritoRouter.post(  "/items",         agregarItem);
carritoRouter.put(   "/items/:itemId", actualizarItem);
carritoRouter.delete("/items/:itemId", eliminarItem);
