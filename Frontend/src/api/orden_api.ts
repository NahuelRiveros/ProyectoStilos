import { http, type ApiResponse, type Pagination } from "./http";

// ─── Tipos compartidos ────────────────────────────────────────────────────────

// Dirección de entrega — se guarda como JSONB en la orden
export interface DireccionEnvio {
  calle:     string;
  numero:    string;
  piso?:     string;
  depto?:    string;
  localidad: string;
  provincia: string;
}

// Datos de facturación opcionales — se guarda como JSONB en la orden
export interface DatosFacturacion {
  razon_social?: string;
  cuit?:         string;
  condicion_iva: "RI" | "CF" | "MT" | "EX" | "SS";  // código del backend
}

// ─── Orden ───────────────────────────────────────────────────────────────────

export interface OrdenItem {
  id:            number;
  producto_id:   number | null;
  nombre:        string;
  categoria:     string;
  talle:         string | null;
  precio_unidad: number;
  cantidad:      number;
  subtotal:      number;
}

export interface OrdenEnvio {
  estado:   string;
  tracking: string | null;
  opcion:   string | null;
}

export interface Orden {
  id:               number;
  estado:           string;       // código: "pendiente" | "pagado" | ...
  estado_label:     string | null;
  subtotal:         number;
  costo_envio:      number;
  total:            number;
  direccion:        DireccionEnvio | null;
  facturacion:      DatosFacturacion | null;
  mp_preference_id: string | null;
  mp_payment_id:    string | null;
  notas:            string | null;
  fecha:            string;
  items:            OrdenItem[];
  envio:            OrdenEnvio | null;
}

// ─── Payload para crear orden ─────────────────────────────────────────────────
// Los items se leen del carrito server-side — solo se necesita info de entrega

export interface CrearOrdenPayload {
  envio_opcion_id: number;
  codigo_postal:   string;
  direccion:       DireccionEnvio;
  facturacion?:    DatosFacturacion;
  notas?:          string;
}

export interface CrearOrdenResponse {
  orden_id:      number;
  total:         number;
  mp_init_point: string | null;  // null si MP falló (la orden igual se crea)
}

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * POST /ordenes — crea la orden a partir del carrito server-side.
 * Si mp_init_point !== null → redirigir al usuario a esa URL para pagar.
 */
export async function crearOrden(payload: CrearOrdenPayload): Promise<CrearOrdenResponse> {
  const r = await http.post<ApiResponse<CrearOrdenResponse>>("/ordenes", payload);
  return r.data.data;
}

/** GET /ordenes/:id — detalle de una orden */
export async function getOrden(id: number | string): Promise<Orden> {
  const r = await http.get<ApiResponse<Orden>>(`/ordenes/${id}`);
  return r.data.data;
}

/** GET /ordenes — historial paginado del usuario autenticado */
export async function getMisOrdenes(page = 1, limit = 10): Promise<{ ordenes: Orden[]; pagination: Pagination }> {
  const r = await http.get<ApiResponse<Orden[]>>("/ordenes", { params: { page, limit } });
  return {
    ordenes:    r.data.data,
    pagination: r.data.pagination ?? { total: 0, pagina: 1, total_paginas: 1 },
  };
}

/** PUT /ordenes/:id/cancelar — cancela una orden en estado "pendiente" */
export async function cancelarOrden(id: number | string): Promise<void> {
  await http.put(`/ordenes/${id}/cancelar`);
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/** GET /ordenes/admin/todas — admin: todas las órdenes paginadas */
export async function getTodasOrdenes(
  page = 1,
  limit = 20,
  estado?: string,
): Promise<{ ordenes: Orden[]; pagination: Pagination }> {
  const params: Record<string, unknown> = { page, limit };
  if (estado) params.estado = estado;
  const r = await http.get<ApiResponse<Orden[]>>("/ordenes/admin/todas", { params });
  return {
    ordenes:    r.data.data,
    pagination: r.data.pagination ?? { total: 0, pagina: 1, total_paginas: 1 },
  };
}

/** PUT /ordenes/admin/:id/estado — admin: cambia el estado de una orden */
export async function actualizarEstadoOrden(id: number | string, estado: string): Promise<void> {
  await http.put(`/ordenes/admin/${id}/estado`, { estado });
}
