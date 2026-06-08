export const cartConfig = {

  // ═══════════════════════════════════════════════════════════════
  // HABILITACION — encender / apagar funcionalidades enteras
  // ═══════════════════════════════════════════════════════════════

  // [NAVBAR] Habilita el icono de carrito y la ruta /carrito
  // Requiere que el backend tenga activos los endpoints de /carrito
  enableCart: false,

  // [CHECKOUT] Habilita el flujo /checkout al finalizar la compra
  // Requiere enableCart: true
  enableCheckout: false,

  // [PAGOS] Habilita el pago online con MercadoPago
  // Requiere enableCheckout: true + VITE_MP_PUBLIC_KEY en .env
  enablePayments: false,

  // [PRODUCTO] Boton principal en la pagina de detalle de producto
  // "whatsapp" → consulta por WhatsApp  (requiere storeConfig.enableWhatsAppConsultation)
  // "cart"     → agrega al carrito     (requiere enableCart: true)
  // "none"     → sin boton de accion
  productDetailCta: "whatsapp",


  // ═══════════════════════════════════════════════════════════════
  // LIMITES — cantidades y maximos permitidos
  // ═══════════════════════════════════════════════════════════════

  // [CARRITO] Maximo de unidades del mismo producto por linea de carrito
  cantidadMaxPorItem: 99,

  // [CARRITO] Maximo de productos distintos en el carrito al mismo tiempo
  maxItemsEnCarrito: 20,


  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES — que controlar y en que momento
  // ═══════════════════════════════════════════════════════════════

  // [CARRITO] Bloquea el boton "Agregar" si el producto no tiene stock
  validarStockAlAgregar: true,

  // [CARRITO] Al abrir el carrito: detecta y avisa si los precios cambiaron
  // Requiere que el backend retorne precio_al_agregar en cada item de GET /carrito
  validarPreciosAlAbrir: true,

  // [CARRITO] Al abrir el carrito: detecta variantes que ya no existen (talle / color)
  // Requiere que el backend retorne variante_disponible: boolean en cada item
  validarVariantesAlAbrir: true,

  // [CARRITO] Al abrir el carrito: auto-elimina del servidor productos desactivados
  // Requiere que el backend retorne activo: boolean en cada item
  autoRemoverProductosInactivos: true,


  // ═══════════════════════════════════════════════════════════════
  // CUPONES — descuentos y promociones
  // ═══════════════════════════════════════════════════════════════

  // [CHECKOUT] Habilita el campo para ingresar codigos de descuento
  enableCupones: false,


  // ═══════════════════════════════════════════════════════════════
  // ENVIO — opciones de despacho
  // ═══════════════════════════════════════════════════════════════

  // [CHECKOUT] Habilita el selector de opciones de envio en el checkout
  enableEnvio: true,

  // [CHECKOUT] Monto minimo de compra para envio gratis (null = no aplica)
  // Ej: 50000 → envio gratis en compras mayores a $50.000
  envioGratisDesde: null,


  // ═══════════════════════════════════════════════════════════════
  // SESION DEL CARRITO
  // ═══════════════════════════════════════════════════════════════

  // [BACKEND] Dias de inactividad antes de que el backend limpie el carrito
  // El frontend usa este valor solo como referencia informativa
  cartTtlDias: 30,


  // ═══════════════════════════════════════════════════════════════
  // METODOS DE PAGO
  // ═══════════════════════════════════════════════════════════════

  // [CHECKOUT / FOOTER] Metodos de pago activos
  // Valores posibles: "mercadopago" | "transferencia" | "efectivo"
  metodosHabilitados: ["mercadopago"],

  // [FOOTER] Tarjetas que acepta el negocio — define que logos se muestran
  // Valores posibles: "visa" | "mastercard" | "amex" | "naranja" | "cabal"
  tarjetasAceptadas: ["visa", "mastercard", "amex"],


  // ═══════════════════════════════════════════════════════════════
  // FOOTER — sellos de confianza y cumplimiento legal (Argentina)
  // Toda esta seccion solo aparece si enableCart: true
  // ═══════════════════════════════════════════════════════════════

  // [FOOTER] Activa la seccion completa de sellos de confianza
  mostrarSellosConfianza: true,

  // [FOOTER] Muestra el sello de MercadoPago ("Pagá con Mercado Pago")
  // Solo se muestra si "mercadopago" esta en metodosHabilitados
  mostrarLogoMercadoPago: true,

  // [FOOTER] Muestra los logos de tarjetas segun tarjetasAceptadas[]
  mostrarLogosTarjetas: true,

  // [FOOTER] Muestra el sello de "Compra Segura" con candado SSL
  mostrarSellosCompraSegura: true,

  // [FOOTER] Muestra el link oficial a Defensa del Consumidor (Ley 24.240)
  // Obligatorio para e-commerce en Argentina segun la normativa vigente
  mostrarDefensaConsumidor: true,

  // [FOOTER] Muestra el widget Data Fiscal de AFIP (codigo QR)
  // Requiere businessConfig.dataFiscalUrl con la URL generada por AFIP
  // Obtener en: https://www.afip.gob.ar/fe/qr/
  mostrarDataFiscal: false,

};

// true cuando el carrito y el checkout estan habilitados
export function isEcommerceMode() {
  return cartConfig.enableCart && cartConfig.enableCheckout;
}
