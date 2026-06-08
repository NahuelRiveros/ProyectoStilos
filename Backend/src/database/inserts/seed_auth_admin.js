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

  const [rolSadm, rolAdm] = await Promise.all([
    Auth01Rol.findOne({ where: { AUTH01_ABREVIATURA: "SADM" } }),
    Auth01Rol.findOne({ where: { AUTH01_ABREVIATURA: "ADM"  } }),
  ]);

  if (!rolSadm || !rolAdm) {
    console.warn("⚠️  No existen los roles SADM/ADM — ejecutar seed_auth_roles primero");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin123*", 10);

  const usuario = await Auth02Usuario.create({
    AUTH02_NOMBRE:     "Super Administrador",
    AUTH02_APELLIDO:   "Sistema",
    AUTH02_EMAIL:      emailAdmin,
    AUTH02_CONTRASENA: passwordHash,
    AUTH02_USERNAME:   "superadmin",
    AUTH02_AVATAR:     null,
    AUTH02_FECHAALTA:  new Date(),
    AUTH02_FECHABAJA:  null,
  });

  // El super admin recibe SADM (dueño del sistema) + ADM (acceso completo al panel)
  await Auth05UsuarioRol.bulkCreate([
    { RELA_AUTH02: usuario.ID_AUTH02, RELA_AUTH01: rolSadm.ID_AUTH01, AUTH05_FECHAALTA: new Date(), AUTH05_FECHABAJA: null },
    { RELA_AUTH02: usuario.ID_AUTH02, RELA_AUTH01: rolAdm.ID_AUTH01,  AUTH05_FECHAALTA: new Date(), AUTH05_FECHABAJA: null },
  ]);

  console.log("✅ Super administrador creado");
  console.log(`   📧  Email:    ${emailAdmin}`);
  console.log("   🔑  Password: Admin123*");
}
