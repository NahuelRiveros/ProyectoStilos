import { Auth01Rol } from "./auth_01_rol.js";
import { Auth02Usuario } from "./auth_02_usuario.js";
import { Auth03ResetToken } from "./auth_03_reset_token.js";
import { Auth04LogSesion } from "./auth_04_log_sesion.js";
////////////////////////////////////////////////////////
import { pers_01_persona } from "./personas/pers_01_persona.js";
import { pers_02_tipo_documento } from "./personas/pers_02_tipo_documento.js";
import { pers_03_sexo } from "./Personas/pers_03_sexo.js";
import { pers_04_estado_civil } from "./personas/pers_04_estado_civil.js";
import { pers_05_provincia } from "./personas/pers_05_provincia.js";
import { pers_06_localidad } from "./personas/pers_06_localidad.js";
////////////////////////////////////////////////////////
import { Prod01Categoria }      from "./productos/prod_01_categoria.js";
import { Prod02Genero }          from "./productos/prod_02_genero.js";
import { Prod08CategoriaGenero } from "./productos/prod_08_categoria_genero.js";
import { Prod03Producto }  from "./productos/prod_03_producto.js";
import { Prod04Talle }     from "./productos/prod_04_talle.js";
import { Prod05Stock }     from "./productos/prod_05_stock.js";
import { Prod06Color }     from "./productos/prod_06_color.js";
import { Prod07Marca }     from "./productos/prod_07_marca.js";
////////////////////////////////////////////////////////
import { Carr01Carrito } from "./carrito/carr_01_carrito.js";
import { Carr02Item }    from "./carrito/carr_02_item.js";
////////////////////////////////////////////////////////
import { Ord01Estado }      from "./ordenes/ord_01_estado.js";
import { Ord02CondicionIva } from "./ordenes/ord_02_condicion_iva.js";
import { Ord03Orden }       from "./ordenes/ord_03_orden.js";
import { Ord04Item }        from "./ordenes/ord_04_item.js";
////////////////////////////////////////////////////////
import { Fact01TipoComp }   from "./facturacion/fact_01_tipo_comp.js";
import { Fact02PuntoVenta } from "./facturacion/fact_02_punto_venta.js";
import { Fact03Comprobante } from "./facturacion/fact_03_comprobante.js";
////////////////////////////////////////////////////////
import { Envio01Opcion } from "./envios/envio_01_opcion.js";
import { Envio02Envio }  from "./envios/envio_02_envio.js";
////////////////////////////////////////////////////////
import { Cli01Perfil }    from "./clientes/cli_01_perfil.js";
import { Cli02Direccion } from "./clientes/cli_02_direccion.js";

