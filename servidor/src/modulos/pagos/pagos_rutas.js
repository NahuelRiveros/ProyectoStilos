import { Router } from "express";
import { avisoLibre, avisoParams, iniciarPagoSchema, pedidoPagoParams } from "compartido/schemas/pagos.js";
import { ROLES_PANEL } from "compartido/reglas/roles.js";
import { requerirAuth, requerirModulo, requerirRol } from "../../nucleo/auth/middlewares.js";
import { validar } from "../../nucleo/validar.js";
import * as pagos from "./pagos_controlador.js";

export const pagosRutas = Router();
pagosRutas.use(requerirModulo("pagos_online"));

// Público: qué proveedores tienen credenciales (la tienda muestra el botón solo si hay alguno).
pagosRutas.get("/disponibles", pagos.verDisponibles);

// Aviso del proveedor (webhook): sin sesión, se valida con la firma del proveedor.
pagosRutas.post("/aviso/:proveedor", validar({ params: avisoParams, query: avisoLibre, body: avisoLibre }), pagos.aviso);

// El cliente paga SU pedido (el servicio responde 404 con uno ajeno).
pagosRutas.post("/pedidos/:id", requerirAuth, validar({ params: pedidoPagoParams, body: iniciarPagoSchema }), pagos.iniciar);

// Panel: intentos de pago online de un pedido.
pagosRutas.get("/pedidos/:id", requerirAuth, requerirRol(...ROLES_PANEL), validar({ params: pedidoPagoParams }), pagos.delPedido);
