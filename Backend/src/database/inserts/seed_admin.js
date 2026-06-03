import bcrypt from "bcryptjs";
import { Auth01Rol, Auth02Usuario } from "../../models/index.js";

export async function seed_admin() {
  console.log("🌱 Verificando usuario administrador...");

  const rolAdmin = await Auth01Rol.findOne({
    where: { AUTH01_ABREVIATURA: "ADM" },
  });

  if (!rolAdmin) {
    console.warn("⚠️ No existe el rol ADM");
    return;
  }

  const existe = await Auth02Usuario.findOne({
    where: { AUTH02_EMAIL: "admin@sistema.com" },
  });

  if (existe) {
    console.log("⏭️ Usuario administrador ya existe");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin123*", 10);

  await Auth02Usuario.create({
    RELA_AUTH01:      rolAdmin.ID_AUTH01,
    AUTH02_NOMBRE:    "Administrador",
    AUTH02_APELLIDO:  "Sistema",
    AUTH02_EMAIL:     "admin@sistema.com",
    AUTH02_CONTRASENA: passwordHash,
    AUTH02_USERNAME:  "admin",
    AUTH02_AVATAR:    null,
    AUTH02_FECHAALTA: new Date(),
    AUTH02_FECHABAJA: null,
  });

  console.log("✅ Usuario administrador creado");
  console.log("📧 Email:    admin@sistema.com");
  console.log("🔑 Password: Admin123*");
}
