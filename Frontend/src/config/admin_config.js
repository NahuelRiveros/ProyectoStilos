export const adminConfig = {
  // [ADMIN] false = deshabilita el acceso al panel admin para todos los roles
  enabled: true,
  // [NAVBAR] Label del link "Admin" visible solo para usuarios con rol admin
  navLabel: "Admin",
  // [ADMIN] Texto en la pantalla de acceso denegado
  restrictedLabel: "Area restringida",

  // [ADMIN / SIDEBAR] Modulos visibles en el menu lateral del backoffice
  // false = oculta el modulo del sidebar (no elimina la ruta, solo la esconde)
  modules: {
    dashboard:    true,   // Resumen general y metricas
    products:     true,   // ABM de productos
    catalogs:     true,   // Grupos, categorias y subcategorias
    stockAlerts:  true,   // Alertas de productos con stock bajo
    home:         true,   // Editor de banners y seccion Home
    users:        true,   // Gestion de usuarios y roles
    subscription: true,   // Plan y suscripcion del cliente
    orders:       false,  // Pedidos (requiere modo ecommerce)
    invoices:     false,  // Facturacion (requiere modo ecommerce)
    payments:     false,  // Reportes de pagos (requiere modo ecommerce)
  },
};
