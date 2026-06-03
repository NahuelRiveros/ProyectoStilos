import { Auth01Rol } from "../../models/index.js";

// Roles base del sistema. Solo se crean dos:
//   ADM — el único rol fijo universal (nivel máximo 100)
//   USR — rol por defecto para usuarios nuevos (nivel mínimo 10)
//
// Los roles de "staff" son específicos de cada proyecto.
// Agregalos acá abajo o vía POST /api/catalogos/roles con el nivel
// que corresponda (convención: nivel 50 para roles intermedios).
//
// Ejemplo para un proyecto de gimnasio:
//   { AUTH01_NOMBRE: "Recepcionista", AUTH01_ABREVIATURA: "RCP", AUTH01_NIVEL: 50 }
//   { AUTH01_NOMBRE: "Instructor",    AUTH01_ABREVIATURA: "INST", AUTH01_NIVEL: 50 }

export async function seed_auth_roles() {
  console.log("🌱 Verificando roles base (AUTH_01_ROL)...");

  const roles = [
    { AUTH01_NOMBRE: "Administrador", AUTH01_ABREVIATURA: "ADM", AUTH01_NIVEL: 100 },
    { AUTH01_NOMBRE: "Usuario",       AUTH01_ABREVIATURA: "USR", AUTH01_NIVEL: 10  },
    // ── Roles del proyecto (agregar acá) ──────────────────────────────
    // { AUTH01_NOMBRE: "Staff", AUTH01_ABREVIATURA: "STF", AUTH01_NIVEL: 50 },
  ];

  for (const rol of roles) {
    const [, created] = await Auth01Rol.findOrCreate({
      where:    { AUTH01_ABREVIATURA: rol.AUTH01_ABREVIATURA },
      defaults: { ...rol, AUTH01_FECHAALTA: new Date(), AUTH01_FECHABAJA: null },
    });

    // Actualiza el nivel si el rol ya existía con un valor distinto
    if (!created) {
      await Auth01Rol.update(
        { AUTH01_NIVEL: rol.AUTH01_NIVEL },
        { where: { AUTH01_ABREVIATURA: rol.AUTH01_ABREVIATURA } }
      );
    }
  }

  console.log("✅ Roles base verificados");
}
