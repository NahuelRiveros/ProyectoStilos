import {
  Auth01Rol,
  Auth02Usuario,
  Auth03ResetToken,
  Auth04LogSesion,
  Auth05UsuarioRol,
  Auth06Suscripcion,
} from "../models/index.js";
import { pers_01_persona } from "../models/personas/pers_01_persona.js";
import { pers_02_tipo_documento } from "../models/personas/pers_02_tipo_documento.js";
import { pers_03_sexo } from "../models/Personas/pers_03_sexo.js";
import { pers_04_estado_civil } from "../models/Personas/pers_04_estado_civil.js";
import { pers_05_provincia } from "../models/personas/pers_05_provincia.js";
import { pers_06_localidad } from "../models/personas/pers_06_localidad.js";

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
  // Orden: primero las tablas sin FK, luego las dependientes
  const modelos_en_orden = [
    Auth01Rol,        // sin dependencias
    Auth02Usuario,    // depende de Auth01Rol (col RELA_AUTH01 deprecada pero se mantiene)
    Auth03ResetToken, // depende de Auth02Usuario
    Auth04LogSesion,  // depende de Auth02Usuario
    Auth05UsuarioRol,   // junction N:N: depende de Auth01Rol y Auth02Usuario
    Auth06Suscripcion,  // tabla independiente — estado de suscripción del sistema
    ////////
    pers_03_sexo,
    pers_02_tipo_documento,
    pers_04_estado_civil,
    pers_05_provincia,
    pers_06_localidad,
    pers_01_persona
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
