// MERCADOPAGO
// Clave pública del SDK de MercadoPago — se carga desde el archivo .env.
//
// Para activar los pagos:
//   1. Obtener la PUBLIC KEY en mercadopago.com (panel → Credenciales)
//   2. Agregar al .env del frontend: VITE_MP_PUBLIC_KEY=APP_USR-...
//   3. Activar en cart_config.js: enablePayments: true
//
// La SECRET KEY va exclusivamente en el servidor backend — nunca en el frontend.

export const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY ?? "";

// true si la clave está cargada (útil para ocultar botones de pago sin configurar)
export const mpConfigurado = mpPublicKey.length > 10;
