import { Auth01Rol } from "./auth_01_rol.js";
import { Auth02Usuario } from "./auth_02_usuario.js";
import { Auth03ResetToken } from "./auth_03_reset_token.js";
import { Auth04LogSesion } from "./auth_04_log_sesion.js";
import { Auth05UsuarioRol } from "./auth_05_usuario_rol.js";
import { Auth06Suscripcion } from "./auth_06_suscripcion.js";
//////////////////
import { pers_01_persona } from "./personas/pers_01_persona.js";
import { pers_02_tipo_documento } from "./personas/pers_02_tipo_documento.js";
import { pers_03_sexo } from "./Personas/pers_03_sexo.js"; 
import { pers_04_estado_civil } from "./Personas/pers_04_estado_civil.js";
import { pers_05_provincia } from "./personas/pers_05_provincia.js";
import { pers_06_localidad } from "./personas/pers_06_localidad.js";

import { setupAssociations } from "./associations.js";

setupAssociations();

export {
  Auth01Rol,
  Auth02Usuario,
  Auth03ResetToken,
  Auth04LogSesion,
  Auth05UsuarioRol,
  Auth06Suscripcion,
  pers_01_persona,
  pers_02_tipo_documento,
  pers_03_sexo,
  pers_04_estado_civil,
  pers_05_provincia,
  pers_06_localidad
};
