// ==========================================================
// NIVELES DE PRIVILEGIO (convención del sistema)
//
// Cada rol en la DB tiene AUTH01_NIVEL (0-100).
// requireNivel(N) → pasa cualquier rol con nivel >= N.
// Esto hace que STF1, STF2, STF3... todos con nivel 50
// pasen requireNivel(50) sin listarse individualmente.
//
// Convención estándar:
//   100 → Administrador total
//    50 → Staff (nivel intermedio — cada proyecto define sus roles)
//    10 → Usuario básico
//     0 → Sin rol (bloqueado)
// ==========================================================

export const NIVELES = {
  ADMIN: 100,
  STAFF: 50,
  USR:   10,
};

// ==========================================================
// ROLES FIJOS DEL SISTEMA (abreviaturas)
//
// Solo ADM y USR son universales. Los roles de "staff" los
// define cada proyecto en seed_auth_roles.js o vía API.
//
// Para agregar un rol del proyecto:
//   export const ROLES = { ..., CAJA: "CAJ", RECEP: "RCP" };
// ==========================================================

export const ROLES = {
  ADMIN: "ADM",
  USR:   "USR",
};

// ==========================================================
// MATRIZ DE PERMISOS
//
// Cada entrada acepta:
//   { nivel: N }              → requireNivel internamente
//   { roles: ["ADM", "CAJ"] } → requireRole internamente
//   { nivel: N, roles: [...] } → pasa si cumple CUALQUIERA
//
// Uso en rutas:
//   router.get("/ruta", requireAuth, requireAccess(ACCESS.X), handler)
//
// CÓMO AGREGAR UN MÓDULO NUEVO:
//   1. Crear el rol en DB si hace falta (POST /api/catalogos/roles con AUTH01_NIVEL)
//   2. Declarar la abreviatura en ROLES si lo usarás con exactitud
//   3. Agregar las claves en ACCESS usando { nivel } o { roles }
//   4. Usar requireAccess(ACCESS.TU_MODULO_ACCION) en la ruta
//
// EJEMPLOS para un proyecto con "Recepcionista (RCP)" y "Cajero (CAJ)":
//   RESERVAS_GET:    { nivel: NIVELES.STAFF }       // cualquier staff
//   RESERVAS_CREATE: { roles: [ROLES.ADMIN, "RCP"] } // solo admin o recepcionista
//   CAJA_GET:        { roles: [ROLES.ADMIN, "CAJ"] } // solo admin o cajero
//   REPORTES:        { nivel: NIVELES.ADMIN }        // solo admin (nivel 100)
// ==========================================================

export const ACCESS = {
  // ─── USUARIOS ──────────────────────────────────────────
  USUARIOS_GET:    { roles: [ROLES.ADMIN] },
  USUARIOS_CREATE: { roles: [ROLES.ADMIN] },
  USUARIOS_UPDATE: { roles: [ROLES.ADMIN] },
  USUARIOS_DELETE: { roles: [ROLES.ADMIN] },
  USUARIOS_ROLES:  { roles: [ROLES.ADMIN] },

  // ─── ROLES (catálogo) ──────────────────────────────────
  // Solo ADM gestiona roles — lectura y escritura.
  ROLES_GET:    { roles: [ROLES.ADMIN] },
  ROLES_CREATE: { roles: [ROLES.ADMIN] },
  ROLES_UPDATE: { roles: [ROLES.ADMIN] },
  ROLES_DELETE: { roles: [ROLES.ADMIN] },

  // ─── CATÁLOGOS GENÉRICOS ───────────────────────────────
  CATALOGOS_GET:    { nivel: NIVELES.USR   }, // cualquier usuario autenticado
  CATALOGOS_CREATE: { nivel: NIVELES.STAFF }, // cualquier staff (nivel >= 50)
  CATALOGOS_UPDATE: { nivel: NIVELES.STAFF },
  CATALOGOS_DELETE: { roles: [ROLES.ADMIN] }, // solo admin exacto
};
