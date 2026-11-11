import { DataTypes } from "sequelize";
import { defineModel } from "../../../core/models/common/define_model.js";
import { aplicarRelaciones } from "../../../core/models/common/relaciones.js";

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
  nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  ...fechas,
}, { tableName: "marca_ropa" });

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
  estado:  { type: DataTypes.STRING(12), allowNull: false, defaultValue: "nuevo", validate: { isIn: [["nuevo", "atendido", "cancelado"]] } },
  ...fechas,
}, { tableName: "pedido_whatsapp", indexes: [{ fields: ["estado"] }] });

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

aplicarRelaciones([
  { tipo: "belongsTo", from: CategoriaRopa, to: CategoriaRopa, foreignKey: "padre_id", as: "padre" },
  { tipo: "hasMany",   from: GrupoTalle, to: Talle, foreignKey: "grupo_talle_id", as: "talles" },
  { tipo: "belongsTo", from: Prenda, to: CategoriaRopa, foreignKey: "categoria_id", as: "categoria" },
  { tipo: "belongsTo", from: Prenda, to: MarcaRopa, foreignKey: "marca_id", as: "marca" },
  { tipo: "belongsTo", from: Prenda, to: GrupoTalle, foreignKey: "grupo_talle_id", as: "grupo_talle" },
  { tipo: "hasMany",   from: Prenda, to: PrendaVariante, foreignKey: "prenda_id", as: "variantes" },
  { tipo: "hasMany",   from: Prenda, to: PrendaImagen, foreignKey: "prenda_id", as: "imagenes" },
  { tipo: "belongsTo", from: PrendaVariante, to: Prenda, foreignKey: "prenda_id", as: "prenda" },
  { tipo: "belongsTo", from: PrendaVariante, to: ColorRopa, foreignKey: "color_id", as: "color" },
  { tipo: "belongsTo", from: PrendaVariante, to: Talle, foreignKey: "talle_id", as: "talle" },
  { tipo: "hasMany",   from: PedidoWhatsapp, to: PedidoWhatsappItem, foreignKey: "pedido_id", as: "items" },
]);
