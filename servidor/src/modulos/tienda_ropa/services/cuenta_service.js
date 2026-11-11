import { sequelize } from "../../../core/database/sequelize.js";
import { noExiste } from "../../../core/services/common/errores.js";
import { Persona } from "../../../core/models/index.js";
import { ClienteRopa } from "../models/index.js";

// "Mis datos" del cliente (ROP-41). Nombre, apellido y celular viven en la persona del core (los usa
// todo el sistema); el domicilio, en cliente_ropa.

export async function misDatos({ usuario_id, persona_id }) {
  const [persona, cliente] = await Promise.all([
    Persona.findByPk(persona_id, { attributes: ["nombre", "apellido", "email", "celular"] }),
    ClienteRopa.findOne({ where: { usuario_id }, attributes: ["direccion", "localidad", "codigo_postal"] }),
  ]);
  if (!persona) throw noExiste("No encontramos tus datos.");
  return {
    nombre: persona.nombre, apellido: persona.apellido, email: persona.email, celular: persona.celular ?? "",
    direccion: cliente?.direccion ?? "", localidad: cliente?.localidad ?? "", codigo_postal: cliente?.codigo_postal ?? "",
    completos: Boolean(persona.nombre && persona.apellido && persona.celular),
  };
}

export async function guardarMisDatos(usuario, { nombre, apellido, celular, direccion, localidad, codigo_postal }) {
  await sequelize.transaction(async (transaction) => {
    const persona = await Persona.findByPk(usuario.persona_id, { transaction });
    if (!persona) throw noExiste("No encontramos tus datos.");
    await persona.update({ nombre, apellido, celular, actualizado_en: new Date() }, { transaction });
    const domicilio = { direccion: direccion || null, localidad: localidad || null, codigo_postal: codigo_postal || null };
    const [cliente, creado] = await ClienteRopa.findOrCreate({ where: { usuario_id: usuario.usuario_id }, defaults: domicilio, transaction });
    if (!creado) await cliente.update({ ...domicilio, actualizado_en: new Date() }, { transaction });
  });
  return misDatos(usuario);
}
