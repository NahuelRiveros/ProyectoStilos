// PANEL DE ADMINISTRACIÓN
// Qué módulos aparecen en el menú lateral del backoffice.

export const adminConfig = {
  // false = nadie puede entrar al panel, independientemente del rol.
  enabled: true,

  // Textos del panel
  navLabel: "Admin",
  restrictedLabel: "Área restringida",

  // Módulos del menú lateral.
  // false = oculta el módulo del menú (no elimina la ruta, solo la esconde).
  modules: {
    dashboard:    true,   // Resumen y métricas generales
    products:     true,   // ABM de productos
    catalogs:     true,   // Grupos, categorías y subcategorías
    stockAlerts:  true,   // Alertas de stock bajo
    home:         true,   // Editor de banners y sección home
    whatsapp:     true,   // Configuración de WhatsApp (número, mensaje, nota de entrega)
    mediosPago:   true,   // Medios de pago y promociones de cuotas
    users:        true,   // Gestión de usuarios y roles
    subscription: true,   // Plan y suscripción del cliente
    import:       true,   // Importación masiva de productos via CSV
    orders:       false,  // Pedidos (requiere modo ecommerce)
    invoices:     false,  // Facturación (requiere modo ecommerce)
    payments:     false,  // Reportes de pagos (requiere modo ecommerce)
  },
};
