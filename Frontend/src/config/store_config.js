export const STORE_MODES = {
  CATALOG_ONLY:      "catalog_only",       // Solo muestra productos, sin acciones de compra
  CATALOG_WHATSAPP:  "catalog_whatsapp",   // Catalogo + boton de consulta por WhatsApp
  ECOMMERCE:         "ecommerce",          // Carrito + checkout completo
};

export const storeConfig = {
  // [GLOBAL] Modo de operacion de la tienda (ver STORE_MODES arriba)
  mode: STORE_MODES.CATALOG_WHATSAPP,

  // [WHATSAPP] Muestra el boton "Consultar por WhatsApp" en producto y carrito
  enableWhatsAppConsultation: true,
  // [PRODUCTO] Habilita la funcionalidad de lista de deseos / favoritos
  enableWishlist: false,
  // [PRODUCTO / ADMIN] Muestra el stock disponible al cliente en la ficha de producto
  enableStockVisibility: true,
  // [PRODUCTO / CARRITO] Muestra precios. false = catalogo sin precios visible
  enablePrices: true,
};

export function isWhatsAppMode() {
  return storeConfig.enableWhatsAppConsultation && storeConfig.mode !== STORE_MODES.CATALOG_ONLY;
}
