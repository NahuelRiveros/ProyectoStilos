import {
  Auth01Rol,
  Auth02Usuario,
  Auth03ResetToken,
  Auth04LogSesion,
  pers_01_persona,
  pers_02_tipo_documento,
  pers_03_sexo,
  pers_04_estado_civil,
  pers_05_provincia,
  pers_06_localidad,
  Prod01Categoria,
  Prod02Genero,
  Prod03Producto,
  Prod04Talle,
  Prod05Stock,
  Prod06Color,
  Prod07Marca,
  Prod08CategoriaGenero,
  Carr01Carrito,
  Carr02Item,
  Ord01Estado,
  Ord02CondicionIva,
  Ord03Orden,
  Ord04Item,
  Fact01TipoComp,
  Fact02PuntoVenta,
  Fact03Comprobante,
  Envio01Opcion,
  Envio02Envio,
  Cli01Perfil,
  Cli02Direccion,
  Home01Config,
} from "../models/index.js";

import { run_basic_seeds } from "./inserts/index.js";
import { seed_localidades_geo } from "./inserts/insert_pers_05_localidades.js";
import { seed_provincias_geo } from "./inserts/insert_pers_06_provincia.js";

export async function bootstrap_database() {
  console.log("🛠️  Iniciando bootstrap...");
  await sincronizar_modelos();
  await run_basic_seeds();
  await seed_provincias_geo();
  await seed_localidades_geo();

  console.log("✅ Bootstrap finalizado correctamente");
}

async function sincronizar_modelos() {
  // Orden: primero tablas sin FK, luego las dependientes
  const modelos_en_orden = [
    // ── Auth ────────────────────────────────────
    Auth01Rol,          // sin dependencias
    Auth02Usuario,      // → Auth01Rol
    Auth03ResetToken,   // → Auth02Usuario
    Auth04LogSesion,    // → Auth02Usuario
    // ── Personas ────────────────────────────────
    pers_03_sexo,
    pers_02_tipo_documento,
    pers_04_estado_civil,
    pers_05_provincia,
    pers_06_localidad,
    pers_01_persona,
    // ── Productos ───────────────────────────────
    Prod01Categoria,        // sin dependencias (self-ref RELA_PARENT deferido)
    Prod02Genero,           // sin dependencias
    Prod06Color,            // sin dependencias
    Prod07Marca,            // sin dependencias
    Prod08CategoriaGenero,  // → Prod01Categoria, Prod02Genero
    Prod03Producto,         // → Prod01Categoria, Prod02Genero, Prod07Marca
    Prod04Talle,            // sin dependencias
    Prod05Stock,            // → Prod03Producto, Prod04Talle, Prod06Color
    // ── Carrito ─────────────────────────────────
    Carr01Carrito,      // → Auth02Usuario
    Carr02Item,         // → Carr01Carrito, Prod03Producto, Prod04Talle
    // ── Órdenes ─────────────────────────────────
    Ord01Estado,        // sin dependencias
    Ord02CondicionIva,  // sin dependencias
    Ord03Orden,         // → Auth02Usuario, Ord01Estado
    Ord04Item,          // → Ord03Orden, Prod03Producto
    // ── Facturación ─────────────────────────────
    Fact01TipoComp,     // sin dependencias
    Fact02PuntoVenta,   // sin dependencias
    Fact03Comprobante,  // → Ord03Orden, Fact01TipoComp, Fact02PuntoVenta
    // ── Envíos ──────────────────────────────────
    Envio01Opcion,      // sin dependencias
    Envio02Envio,       // → Ord03Orden, Envio01Opcion
    // ── Clientes ────────────────────────────────
    Cli01Perfil,        // → Auth02Usuario, Ord02CondicionIva
    Cli02Direccion,     // → Cli01Perfil
    // ── Home ────────────────────────────────────
    Home01Config,       // sin dependencias (fila única JSON)
  ];

  for (const model of modelos_en_orden) {
    try {
      await model.sync({ alter: true });
      console.log(`✅ Tabla sincronizada: ${model.tableName}`);
    } catch (error) {
      console.error(`❌ Error en tabla ${model.tableName}:`, error.message);
      throw error;
    }
  }
}
