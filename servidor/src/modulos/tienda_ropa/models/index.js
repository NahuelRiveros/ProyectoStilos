import { DataTypes } from "sequelize";
import { defineModel } from "../../../core/models/common/define_model.js";
import { aplicarRelaciones } from "../../../core/models/common/relaciones.js";
import { ESTADOS_COMPROBANTE, ESTADOS_PAGO, ESTADOS_PEDIDO, FORMAS_PAGO } from "../reglas.js";

// Tablas del rubro tienda_ropa (spec 2026-11-catalogo-ropa.md). Un solo archivo: son pocas y se
// leen juntas. El orden de creación está en modulo.js.

const fechas = {
  creado_en:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  actualizado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
};

/** ROP-01: árbol (ej. Mujer › Remeras). */
export const CategoriaRopa = defineModel("CategoriaRopa", {
  nombre:   { type: DataTypes.STRING(80), allowNull: false },
  slug:     { type: DataTypes.STRING(90), allowNull: false, unique: true },
  padre_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "categoria_ropa", key: "id" } },
  orden:    { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  activo:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  ...fechas,
}, { tableName: "categoria_ropa", indexes: [{ fields: ["padre_id"] }] });

export const MarcaRopa = defineModel("MarcaRopa", {
  nombre:   { type: DataTypes.STRING(80), allowNull: false, unique: true },
  activo:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  logo_url: { type: DataTypes.STRING(500), allowNull: true }, // ROP-25
  ...fechas,
}, { tableName: "marca_ropa" });

/** ROP-23: lisa, rayada, estampada… (opcional en cada prenda). */
export const DisenoRopa = defineModel("DisenoRopa", {
  nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  orden:  { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  ...fechas,
}, { tableName: "diseno_ropa" });

/** ROP-03 */
export const ColorRopa = defineModel("ColorRopa", {
  nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  hex:    { type: DataTypes.STRING(7), allowNull: false },
  orden:  { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  ...fechas,
}, { tableName: "color_ropa" });

/** ROP-04: "Ropa" (S…XXXL), "Jeans" (36…56). Una prenda usa los talles de un grupo. */
export const GrupoTalle = defineModel("GrupoTalle", {
  nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  orden:  { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  ...fechas,
}, { tableName: "grupo_talle" });

export const Talle = defineModel("Talle", {
  grupo_talle_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "grupo_talle", key: "id" }, onDelete: "CASCADE" },
  nombre: { type: DataTypes.STRING(10), allowNull: false },
  orden:  { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
}, { tableName: "talle", indexes: [{ unique: true, fields: ["grupo_talle_id", "nombre"] }] });

/** ROP-05 y ROP-07: un precio por prenda. ROP-17: precio_anterior solo se muestra (tachado). */
export const Prenda = defineModel("Prenda", {
  nombre:          { type: DataTypes.STRING(120), allowNull: false },
  slug:            { type: DataTypes.STRING(90), allowNull: false, unique: true },
  descripcion:     { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  categoria_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: "categoria_ropa", key: "id" } },
  marca_id:        { type: DataTypes.INTEGER, allowNull: true, references: { model: "marca_ropa", key: "id" } },
  grupo_talle_id:  { type: DataTypes.INTEGER, allowNull: false, references: { model: "grupo_talle", key: "id" } },
  diseno_id:       { type: DataTypes.INTEGER, allowNull: true, references: { model: "diseno_ropa", key: "id" } },
  precio:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  precio_anterior: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  activo:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  ...fechas,
}, { tableName: "prenda", indexes: [{ fields: ["categoria_id"] }, { fields: ["activo"] }] });

/** ROP-08: cada talle × color de la prenda, con "hay / agotado". */
export const PrendaVariante = defineModel("PrendaVariante", {
  prenda_id:  { type: DataTypes.INTEGER, allowNull: false, references: { model: "prenda", key: "id" }, onDelete: "CASCADE" },
  color_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: "color_ropa", key: "id" } },
  talle_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: "talle", key: "id" } },
  disponible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "prenda_variante", indexes: [{ unique: true, fields: ["prenda_id", "color_id", "talle_id"] }] });

