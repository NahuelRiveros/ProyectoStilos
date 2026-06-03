import { Auth01Rol } from "./auth_01_rol.js";
import { Auth02Usuario } from "./auth_02_usuario.js";
import { Auth03ResetToken } from "./auth_03_reset_token.js";
import { Auth04LogSesion } from "./auth_04_log_sesion.js";
import { Auth05UsuarioRol } from "./auth_05_usuario_rol.js";
////////////////////////////////////////////////////////
import { pers_01_persona } from "./personas/pers_01_persona.js";
import { pers_02_tipo_documento } from "./personas/pers_02_tipo_documento.js";
import { pers_03_sexo } from "./Personas/pers_03_sexo.js"; 
import { pers_04_estado_civil } from "./personas/pers_04_estado_civil.js";
import { pers_05_provincia } from "./personas/pers_05_provincia.js";
import { pers_06_localidad } from "./personas/pers_06_localidad.js";

export function setupAssociations() {
  // USUARIO ↔ ROL (N:N via AUTH_05_USUARIO_ROL)
  // Filtrá solo asignaciones activas con: through: { where: { AUTH05_FECHABAJA: null } }
  Auth02Usuario.belongsToMany(Auth01Rol, {
    through: Auth05UsuarioRol,
    foreignKey: "RELA_AUTH02",
    otherKey:   "RELA_AUTH01",
    as: "roles",
  });
  Auth01Rol.belongsToMany(Auth02Usuario, {
    through: Auth05UsuarioRol,
    foreignKey: "RELA_AUTH01",
    otherKey:   "RELA_AUTH02",
    as: "usuarios",
  });
  Auth05UsuarioRol.belongsTo(Auth01Rol,    { foreignKey: "RELA_AUTH01", as: "rol" });
  Auth05UsuarioRol.belongsTo(Auth02Usuario, { foreignKey: "RELA_AUTH02", as: "usuario" });

  // USUARIO → RESET TOKENS
  Auth02Usuario.hasMany(Auth03ResetToken, {
    foreignKey: "RELA_AUTH02",
    as: "resetTokens",
  });
  Auth03ResetToken.belongsTo(Auth02Usuario, {
    foreignKey: "RELA_AUTH02",
    as: "usuario",
  });

  // USUARIO → LOGS DE SESIÓN
  Auth02Usuario.hasMany(Auth04LogSesion, {
    foreignKey: "RELA_AUTH02",
    as: "logs",
  });
  Auth04LogSesion.belongsTo(Auth02Usuario, {
    foreignKey: "RELA_AUTH02",
    as: "usuario",
  });

  // PERSONA → TIPO DOCUMENTO
  pers_02_tipo_documento.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO",
    as: "persona_tipo_documento"
  })

  pers_01_persona.belongsTo(pers_02_tipo_documento,{
    foreignKey: "RELA_PERS_02_TIPO_DOCUMENTO",
    as: "tipo_documento_persona"
  })

  // PERSONA → SEXO
  pers_03_sexo.hasMany(pers_01_persona,{
    foreignKey : "RELA_PERS_03_SEXO",
    as: "persona_sexo"
  })
  pers_01_persona.belongsTo(pers_03_sexo,{
    foreignKey: "RELA_PERS_03_SEXO",
    as: "sexo_persona"
  })

  // PERSONA → ESTADO CIVIL
  pers_04_estado_civil.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_05_ESTADO_CIVIL",
    as: "persona_estado_civil"
  })
  pers_01_persona.belongsTo(pers_04_estado_civil,{
    foreignKey: "RELA_PERS_05_ESTADO_CIVIL",
    as: "estado_civil_persona"
  })

  // LOCALIDAD → PERSONA
  pers_06_localidad.hasMany(pers_01_persona,{
    foreignKey: "RELA_PERS_06_LOCALIDAD",
    as: "persona_localidad"
  })
  pers_01_persona.belongsTo(pers_06_localidad,{
    foreignKey: "RELA_PERS_06_LOCALIDAD",
    as: "localidad_persona"
  })

  // PROVINCIA → LOCALIDAD
  pers_05_provincia.hasMany(pers_06_localidad, {
    foreignKey: "RELA_PERS_05_PROVINCIA",
    as: "localidades",
  });

  pers_06_localidad.belongsTo(pers_05_provincia,{
    foreignKey: "RELA_PERS_05_PROVINCIA",
    as: "provincia",
  })

  
}
