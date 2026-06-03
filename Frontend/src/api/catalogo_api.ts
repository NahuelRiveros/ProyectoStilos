import { http, type ApiResponse } from "./http";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface Categoria {
  id:       number;
  nombre:   string;
  slug:     string;
  padre_id: number | null;
}

export interface Genero {
  id:     number;
  nombre: string;
  slug:   string;
}

export interface Talle {
  id:     number;
  nombre: string;
  orden:  number;
}

export interface Color {
  id:     number;
  nombre: string;
  hex:    string | null;
  orden:  number;
}

export interface EstadoOrden {
  id:       number;
  codigo:   string;
  etiqueta: string;
}

export interface CondicionIva {
  id:     number;
  codigo: string;
  nombre: string;
}

export interface TipoComprobante {
  id:                 number;
  letra:              string;
  nombre:             string;
  condicion_receptor: string;
}

export interface Marca {
  id:          number;
  nombre:      string;
  slug:        string;
  logo:        string | null;
  descripcion: string | null;
  orden:       number;
  activo:      boolean;
}

export interface OpcionEnvio {
  id:              number;
  nombre:          string;
  descripcion:     string;
  precio:          number;
  tiempo_estimado: string;
  gratis_desde:    number | null;
}

// ─── Mappers (DB column names → clean types) ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCategoria   = (r: any): Categoria  => ({ id: r.ID_PROD01, nombre: r.PROD01_NOMBRE, slug: r.PROD01_SLUG, padre_id: r.RELA_PARENT ?? null });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGenero      = (r: any): Genero     => ({ id: r.ID_PROD02, nombre: r.PROD02_NOMBRE, slug: r.PROD02_SLUG });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTalle       = (r: any): Talle      => ({ id: r.ID_PROD04, nombre: r.PROD04_NOMBRE, orden: r.PROD04_ORDEN });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapColor       = (r: any): Color      => ({ id: r.ID_PROD06, nombre: r.PROD06_NOMBRE, hex: r.PROD06_HEX ?? null, orden: r.PROD06_ORDEN ?? 0 });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapEstado      = (r: any): EstadoOrden => ({ id: r.ID_ORD01, codigo: r.ORD01_CODIGO, etiqueta: r.ORD01_ETIQUETA });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCondicion   = (r: any): CondicionIva => ({ id: r.ID_ORD02, codigo: r.ORD02_CODIGO, nombre: r.ORD02_NOMBRE });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTipoComp    = (r: any): TipoComprobante => ({ id: r.ID_FACT01, letra: r.FACT01_LETRA, nombre: r.FACT01_NOMBRE, condicion_receptor: r.FACT01_CONDICION_RECEPTOR });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMarca = (r: any): Marca => ({
  id:          r.ID_PROD07,
  nombre:      r.PROD07_NOMBRE,
  slug:        r.PROD07_SLUG,
  logo:        r.PROD07_LOGO ?? null,
  descripcion: r.PROD07_DESCRIPCION ?? null,
  orden:       r.PROD07_ORDEN ?? 0,
  activo:      r.PROD07_ACTIVO ?? true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOpcionEnvio = (r: any): OpcionEnvio => ({
  id: r.ID_ENVIO01, nombre: r.ENVIO01_NOMBRE, descripcion: r.ENVIO01_DESCRIPCION,
  precio: parseFloat(r.ENVIO01_PRECIO), tiempo_estimado: r.ENVIO01_TIEMPO_ESTIMADO,
  gratis_desde: r.ENVIO01_GRATIS_DESDE ?? null,
});

const hoy = () => new Date().toISOString().split("T")[0];

// ─── Lectura (GET público) ────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/categorias");
  return r.data.data.map(mapCategoria);
}

export async function getGeneros(): Promise<Genero[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/generos");
  return r.data.data.map(mapGenero);
}

export async function getTalles(): Promise<Talle[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/talles");
  return r.data.data.map(mapTalle);
}

export async function getColores(): Promise<Color[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/colores");
  return r.data.data.map(mapColor);
}

export async function getEstadosOrden(): Promise<EstadoOrden[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/estados-orden");
  return r.data.data.map(mapEstado);
}

export async function getCondicionesIva(): Promise<CondicionIva[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/condiciones-iva");
  return r.data.data.map(mapCondicion);
}

export async function getTiposComprobante(): Promise<TipoComprobante[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/tipos-comprobante");
  return r.data.data.map(mapTipoComp);
}

export async function getMarcas(): Promise<Marca[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/marcas");
  return r.data.data.map(mapMarca);
}

export async function getOpcionesEnvio(): Promise<OpcionEnvio[]> {
  const r = await http.get<ApiResponse<unknown[]>>("/catalogos/opciones-envio");
  return r.data.data.map(mapOpcionEnvio);
}

// ─── CRUD Marcas ─────────────────────────────────────────────────────────────

export interface MarcaPayload {
  nombre:      string;
  slug:        string;
  logo:        string | null;
  descripcion: string | null;
  orden:       number;
}

export async function createMarca(data: MarcaPayload): Promise<Marca> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/marcas", {
    PROD07_NOMBRE:      data.nombre,
    PROD07_SLUG:        data.slug,
    PROD07_LOGO:        data.logo,
    PROD07_DESCRIPCION: data.descripcion,
    PROD07_ORDEN:       data.orden,
    PROD07_ACTIVO:      true,
    PROD07_FECHAALTA:   hoy(),
  });
  return mapMarca(r.data.data);
}