/** ROP-06: color_id null = foto general (se ve con todos los colores). */
export const PrendaImagen = defineModel("PrendaImagen", {
  prenda_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "prenda", key: "id" }, onDelete: "CASCADE" },
  color_id:  { type: DataTypes.INTEGER, allowNull: true, references: { model: "color_ropa", key: "id" } },
  url:       { type: DataTypes.STRING(500), allowNull: false },
  orden:     { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
}, { tableName: "prenda_imagen", indexes: [{ fields: ["prenda_id"] }] });

/** ROP-15: pedido enviado por WhatsApp, guardado para el panel. */
export const PedidoWhatsapp = defineModel("PedidoWhatsapp", {
  nombre:  { type: DataTypes.STRING(80), allowNull: false },
  celular: { type: DataTypes.STRING(20), allowNull: false },
  total:   { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  // Estados de 2026-11-cuentas-y-transferencias.md (los Nuevo / Atendido de antes no se migran).
  estado:  { type: DataTypes.STRING(14), allowNull: false, defaultValue: "recibido", validate: { isIn: [ESTADOS_PEDIDO] } },
  // ROP-46: "whatsapp" (sin cuenta) o "cuenta" (cliente que ingresó, con seguimiento).
  origen:      { type: DataTypes.STRING(10), allowNull: false, defaultValue: "whatsapp", validate: { isIn: [["whatsapp", "cuenta"]] } },
  usuario_id:  { type: DataTypes.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onDelete: "SET NULL" },
  forma_pago:  { type: DataTypes.STRING(14), allowNull: true, validate: { isIn: [FORMAS_PAGO] } },
  estado_pago: { type: DataTypes.STRING(12), allowNull: false, defaultValue: "pendiente", validate: { isIn: [ESTADOS_PAGO] } },
  // ROP-54: sube en cada cambio; si no coincide con la que vio quien cambia, otro lo cambió antes.
  version:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  // ROP-43: la manda el navegador; un reintento con la misma clave devuelve el mismo pedido.
  clave_envio: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  // ROP-18: copia de la entrega elegida; envio_gratis queda fijo aunque después cambie el mínimo.
  entrega:      { type: DataTypes.STRING(8), allowNull: false, defaultValue: "retiro", validate: { isIn: [["retiro", "envio"]] } },
  direccion:    { type: DataTypes.STRING(120), allowNull: true },
  localidad:    { type: DataTypes.STRING(80), allowNull: true },
  envio_gratis: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  ...fechas,
}, { tableName: "pedido_whatsapp", indexes: [{ fields: ["estado"] }, { fields: ["usuario_id"] }, { fields: ["estado_pago"] }] });

/** Copia nombre, color, talle y precio del momento: si la prenda cambia o se borra, el pedido no. */
export const PedidoWhatsappItem = defineModel("PedidoWhatsappItem", {
  pedido_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: "pedido_whatsapp", key: "id" }, onDelete: "CASCADE" },
  prenda_id:       { type: DataTypes.INTEGER, allowNull: true, references: { model: "prenda", key: "id" }, onDelete: "SET NULL" },
  nombre_prenda:   { type: DataTypes.STRING(120), allowNull: false },
  color:           { type: DataTypes.STRING(40), allowNull: false },
  talle:           { type: DataTypes.STRING(10), allowNull: false },
  cantidad:        { type: DataTypes.SMALLINT, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  subtotal:        { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: "pedido_whatsapp_item", indexes: [{ fields: ["pedido_id"] }] });

/** ROP-54: cada cambio de estado, con quién, cuándo y por qué. */
export const PedidoRopaHistorial = defineModel("PedidoRopaHistorial", {
  pedido_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: "pedido_whatsapp", key: "id" }, onDelete: "CASCADE" },
  estado_anterior: { type: DataTypes.STRING(14), allowNull: true },
  estado_nuevo:    { type: DataTypes.STRING(14), allowNull: false },
  motivo:          { type: DataTypes.STRING(500), allowNull: true },
  usuario_id:      { type: DataTypes.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onDelete: "SET NULL" },
  creado_en:       { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "pedido_ropa_historial", indexes: [{ fields: ["pedido_id"] }] });

