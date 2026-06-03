// ==========================================================
// ROLES DEL SISTEMA
// Deben coincidir con AUTH_01_ROL.AUTH01_NOMBRE
// ==========================================================

export const ROLES = {
  ADMIN: "Administrador",
  USR:   "Usuario",
};

// ==========================================================
// GRUPOS DE ACCESO
// ==========================================================

const AUTENTICADO = [ROLES.ADMIN, ROLES.USR];
const SOLO_ADMIN  = [ROLES.ADMIN];

// ==========================================================
// MATRIZ DE PERMISOS
// ==========================================================

export const ACCESS = {
  // =====================
  // USUARIOS
  // =====================
  USUARIOS_GET:    SOLO_ADMIN,
  USUARIOS_CREATE: SOLO_ADMIN,
  USUARIOS_UPDATE: SOLO_ADMIN,
  USUARIOS_DELETE: SOLO_ADMIN,

  // =====================
  // ROLES
  // =====================
  ROLES_GET:    AUTENTICADO,
  ROLES_CREATE: SOLO_ADMIN,
  ROLES_UPDATE: SOLO_ADMIN,
  ROLES_DELETE: SOLO_ADMIN,

  // =====================
  // CATÁLOGOS GENÉRICOS
  // =====================
  CATALOGOS_GET:    AUTENTICADO,
  CATALOGOS_CREATE: SOLO_ADMIN,
  CATALOGOS_UPDATE: SOLO_ADMIN,
  CATALOGOS_DELETE: SOLO_ADMIN,

  // =====================
  // CARRITO
  // Todo autenticado — cada usuario opera su propio carrito
  // =====================
  CARRITO: AUTENTICADO,

  // =====================
  // ÓRDENES
  // Crear y consultar: cualquier usuario autenticado
  // Admin: solo administradores
  // =====================
  ORDENES_CREATE: AUTENTICADO,
  ORDENES_READ:   AUTENTICADO,
  ORDENES_ADMIN:  SOLO_ADMIN,

  // =====================
  // PAGOS
  // Verificar estado: cualquier usuario autenticado
  // Webhook: sin auth (middleware omitido en la ruta)
  // =====================
  PAGOS_VERIFICAR: AUTENTICADO,

  // =====================
  // PRODUCTOS
  // GET sin auth → frontend público (catálogo de ropa)
  // CRUD y gestión de stock: solo admin
  // =====================
  PRODUCTOS_CREATE: SOLO_ADMIN,
  PRODUCTOS_UPDATE: SOLO_ADMIN,
  PRODUCTOS_DELETE: SOLO_ADMIN,
  PRODUCTOS_STOCK:  SOLO_ADMIN,

  // catálogos de soporte de producto
  CATEGORIAS_CREATE: SOLO_ADMIN,
  CATEGORIAS_UPDATE: SOLO_ADMIN,
  CATEGORIAS_DELETE: SOLO_ADMIN,

  GENEROS_CREATE: SOLO_ADMIN,
  GENEROS_UPDATE: SOLO_ADMIN,
  GENEROS_DELETE: SOLO_ADMIN,

  TALLES_CREATE: SOLO_ADMIN,
  TALLES_UPDATE: SOLO_ADMIN,
  TALLES_DELETE: SOLO_ADMIN,

  COLORES_CREATE: SOLO_ADMIN,
  COLORES_UPDATE: SOLO_ADMIN,
  COLORES_DELETE: SOLO_ADMIN,

  MARCAS_CREATE: SOLO_ADMIN,
  MARCAS_UPDATE: SOLO_ADMIN,
  MARCAS_DELETE: SOLO_ADMIN,

  // =====================
  // UPLOAD DE IMÁGENES
  // =====================
  UPLOAD: SOLO_ADMIN,

  // =====================
  // ÓRDENES (catálogos de soporte)
  // GET autenticado → usuario lo ve al hacer checkout / historial
  // CRUD solo admin
  // =====================
  ESTADOS_ORDEN_GET:    AUTENTICADO,
  ESTADOS_ORDEN_CREATE: SOLO_ADMIN,
  ESTADOS_ORDEN_UPDATE: SOLO_ADMIN,
  ESTADOS_ORDEN_DELETE: SOLO_ADMIN,

  CONDICION_IVA_GET: AUTENTICADO,

  // =====================
  // FACTURACIÓN
  // GET autenticado → usuario lo elige en checkout
  // Puntos de venta solo admin
  // =====================
  TIPO_COMP_GET: AUTENTICADO,

  PUNTO_VENTA_GET:    SOLO_ADMIN,
  PUNTO_VENTA_CREATE: SOLO_ADMIN,
  PUNTO_VENTA_UPDATE: SOLO_ADMIN,
  PUNTO_VENTA_DELETE: SOLO_ADMIN,

  // =====================
  // ENVÍOS
  // GET autenticado → usuario elige en checkout
  // CRUD solo admin
  // =====================
  ENVIO_OPCION_GET:    AUTENTICADO,
  ENVIO_OPCION_CREATE: SOLO_ADMIN,
  ENVIO_OPCION_UPDATE: SOLO_ADMIN,
  ENVIO_OPCION_DELETE: SOLO_ADMIN,

  // =====================
  // COMPROBANTES AFIP
  // Leer el propio comprobante: cualquier usuario autenticado
  // Emitir y ver todos: solo admin
  // =====================
  COMPROBANTES_READ:   AUTENTICADO,
  COMPROBANTES_EMITIR: SOLO_ADMIN,

  // =====================
  // PERFIL DE CLIENTE
  // Perfil y direcciones: cualquier usuario autenticado
  // =====================
  CLIENTES_PERFIL: AUTENTICADO,
};
