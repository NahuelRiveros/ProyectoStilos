import * as listas from "../services/listas_service.js";
import * as prendas from "../services/prendas_service.js";

// Panel del catálogo (permiso "Editar productos"). Entrada validada en req.datos.

const ok = (res, data, mensaje, estado = 200) => res.status(estado).json({ ok: true, mensaje, data });
const id = (req) => req.datos.params.id;

/** Alta, edición y baja de una lista, con el mensaje en español de cada una. */
function crud({ listar, crear, actualizar, eliminar }, cosa, genero = "a") {
  return {
    listar: async (_req, res) => ok(res, await listar()),
    crear: async (req, res) => ok(res, await crear(req.datos.body), `${cosa} cread${genero}.`, 201),
    actualizar: async (req, res) => ok(res, await actualizar(id(req), req.datos.body), `${cosa} actualizad${genero}.`),
    eliminar: async (req, res) => { await eliminar(id(req)); return ok(res, null, `${cosa} eliminad${genero}.`); },
  };
}

export const categorias = crud({ listar: listas.listarCategorias, crear: listas.crearCategoria, actualizar: listas.actualizarCategoria, eliminar: listas.eliminarCategoria }, "Categoría");
export const marcas = crud({ listar: listas.listarMarcas, crear: listas.crearMarca, actualizar: listas.actualizarMarca, eliminar: listas.eliminarMarca }, "Marca");
export const colores = crud({ listar: listas.listarColores, crear: listas.crearColor, actualizar: listas.actualizarColor, eliminar: listas.eliminarColor }, "Color", "o");
export const grupos = crud({ listar: listas.listarGruposTalle, crear: listas.crearGrupoTalle, actualizar: listas.actualizarGrupoTalle, eliminar: listas.eliminarGrupoTalle }, "Grupo de talles", "o");

export const caracteristicas = crud({ listar: listas.listarCaracteristicas, crear: listas.crearGrupoCaracteristica, actualizar: listas.actualizarGrupoCaracteristica, eliminar: listas.eliminarGrupoCaracteristica }, "Grupo de características", "o");

/** "Cargar sugeridos": responde cuántos agregó o que ya estaban todos. */
const sugeridos = (cargar, plural, yaEstaban) => async (_req, res) => {
  const n = await cargar();
  return ok(res, { agregados: n }, n ? `Se agregaron ${n} ${plural}.` : yaEstaban);
};
export const marcasSugeridasController = sugeridos(listas.cargarMarcasSugeridas, "marcas", "Ya tenías todas las marcas sugeridas.");
export const caracteristicasSugeridasController = sugeridos(listas.cargarCaracteristicasSugeridas, "características", "Ya tenías todas las características sugeridas.");
export const categoriasSugeridasController = sugeridos(listas.cargarCategoriasSugeridas, "categorías", "Ya tenías todas las categorías sugeridas.");

export async function coloresSugeridosController(_req, res) {
  const n = await listas.cargarColoresSugeridos();
  return ok(res, { agregados: n }, n ? `Se agregaron ${n} colores.` : "Ya tenías todos los colores sugeridos.");
}

export async function gruposSugeridosController(_req, res) {
  const n = await listas.cargarGruposSugeridos();
  return ok(res, { agregados: n }, n ? `Se agregaron ${n} grupos de talles.` : "Ya tenías todos los grupos sugeridos.");
}

export const listarPrendasController = async (req, res) => ok(res, await prendas.listarPrendas(req.datos.query));
export const obtenerPrendaController = async (req, res) => ok(res, await prendas.obtenerPrenda(id(req)));
export const crearPrendaController = async (req, res) => ok(res, await prendas.crearPrenda(req.datos.body), "Prenda creada.", 201);
export const actualizarPrendaController = async (req, res) => ok(res, await prendas.actualizarPrenda(id(req), req.datos.body), "Prenda actualizada.");

export async function estadoPrendaController(req, res) {
  const { activo } = req.datos.body;
  return ok(res, await prendas.cambiarEstadoPrenda(id(req), activo), activo ? "Prenda visible en la tienda." : "Prenda oculta de la tienda.");
}

export async function eliminarPrendaController(req, res) {
  await prendas.eliminarPrenda(id(req));
  return ok(res, null, "Prenda eliminada.");
}
