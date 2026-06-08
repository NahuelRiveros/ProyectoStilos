import { Auth01Rol } from "./auth_01_rol.js";
import { Auth02Usuario } from "./auth_02_usuario.js";
import { Auth03ResetToken } from "./auth_03_reset_token.js";
import { Auth04LogSesion } from "./auth_04_log_sesion.js";
import { Auth05UsuarioRol } from "./auth_05_usuario_rol.js";
import { Auth06Suscripcion } from "./auth_06_suscripcion.js";
import { Auth07SuscripcionLog } from "./auth_07_suscripcion_log.js";

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
import { Prod08CategoriaGenero } from "./productos/prod_08_categoria_genero.js";

import { Carr01Carrito } from "./carrito/carr_01_carrito.js";
import { Carr02Item } from "./carrito/carr_02_item.js";

import { Envio01Opcion } from "./envios/envio_01_opcion.js";
import { Envio02Envio } from "./envios/envio_02_envio.js";

import { Fact01TipoComp } from "./facturacion/fact_01_tipo_comp.js";
import { Fact02PuntoVenta } from "./facturacion/fact_02_punto_venta.js";
import { Fact03Comprobante } from "./facturacion/fact_03_comprobante.js";

import { Cli01Perfil } from "./clientes/cli_01_perfil.js";
import { Cli02Direccion } from "./clientes/cli_02_direccion.js";

import { Ord01Estado } from "./ordenes/ord_01_estado.js";
import { Ord02CondicionIva } from "./ordenes/ord_02_condicion_iva.js";
import { Ord03Orden } from "./ordenes/ord_03_orden.js";
import { Ord04Item } from "./ordenes/ord_04_item.js";

import { Home01Config } from "./home/home_01_config.js";

import { setupAssociations } from "./associations.js";

setupAssociations();

export {
  // Auth
  Auth01Rol,
  Auth02Usuario,
  Auth03ResetToken,
  Auth04LogSesion,
  Auth05UsuarioRol,
  Auth06Suscripcion,
  Auth07SuscripcionLog,
  // Personas
  pers_01_persona,
  pers_02_tipo_documento,
  pers_03_sexo,
  pers_04_estado_civil,
  pers_05_provincia,
  pers_06_localidad,
  // Productos
  Prod01Categoria,
  Prod02Genero,
  Prod03Producto,
  Prod04Talle,
  Prod05Stock,
  Prod06Color,
  Prod07Marca,
  Prod08CategoriaGenero,
  // Carrito
  Carr01Carrito,
  Carr02Item,
  // Envios
  Envio01Opcion,
  Envio02Envio,
  // Facturación
  Fact01TipoComp,
  Fact02PuntoVenta,
  Fact03Comprobante,
  // Clientes
  Cli01Perfil,
  Cli02Direccion,
  // Ordenes
  Ord01Estado,
  Ord02CondicionIva,
  Ord03Orden,
  Ord04Item,
  // Home
  Home01Config,
};
