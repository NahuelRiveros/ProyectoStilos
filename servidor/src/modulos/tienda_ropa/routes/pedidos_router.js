import { Router } from "express";
import { requireAuth, requirePermiso } from "../../../core/middleware/auth_middleware.js";
import { validar } from "../../../core/middleware/validar.js";
import * as pedidos from "../controllers/pedidos_controller.js";
import { esquemaComprobante, esquemaEstadoPedido, esquemaFiltrosPedidos, esquemaId, esquemaMotivo } from "../reglas.js";

// Pedidos en el panel: verlos pide "Ver pedidos"; cambiar el estado, "Gestionar pedidos"; mover
// dinero (comprobantes y pagos), "Registrar pagos" (ROP-57).
export const pedidosRopaRouter = Router();
pedidosRopaRouter.use(requireAuth, requirePermiso("pedidos.ver"));

const pagos = requirePermiso("pagos.registrar");

pedidosRopaRouter.get("/", validar({ query: esquemaFiltrosPedidos }), pedidos.listarPedidosController);
pedidosRopaRouter.get("/resumen", pedidos.resumenPedidosController);
pedidosRopaRouter.get("/:id", validar({ params: esquemaId }), pedidos.obtenerPedidoController);
pedidosRopaRouter.patch("/:id/estado", requirePermiso("pedidos.gestionar"), validar({ params: esquemaId, body: esquemaEstadoPedido }), pedidos.estadoPedidoController);
pedidosRopaRouter.post("/:id/pagado", pagos, validar({ params: esquemaId }), pedidos.pagadoController);
pedidosRopaRouter.get("/:id/comprobantes/:comprobanteId/enlace", validar({ params: esquemaComprobante }), pedidos.enlaceComprobanteController);
pedidosRopaRouter.post("/:id/comprobantes/:comprobanteId/aceptar", pagos, validar({ params: esquemaComprobante }), pedidos.aceptarComprobanteController);
pedidosRopaRouter.post("/:id/comprobantes/:comprobanteId/rechazar", pagos, validar({ params: esquemaComprobante, body: esquemaMotivo }), pedidos.rechazarComprobanteController);
