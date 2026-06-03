import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../sequelize.js";
import { pers_05_provincia } from "../../models/personas/pers_05_provincia.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seed_provincias_geo() {
  const transaction = await sequelize.transaction();

  try {
    const filePath = path.resolve(__dirname, "../json/provincias.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);

    const provincias = Array.isArray(json?.provincias) ? json.provincias : [];

    if (!provincias.length) {
      console.log("⚠️ No se encontraron provincias válidas en provincias.json");
      await transaction.rollback();
      return;
    }

    for (const item of provincias) {
      const PERS_05_CODIGO = String(item.id ?? "").trim() || null;
      const PERS_05_NOMBRE = String(item.nombre ?? "").trim();

      if (!PERS_05_NOMBRE) continue;

      const existente =
        (PERS_05_CODIGO &&
          (await pers_05_provincia.findOne({
            where: { PERS_05_CODIGO },
            transaction,
          }))) ||
        (await pers_05_provincia.findOne({
          where: { PERS_05_NOMBRE },
          transaction,
        }));

      if (existente) {
        //console.log(`⏭ Ya existe, se omite: ${PERS_05_NOMBRE}`);
        continue;
      }

      await pers_05_provincia.create(
        {
          PERS_05_CODIGO,
          PERS_05_NOMBRE,
          PERS_05_NOMBRE_COMPLETO: String(item.nombre_completo ?? "").trim() || null,
          PERS_05_ISO: String(item.iso_id ?? "").trim() || null,
          PERS_05_CATEGORIA: String(item.categoria ?? "").trim() || null,
          PERS_05_FUENTE: String(item.fuente ?? "").trim() || null,
          PERS_05_ACTIVA: true,
        },
        { transaction }
      );

      console.log(`➕ Provincia insertada: ${PERS_05_NOMBRE}`);
    }

    await transaction.commit();
    console.log("✅ Provincias GeoRef verificadas (solo inserción)");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error al cargar provincias GeoRef:", error.message);
    throw error;
  }
}
