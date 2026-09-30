import * as atributos from "./atributos_servicio.js";

// Marcas
export const listarMarcas = async (req, res) => res.json({ ok: true, data: await atributos.listarMarcas() });
export const crearMarca = async (req, res) => res.status(201).json({ ok: true, data: await atributos.crearMarca(req.datos.body) });
export const actualizarMarca = async (req, res) => res.json({ ok: true, data: await atributos.actualizarMarca(req.datos.params.id, req.datos.body) });
export async function eliminarMarca(req, res) {
  await atributos.eliminarMarca(req.datos.params.id);
  res.status(204).end();
}

// Colores
export const listarColores = async (req, res) => res.json({ ok: true, data: await atributos.listarColores() });
export const crearColor = async (req, res) => res.status(201).json({ ok: true, data: await atributos.crearColor(req.datos.body) });
export const actualizarColor = async (req, res) => res.json({ ok: true, data: await atributos.actualizarColor(req.datos.params.id, req.datos.body) });
export async function eliminarColor(req, res) {
  await atributos.eliminarColor(req.datos.params.id);
  res.status(204).end();
}

// Grupos de talles
export const listarGruposTalle = async (req, res) => res.json({ ok: true, data: await atributos.listarGruposTalle() });
export const crearGrupoTalle = async (req, res) => res.status(201).json({ ok: true, data: await atributos.crearGrupoTalle(req.datos.body) });
export const actualizarGrupoTalle = async (req, res) =>
  res.json({ ok: true, data: await atributos.actualizarGrupoTalle(req.datos.params.id, req.datos.body) });
export async function eliminarGrupoTalle(req, res) {
  await atributos.eliminarGrupoTalle(req.datos.params.id);
  res.status(204).end();
}
export const cargarGruposSugeridos = async (req, res) => res.json({ ok: true, data: await atributos.cargarGruposSugeridos() });
