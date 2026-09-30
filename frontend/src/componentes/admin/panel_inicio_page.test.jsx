import { screen } from "@testing-library/react";
import { http as mock, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { proyecto } from "compartido/proyecto.js";
import { CLAVE_SESION } from "@/api/http.js";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import PanelInicioPage from "./panel_inicio_page.jsx";

// Lo que se prueba es QUÉ resúmenes ve cada rol, no su contenido: se reemplazan por un texto.
vi.mock("@/modulos/caja/admin/resumen_caja.jsx", () => ({ default: () => <p>Números de caja</p> }));
vi.mock("@/modulos/tienda/admin/resumen_pedidos.jsx", () => ({ default: () => <p>Números de pedidos</p> }));
vi.mock("@/modulos/catalogo/admin/resumen_catalogo.jsx", () => ({ default: () => <p>Números del catálogo</p> }));
vi.mock("@/modulos/stock/admin/resumen_stock.jsx", () => ({ default: () => <p>Números de stock</p> }));

function sesionComo(roles) {
  localStorage.setItem(CLAVE_SESION, "token-de-prueba");
  servidorMock.use(mock.get(`${API}/auth/yo`, () => HttpResponse.json({ ok: true, data: { id: 1, nombre: "Ana", email: "a@a.com", roles } })));
}

describe.skipIf(!proyecto.modulos.caja)("Inicio del panel · indicadores de Caja", () => {
  it("el personal (staff) no ve los números de Caja, pero sí los de pedidos", async () => {
    sesionComo(["staff"]);
    renderizar(<PanelInicioPage />);

    expect(await screen.findByRole("heading", { name: "Hola, Ana" })).toBeInTheDocument();
    if (proyecto.modulos.tienda) expect(await screen.findByText("Números de pedidos")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Caja" })).not.toBeInTheDocument();
    expect(screen.queryByText("Números de caja")).not.toBeInTheDocument();
  });

  it.each([["admin"], ["super_admin"]])("un %s sí ve los números de Caja", async (rol) => {
    sesionComo([rol]);
    renderizar(<PanelInicioPage />);

    expect(await screen.findByRole("heading", { name: "Caja" })).toBeInTheDocument();
    expect(await screen.findByText("Números de caja")).toBeInTheDocument();
  });
});
