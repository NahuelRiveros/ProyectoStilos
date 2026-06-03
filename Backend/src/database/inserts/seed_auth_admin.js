import bcrypt from "bcryptjs";
import { Auth01Rol, Auth02Usuario, Auth05UsuarioRol } from "../../models/index.js";
import { env } from "../../configuracion_servidor/env.js";

export async function seed_auth_admin() {
  console.log("🌱 Verificando usuario administrador (AUTH_02_USUARIO)...");

  const emailAdmin = env.SUPER_ADMIN_EMAIL;

  const yaExiste = await Auth02Usuario.findOne({
    where: { AUTH02_EMAIL: emailAdmin },
  });

  if (yaExiste) {
    console.log("⏭️  Usuario administrador ya existe");
    return;
  }

  const rolAdmin = await Auth01Rol.findOne({
    where: { AUTH01_ABREVIATURA: "ADM" },
  });

  if (!rolAdmin) {
    console.warn("⚠️  No existe el rol ADM — ejecutar seed_auth_roles primero");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin123*", 10);

  const usuario = await Auth02Usuario.create({
    AUTH02_NOMBRE:     "Administrador",
    AUTH02_APELLIDO:   "Sistema",
    AUTH02_EMAIL:      emailAdmin,
    AUTH02_CONTRASENA: passwordHash,
    AUTH02_USERNAME:   "admin",
    AUTH02_AVATAR:     null,
    AUTH02_FECHAALTA:  new Date(),
    AUTH02_FECHABAJA:  null,
  });

  await Auth05UsuarioRol.create({
    RELA_AUTH02:     usuario.ID_AUTH02,
    RELA_AUTH01:     rolAdmin.ID_AUTH01,
    AUTH05_FECHAALTA: new Date(),
    AUTH05_FECHABAJA: null,
  });

  console.log("✅ Usuario administrador creado");
  console.log("   📧  Email:    admin@sistema.com");
  console.log("   🔑  Password: Admin123*");
}
