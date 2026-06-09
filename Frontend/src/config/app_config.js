// PUNTO DE ENTRADA DE LA CONFIGURACIÓN
// Importar todo desde aquí en lugar de ir archivo por archivo.
//
// Guía rápida para un proyecto nuevo:
//   1. store_config.js   → elegir el modo de la tienda
//   2. brand_config.js   → nombre, logo y redes sociales
//   3. whatsapp_config.js → número de WhatsApp y texto del mensaje
//   4. business_config.js → datos del negocio para el footer
//   5. theme_config.js   → colores y fuentes
//   6. catalog_config.js → menú y nombres de categorías
//   7. cart_config.js    → carrito y pagos (solo para modo ecommerce)

export { themeConfig }                          from "./theme_config";
export { brandConfig }                          from "./brand_config";
export { storeConfig, STORE_MODES, isWhatsAppMode } from "./store_config";
export { cartConfig, isEcommerceMode }          from "./cart_config";
export { mpPublicKey, mpConfigurado }           from "./mp_config";
export { catalogConfig }                        from "./catalog_config";
export { adminConfig }                          from "./admin_config";
export { businessConfig }                       from "./business_config";
export { authConfig }                           from "./auth_config";
