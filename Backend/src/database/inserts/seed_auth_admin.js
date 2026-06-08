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
    // Migración: asegurar que el super admin tenga SADM y no ADM
    const rolSadmMig = await Auth01Rol.findOne({ where: { AUTH01_ABREVIATURA: "SADM" } });
    if (rolSadmMig) {
      const tieneSadm = await Auth05UsuarioRol.findOne({
        where: { RELA_AUTH02: yaExiste.ID_AUTH02, RELA_AUTH01: rolSadmMig.ID_AUTH01, AUTH05_FECHABAJA: null },
      });
      if (!tieneSadm) {
        // Asignar SADM
        const existente = await Auth05UsuarioRol.findOne({
          where: { RELA_AUTH02: yaExiste.ID_AUTH02, RELA_AUTH01: rolSadmMig.ID_AUTH01 },
        });
        if (existente) {
          await existente.update({ AUTH05_FECHABAJA: null });
        } else {
          await Auth05UsuarioRol.create({
            RELA_AUTH02: yaExiste.ID_AUTH02, RELA_AUTH01: rolSadmMig.ID_AUTH01,
            AUTH05_FECHAALTA: new Date(), AUTH05_FECHABAJA: null,
          });
        }
        // Revocar ADM si lo tiene
        const rolAdmMig = await Auth01Rol.findOne({ where: { AUTH01_ABREVIATURA: "ADM" } });
        if (rolAdmMig) {
          await Auth05UsuarioRol.update(
            { AUTH05_FECHABAJA: new Date() },
            { where: { RELA_AUTH02: yaExiste.ID_AUTH02, RELA_AUTH01: rolAdmMig.ID_AUTH01, AUTH05_FECHABAJA: null } }
          );
        }
        console.log("✅ Super admin migrado a rol SADM");
      } else {
        console.log("⏭️  Usuario administrador ya existe con rol SADM");
      }
    }
    return;
  }

  const rolSadm = await Auth01Rol.findOne({ where: { AUTH01_ABREVIATURA: "SADM" } });

  if (!rolSadm) {
    console.warn("⚠️  No existe el rol SADM — ejecutar seed_auth_roles primero");
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

  // SADM (nivel 200) pasa automáticamente todos los checks nivel >= 100,
  // por lo que hereda permisos de ADM sin necesitar el rol ADM explícitamente.
  await Auth05UsuarioRol.create({
    RELA_AUTH02:      usuario.ID_AUTH02,
    RELA_AUTH01:      rolSadm.ID_AUTH01,
    AUTH05_FECHAALTA: new Date(),
    AUTH05_FECHABAJA: null,
  });

  console.log("✅ Super administrador creado");
  console.log(`   📧  Email:    ${emailAdmin}`);
  console.log("   🔑  Password: Admin123*");
}
