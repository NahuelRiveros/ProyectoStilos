import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "../database/sequelize.js";
import {
  forense_provincia,
  forense_localidad,
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustá esta ruta al archivo JSON real
const JSON_PATH = path.resolve(__dirname, "../data/localidades.json");

function normText(value) {
  if (value === null || value === undefined) return null;
  const txt = String(value).trim();
  return txt ? txt.toLowerCase() : null;
}

function normCode(value) {
  if (value === null || value === undefined) return null;
  const txt = String(value).trim();
  return txt || null;
}

async function cargarJson(filepath) {
  const raw = await fs.readFile(filepath, "utf8");
  return JSON.parse(raw);
}

async function obtenerMapaProvincias() {
  const provincias = await forense_provincia.findAll({
    attributes: ["id_provincia", "provincia_codigo", "provincia_nombre"],
    raw: true,
  });

  const map = new Map();

  for (const p of provincias) {
    if (p.provincia_codigo) {
      map.set(String(p.provincia_codigo).trim(), p.id_provincia);
    }
  }

  return map;
}

function buildRows(localidades, provinciaMap) {
  const rows = [];
  const sinProvincia = [];

  for (const item of localidades) {
    const provinciaCodigo = normCode(item?.provincia?.id);
    const relaProvincia = provinciaMap.get(provinciaCodigo);

    if (!relaProvincia) {
      sinProvincia.push({
        localidad: item?.nombre,
        provincia_codigo: provinciaCodigo,
        provincia_nombre: item?.provincia?.nombre ?? null,
      });
      continue;
    }

    rows.push({
      rela_provincia: relaProvincia,
      forense_localidad_codigo: normCode(item?.id),
      forense_localidad: normText(item?.nombre),
      forense_localidad_categoria: normText(item?.categoria),

      forense_departamento_codigo: normCode(item?.departamento?.id),
      forense_departamento: normText(item?.departamento?.nombre),

      forense_gobierno_local_codigo: normCode(item?.gobierno_local?.id),
      forense_gobierno_local: normText(item?.gobierno_local?.nombre),

      forense_localidad_censal_codigo: normCode(item?.localidad_censal?.id),
      forense_localidad_censal: normText(item?.localidad_censal?.nombre),

      forense_localidad_activa: true,
      forense_localidad_created_at: new Date(),
      forense_localidad_updated_at: new Date(),
    });
  }

  return { rows, sinProvincia };
}

async function importarLocalidades() {
  const data = await cargarJson(JSON_PATH);
  const localidades = Array.isArray(data?.localidades) ? data.localidades : [];

  if (!localidades.length) {
    throw new Error("El JSON no contiene localidades");
  }

  const provinciaMap = await obtenerMapaProvincias();
  const { rows, sinProvincia } = buildRows(localidades, provinciaMap);

  if (!rows.length) {
    throw new Error("No se generaron filas válidas para importar");
  }

  const tx = await sequelize.transaction();

  try {
    await forense_localidad.bulkCreate(rows, {
      transaction: tx,
      updateOnDuplicate: [
        "rela_provincia",
        "forense_localidad",
        "forense_localidad_categoria",
        "forense_departamento_codigo",
        "forense_departamento",
        "forense_gobierno_local_codigo",
        "forense_gobierno_local",
        "forense_localidad_censal_codigo",
        "forense_localidad_censal",
        "forense_localidad_activa",
        "forense_localidad_updated_at",
      ],
    });

    await tx.commit();

    console.log("✅ Importación completada");
    console.log(`Total en JSON: ${localidades.length}`);
    console.log(`Importadas/actualizadas: ${rows.length}`);
    console.log(`Sin provincia asociada: ${sinProvincia.length}`);

    if (sinProvincia.length) {
      console.log("⚠ Primeros casos sin provincia:");
      console.table(sinProvincia.slice(0, 10));
    }
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

importarLocalidades()
  .then(() => {
    console.log("🏁 Proceso finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error importando localidades:", error);
    process.exit(1);
  });