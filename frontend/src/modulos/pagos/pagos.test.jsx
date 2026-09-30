import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import PagarPedido from "./componentes/pagar_pedido.jsx";
import PagosOnlinePedido from "./admin/pagos_online_pedido.jsx";

// Este archivo prueba el pago con Mercado Pago sea cual sea la config del cliente activo.
vi.mock("compartido/proyecto.js", async (original) => {
  const { proyecto: real } = await original();
  return { proyecto: { ...real, pagos_online: { medios: ["mercado_pago", "tarjeta"], estado_al_aprobar: "pago_recibido" } } };
});

const pedido = (extra = {}) => ({ id: 55, estado: "pendiente", estado_cobro: "pendiente", medio_pago: "mercado_pago", total: "12100.00", saldo: 12100, ...extra });
const conMercadoPago = () => servidorMock.use(mock.get(`${API}/pagos/disponibles`, () => HttpResponse.json({ ok: true, data: { mercado_pago: true } })));

describe("Tienda · pagar el pedido con Mercado Pago", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sin credenciales en el servidor no muestra nada", async () => {
    renderizar(<PagarPedido pedido={pedido()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("button", { name: /Mercado Pago/ })).not.toBeInTheDocument();
  });

  it("con saldo, pide el link y lleva al cliente a Mercado Pago", async () => {
    conMercadoPago();
    let pedidoPagado;
    servidorMock.use(
      mock.post(`${API}/pagos/pedidos/55`, async ({ request }) => {
        pedidoPagado = await request.json();
        return HttpResponse.json({ ok: true, data: { url: "https://mp.test/pagar/1", pago_online_id: 7 } }, { status: 201 });
      }),
    );
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    renderizar(<PagarPedido pedido={pedido()} />);

    await userEvent.click(await screen.findByRole("button", { name: /Pagar \$\s?12\.100,00 con Mercado Pago/ }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith("https://mp.test/pagar/1"));
    expect(pedidoPagado).toEqual({ proveedor: "mercado_pago" });
  });

  it.each([
    ["por transferencia", { medio_pago: "transferencia" }],
    ["cancelado", { estado: "cancelado" }],
    ["ya pagado", { saldo: 0, estado_cobro: "cobrado" }],
  ])("no ofrece pagar un pedido %s", async (_caso, extra) => {
    conMercadoPago();
    renderizar(<PagarPedido pedido={pedido(extra)} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("button", { name: /Mercado Pago/ })).not.toBeInTheDocument();
  });

  it("al volver con el pago aprobado avisa que se está acreditando (sin volver a ofrecer pagar)", async () => {
    conMercadoPago();
    renderizar(<PagarPedido pedido={pedido()} recargar={() => {}} />, { ruta: "/mis-pedidos/55?status=approved&payment_id=9001" });
    expect(await screen.findByRole("status")).toHaveTextContent("Mercado Pago aprobó tu pago");
    expect(screen.queryByRole("button", { name: /Mercado Pago/ })).not.toBeInTheDocument();
  });

  it("si el pago no se completó lo dice y deja intentar de nuevo; si el error es del servidor lo muestra", async () => {
    conMercadoPago();
    servidorMock.use(
      mock.post(`${API}/pagos/pedidos/55`, () =>
        HttpResponse.json({ ok: false, codigo: "PROVEEDOR_NO_RESPONDE", mensaje: "No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.", detalles: [] }, { status: 502 }),
      ),
    );
    renderizar(<PagarPedido pedido={pedido()} />, { ruta: "/mis-pedidos/55?status=rejected" });
    expect(await screen.findByRole("status")).toHaveTextContent("El pago no se completó");

    await userEvent.click(screen.getByRole("button", { name: /con Mercado Pago/ }));
    expect(await screen.findByText("No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.")).toBeInTheDocument();
  });
});

describe("Panel · pagos online del pedido", () => {
  it("lista los intentos y avisa cuando hay uno para revisar", async () => {
    servidorMock.use(
      mock.get(`${API}/pagos/pedidos/55`, () =>
        HttpResponse.json({
          ok: true,
          data: [
            { id: 2, proveedor: "mercado_pago", estado: "revisar", monto: "12100.00", pago_externo_id: "9004", actualizado_en: "2026-09-30T15:00:00Z" },
            { id: 1, proveedor: "mercado_pago", estado: "rechazado", monto: "12100.00", pago_externo_id: "9003", actualizado_en: "2026-09-30T14:00:00Z" },
          ],
        }),
      ),
    );
    renderizar(<PagosOnlinePedido pedido={pedido()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("no coincide con el pedido");
    expect(screen.getByText("Revisar")).toBeInTheDocument();
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("sin pagos online no muestra la sección", async () => {
    servidorMock.use(mock.get(`${API}/pagos/pedidos/55`, () => HttpResponse.json({ ok: true, data: [] })));
    renderizar(<PagosOnlinePedido pedido={pedido()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("heading", { name: "Pagos online" })).not.toBeInTheDocument();
  });
});
