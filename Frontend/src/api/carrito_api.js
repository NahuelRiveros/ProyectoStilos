import { http } from "./http";

// GET /api/carrito
export async function getCarrito() {
  const { data } = await http.get("/carrito");
  return data.data;
}

// POST /api/carrito/items
// { producto_id, talle_id?, cantidad, precio_unidad }
export async function addCarritoItem(item) {
  const { data } = await http.post("/carrito/items", item);
  return data.data;
}

// PUT /api/carrito/items/:itemId
export async function updateCarritoItem(itemId, cantidad) {
  const { data } = await http.put(`/carrito/items/${itemId}`, { cantidad });
  return data.data;
}

// DELETE /api/carrito/items/:itemId
export async function removeCarritoItem(itemId) {
  const { data } = await http.delete(`/carrito/items/${itemId}`);
  return data.data;
}

// DELETE /api/carrito
export async function clearCarrito() {
  await http.delete("/carrito");
}

// POST /api/carrito/sync
// { items: [{ producto_id, talle_id?, cantidad, precio_unidad }] }
export async function syncCarrito(items) {
  const { data } = await http.post("/carrito/sync", { items });
  return data.data;
}
