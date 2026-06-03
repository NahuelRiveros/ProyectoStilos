// Lee las variables del archivo .env y las expone de forma tipada en toda la app.
// Para cambiar cualquier valor, editá el .env — no toques este archivo.
import "dotenv/config";

// Convierte un string a booleano de forma segura.
// Útil para variables como DB_SSL o SMTP_SECURE que vienen como "true"/"false" en el .env.
function getBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).toLowerCase() === "true";
}

// Convierte un string a número de forma segura.
// Si el valor no es un número válido, devuelve el valor por defecto.
function getNumber(value, defaultValue) {
  const number = Number(value);
  return Number.isFinite(number) ? number : defaultValue;
}

export const env = {
  // ─── ENTORNO ─────────────────────────────────────────────────────────────
  // "development" | "production" | "test"
  // En production se desactivan logs verbosos y se endurecen las políticas de seguridad.
  NODE_ENV: process.env.NODE_ENV || "development",

  // Puerto en el que escucha el servidor Express.
  // Cambiarlo si 3001 está ocupado o si el hosting lo requiere.
  PORT: getNumber(process.env.PORT, 3001),

  // ─── IDENTIFICACIÓN DE LA APP ─────────────────────────────────────────────
  // Usados en emails, logs y respuestas de la API para identificar el sistema.
  APP_NAME: process.env.APP_NAME || "GYMNASIO",
  APP_FULL_NAME: process.env.APP_FULL_NAME || "Sistema Gymnasio",

  // ─── BASE DE DATOS (PostgreSQL) ───────────────────────────────────────────
  // DATABASE_URL: cadena de conexión completa (alternativa a las variables individuales).
  // Útil en servicios cloud como Railway, Render o Supabase que proveen una sola URL.
  // Si está vacía, el sistema usa las variables DB_* individuales de abajo.
  // Ejemplo: postgresql://usuario:contraseña@host:5432/nombre_db
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Servidor donde corre PostgreSQL. En desarrollo suele ser "localhost".
  DB_HOST: process.env.DB_HOST || "localhost",

  // Puerto de PostgreSQL. El default estándar es 5432.
  DB_PORT: getNumber(process.env.DB_PORT, 5432),

  // ★ NOMBRE DE LA BASE DE DATOS ★
  // Creá esta base en PostgreSQL antes de correr el servidor.
  // Comando: CREATE DATABASE "NAME";
  DB_NAME: process.env.DB_NAME || "Stylos-ecomerce",

  // ★ ESQUEMA DE POSTGRESQL ★
  // Todos los modelos/tablas se crearán dentro de este esquema.
  // Crealo con: CREATE SCHEMA IF NOT EXISTS "Dynamic";
  // Cambiarlo aquí y en .env si querés usar otro nombre (ej: "public", "gym", etc.).
  DB_SCHEMA: process.env.DB_SCHEMA || "Stilos",

  // Usuario de PostgreSQL con permisos sobre DB_NAME y DB_SCHEMA.
  DB_USER: process.env.DB_USER || "postgres",

  // Contraseña del usuario. Nunca subir el .env real a git.
  DB_PASS: process.env.DB_PASS || "",

  // Activar SSL para la conexión. Necesario en la mayoría de los hostings cloud.
  // En desarrollo local dejar en false.
  DB_SSL: getBoolean(process.env.DB_SSL, false),

  // ─── AUTENTICACIÓN JWT ────────────────────────────────────────────────────
  // Clave secreta para firmar los tokens JWT. DEBE ser larga y aleatoria en producción.
  // Generá una con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  JWT_SECRET: process.env.JWT_SECRET || "CAMBIAR_ESTE_SECRETO",

  // Tiempo de vida del token de sesión. Ejemplos: "8h", "1d", "7d".
  // Menor tiempo = más seguro, pero el usuario debe loguear más seguido.
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",

  // ─── RESET DE CONTRASEÑA ─────────────────────────────────────────────────
  // Minutos que dura válido el link/token de recuperación de contraseña.
  RESET_TOKEN_EXPIRES_MINUTES: getNumber(
    process.env.RESET_TOKEN_EXPIRES_MINUTES,
    30
  ),

  // ─── CORREO (SMTP) ────────────────────────────────────────────────────────
  // Configuración del servidor de correo saliente.
  // Con Gmail: host=smtp.gmail.com, port=587, secure=false, y usar una App Password.
  // Ver: https://myaccount.google.com/apppasswords
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: getNumber(process.env.SMTP_PORT, 587),

  // false = STARTTLS (puerto 587) | true = SSL directo (puerto 465)
  SMTP_SECURE: getBoolean(process.env.SMTP_SECURE, false),

  // Cuenta de Gmail (o del proveedor) que envía los correos.
  SMTP_USER: process.env.SMTP_USER || "",

  // App Password de Gmail (no es la contraseña normal de la cuenta).
  SMTP_PASS: process.env.SMTP_PASS || "",

  // Nombre y dirección que verá el destinatario en el campo "De:".
  // Formato: "Nombre Visible <correo@dominio.com>"
  SMTP_FROM: process.env.SMTP_FROM || "",

  // ─── FRONTEND / CORS ──────────────────────────────────────────────────────
  // URL del frontend. Se usa para armar links en emails (ej: link de reset de password).
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Origen permitido por CORS. Debe coincidir exactamente con la URL del frontend.
  // En producción cambiar a la URL real del frontend.
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // ─── ZONA HORARIA ─────────────────────────────────────────────────────────
  // Afecta logs, timestamps y cálculos de fechas en Node.
  // Ver zonas válidas en: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  TZ: process.env.TZ || "America/Argentina/Cordoba",

  // ─── CLOUDINARY (storage de imágenes) ────────────────────────────────────
  // Obtener en: https://cloudinary.com → Dashboard y Settings > API Keys
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY:    process.env.CLOUDINARY_API_KEY    || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // ─── MERCADOPAGO ──────────────────────────────────────────────────────────
  // Access token de la cuenta MP (producción o sandbox).
  // Producción:  APP_USR-...
  // Sandbox:     TEST-...
  // Obtenerlo en: https://www.mercadopago.com.ar/developers/panel/app
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || "",

  // URL pública del backend — la usa MP para enviar notificaciones de pago.
  // En desarrollo usar ngrok o similar para exponer localhost.
  // Ejemplo: "https://mi-api.ngrok.io"
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
};