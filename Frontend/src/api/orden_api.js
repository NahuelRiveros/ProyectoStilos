import { http } from "./http";

// POST /api/ordenes
// payload: { envio_opcion_id, codigo_postal, direccion, facturacion?, notas? }
export async function crearOrden(payload) {
  const { data } = await http.post("/ordenes", payload);
  return data.data;
}

// GET /api/ordenes
export async function getMisOrdenes(params = {}) {
  const { data } = await http.get("/ordenes", { params });
  return data.data;
}

// GET /api/ordenes/:id
export async function getOrden(id) {
  const { data } = await http.get(`/ordenes/${id}`);
  return data.data;
}

// PUT /api/ordenes/:id/cancelar
export async function cancelarOrden(id) {
  const { data } = await http.put(`/ordenes/${id}/cancelar`);
  return data.data;
}
