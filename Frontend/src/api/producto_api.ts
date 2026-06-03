import { http, type ApiResponse, type Pagination } from "./http";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface TalleDisponible {
  talle:    string;
  talle_id: number | null;
  stock:    number;
}

export interface ProductoColor {
  id:     number;
  nombre: string;
  hex:    string | null;
}

export interface Producto {
  id:                 number;
  nombre:             string;
  descripcion:        string | null;
  categoria:          string;
  categoria_id:       number | null;
  genero:             string;
  genero_id:          number | null;
  marca:              string | null;
  marca_id:           number | null;
  precio:             number;
  precio_anterior:    number | null;
  descuento:          string | null;
  imagenes:           { src: string; alt?: string }[] | string[];
  colores:            ProductoColor[];
  badge:              "nuevo" | "vuelve" | "agotado" | null;
  home_seccion:       "carousel" | "novedades" | null;
  activo:             boolean;
  stock:              number;
  talles_disponibles: TalleDisponible[];
}

export interface ProductoFiltros {
  genero?:        string;
  categoria?:     string;
  marca?:         string;
  precio_max?:    number;
  solo_ofertas?:  boolean;
  solo_stock?:    boolean;
  home_seccion?:  "carousel" | "novedades";
  orden?:         "novedad" | "precio_asc" | "precio_desc" | "nombre_asc";
  page?:          number;
  limit?:         number;
}

// ─── Tipos de stock ───────────────────────────────────────────────────────────

export interface StockRow {
  id:       number;
  talle_id: number | null;
  talle:    string | null;
  stock:    number;
}

export interface StockUpsert {
  talle_id: number | null;
  cantidad: number;
}

// ─── Payload de creación / actualización ─────────────────────────────────────
// Usa los nombres de columna del backend (generic controller los filtra por whitelist)

export interface CrearProductoPayload {
  RELA_PROD01:             number;
  RELA_PROD02:             number;
  RELA_PROD07?:            number;
  PROD03_NOMBRE:           string;
  PROD03_DESCRIPCION?:     string;
  PROD03_PRECIO:           number;
  PROD03_PRECIO_ANTERIOR?: number | null;
  PROD03_DESCUENTO?:       string | null;
  PROD03_BADGE?:           string | null;
  PROD03_HOME_SECCION?:    "carousel" | "novedades" | null;
  PROD03_IMAGENES?:        { src: string; alt?: string }[];
  PROD03_COLORES?:         ProductoColor[];
  PROD03_FECHAALTA?:       string;
}

export type ActualizarProductoPayload = Omit<CrearProductoPayload, "PROD03_FECHAALTA">;

// ─── GET (público) ────────────────────────────────────────────────────────────

export async function getProductos(
  filtros: ProductoFiltros = {},
): Promise<{ productos: Producto[]; pagination: Pagination }> {
  const params = Object.fromEntries(
    Object.entries({
      ...filtros,
      pagina:     filtros.page,
      por_pagina: filtros.limit,
      page:       undefined,
      limit:      undefined,
    }).filter(([, v]) => v !== undefined && v !== null && v !== false),
  );
  const r = await http.get<ApiResponse<Producto[]>>("/productos", { params });
  return {
    productos:  r.data.data,
    pagination: r.data.pagination ?? {
      total:         Number((r.data as ApiResponse<Producto[]> & { total?: number }).total ?? 0),
      pagina:        Number((r.data as ApiResponse<Producto[]> & { pagina?: number }).pagina ?? 1),
      total_paginas: Number((r.data as ApiResponse<Producto[]> & { total_paginas?: number }).total_paginas ?? 1),
    },
  };
}

export async function getOfertasDestacadas(): Promise<Producto[]> {
  const r = await http.get<ApiResponse<Producto[]>>("/productos/ofertas/destacadas");
  return r.data.data;
}

export async function getProducto(id: number | string): Promise<Producto> {
  const r = await http.get<ApiResponse<Producto>>(`/productos/${id}`);
  return r.data.data;
}

// ─── Stock (admin) ────────────────────────────────────────────────────────────

export async function getProductoStock(id: number | string): Promise<StockRow[]> {
  const r = await http.get<ApiResponse<unknown[]>>(`/productos/${id}/stock`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (r.data.data as any[]).map((s) => ({
    id:       s.ID_PROD05,
    talle_id: s.RELA_PROD04 ?? null,
    talle:    s.talle?.PROD04_NOMBRE ?? null,
    stock:    s.PROD05_STOCK,
  }));
}

export async function updateProductoStock(
  id: number | string,
  entries: StockUpsert[],
): Promise<StockRow[]> {
  const r = await http.put<ApiResponse<unknown[]>>(`/productos/${id}/stock`, entries);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (r.data.data as any[]).map((s) => ({
    id:       s.ID_PROD05,
    talle_id: s.RELA_PROD04 ?? null,
    talle:    s.talle?.PROD04_NOMBRE ?? null,
    stock:    s.PROD05_STOCK,
  }));
}

// ─── CRUD (admin) ─────────────────────────────────────────────────────────────

export async function crearProducto(data: CrearProductoPayload): Promise<{ id: number }> {
  if (!data.PROD03_FECHAALTA) {
    data = { ...data, PROD03_FECHAALTA: new Date().toISOString().split("T")[0] };
  }
  const r = await http.post<ApiResponse<{ id: number }>>("/productos", data);
  return r.data.data;
}

export async function actualizarProducto(
  id: number | string,
  data: ActualizarProductoPayload,
): Promise<void> {
  await http.put(`/productos/${id}`, data);
}

// ─── Stock bajo (admin) ───────────────────────────────────────────────────────

export interface StockBajoItem {
  producto_id:     number;
  producto_nombre: string;
  marca:           string | null;
  talle:           string | null;
  color:           string | null;
  color_hex:       string | null;
  stock:           number;
}

export async function getStockBajo(umbral = 1): Promise<StockBajoItem[]> {
  const r = await http.get<ApiResponse<StockBajoItem[]>>("/productos/stock-bajo", {
    params: { umbral },
  });
  return r.data.data;
}
