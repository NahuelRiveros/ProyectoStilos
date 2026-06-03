import { Auth01Rol } from "../../models/index.js";

// Roles base del sistema.
// Para agregar roles en un proyecto específico, extendé este array.
export async function seed_roles() {
  console.log("🌱 Verificando roles base...");

  const roles = [
    { AUTH01_NOMBRE: "Administrador", AUTH01_ABREVIATURA: "ADM" },
    { AUTH01_NOMBRE: "Usuario",       AUTH01_ABREVIATURA: "USR" },
  ];

  for (const rol of roles) {
    await Auth01Rol.findOrCreate({
      where: { AUTH01_ABREVIATURA: rol.AUTH01_ABREVIATURA },
      defaults: {
        ...rol,
        AUTH01_FECHAALTA: new Date(),
        AUTH01_FECHABAJA: null,
      },
    });
  }

  console.log("✅ Roles base verificados");
}
