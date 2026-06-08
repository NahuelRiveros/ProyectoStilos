import { Auth01Rol } from "./auth_01_rol.js";
import { Auth02Usuario } from "./auth_02_usuario.js";
import { Auth03ResetToken } from "./auth_03_reset_token.js";
import { Auth04LogSesion } from "./auth_04_log_sesion.js";
import { Auth05UsuarioRol } from "./auth_05_usuario_rol.js";

import { pers_01_persona } from "./personas/pers_01_persona.js";
import { pers_02_tipo_documento } from "./personas/pers_02_tipo_documento.js";
import { pers_03_sexo } from "./personas/pers_03_sexo.js";
import { pers_04_estado_civil } from "./personas/pers_04_estado_civil.js";
import { pers_05_provincia } from "./personas/pers_05_provincia.js";
import { pers_06_localidad } from "./personas/pers_06_localidad.js";

import { Prod01Categoria } from "./productos/prod_01_categoria.js";
import { Prod02Genero } from "./productos/prod_02_genero.js";
import { Prod03Producto } from "./productos/prod_03_producto.js";
import { Prod04Talle } from "./productos/prod_04_talle.js";
import { Prod05Stock } from "./productos/prod_05_stock.js";
import { Prod06Color } from "./productos/prod_06_color.js";
import { Prod07Marca } from "./productos/prod_07_marca.js";

import { Carr01Carrito } from "./carrito/carr_01_carrito.js";
import { Carr02Item } from "./carrito/carr_02_item.js";

import { Envio01Opcion } from "./envios/envio_01_opcion.js";
import { Envio02Envio } from "./envios/envio_02_envio.js";

import { Ord01Estado } from "./ordenes/ord_01_estado.js";
import { Ord03Orden } from "./ordenes/ord_03_orden.js";
import { Ord04Item } from "./ordenes/ord_04_item.js";

