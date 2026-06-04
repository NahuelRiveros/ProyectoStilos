import { http } from "./http";

const today = () => new Date().toISOString().slice(0, 10);

// GET /api/catalogos/categorias  [público]
export async function getCategorias() {
  const { data } = await http.get("/catalogos/categorias");
  return data.data.map((c) => ({
    id:       c.ID_PROD01,
    nombre:   c.PROD01_NOMBRE,
    slug:     c.PROD01_SLUG,
    padre_id: c.RELA_PARENT ?? null,
  }));
}

// GET /api/catalogos/marcas  [público]
export async function getMarcas() {
  const { data } = await http.get("/catalogos/marcas");
  return data.data.map((m) => ({
    id:     m.ID_PROD07,
    nombre: m.PROD07_NOMBRE,
    slug:   m.PROD07_SLUG,
    logo:   m.PROD07_LOGO ?? null,
  }));
}

export async function createMarca(payload) {
  const body = {
    PROD07_NOMBRE: payload.nombre,
    PROD07_SLUG: payload.slug,
    PROD07_LOGO: payload.logo ?? null,
    PROD07_DESCRIPCION: payload.descripcion ?? null,
    PROD07_ORDEN: payload.orden ?? 0,
    PROD07_ACTIVO: true,
    PROD07_FECHAALTA: today(),
  };
  const { data } = await http.post("/catalogos/marcas", body);
  return mapMarca(data.data);
}

export async function updateMarca(id, payload) {
  const body = {
    PROD07_NOMBRE: payload.nombre,
    PROD07_SLUG: payload.slug,
    PROD07_LOGO: payload.logo ?? null,
    PROD07_DESCRIPCION: payload.descripcion ?? null,
    PROD07_ORDEN: payload.orden ?? 0,
    PROD07_ACTIVO: true,
  };
  const { data } = await http.put(`/catalogos/marcas/${id}`, body);
  return mapMarca(data.data);
}

export async function deleteMarca(id) {
  await http.delete(`/catalogos/marcas/${id}`);
}

export async function getGeneros() {
  const { data } = await http.get("/catalogos/generos");
  return data.data.map(mapGenero);
}

export async function getCatalogoNavegacion() {
  const { data } = await http.get("/catalogos/navegacion");
  return data.data.map(mapNavGenero);
}

export async function createGenero(nombre, slug) {
  const { data } = await http.post("/catalogos/generos", {
    PROD02_NOMBRE: nombre,
    PROD02_SLUG: slug,
    PROD02_FECHAALTA: today(),
  });
  return mapGenero(data.data);
}

export async function updateGenero(id, nombre, slug) {
  const { data } = await http.put(`/catalogos/generos/${id}`, {
    PROD02_NOMBRE: nombre,
    PROD02_SLUG: slug,
  });
  return mapGenero(data.data);
}

export async function deleteGenero(id) {
  await http.delete(`/catalogos/generos/${id}`);
}

export async function getTalles() {
  const { data } = await http.get("/catalogos/talles");
  return data.data.map(mapTalle);
}

export async function createTalle(nombre, orden = 0) {
  const { data } = await http.post("/catalogos/talles", {
    PROD04_NOMBRE: nombre,
    PROD04_ORDEN: orden,
    PROD04_FECHAALTA: today(),
  });
  return mapTalle(data.data);
}

export async function updateTalle(id, nombre, orden = 0) {
  const { data } = await http.put(`/catalogos/talles/${id}`, {
    PROD04_NOMBRE: nombre,
    PROD04_ORDEN: orden,
  });
  return mapTalle(data.data);
}

export async function deleteTalle(id) {
  await http.delete(`/catalogos/talles/${id}`);
}

export async function getColores() {
  const { data } = await http.get("/catalogos/colores");
  return data.data.map(mapColor);
}

export async function createColor(nombre, hex = null, orden = 0) {
  const { data } = await http.post("/catalogos/colores", {
    PROD06_NOMBRE: nombre,
    PROD06_HEX: hex,
    PROD06_ORDEN: orden,
    PROD06_FECHAALTA: today(),
  });
  return mapColor(data.data);
}

export async function updateColor(id, nombre, hex = null, orden = 0) {
  const { data } = await http.put(`/catalogos/colores/${id}`, {
    PROD06_NOMBRE: nombre,
    PROD06_HEX: hex,
    PROD06_ORDEN: orden,
  });
  return mapColor(data.data);
}

export async function deleteColor(id) {
  await http.delete(`/catalogos/colores/${id}`);
}

