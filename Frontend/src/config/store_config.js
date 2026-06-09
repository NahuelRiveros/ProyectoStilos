// TIPO DE TIENDA
// Define cómo funciona la tienda para los clientes.
// Este es el primer archivo a configurar en un proyecto nuevo.

export const STORE_MODES = {
  CATALOG_ONLY:     "catalog_only",     // Solo muestra productos — sin botones de compra ni WhatsApp
  CATALOG_WHATSAPP: "catalog_whatsapp", // Muestra productos — el cliente consulta por WhatsApp
  ECOMMERCE:        "ecommerce",        // Carrito de compras + checkout + pagos online
};

export const storeConfig = {
  // Modo de la tienda. Cambiar esto activa o desactiva funcionalidades automáticamente.
  mode: STORE_MODES.CATALOG_WHATSAPP,

  // Muestra el botón "Consultar por WhatsApp" en el producto y en el carrito de consulta.
  // Se activa solo en modo CATALOG_WHATSAPP.
  enableWhatsAppConsultation: true,

  // Lista de deseos / favoritos para el cliente.
  enableWishlist: false,

  // Muestra cuántas unidades quedan en la ficha de cada producto.
  // false = el cliente no ve el stock disponible.
  enableStockVisibility: true,

  // Muestra los precios en el catálogo y en el detalle de producto.
  // false = catálogo sin precios (solo para ver, sin datos de valor).
  enablePrices: true,
};

export function isWhatsAppMode() {
  return storeConfig.enableWhatsAppConsultation && storeConfig.mode !== STORE_MODES.CATALOG_ONLY;
}
