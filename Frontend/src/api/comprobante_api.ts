import { http, type ApiResponse, type Pagination } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Comprobante {
  id:                number;
  numero:            number;
  numero_formateado: string;   // "0001-00000001"
  letra:             string;   // "A" | "B" | "C"
  tipo:              string;   // nombre legible
  punto_venta:       number | null;
  cuit_receptor:     string | null;
  pdf_url:           string | null;
  fecha:             string;
  orden_id:          number;
  total:             number | null;
  usuario_email:     string | null;  // solo admin
}

// ─── API ──────────────────────────────────────────────────────────────────────

/** GET /comprobantes — comprobantes del usuario autenticado */
export async function getMisComprobantes(): Promise<Comprobante[]> {
  const r = await http.get<ApiResponse<Comprobante[]>>("/comprobantes");
  return r.data.data;
}

/** GET /comprobantes/:id — detalle de un comprobante (propio o admin) */
export async function getComprobante(id: number): Promise<Comprobante> {
  const r = await http.get<ApiResponse<Comprobante>>(`/comprobantes/${id}`);
  return r.data.data;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface EmitirComprobantePayload {
  orden_id:       number;
  tipo_comp_id:   number;
  punto_venta_id: number;
  cuit_receptor?: string;
  pdf_url?:       string;
}

/** POST /comprobantes — admin: emite un comprobante para una orden */
export async function emitirComprobante(data: EmitirComprobantePayload): Promise<Comprobante> {
  const r = await http.post<ApiResponse<Comprobante>>("/comprobantes", data);
  return r.data.data;
}

/** GET /comprobantes/admin/todas — admin: todos los comprobantes paginados */
export async function getTodasComprobantes(
  page = 1,
  limit = 20,
): Promise<{ comprobantes: Comprobante[]; pagination: Pagination }> {
  const r = await http.get<ApiResponse<Comprobante[]>>("/comprobantes/admin/todas", {
    params: { page, limit },
  });
  return {
    comprobantes: r.data.data,
    pagination:   r.data.pagination ?? { total: 0, pagina: 1, total_paginas: 1 },
  };
}
