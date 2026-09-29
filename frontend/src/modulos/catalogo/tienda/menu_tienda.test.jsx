import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { nombreProductos, verProductos } from "@/clientes/index.js";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import MenuTienda from "./menu_tienda.jsx";

const cat = (id, nombre, extra = {}) => ({ id, nombre, slug: nombre.toLowerCase(), padre_id: null, orden: id, en_menu: false, cantidad_productos: 1, ...extra });
// Mujer y Hombre tienen subcategorías propias (el "Jean" de mujer no es el de hombre).
const ROPA = [
  cat(1, "Mujer", { en_menu: true, cantidad_productos: 0 }),
  cat(2, "Jeans", { padre_id: 1, cantidad_productos: 4 }),
  cat(3, "Remeras", { padre_id: 1, cantidad_productos: 2 }),
  cat(4, "Vestidos", { padre_id: 1, cantidad_productos: 0 }), // vacía: no se ofrece
  cat(5, "Hombre", { en_menu: true, cantidad_productos: 0 }),
  cat(6, "Jeans", { padre_id: 5, cantidad_productos: 3 }),
  cat(7, "Liquidación", { en_menu: false }),
];
const categorias = (lista) => servidorMock.use(mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: lista })));

describe("Menú Tienda (desplegable con columnas) · escritorio", () => {
  it("un solo botón abre una columna por categoría del menú con sus subcategorías", async () => {
    categorias(ROPA);
    renderizar(<MenuTienda modo="marcadas" variante="escritorio" />);

    const boton = await screen.findByRole("button", { name: nombreProductos });
    expect(screen.queryByRole("link", { name: "Mujer" })).not.toBeInTheDocument();

    await userEvent.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    const mujer = within(screen.getByRole("region", { name: "Mujer" }));
    expect(mujer.getByRole("link", { name: "Mujer" })).toHaveAttribute("href", "/catalogo?categoria=1");
    expect(mujer.getByRole("link", { name: "Jeans" })).toHaveAttribute("href", "/catalogo?categoria=2");
    expect(mujer.queryByRole("link", { name: "Vestidos" })).not.toBeInTheDocument();
    const hombre = within(screen.getByRole("region", { name: "Hombre" }));
    expect(hombre.getByRole("link", { name: "Jeans" })).toHaveAttribute("href", "/catalogo?categoria=6");
    expect(screen.queryByText("Liquidación")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: verProductos })).toHaveAttribute("href", "/catalogo");

    await userEvent.keyboard("{Escape}");
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(boton).toHaveFocus();
  });

  it("elegir una subcategoría cierra el panel", async () => {
    categorias(ROPA);
    renderizar(<MenuTienda modo="marcadas" variante="escritorio" />);

    const boton = await screen.findByRole("button", { name: nombreProductos });
    await userEvent.click(boton);
    await userEvent.click(within(screen.getByRole("region", { name: "Mujer" })).getByRole("link", { name: "Remeras" }));
    expect(boton).toHaveAttribute("aria-expanded", "false");
  });

  it("si todavía no hay categorías marcadas, muestra el link de productos", async () => {
    categorias([cat(1, "Mujer")]);
    renderizar(<MenuTienda modo="marcadas" variante="escritorio" />);
    expect(await screen.findByRole("link", { name: nombreProductos })).toHaveAttribute("href", "/catalogo");
  });
});

describe("Menú Tienda · celular", () => {
  it("se abre en grupos por categoría, y elegir una cierra el menú", async () => {
    categorias(ROPA);
    const onNavegar = vi.fn();
    renderizar(<MenuTienda modo="marcadas" variante="celular" onNavegar={onNavegar} />);

    await userEvent.click(await screen.findByRole("button", { name: nombreProductos }));
    expect(screen.getByRole("link", { name: verProductos })).toHaveAttribute("href", "/catalogo");
    const hombre = screen.getByRole("button", { name: "Hombre" });
    await userEvent.click(hombre);
    const grupo = document.getElementById(hombre.getAttribute("aria-controls"));
    expect(within(grupo).getAllByRole("link").map((l) => l.textContent)).toEqual(["Ver todo Hombre", "Jeans"]);

    await userEvent.click(within(grupo).getByRole("link", { name: "Jeans" }));
    expect(onNavegar).toHaveBeenCalled();
  });
});
