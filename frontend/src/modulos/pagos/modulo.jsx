import PagarPedido from "./componentes/pagar_pedido.jsx";
import PagosOnlinePedido from "./admin/pagos_online_pedido.jsx";

// Pagos online (Mercado Pago). Se enchufa en las pantallas de pedidos de la tienda sin que la tienda
// lo conozca. Sin credenciales en el servidor, el botón de pago no aparece.
export const moduloPagos = {
  codigo: "pagos_online",
  // En el detalle del pedido del cliente ({ pedido, recargar })
  accionesPedido: [PagarPedido],
  // En el detalle del pedido del panel ({ pedido })
  seccionesPedidoPanel: [PagosOnlinePedido],
};