export function setupAssociations() {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  Auth02Usuario.belongsToMany(Auth01Rol, {
    through: Auth05UsuarioRol,
    foreignKey: "RELA_AUTH02",
    otherKey:   "RELA_AUTH01",
    as: "roles",
  });
  Auth01Rol.belongsToMany(Auth02Usuario, {
    through: Auth05UsuarioRol,
    foreignKey: "RELA_AUTH01",
    otherKey:   "RELA_AUTH02",
    as: "usuarios",
  });
  Auth05UsuarioRol.belongsTo(Auth01Rol,     { foreignKey: "RELA_AUTH01", as: "rol" });
  Auth05UsuarioRol.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  Auth02Usuario.hasMany(Auth03ResetToken, { foreignKey: "RELA_AUTH02", as: "resetTokens" });
  Auth03ResetToken.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  Auth02Usuario.hasMany(Auth04LogSesion, { foreignKey: "RELA_AUTH02", as: "logs" });
  Auth04LogSesion.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  // ── PERSONAS ──────────────────────────────────────────────────────────────
  pers_02_tipo_documento.hasMany(pers_01_persona, { foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO", as: "persona_tipo_documento" });
  pers_01_persona.belongsTo(pers_02_tipo_documento, { foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO", as: "tipo_documento_persona" });

  pers_03_sexo.hasMany(pers_01_persona, { foreignKey: "RELA_PERS_03_SEXO", as: "persona_sexo" });
  pers_01_persona.belongsTo(pers_03_sexo, { foreignKey: "RELA_PERS_03_SEXO", as: "sexo_persona" });

  pers_04_estado_civil.hasMany(pers_01_persona, { foreignKey: "RELA_PERS_05_ESTADO_CIVIL", as: "persona_estado_civil" });
  pers_01_persona.belongsTo(pers_04_estado_civil, { foreignKey: "RELA_PERS_05_ESTADO_CIVIL", as: "estado_civil_persona" });

  pers_05_provincia.hasMany(pers_06_localidad, { foreignKey: "RELA_PERS_05_PROVINCIA", as: "localidades" });
  pers_06_localidad.belongsTo(pers_05_provincia, { foreignKey: "RELA_PERS_05_PROVINCIA", as: "provincia" });

  pers_06_localidad.hasMany(pers_01_persona, { foreignKey: "RELA_PERS_06_LOCALIDAD", as: "persona_localidad" });
  pers_01_persona.belongsTo(pers_06_localidad, { foreignKey: "RELA_PERS_06_LOCALIDAD", as: "localidad_persona" });

  // ── PRODUCTOS ─────────────────────────────────────────────────────────────
  Prod01Categoria.hasMany(Prod03Producto, { foreignKey: "RELA_PROD01", as: "productos" });
  Prod03Producto.belongsTo(Prod01Categoria, { foreignKey: "RELA_PROD01", as: "categoria" });

  Prod02Genero.hasMany(Prod03Producto, { foreignKey: "RELA_PROD02", as: "productos" });
  Prod03Producto.belongsTo(Prod02Genero, { foreignKey: "RELA_PROD02", as: "genero" });

  Prod07Marca.hasMany(Prod03Producto, { foreignKey: "RELA_PROD07", as: "productos" });
  Prod03Producto.belongsTo(Prod07Marca, { foreignKey: "RELA_PROD07", as: "marca" });

  Prod03Producto.hasMany(Prod05Stock, { foreignKey: "RELA_PROD03", as: "stocks" });
  Prod05Stock.belongsTo(Prod03Producto, { foreignKey: "RELA_PROD03", as: "producto" });

  Prod04Talle.hasMany(Prod05Stock, { foreignKey: "RELA_PROD04", as: "stocks" });
  Prod05Stock.belongsTo(Prod04Talle, { foreignKey: "RELA_PROD04", as: "talle" });

  Prod06Color.hasMany(Prod05Stock, { foreignKey: "RELA_PROD06", as: "stocks" });
  Prod05Stock.belongsTo(Prod06Color, { foreignKey: "RELA_PROD06", as: "color" });

  // ── CARRITO ───────────────────────────────────────────────────────────────
  Auth02Usuario.hasOne(Carr01Carrito, { foreignKey: "RELA_AUTH02", as: "carrito" });
  Carr01Carrito.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  Carr01Carrito.hasMany(Carr02Item, { foreignKey: "RELA_CARR01", as: "items" });
  Carr02Item.belongsTo(Carr01Carrito, { foreignKey: "RELA_CARR01", as: "carrito" });

  Carr02Item.belongsTo(Prod03Producto, { foreignKey: "RELA_PROD03", as: "producto" });
  Prod03Producto.hasMany(Carr02Item, { foreignKey: "RELA_PROD03", as: "carrito_items" });

  // ── ORDENES ───────────────────────────────────────────────────────────────
  Auth02Usuario.hasMany(Ord03Orden, { foreignKey: "RELA_AUTH02", as: "ordenes" });
  Ord03Orden.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  Ord01Estado.hasMany(Ord03Orden, { foreignKey: "RELA_ORD01", as: "ordenes" });
  Ord03Orden.belongsTo(Ord01Estado, { foreignKey: "RELA_ORD01", as: "estado" });

  Ord03Orden.hasMany(Ord04Item, { foreignKey: "RELA_ORD03", as: "items" });
  Ord04Item.belongsTo(Ord03Orden, { foreignKey: "RELA_ORD03", as: "orden" });

  // ── ENVIOS ────────────────────────────────────────────────────────────────
  Envio01Opcion.hasMany(Envio02Envio, { foreignKey: "RELA_ENVIO01", as: "envios" });
  Envio02Envio.belongsTo(Envio01Opcion, { foreignKey: "RELA_ENVIO01", as: "opcion" });

  Ord03Orden.hasOne(Envio02Envio, { foreignKey: "RELA_ORD03", as: "envio" });
  Envio02Envio.belongsTo(Ord03Orden, { foreignKey: "RELA_ORD03", as: "orden" });
}