export async function updateMarca(id: number, data: MarcaPayload): Promise<Marca> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/marcas/${id}`, {
    PROD07_NOMBRE:      data.nombre,
    PROD07_SLUG:        data.slug,
    PROD07_LOGO:        data.logo,
    PROD07_DESCRIPCION: data.descripcion,
    PROD07_ORDEN:       data.orden,
  });
  return mapMarca(r.data.data);
}

export async function deleteMarca(id: number): Promise<void> {
  await http.delete(`/catalogos/marcas/${id}`);
}

// ─── CRUD Categorías (tipos de prenda) ───────────────────────────────────────

export async function createCategoria(nombre: string, slug: string, padreId?: number | null): Promise<Categoria> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/categorias", {
    PROD01_NOMBRE: nombre,
    PROD01_SLUG:   slug,
    RELA_PARENT:   padreId ?? null,
    PROD01_FECHAALTA: hoy(),
  });
  return mapCategoria(r.data.data);
}

export async function updateCategoria(id: number, nombre: string, slug: string, padreId?: number | null): Promise<Categoria> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/categorias/${id}`, {
    PROD01_NOMBRE: nombre,
    PROD01_SLUG:   slug,
    RELA_PARENT:   padreId ?? null,
  });
  return mapCategoria(r.data.data);
}

export async function deleteCategoria(id: number): Promise<void> {
  await http.delete(`/catalogos/categorias/${id}`);
}

export async function reactivarCategoria(id: number): Promise<void> {
  await http.put(`/catalogos/categorias/${id}/reactivar`);
}

export async function getCategoriaGeneros(id: number): Promise<number[]> {
  const r = await http.get<ApiResponse<number[]>>(`/catalogos/categorias/${id}/generos`);
  return r.data.data;
}

export async function setCategoriaGeneros(id: number, generoIds: number[]): Promise<void> {
  await http.put(`/catalogos/categorias/${id}/generos`, { genero_ids: generoIds });
}

// ─── CRUD Géneros ─────────────────────────────────────────────────────────────

export async function createGenero(nombre: string, slug: string): Promise<Genero> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/generos", {
    PROD02_NOMBRE: nombre, PROD02_SLUG: slug, PROD02_FECHAALTA: hoy(),
  });
  return mapGenero(r.data.data);
}

export async function updateGenero(id: number, nombre: string, slug: string): Promise<Genero> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/generos/${id}`, {
    PROD02_NOMBRE: nombre, PROD02_SLUG: slug,
  });
  return mapGenero(r.data.data);
}

export async function deleteGenero(id: number): Promise<void> {
  await http.delete(`/catalogos/generos/${id}`);
}

// ─── CRUD Talles ──────────────────────────────────────────────────────────────

export async function createTalle(nombre: string, orden: number): Promise<Talle> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/talles", {
    PROD04_NOMBRE: nombre, PROD04_ORDEN: orden, PROD04_FECHAALTA: hoy(),
  });
  return mapTalle(r.data.data);
}

export async function updateTalle(id: number, nombre: string, orden: number): Promise<Talle> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/talles/${id}`, {
    PROD04_NOMBRE: nombre, PROD04_ORDEN: orden,
  });
  return mapTalle(r.data.data);
}

export async function deleteTalle(id: number): Promise<void> {
  await http.delete(`/catalogos/talles/${id}`);
}

// ─── CRUD Colores ─────────────────────────────────────────────────────────────

export async function createColor(nombre: string, hex: string | null, orden: number): Promise<Color> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/colores", {
    PROD06_NOMBRE: nombre, PROD06_HEX: hex || null, PROD06_ORDEN: orden, PROD06_FECHAALTA: hoy(),
  });
  return mapColor(r.data.data);
}

export async function updateColor(id: number, nombre: string, hex: string | null, orden: number): Promise<Color> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/colores/${id}`, {
    PROD06_NOMBRE: nombre, PROD06_HEX: hex || null, PROD06_ORDEN: orden,
  });
  return mapColor(r.data.data);
}

export async function deleteColor(id: number): Promise<void> {
  await http.delete(`/catalogos/colores/${id}`);
}

// ─── CRUD Opciones de Envío ───────────────────────────────────────────────────

export interface OpcionEnvioPayload {
  nombre:          string;
  descripcion:     string;
  precio:          number;
  tiempo_estimado: string;
  gratis_desde:    number | null;
}

export async function createOpcionEnvio(data: OpcionEnvioPayload): Promise<OpcionEnvio> {
  const r = await http.post<ApiResponse<unknown>>("/catalogos/opciones-envio", {
    ENVIO01_NOMBRE:          data.nombre,
    ENVIO01_DESCRIPCION:     data.descripcion,
    ENVIO01_PRECIO:          data.precio,
    ENVIO01_TIEMPO_ESTIMADO: data.tiempo_estimado,
    ENVIO01_GRATIS_DESDE:    data.gratis_desde,
    ENVIO01_ACTIVO:          true,
    ENVIO01_FECHAALTA:       hoy(),
  });
  return mapOpcionEnvio(r.data.data);
}

export async function updateOpcionEnvio(id: number, data: OpcionEnvioPayload): Promise<OpcionEnvio> {
  const r = await http.put<ApiResponse<unknown>>(`/catalogos/opciones-envio/${id}`, {
    ENVIO01_NOMBRE:          data.nombre,
    ENVIO01_DESCRIPCION:     data.descripcion,
    ENVIO01_PRECIO:          data.precio,
    ENVIO01_TIEMPO_ESTIMADO: data.tiempo_estimado,
    ENVIO01_GRATIS_DESDE:    data.gratis_desde,
    ENVIO01_ACTIVO:          true,
  });
  return mapOpcionEnvio(r.data.data);
}

export async function deleteOpcionEnvio(id: number): Promise<void> {
  await http.delete(`/catalogos/opciones-envio/${id}`);
}
