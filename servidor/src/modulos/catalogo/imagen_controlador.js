import { agregarImagenArchivo, agregarImagenUrl, cambiarColorImagen, eliminarImagen, ordenarImagenes } from "./imagen_servicio.js";

export async function subir(req, res) {
  const data = await agregarImagenArchivo(req.datos.params.id, req.file, req.datos.body);
  res.status(201).json({ ok: true, data });
}

export async function agregarPorUrl(req, res) {
  const data = await agregarImagenUrl(req.datos.params.id, req.datos.body);
  res.status(201).json({ ok: true, data });
}

export async function cambiarColor(req, res) {
  const data = await cambiarColorImagen(req.datos.params.id, req.datos.params.imagenId, req.datos.body);
  res.json({ ok: true, data });
}

export async function eliminar(req, res) {
  await eliminarImagen(req.datos.params.id, req.datos.params.imagenId);
  res.status(204).end();
}

export async function ordenar(req, res) {
  const data = await ordenarImagenes(req.datos.params.id, req.datos.body.ids);
  res.json({ ok: true, data });
}
