import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import { categoriasEjemplo, paginacionDe, productoEjemplo } from "@/test/datos_catalogo.js";
import CatalogoPage from "./catalogo_page.jsx";
import FiltrosCelular from "./filtros_celular.jsx";

const DISPONIBLES = {
  marcas: [
    { id: 1, nombre: "Levis", cantidad: 1 },
    { id: 2, nombre: "Taverniti", cantidad: 3 },
  ],
  colores: [
    { id: 10, nombre: "Negro", hex: "#111111", cantidad: 2 },
    { id: 11, nombre: "Blanco", hex: "#FFFFFF", cantidad: 1 },
  ],
  talles: [
    { id: 51, nombre: "M", grupo_id: 5, grupo: "Ropa", cantidad: 2 },
    { id: 61, nombre: "40", grupo_id: 6, grupo: "Jeans", cantidad: 1 },
  ],
};

/** Simula el API y guarda los filtros con que se pidió cada listado. */
function simular({ productos = [productoEjemplo()] } = {}) {
  const pedidos = [];
  servidorMock.use(
    mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: categoriasEjemplo })),
    mock.get(`${API}/catalogo/productos/filtros`, () => HttpResponse.json({ ok: true, data: DISPONIBLES })),
    mock.get(`${API}/catalogo/productos`, ({ request }) => {
      pedidos.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json({ ok: true, data: productos, paginacion: paginacionDe(productos) });
    }),
  );
  return pedidos;
}

describe("Catálogo · filtros de marca, color y talle", () => {
  it("elegir un color y un talle filtra el listado y muestra los chips para quitarlos", async () => {
    const pedidos = simular();
    renderizar(<CatalogoPage />, { ruta: "/catalogo" });
    const filtros = within(await screen.findByRole("complementary", { name: "Filtros" }));

    await userEvent.click(await filtros.findByRole("button", { name: "Negro" }));
    await userEvent.click(filtros.getByRole("button", { name: "M (Ropa)" }));
    await vi.waitFor(() => expect(pedidos.at(-1)).toMatchObject({ color: "10", talle: "51" }));
    expect(filtros.getByRole("button", { name: "Negro" })).toHaveAttribute("aria-pressed", "true");

    const chips = within(screen.getByRole("group", { name: "Filtros aplicados" }));
    expect(chips.getAllByRole("button").map((b) => b.textContent)).toEqual(["Negro", "Talle M", "Limpiar filtros"]);
    await userEvent.click(chips.getByRole("button", { name: "Quitar filtro Negro" }));
    await vi.waitFor(() => expect(pedidos.at(-1)).not.toHaveProperty("color"));
    expect(pedidos.at(-1)).toMatchObject({ talle: "51" });
  });

  it("varias marcas se combinan y 'Limpiar filtros' saca todo", async () => {
    const pedidos = simular();
    renderizar(<CatalogoPage />, { ruta: "/catalogo" });
    const filtros = within(await screen.findByRole("complementary", { name: "Filtros" }));

    await userEvent.click(await filtros.findByRole("checkbox", { name: /Taverniti/ }));
    await userEvent.click(filtros.getByRole("checkbox", { name: /Levis/ }));
    await vi.waitFor(() => expect(pedidos.at(-1)).toMatchObject({ marca: "2,1" }));

    await userEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    await vi.waitFor(() => expect(pedidos.at(-1)).not.toHaveProperty("marca"));
    expect(screen.queryByRole("group", { name: "Filtros aplicados" })).not.toBeInTheDocument();
  });

  it("los filtros vienen de la URL y, sin resultados, explica que es por la combinación", async () => {
    const pedidos = simular({ productos: [] });
    renderizar(<CatalogoPage />, { ruta: "/catalogo?color=11&talle=61" });

    expect(await screen.findByText("No hay productos con esa combinación de filtros. Probá sacando alguno.")).toBeInTheDocument();
    expect(pedidos[0]).toMatchObject({ color: "11", talle: "61" });
    const chips = within(await screen.findByRole("group", { name: "Filtros aplicados" }));
    expect(chips.getByRole("button", { name: "Quitar filtro Talle 40" })).toBeInTheDocument();
  });

  it("al cambiar de categoría se limpian marca, color y talle", async () => {
    const pedidos = simular();
    renderizar(<CatalogoPage />, { ruta: "/catalogo?color=10" });
    const filtros = within(await screen.findByRole("complementary", { name: "Filtros" }));

    await userEvent.click(await filtros.findByRole("button", { name: /^Bebidas/ }));
    await vi.waitFor(() => expect(pedidos.at(-1)).toMatchObject({ categoria: "3" }));
    expect(pedidos.at(-1)).not.toHaveProperty("color");
  });
});

describe("Catálogo · filtros en el celular", () => {
  it("un botón 'Filtrar' con la cantidad elegida abre el panel con los filtros", async () => {
    const alternar = vi.fn();
    renderizar(<FiltrosCelular disponibles={DISPONIBLES} elegidos={{ color: "10" }} onAlternar={alternar} cantidadActivos={1} total={2} />);

    await userEvent.click(screen.getByRole("button", { name: "Filtrar (1)" }));
    const panel = within(screen.getByRole("dialog", { name: "Filtrar" }));
    await userEvent.click(panel.getByRole("button", { name: "Blanco" }));
    expect(alternar).toHaveBeenCalledWith("color", 11);

    await userEvent.click(panel.getByRole("button", { name: "Ver 2 resultados" }));
    expect(screen.queryByRole("dialog", { name: "Filtrar" })).not.toBeInTheDocument();
  });

  it("sin marcas, colores ni talles no muestra el botón", () => {
    renderizar(<FiltrosCelular disponibles={{ marcas: [], colores: [], talles: [] }} elegidos={{}} onAlternar={() => {}} />);
    expect(screen.queryByRole("button", { name: /Filtrar/ })).not.toBeInTheDocument();
  });
});
