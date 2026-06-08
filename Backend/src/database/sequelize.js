import { Sequelize } from "sequelize";
import { env } from "../configuracion_servidor/env.js";

const dialectOptions = env.DB_SSL
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

const baseOptions = {
  dialect:        "postgres",
  logging:        false,
  dialectOptions,
  define: {
    schema:          env.DB_SCHEMA,
    freezeTableName: true,
    timestamps:      false,
  },
  pool: {
    max:     10,
    min:     0,
    acquire: 30000,
    idle:    10000,
  },
};

// DATABASE_URL → producción (Render, Railway, Supabase, etc.)
// Variables individuales → desarrollo local
export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, baseOptions)
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
      ...baseOptions,
      host: env.DB_HOST,
      port: env.DB_PORT,
    });

export async function conectarDB() {
  try {
    await sequelize.authenticate();

    // Crea el schema si no existe (no requiere acceso a la DB "postgres" del sistema)
    const schema = env.DB_SCHEMA.replace(/"/g, "");
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    await sequelize.query(`SET TIME ZONE '${env.TZ}'`);

    console.log("✅ Conexión exitosa a PostgreSQL");
    console.log(`📦 Conexión: ${env.DATABASE_URL ? "DATABASE_URL" : env.DB_NAME}`);
    console.log(`📂 Schema:   ${schema}`);
    console.log(`🕒 Zona:     ${env.TZ}`);
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:");
    console.error(error.message);
    throw error;
  }
}
