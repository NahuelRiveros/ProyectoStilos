// PUBLIC KEY de MercadoPago — es de naturaleza publica, segura para el frontend.
// Se usa para inicializar el SDK de Checkout Pro / Bricks en el browser.
//
// SECRET KEY: va EXCLUSIVAMENTE en el servidor (nunca en el frontend).
// Configurar en .env copiando .env.example → VITE_MP_PUBLIC_KEY=APP_USR-...
export const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY ?? "";

// true si la clave esta cargada (util para ocultar botones de pago sin config)
export const mpConfigurado = mpPublicKey.length > 10;