/** ROP-48 a ROP-50: el archivo vive privado en Cloudinary; acá solo su id. */
export const PedidoRopaComprobante = defineModel("PedidoRopaComprobante", {
  pedido_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: "pedido_whatsapp", key: "id" }, onDelete: "CASCADE" },
  public_id:      { type: DataTypes.STRING(200), allowNull: false },
  formato:        { type: DataTypes.STRING(4), allowNull: false },
  estado:         { type: DataTypes.STRING(12), allowNull: false, defaultValue: "en_revision", validate: { isIn: [ESTADOS_COMPROBANTE] } },
  motivo_rechazo: { type: DataTypes.STRING(500), allowNull: true },
  revisado_por:   { type: DataTypes.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onDelete: "SET NULL" },
  revisado_en:    { type: DataTypes.DATE, allowNull: true },
  creado_en:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "pedido_ropa_comprobante", indexes: [{ fields: ["pedido_id"] }] });

/** ROP-41: domicilio del cliente (nombre, apellido y celular viven en la persona del core). */
export const ClienteRopa = defineModel("ClienteRopa", {
  usuario_id:    { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: "usuario", key: "id" }, onDelete: "CASCADE" },
  direccion:     { type: DataTypes.STRING(120), allowNull: true },
  localidad:     { type: DataTypes.STRING(80), allowNull: true },
  codigo_postal: { type: DataTypes.STRING(10), allowNull: true },
  ...fechas,
}, { tableName: "cliente_ropa" });

aplicarRelaciones([
  { tipo: "belongsTo", from: CategoriaRopa, to: CategoriaRopa, foreignKey: "padre_id", as: "padre" },
  { tipo: "hasMany",   from: GrupoTalle, to: Talle, foreignKey: "grupo_talle_id", as: "talles" },
  { tipo: "belongsTo", from: Prenda, to: CategoriaRopa, foreignKey: "categoria_id", as: "categoria" },
  { tipo: "belongsTo", from: Prenda, to: MarcaRopa, foreignKey: "marca_id", as: "marca" },
  { tipo: "belongsTo", from: Prenda, to: DisenoRopa, foreignKey: "diseno_id", as: "diseno" },
  { tipo: "belongsTo", from: Prenda, to: GrupoTalle, foreignKey: "grupo_talle_id", as: "grupo_talle" },
  { tipo: "hasMany",   from: Prenda, to: PrendaVariante, foreignKey: "prenda_id", as: "variantes" },
  { tipo: "hasMany",   from: Prenda, to: PrendaImagen, foreignKey: "prenda_id", as: "imagenes" },
  { tipo: "belongsTo", from: PrendaVariante, to: Prenda, foreignKey: "prenda_id", as: "prenda" },
  { tipo: "belongsTo", from: PrendaVariante, to: ColorRopa, foreignKey: "color_id", as: "color" },
  { tipo: "belongsTo", from: PrendaVariante, to: Talle, foreignKey: "talle_id", as: "talle" },
  { tipo: "hasMany",   from: PedidoWhatsapp, to: PedidoWhatsappItem, foreignKey: "pedido_id", as: "items" },
  { tipo: "hasMany",   from: PedidoWhatsapp, to: PedidoRopaHistorial, foreignKey: "pedido_id", as: "historial" },
  { tipo: "hasMany",   from: PedidoWhatsapp, to: PedidoRopaComprobante, foreignKey: "pedido_id", as: "comprobantes" },
  { tipo: "belongsTo", from: PedidoRopaComprobante, to: PedidoWhatsapp, foreignKey: "pedido_id", as: "pedido" },
]);
