import { seed_auth_roles } from "./seed_auth_roles.js";
import { seed_auth_admin } from "./seed_auth_admin.js";

export async function run_basic_seeds() {
  console.log("🌱 Iniciando seeds base...");

  await seed_auth_roles(); // siempre primero: Auth01Rol no tiene dependencias
  await seed_auth_admin(); // depende de Auth01Rol

  console.log("✅ Seeds base verificados");
}
