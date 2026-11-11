// Políticas de este cliente, compartidas por la API y el navegador; nunca incluir secretos.
export const clientConfig = {
  // Elige la marca de frontend/src/proyecto/config/brand_config.js.
  id: "stilos",
  // publicRegistration: true si el proyecto tiene tienda y los clientes se registran solos.
  // ROP-40: los clientes pueden registrarse (o ingresar con Google) para seguir sus pedidos.
  auth: { publicRegistration: true, passwordMinLength: 8, passwordMaxLength: 72, resetMinutes: 20, sesionClienteDias: 30, sesionPersonalHoras: 24 },
  // Catálogo y carrito de la tienda (las reglas del carrito del core leen estos límites).
  tienda: { publicCatalog: true, guestCart: true, pageSize: 24, maxQuantity: 99, maxCartLines: 50, cartTtlDays: 15 },
  // Entrega del pedido (ROP-18). El costo del envío se coordina por WhatsApp; desde este total es gratis.
  entrega: {
    envioGratisDesde: 150000,
    direccionLocal: null, // [COMPLETAR] dirección para retirar, ej. "Calle 123, Ciudad"; null = se pasa por WhatsApp
  },
  // ROP-47: datos para que el cliente transfiera. [COMPLETAR] todos: mientras falte alguno, la tienda
  // no ofrece "Transferencia". Son públicos (se muestran al cliente): no son secretos.
  datosBancarios: {
    titular: null, // [COMPLETAR] como figura en el banco
    banco: null,   // [COMPLETAR]
    cbu: null,     // [COMPLETAR] 22 números
    alias: null,   // [COMPLETAR]
    cuit: null,    // [COMPLETAR]
  },
  // WhatsApp del negocio (ROP-14): con código de país, sin "+" ni espacios.
  whatsapp: "5493704784641",
  // Datos fiscales de quien factura (ver core/fiscal_config.js). [COMPLETAR] antes de facturar.
  // condicion_iva: "responsable_inscripto", "monotributista" o "exento"; null = no se sugiere factura.
  emisorFiscal: {
    condicion_iva: null,
    razon_social: null, // [COMPLETAR] como figura en ARCA
    domicilio_comercial: null, // [COMPLETAR] calle, número, localidad
    ingresos_brutos: null, // [COMPLETAR] número de IIBB o "Convenio Multilateral …"
    inicio_actividades: null, // [COMPLETAR] "AAAA-MM-DD"
  },
};
