import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "../sequelize.js";
import { pers_06_localidad } from "../../models/personas/pers_06_localidad.js";
import { pers_05_provincia } from "../../models/personas/pers_05_provincia.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seed_localidades_geo() {
  const transaction = await sequelize.transaction();

  try {
    const filePath = path.resolve(__dirname, "../json/localidades.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);

    const localidades = Array.isArray(json?.localidades)
      ? json.localidades
      : [];

    if (!localidades.length) {
      console.log("⚠️ No hay localidades en el JSON");
      await transaction.rollback();
      return;
    }

    // 🔥 1. Traer provincias una sola vez
    const provincias = await pers_05_provincia.findAll({ transaction });

    const mapProvincias = {};
    for (const p of provincias) {
      mapProvincias[p.PERS_05_CODIGO] = p.ID_PERS_05;
    }

    // 🔥 2. Traer códigos existentes (para no duplicar)
    const existentes = await pers_06_localidad.findAll({
      attributes: ["PERS_06_LOCALIDAD_CODIGO"],
      transaction,
    });

    const existentesSet = new Set(
      existentes.map((e) => e.PERS_06_LOCALIDAD_CODIGO)
    );

    // 🔥 3. Preparar inserts
    const inserts = [];

    for (const item of localidades) {
      const codigo = String(item.id ?? "").trim();
      if (!codigo) continue;

      // 👉 si ya existe, lo salteamos
      if (existentesSet.has(codigo)) continue;

      const provincia_codigo = item?.provincia?.id;
      const RELA_PERS_05_PROVINCIA = mapProvincias[provincia_codigo];

      if (!RELA_PERS_05_PROVINCIA) {
        console.log(
          `⚠️ Provincia no encontrada para localidad: ${item.nombre}`
        );
        continue;
      }

      inserts.push({
        RELA_PERS_05_PROVINCIA,

        PERS_06_LOCALIDAD_CODIGO: codigo,
        PERS_06_LOCALIDAD: item.nombre,

        PERS_06_LOCALIDAD_CATEGORIA: item.categoria || null,

        PERS_06_DEPTO_CODIGO: item?.departamento?.id || null,
        PERS_06_LOCALIDAD_DEPARTAMENTO: item?.departamento?.nombre || null,

        PERS_06_LOCALIDAD_GOB_LOCAL_CODIGO: item?.gobierno_local?.id || null,
        PERS_06_LOCALIDAD_GOB_LOCAL: item?.gobierno_local?.nombre || null,

        PERS_06_CENSAL_CODIGO: item?.localidad_censal?.id || null,
        PERS_06_LOCALIDAD_CENSAL: item?.localidad_censal?.nombre || null,

        PERS_06_LOCALIDAD_ACTIVA: true,
      });
    }

    // 🔥 4. Insert masivo
    if (inserts.length > 0) {
      await pers_06_localidad.bulkCreate(inserts, {
        transaction,
        ignoreDuplicates: true,
      });

      console.log(`➕ Localidades insertadas: ${inserts.length}`);
    } else {
      console.log("ℹ️ No hay nuevas localidades para insertar");
    }

    await transaction.commit();
    console.log("✅ Localidades GeoRef cargadas correctamente");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error en seed_localidades_geo:", error.message);
    throw error;
  }
}
