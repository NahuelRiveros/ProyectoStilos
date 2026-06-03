import { seed_auth_roles } from "./seed_auth_roles.js";
import { seed_auth_admin } from "./seed_auth_admin.js";
import { seed_ecommerce }  from "./seed_ecommerce.js";

export async function run_basic_seeds() {
  console.log("🌱 Iniciando seeds base...");

  await seed_auth_roles(); // siempre primero: Auth01Rol no tiene dependencias
  await seed_auth_admin(); // depende de Auth01Rol
  await seed_ecommerce();  // catálogos del ecommerce

  console.log("✅ Seeds base verificados");
}
