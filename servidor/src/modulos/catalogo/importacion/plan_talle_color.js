import { quitarAcentos } from "compartido/reglas/texto.js";
import { claveGrupo, rutasCategorias } from "./plan.js";
import { claveTexto } from "./normalizar.js";

// Indumentaria: cada fila con Color y/o Talle se resuelve contra las listas del panel. Lo que no
// existe NO se crea: la fila queda con error para que primero se cargue en Colores o Talles (así
// no se llenan las listas de colores mal escritos). La variante se nombra igual que en el panel
// ("Negro · M"): una prenda cargada a mano y la misma importada se reconocen como la misma.

const clave = (v) => quitarAcentos(claveTexto(v));

function indice(lista) {
  const porNombre = new Map();
  for (const item of lista) {
    const k = clave(item.nombre);
    if (!porNombre.has(k)) porNombre.set(k, []);
    porNombre.get(k).push(item);
  }
  return porNombre;
}

/**
 * filas: salida de normalizarFilas. catalogo: { categorias, productos, colores, grupos: [{ id, nombre, talles }] }.
 * Devuelve las filas con valor.presentacion = "Color · Talle" y valor.color_id / talle_id / grupo_talle_id,
 * o convertidas en { accion: "error", mensaje } si algo no cierra. Las filas sin color ni talle quedan igual.
 */
export function resolverTalleColor(filas, catalogo) {
  const colores = indice(catalogo.colores ?? []);
  const grupos = indice(catalogo.grupos ?? []);
  const talles = indice((catalogo.grupos ?? []).flatMap((g) => g.talles.map((t) => ({ ...t, grupo: g }))));
  const rutas = rutasCategorias(catalogo.categorias);
  const productos = new Map(catalogo.productos.map((p) => [claveGrupo(rutas.get(p.categoria_id), p.nombre), p]));

  const resueltas = filas.map((fila) => {
    const v = fila.valor;
    if (!v || (!v.color && !v.talle)) return fila;
    const error = (mensaje) => ({ fila: fila.fila, valor: v, accion: "error", mensaje });
    if (v.presentacion) return error("Usá la columna Presentación o las de Color y Talle, no las dos.");

    const existente = productos.get(claveGrupo(v.categoria, v.producto));
    let color = null;
    if (v.color) {
      color = colores.get(clave(v.color))?.[0];
      if (!color) return error(`El color "${v.color}" no existe. Cargalo en Catálogo → Colores.`);
    }

    let talle = null;
    if (v.talle) {
      let grupo = null;
      if (v.grupo_talle) {
        grupo = grupos.get(clave(v.grupo_talle))?.[0];
        if (!grupo) return error(`El grupo de talles "${v.grupo_talle}" no existe. Cargalo en Catálogo → Talles.`);
      } else if (existente?.grupo_talle_id) {
        grupo = (catalogo.grupos ?? []).find((g) => g.id === existente.grupo_talle_id) ?? null;
      }
      const candidatos = (talles.get(clave(v.talle)) ?? []).filter((t) => !grupo || t.grupo.id === grupo.id);
      if (candidatos.length === 0) {
        return error(grupo ? `El talle "${v.talle}" no existe en ${grupo.nombre}. Cargalo en Catálogo → Talles.` : `El talle "${v.talle}" no existe. Cargalo en Catálogo → Talles.`);
      }
      if (candidatos.length > 1) {
        return error(`El talle "${v.talle}" está en varios grupos (${candidatos.map((t) => t.grupo.nombre).join(", ")}): agregá la columna Grupo de talles.`);
      }
      talle = candidatos[0];
      if (existente && existente.grupo_talle_id !== talle.grupo.id) {
        return error(existente.grupo_talle_id ? "La prenda ya existe con otro grupo de talles." : "La prenda ya existe sin grupo de talles: elegilo en el panel antes de importar talles.");
      }
    }

    return {
      ...fila,
      valor: {
        ...v,
        presentacion: [color?.nombre, talle?.nombre].filter(Boolean).join(" · "),
        color_id: color?.id ?? null,
        talle_id: talle?.id ?? null,
        grupo_talle_id: talle?.grupo.id ?? null,
      },
    };
  });

  // Una prenda nueva no puede mezclar talles de grupos distintos (ej. Ropa y Jeans en el mismo archivo).
  const gruposPorPrenda = new Map();
  for (const f of resueltas) {
    if (!f.valor?.grupo_talle_id) continue;
    const k = claveGrupo(f.valor.categoria, f.valor.producto);
    if (!gruposPorPrenda.has(k)) gruposPorPrenda.set(k, new Set());
    gruposPorPrenda.get(k).add(f.valor.grupo_talle_id);
  }
  return resueltas.map((f) =>
    f.valor?.grupo_talle_id && gruposPorPrenda.get(claveGrupo(f.valor.categoria, f.valor.producto)).size > 1
      ? { fila: f.fila, valor: f.valor, accion: "error", mensaje: "La misma prenda tiene talles de grupos distintos. Usá un solo grupo por prenda." }
      : f,
  );
}
