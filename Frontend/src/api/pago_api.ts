import { http, type ApiResponse } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PagoEstado =
  | "approved"
  | "pending"
  | "in_process"
  | "rejected"
  | "cancelled"
  | "refunded";

export interface VerificacionPago {
  payment_id:  string;
  estado:      PagoEstado;
  aprobado:    boolean;
  orden_id:    number | null;
  monto:       number;
  metodo_pago: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * GET /pagos/verificar?payment_id=:id
 *
 * Llamar desde la página de confirmación con el payment_id
 * que MercadoPago incluye en la back_url al redirigir al usuario.
 *
 * Flujo:
 *   1. Usuario paga en MP
 *   2. MP redirige a /confirmacion/:ordenId?payment_id=xxx&status=approved
 *   3. Frontend llama verificarPago(payment_id)
 *   4. Si aprobado → mostrar pantalla de éxito
 */
export async function verificarPago(payment_id: string): Promise<VerificacionPago> {
  const r = await http.get<ApiResponse<VerificacionPago>>("/pagos/verificar", {
    params: { payment_id },
  });
  return r.data.data;
}