export async function createCategoria(nombre, slug, padreId = null) {
  const { data } = await http.post("/catalogos/categorias", {
    PROD01_NOMBRE: nombre,
    PROD01_SLUG: slug,
    RELA_PARENT: padreId,
    PROD01_FECHAALTA: today(),
  });
  return mapCategoria(data.data);
}

export async function updateCategoria(id, nombre, slug, padreId = null) {
  const { data } = await http.put(`/catalogos/categorias/${id}`, {
    PROD01_NOMBRE: nombre,
    PROD01_SLUG: slug,
    RELA_PARENT: padreId,
  });
  return mapCategoria(data.data);
}

export async function deleteCategoria(id) {
  await http.delete(`/catalogos/categorias/${id}`);
}

export async function getCategoriaGeneros(id) {
  const { data } = await http.get(`/catalogos/categorias/${id}/generos`);
  return data.data;
}

export async function setCategoriaGeneros(id, generoIds) {
  await http.put(`/catalogos/categorias/${id}/generos`, { genero_ids: generoIds });
}

// GET /api/catalogos/opciones-envio  [auth requerido]
export async function getOpcionesEnvio() {
  const { data } = await http.get("/catalogos/opciones-envio");
  return data.data.map(mapOpcionEnvio);
}

export async function createOpcionEnvio(payload) {
  const { data } = await http.post("/catalogos/opciones-envio", toEnvioPayload(payload));
  return mapOpcionEnvio(data.data);
}

export async function updateOpcionEnvio(id, payload) {
  const { data } = await http.put(`/catalogos/opciones-envio/${id}`, toEnvioPayload(payload));
  return mapOpcionEnvio(data.data);
}

export async function deleteOpcionEnvio(id) {
  await http.delete(`/catalogos/opciones-envio/${id}`);
}

// GET /api/catalogos/condiciones-iva  [auth requerido]
export async function getCondicionesIva() {
  const { data } = await http.get("/catalogos/condiciones-iva");
  return data.data.map((c) => ({
    id:     c.ID_ORD02,
    codigo: c.ORD02_CODIGO,
    nombre: c.ORD02_NOMBRE,
  }));
}

function mapCategoria(c) {
  return {
    id: c.ID_PROD01,
    nombre: c.PROD01_NOMBRE,
    slug: c.PROD01_SLUG,
    padre_id: c.RELA_PARENT ?? null,
  };
}

function mapGenero(g) {
  return {
    id: g.ID_PROD02,
    nombre: g.PROD02_NOMBRE,
    slug: g.PROD02_SLUG,
  };
}

function mapNavCategoria(c) {
  return {
    id: c.id,
    label: c.label,
    nombre: c.label,
    slug: c.slug,
    to: c.to,
    children: (c.children ?? []).map(mapNavCategoria),
  };
}

function mapNavGenero(g) {
  return {
    id: g.id,
    label: g.label,
    nombre: g.label,
    slug: g.slug,
    to: g.to,
    items: (g.items ?? []).map(mapNavCategoria),
  };
}

function mapTalle(t) {
  return {
    id: t.ID_PROD04,
    nombre: t.PROD04_NOMBRE,
    orden: t.PROD04_ORDEN ?? 0,
  };
}

function mapColor(c) {
  return {
    id: c.ID_PROD06,
    nombre: c.PROD06_NOMBRE,
    hex: c.PROD06_HEX ?? null,
    orden: c.PROD06_ORDEN ?? 0,
  };
}

function mapMarca(m) {
  return {
    id: m.ID_PROD07,
    nombre: m.PROD07_NOMBRE,
    slug: m.PROD07_SLUG,
    logo: m.PROD07_LOGO ?? null,
    descripcion: m.PROD07_DESCRIPCION ?? null,
    orden: m.PROD07_ORDEN ?? 0,
  };
}

function mapOpcionEnvio(o) {
  return {
    id: o.ID_ENVIO01,
    nombre: o.ENVIO01_NOMBRE,
    descripcion: o.ENVIO01_DESCRIPCION,
    precio: parseFloat(o.ENVIO01_PRECIO),
    tiempo_estimado: o.ENVIO01_TIEMPO_ESTIMADO,
    gratis_desde: o.ENVIO01_GRATIS_DESDE != null ? parseFloat(o.ENVIO01_GRATIS_DESDE) : null,
  };
}

function toEnvioPayload(payload) {
  return {
    ENVIO01_NOMBRE: payload.nombre,
    ENVIO01_DESCRIPCION: payload.descripcion,
    ENVIO01_PRECIO: payload.precio,
    ENVIO01_TIEMPO_ESTIMADO: payload.tiempo_estimado,
    ENVIO01_GRATIS_DESDE: payload.gratis_desde,
    ENVIO01_ACTIVO: true,
    ENVIO01_FECHAALTA: today(),
  };
}
