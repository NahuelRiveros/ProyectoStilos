import { http } from "./http";

// GET /api/productos
// params: { genero, categoria, marca, precio_max, solo_ofertas, solo_stock, orden, pagina, por_pagina }
export async function getProductos(params = {}) {
  const normalizedParams = { ...params };
  if (normalizedParams.limit != null && normalizedParams.por_pagina == null) {
    normalizedParams.por_pagina = normalizedParams.limit;
    delete normalizedParams.limit;
  }

  const { data } = await http.get("/productos", { params: normalizedParams });
  return {
    productos:  data.data,
    pagination: {
      total:        data.total,
      pagina:       data.pagina,
      total_paginas: data.total_paginas,
    },
  };
}

// GET /api/productos/:id
export async function getProducto(id) {
  const { data } = await http.get(`/productos/${id}`);
  return data.data;
}

// GET /api/productos/ofertas/destacadas
export async function getOfertasDestacadas() {
  const { data } = await http.get("/productos/ofertas/destacadas");
  return data.data;
}

// POST /api/productos
export async function crearProducto(payload) {
  const { data } = await http.post("/productos", payload);
  return data.data;
}

// PUT /api/productos/:id
export async function actualizarProducto(id, payload) {
  const { data } = await http.put(`/productos/${id}`, payload);
  return data.data;
}

// GET /api/productos/:id/stock
export async function getProductoStock(id) {
  const { data } = await http.get(`/productos/${id}/stock`);
  return data.data.map((s) => ({
    id:          s.ID_PROD05,
    producto_id: s.RELA_PROD03,
    talle_id:    s.RELA_PROD04,
    talle:       s.talle?.PROD04_NOMBRE ?? null,
    color_id:    s.RELA_PROD06 ?? null,
    color:       s.color?.PROD06_NOMBRE ?? null,
    color_hex:   s.color?.PROD06_HEX    ?? null,
    stock:       s.PROD05_STOCK,
  }));
}

// PUT /api/productos/:id/stock
export async function updateProductoStock(id, entries) {
  const { data } = await http.put(`/productos/${id}/stock`, entries);
  return data.data;
}

// GET /api/productos/stock-bajo
export async function getStockBajo(umbral = 1) {
  const { data } = await http.get("/productos/stock-bajo", { params: { umbral } });
  return data.data;
}

// GET /api/productos/catalogo-csv
export async function getCatalogoCSV() {
  const { data } = await http.get("/productos/catalogo-csv");
  return data.data;
}

// POST /api/productos/importar-csv
export async function importarProductosCSV(archivo) {
  const form = new FormData();
  form.append("csv", archivo);
  const { data } = await http.post("/productos/importar-csv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
