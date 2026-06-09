// CARRITO Y CHECKOUT
// Activa o desactiva la funcionalidad de compra online.
// La mayoría de estas opciones solo tienen efecto si enableCart: true.

export const cartConfig = {

  // ── ¿Qué está habilitado? ──────────────────────────────────────────────────

  // Activa el carrito de compras y la ruta /carrito.
  // Requiere que el backend tenga activos los endpoints de /carrito.
  enableCart: false,

  // Activa el flujo de checkout al finalizar la compra.
  // Requiere enableCart: true.
  enableCheckout: false,

  // Activa el pago online con MercadoPago.
  // Requiere enableCheckout: true + VITE_MP_PUBLIC_KEY en el archivo .env
  enablePayments: false,

  // Botón principal en la ficha de cada producto:
  // "whatsapp" → abre WhatsApp con el producto (modo actual, CATALOG_WHATSAPP)
  // "cart"     → agrega al carrito (requiere enableCart: true)
  // "none"     → sin botón de acción
  productDetailCta: "whatsapp",


  // ── Métodos de pago ────────────────────────────────────────────────────────

  // Métodos de pago activos en el checkout y en el footer.
  // Opciones: "mercadopago" | "transferencia" | "efectivo"
  metodosHabilitados: ["mercadopago"],

  // Tarjetas que acepta el negocio — define los logos que se muestran en el footer.
  // Opciones: "visa" | "mastercard" | "amex" | "naranja" | "cabal"
  tarjetasAceptadas: ["visa", "mastercard", "amex"],


  // ── Envío y descuentos ────────────────────────────────────────────────────

  // Activa el selector de tipo de envío en el checkout.
  enableEnvio: true,

  // Monto mínimo para envío gratis. null = no aplica.
  // Ejemplo: 50000 → envío gratis en compras mayores a $50.000
  envioGratisDesde: null,

  // Activa el campo para ingresar códigos de descuento en el checkout.
  enableCupones: false,


  // ── Límites del carrito ────────────────────────────────────────────────────

  // Máximo de unidades del mismo producto por línea del carrito.
  cantidadMaxPorItem: 99,

  // Máximo de productos distintos en el carrito al mismo tiempo.
  maxItemsEnCarrito: 20,

  // Días de inactividad antes de que el backend limpie el carrito del usuario.
  cartTtlDias: 30,


  // ── Sellos de confianza (footer) ───────────────────────────────────────────
  // Solo se muestran cuando enableCart: true.

  // Activa la sección de sellos de confianza en el footer.
  mostrarSellosConfianza: true,
  // Sello "Pagá con Mercado Pago" (solo si "mercadopago" está en metodosHabilitados).
  mostrarLogoMercadoPago: true,
  // Logos de tarjetas según tarjetasAceptadas[].
  mostrarLogosTarjetas: true,
  // Sello "Compra Segura" con candado SSL.
  mostrarSellosCompraSegura: true,
  // Link a Defensa del Consumidor (Ley 24.240) — obligatorio para e-commerce en Argentina.
  mostrarDefensaConsumidor: true,
  // Widget Data Fiscal de AFIP (requiere businessConfig.dataFiscalUrl).
  // Generar en: https://www.afip.gob.ar/fe/qr/
  mostrarDataFiscal: false,


  // ── Validaciones automáticas ───────────────────────────────────────────────
  // Dependen de lo que devuelve el backend. No modificar sin revisar los endpoints de /carrito.

  // Bloquea el botón "Agregar" si el producto no tiene stock.
  validarStockAlAgregar: true,
  // Al abrir el carrito: avisa si los precios cambiaron desde que se agregaron.
  validarPreciosAlAbrir: true,
  // Al abrir el carrito: avisa si alguna variante (talle / color) ya no está disponible.
  validarVariantesAlAbrir: true,
  // Al abrir el carrito: elimina automáticamente los productos desactivados por el admin.
  autoRemoverProductosInactivos: true,

};

// true cuando el carrito y el checkout están habilitados (modo ecommerce completo)
export function isEcommerceMode() {
  return cartConfig.enableCart && cartConfig.enableCheckout;
}
