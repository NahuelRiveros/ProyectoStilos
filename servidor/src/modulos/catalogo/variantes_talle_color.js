import { Op } from "sequelize";
import { DatosInvalidos } from "../../nucleo/errores.js";
import { Color, GrupoTalle, Talle } from "./modelos.js";

// Indumentaria: valida el grupo de talles y los colores/talles de cada variante, y arma su nombre
// ("Negro · M"). Algo dado de baja en el panel no se puede elegir de nuevo, pero el producto que ya
// lo tenía lo conserva al editarse (así no hay que rehacer la prenda si se da de baja un color).

const invalido = (detalles) => new DatosInvalidos("Revisá los datos ingresados.", detalles);

async function leer(Modelo, ids, atributos, transaction) {
  if (ids.length === 0) return new Map();
  const filas = await Modelo.findAll({ where: { id: { [Op.in]: ids } }, attributes: atributos, raw: true, transaction });
  return new Map(filas.map((f) => [f.id, f]));
}

/**
 * datos:    body validado del producto (grupo_talle_id, variantes[{ id?, color_id, talle_id }]).
 * actuales: { grupo_talle_id, variantes: [{ id, color_id, talle_id }] } del producto que se edita (o null).
 * Devuelve el nombre de cada variante (mismo orden) o null si no tiene color ni talle (nombre libre).
 */
export async function resolverTalleColor({ datos, actuales = null, transaction }) {
  const usados = { colores: new Set(), talles: new Set() };
  for (const v of actuales?.variantes ?? []) {
    if (v.color_id) usados.colores.add(v.color_id);
    if (v.talle_id) usados.talles.add(v.talle_id);
  }
  const unicos = (clave) => [...new Set(datos.variantes.map((v) => v[clave]).filter(Boolean))];

  const [grupos, colores, talles] = await Promise.all([
    leer(GrupoTalle, datos.grupo_talle_id ? [datos.grupo_talle_id] : [], ["id", "eliminado_en"], transaction),
    leer(Color, unicos("color_id"), ["id", "nombre", "eliminado_en"], transaction),
    leer(Talle, unicos("talle_id"), ["id", "nombre", "grupo_talle_id", "eliminado_en"], transaction),
  ]);

  if (datos.grupo_talle_id) {
    const grupo = grupos.get(datos.grupo_talle_id);
    if (!grupo || (grupo.eliminado_en && grupo.id !== actuales?.grupo_talle_id)) {
      throw invalido([{ campo: "grupo_talle_id", mensaje: "El grupo de talles no existe" }]);
    }
  }

  const errores = [];
  const nombres = datos.variantes.map((v, i) => {
    const color = v.color_id ? colores.get(v.color_id) : null;
    const talle = v.talle_id ? talles.get(v.talle_id) : null;
    if (v.color_id && (!color || (color.eliminado_en && !usados.colores.has(color.id)))) {
      errores.push({ campo: `variantes.${i}.color_id`, mensaje: "El color no existe" });
    }
    if (v.talle_id && (!talle || (talle.eliminado_en && !usados.talles.has(talle.id)))) {
      errores.push({ campo: `variantes.${i}.talle_id`, mensaje: "El talle no existe" });
    } else if (talle && talle.grupo_talle_id !== datos.grupo_talle_id) {
      errores.push({ campo: `variantes.${i}.talle_id`, mensaje: "El talle no es del grupo elegido" });
    }
    if (!color && !talle) return null;
    return [color?.nombre, talle?.nombre].filter(Boolean).join(" · ");
  });
  if (errores.length > 0) throw invalido(errores);
  return nombres;
}