export function setupAssociations() {
  // ROL → USUARIO
  Auth01Rol.hasMany(Auth02Usuario, {
    foreignKey: "RELA_AUTH01",
    as: "usuarios",
  });
  Auth02Usuario.belongsTo(Auth01Rol, {
    foreignKey: "RELA_AUTH01",
    as: "rol",
  });

  // USUARIO → RESET TOKENS
  Auth02Usuario.hasMany(Auth03ResetToken, {
    foreignKey: "RELA_AUTH02",
    as: "resetTokens",
  });
  Auth03ResetToken.belongsTo(Auth02Usuario, {
    foreignKey: "RELA_AUTH02",
    as: "usuario",
  });

  // USUARIO → LOGS DE SESIÓN
  Auth02Usuario.hasMany(Auth04LogSesion, {
    foreignKey: "RELA_AUTH02",
    as: "logs",
  });
  Auth04LogSesion.belongsTo(Auth02Usuario, {
    foreignKey: "RELA_AUTH02",
    as: "usuario",
  });

  // PERSONA → TIPO DOCUMENTO
  pers_02_tipo_documento.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO",
    as: "persona_tipo_documento"
  })

  pers_01_persona.belongsTo(pers_02_tipo_documento,{
    foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO",
    as: "tipo_documento_persona"
  })

  // PERSONA → SEXO
  pers_03_sexo.hasMany(pers_01_persona,{
    foreignKey : "RELA_PERS_03_SEXO",
    as: "persona_sexo"
  })
  pers_01_persona.belongsTo(pers_03_sexo,{
    foreignKey: "RELA_PERS_03_SEXO",
    as: "sexo_persona"
  })

  // PERSONA → ESTADO CIVIL
  pers_04_estado_civil.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_05_ESTADO_CIVIL",
    as: "persona_estado_civil"
  })
  pers_01_persona.belongsTo(pers_04_estado_civil,{
    foreignKey: "RELA_PERS_05_ESTADO_CIVIL",
    as: "estado_civil_persona"
  })

  // LOCALIDAD → PERSONA
  pers_06_localidad.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_06_LOCALIDAD",
    as: "persona_localidad"
  })
  pers_01_persona.belongsTo(pers_06_localidad,{
    foreignKey: "RELA_PERS_06_LOCALIDAD",
    as: "localidad_persona"
  })

  // PROVINCIA → LOCALIDAD
  pers_05_provincia.hasMany(pers_06_localidad, {
    foreignKey: "RELA_PERS_05_PROVINCIA",
    as: "localidades",
  });

  pers_06_localidad.belongsTo(pers_05_provincia, {
    foreignKey: "RELA_PERS_05_PROVINCIA",
    as: "provincia",
  });

  // ── PRODUCTOS ───────────────────────────────────────────────────────────────

  // MARCA → PRODUCTO
  Prod07Marca.hasMany(Prod03Producto, { foreignKey: "RELA_PROD07", as: "productos" });
  Prod03Producto.belongsTo(Prod07Marca, { foreignKey: "RELA_PROD07", as: "marca" });

  // CATEGORIA → PRODUCTO
  Prod01Categoria.hasMany(Prod03Producto, { foreignKey: "RELA_PROD01", as: "productos" });
  Prod03Producto.belongsTo(Prod01Categoria, { foreignKey: "RELA_PROD01", as: "categoria" });

  // GENERO → PRODUCTO
  Prod02Genero.hasMany(Prod03Producto, { foreignKey: "RELA_PROD02", as: "productos" });
  Prod03Producto.belongsTo(Prod02Genero, { foreignKey: "RELA_PROD02", as: "genero" });

  // CATEGORIA → SUBCATEGORIAS (self-referential)
  Prod01Categoria.hasMany(Prod01Categoria, { foreignKey: "RELA_PARENT", as: "subcategorias" });
  Prod01Categoria.belongsTo(Prod01Categoria, { foreignKey: "RELA_PARENT", as: "padre" });

  // GENERO ↔ CATEGORIA (many-to-many via PROD_08_CATEGORIA_GENERO)
  Prod02Genero.belongsToMany(Prod01Categoria, {
    through: Prod08CategoriaGenero,
    foreignKey: "RELA_PROD02",
    otherKey:   "RELA_PROD01",
    as:         "categorias",
  });
  Prod01Categoria.belongsToMany(Prod02Genero, {
    through: Prod08CategoriaGenero,
    foreignKey: "RELA_PROD01",
    otherKey:   "RELA_PROD02",
    as:         "generos",
  });

  // PRODUCTO → STOCK
  Prod03Producto.hasMany(Prod05Stock, { foreignKey: "RELA_PROD03", as: "stocks" });
  Prod05Stock.belongsTo(Prod03Producto, { foreignKey: "RELA_PROD03", as: "producto" });

  // TALLE → STOCK
  Prod04Talle.hasMany(Prod05Stock, { foreignKey: "RELA_PROD04", as: "stocks" });
  Prod05Stock.belongsTo(Prod04Talle, { foreignKey: "RELA_PROD04", as: "talle" });

  // COLOR → STOCK
  Prod06Color.hasMany(Prod05Stock, { foreignKey: "RELA_PROD06", as: "stocks" });
  Prod05Stock.belongsTo(Prod06Color, { foreignKey: "RELA_PROD06", as: "color" });

  // ── CARRITO ─────────────────────────────────────────────────────────────────

  // USUARIO → CARRITO
  Auth02Usuario.hasOne(Carr01Carrito, { foreignKey: "RELA_AUTH02", as: "carrito" });
  Carr01Carrito.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  // CARRITO → ITEMS
  Carr01Carrito.hasMany(Carr02Item, { foreignKey: "RELA_CARR01", as: "items" });
  Carr02Item.belongsTo(Carr01Carrito, { foreignKey: "RELA_CARR01", as: "carrito" });

  // PRODUCTO → CARRITO ITEM
  Prod03Producto.hasMany(Carr02Item, { foreignKey: "RELA_PROD03", as: "carritoItems" });
  Carr02Item.belongsTo(Prod03Producto, { foreignKey: "RELA_PROD03", as: "producto" });

  // TALLE → CARRITO ITEM
  Prod04Talle.hasMany(Carr02Item, { foreignKey: "RELA_PROD04", as: "carritoItems" });
  Carr02Item.belongsTo(Prod04Talle, { foreignKey: "RELA_PROD04", as: "talle" });

  // ── ÓRDENES ─────────────────────────────────────────────────────────────────

  // USUARIO → ORDEN
  Auth02Usuario.hasMany(Ord03Orden, { foreignKey: "RELA_AUTH02", as: "ordenes" });
  Ord03Orden.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  // ESTADO → ORDEN
  Ord01Estado.hasMany(Ord03Orden, { foreignKey: "RELA_ORD01", as: "ordenes" });
  Ord03Orden.belongsTo(Ord01Estado, { foreignKey: "RELA_ORD01", as: "estado" });

  // ORDEN → ITEMS
  Ord03Orden.hasMany(Ord04Item, { foreignKey: "RELA_ORD03", as: "items" });
  Ord04Item.belongsTo(Ord03Orden, { foreignKey: "RELA_ORD03", as: "orden" });

  // PRODUCTO → ORDEN ITEM (nullable: el producto puede eliminarse)
  Prod03Producto.hasMany(Ord04Item, { foreignKey: "RELA_PROD03", as: "ordenItems" });
  Ord04Item.belongsTo(Prod03Producto, { foreignKey: "RELA_PROD03", as: "producto" });

  // ── FACTURACIÓN ─────────────────────────────────────────────────────────────

  // ORDEN → COMPROBANTE
  Ord03Orden.hasOne(Fact03Comprobante, { foreignKey: "RELA_ORD03", as: "comprobante" });
  Fact03Comprobante.belongsTo(Ord03Orden, { foreignKey: "RELA_ORD03", as: "orden" });

  // TIPO COMP → COMPROBANTE
  Fact01TipoComp.hasMany(Fact03Comprobante, { foreignKey: "RELA_FACT01", as: "comprobantes" });
  Fact03Comprobante.belongsTo(Fact01TipoComp, { foreignKey: "RELA_FACT01", as: "tipo" });

  // PUNTO VENTA → COMPROBANTE
  Fact02PuntoVenta.hasMany(Fact03Comprobante, { foreignKey: "RELA_FACT02", as: "comprobantes" });
  Fact03Comprobante.belongsTo(Fact02PuntoVenta, { foreignKey: "RELA_FACT02", as: "puntoVenta" });

  // ── ENVÍOS ──────────────────────────────────────────────────────────────────

  // ORDEN → ENVIO
  Ord03Orden.hasOne(Envio02Envio, { foreignKey: "RELA_ORD03", as: "envio" });
  Envio02Envio.belongsTo(Ord03Orden, { foreignKey: "RELA_ORD03", as: "orden" });

  // OPCION ENVIO → ENVIO
  Envio01Opcion.hasMany(Envio02Envio, { foreignKey: "RELA_ENVIO01", as: "envios" });
  Envio02Envio.belongsTo(Envio01Opcion, { foreignKey: "RELA_ENVIO01", as: "opcion" });

  // ── CLIENTES ────────────────────────────────────────────────────────────────

  // USUARIO → PERFIL
  Auth02Usuario.hasOne(Cli01Perfil, { foreignKey: "RELA_AUTH02", as: "perfil" });
  Cli01Perfil.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  // CONDICION IVA → PERFIL
  Ord02CondicionIva.hasMany(Cli01Perfil, { foreignKey: "RELA_ORD02", as: "perfiles" });
  Cli01Perfil.belongsTo(Ord02CondicionIva, { foreignKey: "RELA_ORD02", as: "condicionIva" });

  // PERFIL → DIRECCIONES
  Cli01Perfil.hasMany(Cli02Direccion, { foreignKey: "RELA_CLI01", as: "direcciones" });
  Cli02Direccion.belongsTo(Cli01Perfil, { foreignKey: "RELA_CLI01", as: "perfil" });
}
