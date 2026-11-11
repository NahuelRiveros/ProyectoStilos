import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validar } from "../../../core/middleware/validar.js";
import { categoriasController, filtrosController, listarController, detalleController, enviarPedidoController } from "../controllers/catalogo_controller.js";
import { esquemaFiltrosCatalogo, esquemaPedido, esquemaSlug } from "../reglas.js";

// Tienda pública: no pide ingresar (ROP-10 a ROP-16).
export const catalogoRopaRouter = Router();

// Enviar un pedido es público: se limita para que nadie llene el panel de pedidos falsos.
const limitePedidos = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, codigo: "DEMASIADOS_PEDIDOS", mensaje: "Enviaste muchos pedidos seguidos. Escribinos por WhatsApp o probá en un rato." },
});

catalogoRopaRouter.get("/categorias", categoriasController);
catalogoRopaRouter.get("/filtros", filtrosController);
catalogoRopaRouter.get("/prendas", validar({ query: esquemaFiltrosCatalogo }), listarController);
catalogoRopaRouter.get("/prendas/:slug", validar({ params: esquemaSlug }), detalleController);
catalogoRopaRouter.post("/pedidos", limitePedidos, validar({ body: esquemaPedido }), enviarPedidoController);
