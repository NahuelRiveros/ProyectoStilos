import { Auth01Rol } from "../../models/index.js";

export async function seed_auth_roles() {
  console.log("🌱 Verificando roles base (AUTH_01_ROL)...");

  const roles = [
    { AUTH01_NOMBRE: "Administrador", AUTH01_ABREVIATURA: "ADM" },
    { AUTH01_NOMBRE: "Moderador",     AUTH01_ABREVIATURA: "MOD" },
    { AUTH01_NOMBRE: "Usuario",       AUTH01_ABREVIATURA: "USR" },
  ];

  for (const rol of roles) {
    await Auth01Rol.findOrCreate({
      where:    { AUTH01_ABREVIATURA: rol.AUTH01_ABREVIATURA },
      defaults: { ...rol, AUTH01_FECHAALTA: new Date(), AUTH01_FECHABAJA: null },
    });
  }

  console.log("✅ Roles base verificados");
}
