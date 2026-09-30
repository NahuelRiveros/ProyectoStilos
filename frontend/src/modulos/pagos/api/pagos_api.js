import { http } from "@/api/http.js";

/** { mercado_pago: true/false }: si el proveedor tiene credenciales cargadas en el servidor. */
export const verDisponibles = async () => (await http.get("/pagos/disponibles")).data.data;

/** Link de pago del saldo del pedido: { url, pago_online_id }. */
export const iniciarPago = async ({ pedidoId, proveedor = "mercado_pago" }) => (await http.post(`/pagos/pedidos/${pedidoId}`, { proveedor })).data.data;

/** Panel: intentos de pago online de un pedido. */
export const verPagosDelPedido = async (pedidoId) => (await http.get(`/pagos/pedidos/${pedidoId}`)).data.data;
