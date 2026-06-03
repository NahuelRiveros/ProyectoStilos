import { http, type ApiResponse } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CarritoItem {
  item_id?:    number;                         // ID_CARR02 — presente en items del servidor, ausente en items locales
  key:         string;                         // `${producto_id}-${talle ?? "u"}`
  producto_id: number;
  nombre:      string;
  categoria:   string;
  precio:      number;
  imagen:      { src: string; alt?: string } | string | null;
  talle:       string | null;
  talle_id?:   number | null;                  // ID_PROD04 — para sync correcto con servidor
  cantidad:    number;
}

// Payload para sincronizar el carrito local tras el login
export interface SyncItem {
  producto_id:  number;
  talle_id?:    number | null;   // ID_PROD04
  cantidad:     number;
  precio_unidad: number;
}

// Payload para agregar un item
export interface AddItemPayload {
  producto_id:  number;
  talle_id?:    number | null;
  cantidad?:    number;
  precio_unidad: number;
}

// ─── Helper interno ────────────────────────────────────────────────────────────

function unwrap(r: { data: ApiResponse<CarritoItem[]> }): CarritoItem[] {
  return r.data.data ?? [];
}

// ─── API ──────────────────────────────────────────────────────────────────────

/** POST /carrito/sync — fusiona el carrito local con el servidor tras el login */
export async function syncCarrito(items: SyncItem[]): Promise<CarritoItem[]> {
  const r = await http.post<ApiResponse<CarritoItem[]>>("/carrito/sync", { items });
  return unwrap(r);
}

/** GET /carrito — obtiene el carrito del usuario autenticado */
export async function getCarrito(): Promise<CarritoItem[]> {
  const r = await http.get<ApiResponse<CarritoItem[]>>("/carrito");
  return unwrap(r);
}

/** POST /carrito/items — agrega o suma cantidad a un item existente */
export async function addCarritoItem(item: AddItemPayload): Promise<CarritoItem[]> {
  const r = await http.post<ApiResponse<CarritoItem[]>>("/carrito/items", item);
  return unwrap(r);
}

/**
 * PUT /carrito/items/:itemId — actualiza la cantidad de un item.
 * cantidad = 0 elimina el item.
 * @param itemId  El item_id (ID_CARR02) que devuelve getCarrito
 */
export async function updateCarritoItem(itemId: number, cantidad: number): Promise<CarritoItem[]> {
  const r = await http.put<ApiResponse<CarritoItem[]>>(`/carrito/items/${itemId}`, { cantidad });
  return unwrap(r);
}

/**
 * DELETE /carrito/items/:itemId — elimina un item específico del carrito
 * @param itemId  El item_id (ID_CARR02) que devuelve getCarrito
 */
export async function removeCarritoItem(itemId: number): Promise<CarritoItem[]> {
  const r = await http.delete<ApiResponse<CarritoItem[]>>(`/carrito/items/${itemId}`);
  return unwrap(r);
}

/** DELETE /carrito — vacía el carrito completo */
export async function clearCarrito(): Promise<void> {
  await http.delete("/carrito");
}
