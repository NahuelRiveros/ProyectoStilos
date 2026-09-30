import { env } from "../../../nucleo/env.js";
import { crearMercadoPago } from "./mercado_pago.js";

// Proveedores de pago disponibles. Para sumar uno (ej. Stripe): crear proveedores/stripe.js con
// las mismas funciones (crearCobro, verificarAviso, consultarPago, configurado, nombre, metodo)
// y agregarlo acá con sus credenciales del .env.
export const proveedores = {
  mercado_pago: crearMercadoPago({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN, claveWebhook: env.MERCADOPAGO_CLAVE_WEBHOOK }),
};
