import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../core/middleware/auth_middleware.js";
import { validar } from "../../../core/middleware/validar.js";
import * as cuenta from "../controllers/mi_cuenta_controller.js";
import { MAX_BYTES_COMPROBANTE, esquemaComprobante, esquemaId, esquemaMisDatos, esquemaMotivo, esquemaPedidoCuenta } from "../reglas.js";

// Cuenta del cliente (ROP-40 a ROP-53): pide ingresar; cada pedido se controla contra su dueño.
export const miCuentaRopaRouter = Router();
miCuentaRopaRouter.use(requireAuth);

const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES_COMPROBANTE, files: 1, fields: 2 } });

miCuentaRopaRouter.get("/datos", cuenta.misDatosController);
miCuentaRopaRouter.put("/datos", validar({ body: esquemaMisDatos }), cuenta.guardarMisDatosController);
miCuentaRopaRouter.get("/pedidos", cuenta.misPedidosController);
miCuentaRopaRouter.post("/pedidos", validar({ body: esquemaPedidoCuenta }), cuenta.crearPedidoCuentaController);
miCuentaRopaRouter.get("/pedidos/:id", validar({ params: esquemaId }), cuenta.miPedidoController);
miCuentaRopaRouter.post("/pedidos/:id/cancelar", validar({ params: esquemaId, body: esquemaMotivo }), cuenta.cancelarMiPedidoController);
miCuentaRopaRouter.post("/pedidos/:id/comprobantes", validar({ params: esquemaId }), subida.single("archivo"), cuenta.subirComprobanteController);
miCuentaRopaRouter.get("/pedidos/:id/comprobantes/:comprobanteId/enlace", validar({ params: esquemaComprobante }), cuenta.enlaceComprobanteController);

// Errores de multer (archivo grande o campo equivocado) con el mismo formato que el resto.
miCuentaRopaRouter.use((error, _req, res, next) => {
  if (res.headersSent || !(error instanceof multer.MulterError)) return next(error);
  const grande = error.code === "LIMIT_FILE_SIZE";
  return res.status(grande ? 413 : 400).json({
    ok: false, codigo: grande ? "ARCHIVO_GRANDE" : "ARCHIVO_INVALIDO",
    mensaje: grande ? "El archivo supera los 5 MB." : "Adjuntá un solo archivo.",
  });
});
