import { Sequelize } from "sequelize";
import { env } from "../configuracion_servidor/env.js";

const dialectOptions = env.DB_SSL
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

const baseOptions = {
  dialect: "postgres",
  logging: false,
  dialectOptions,
  define: {
    // Prefija todas las tablas con el schema: "public"."TABLA"
    // Evita el error "no se ha seleccionado ningún esquema" en PostgreSQL
    schema: env.DB_SCHEMA,
    freezeTableName: true,
    timestamps: false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, baseOptions)
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
      ...baseOptions,
      host: env.DB_HOST,
      port: env.DB_PORT,
    });

// ----------------------------------------------------------
// Crea la DB si no existe (conecta a "postgres" temporalmente)
// ----------------------------------------------------------
async function crearDBSiNoExiste() {
  let dbName, tempSequelize;

  if (env.DATABASE_URL) {
    const url  = new URL(env.DATABASE_URL);
    dbName     = decodeURIComponent(url.pathname.slice(1));
    const tempUrl = env.DATABASE_URL.replace(url.pathname, "/postgres");
    tempSequelize = new Sequelize(tempUrl, { ...baseOptions, logging: false });
  } else {
    dbName = env.DB_NAME;
    tempSequelize = new Sequelize("postgres", env.DB_USER, env.DB_PASS, {
      ...baseOptions,
      host: env.DB_HOST,
      port: env.DB_PORT,
      logging: false,
    });
  }

  try {
    const [rows] = await tempSequelize.query(
      "SELECT 1 FROM pg_database WHERE datname = :dbName",
      { replacements: { dbName } }
    );

    if (rows.length === 0) {
      console.log(`🗄️  Base de datos "${dbName}" no existe. Creando...`);
      const safeName = dbName.replace(/"/g, "");
      await tempSequelize.query(`CREATE DATABASE "${safeName}"`);
      console.log(`✅ Base de datos "${dbName}" creada`);
    }
  } finally {
    await tempSequelize.close();
  }
}

// ----------------------------------------------------------
// Crea el schema si no existe (ej: "public" o uno personalizado)
// Se llama luego de autenticar, ya sobre la DB correcta
// ----------------------------------------------------------
async function crearSchemaSiNoExiste() {
  const schema = env.DB_SCHEMA.replace(/"/g, "");
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  console.log(`📂 Schema: "${schema}"`);
}

// ----------------------------------------------------------
// Exportado — llamado en server.js antes del bootstrap
// ----------------------------------------------------------
export async function conectarDB() {
  try {
    await crearDBSiNoExiste();

    await sequelize.authenticate();

    // Garantiza que el schema exista antes de cualquier sync
    await crearSchemaSiNoExiste();

    await sequelize.query(`SET TIME ZONE '${env.TZ}'`);

    console.log("✅ Conexión exitosa a PostgreSQL");
    console.log(`📦 Base de datos: ${env.DATABASE_URL ? "DATABASE_URL" : env.DB_NAME}`);
    console.log(`🕒 Zona horaria:  ${env.TZ}`);
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:");
    console.error(error.message);
    throw error;
  }
}
