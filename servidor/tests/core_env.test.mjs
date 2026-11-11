import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// env.js lee los nombres nuevos (claros, en español) y, si faltan, los anteriores: un proyecto con
// los nombres viejos en Render no se rompe. Corre en otro proceso porque env.js se evalúa al importar.
const ENV_JS = fileURLToPath(new URL("../src/core/configuracion_servidor/env.js", import.meta.url));
const NUEVAS = ["CLAVE_SESIONES", "URL_FRONTEND_VERCEL", "URL_API_RENDER", "BD_URL_SUPABASE", "BD_ESQUEMA", "DB_SSL",
  "CLOUDINARY_NOMBRE_CUENTA", "CLOUDINARY_CLAVE_API", "CLOUDINARY_SECRETO_API", "GOOGLE_ID_CLIENTE",
  "SUPERADMIN_USUARIO", "SUPERADMIN_CONTRASENA", "NOMBRE_REMITENTE"];
const VIEJAS = ["JWT_SECRET", "VERCEL_FRONTEND_URL", "RENDER_APP_URL", "BD_URL", "DB_SCHEMA", "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "GOOGLE_CLIENT_ID", "SUPERADMIN_PASSWORD"];

/** Lo que queda en `env` con estas variables. Las demás van vacías: así el .env.local de tu PC no se mete. */
function cargar(variables) {
  const vacias = Object.fromEntries([...NUEVAS, ...VIEJAS].map((n) => [n, ""]));
  const codigo = `const m = await import(${JSON.stringify("file:///" + ENV_JS.replaceAll("\\", "/"))}); console.log(JSON.stringify({ ...m.env, FIJO: m.SUPERADMIN_EMAIL_FIJO }));`;
  const salida = execFileSync(process.execPath, ["--input-type=module", "-e", codigo], {
    env: { ...process.env, NODE_ENV: "test", ...vacias, ...variables }, encoding: "utf8",
  });
  return JSON.parse(salida.trim().split("\n").at(-1));
}

test("los nombres nuevos se leen y, si faltan, los anteriores", () => {
  const viejos = cargar({ JWT_SECRET: "vieja", VERCEL_FRONTEND_URL: "https://a.vercel.app", CLOUDINARY_CLOUD_NAME: "cuenta", SUPERADMIN_PASSWORD: "clave" });
  assert.deepEqual([viejos.JWT_SECRET, viejos.VERCEL_FRONTEND_URL, viejos.CLOUDINARY_CLOUD_NAME, viejos.SUPERADMIN_CONTRASENA], ["vieja", "https://a.vercel.app", "cuenta", "clave"]);

  const ambos = cargar({ CLAVE_SESIONES: "nueva", JWT_SECRET: "vieja", URL_FRONTEND_VERCEL: "https://b.vercel.app", VERCEL_FRONTEND_URL: "https://a.vercel.app" });
  assert.equal(ambos.JWT_SECRET, "nueva", "el nombre nuevo gana");
  assert.equal(ambos.VERCEL_FRONTEND_URL, "https://b.vercel.app");
  assert.equal(ambos.FIJO, "nahuel42425@gmail.com", "el email del super admin es fijo en todos los proyectos");
});

test("SSL se activa solo con base remota y el remitente toma el nombre del proyecto", () => {
  assert.equal(cargar({ BD_URL_SUPABASE: "postgresql://u:p@h:5432/postgres" }).DB_SSL, true);
  assert.equal(cargar({ BD_URL: "postgresql://u:p@h:5432/postgres" }).DB_SSL, true, "también con el nombre anterior");
  assert.equal(cargar({}).DB_SSL, false, "en tu PC (sin BD_URL_SUPABASE) no");
  assert.equal(cargar({ BD_URL_SUPABASE: "postgresql://u:p@h:5432/postgres", DB_SSL: "false" }).DB_SSL, false, "DB_SSL lo fuerza a mano");
  assert.ok(cargar({}).NOMBRE_REMITENTE.length > 0);
});
