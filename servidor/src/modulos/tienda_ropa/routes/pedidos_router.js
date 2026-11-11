import { Router } from "express";
import { requireAuth, requirePermiso } from "../../../core/middleware/auth_middleware.js";
import { validar } from "../../../core/middleware/validar.js";
import { listarPedidosController, obtenerPedidoController, estadoPedidoController, resumenPedidosController } from "../controllers/pedidos_controller.js";
import { esquemaEstadoPedido, esquemaFiltrosPedidos, esquemaId } from "../reglas.js";

// Pedidos en el panel (ROP-15): verlos pide "Ver pedidos"; cambiar el estado, "Gestionar pedidos".
export const pedidosRopaRouter = Router();
pedidosRopaRouter.use(requireAuth, requirePermiso("pedidos.ver"));

pedidosRopaRouter.get("/", validar({ query: esquemaFiltrosPedidos }), listarPedidosController);
pedidosRopaRouter.get("/resumen", resumenPedidosController);
pedidosRopaRouter.get("/:id", validar({ params: esquemaId }), obtenerPedidoController);
pedidosRopaRouter.patch("/:id/estado", requirePermiso("pedidos.gestionar"), validar({ params: esquemaId, body: esquemaEstadoPedido }), estadoPedidoController);
