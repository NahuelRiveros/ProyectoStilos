import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { nombreProductos } from "@/clientes/index.js";
import { renderizar } from "@/test/renderizar.jsx";
import FiltroCategoriasArbol from "./filtro_categorias_arbol.jsx";
import FiltroCategoriasNiveles from "./filtro_categorias_niveles.jsx";

const ROPA = [
  { id: 1, nombre: "Mujer", padre_id: null, cantidad_productos: 0 },
  { id: 2, nombre: "Jeans", padre_id: 1, cantidad_productos: 4 },
  { id: 3, nombre: "Remeras", padre_id: 1, cantidad_productos: 2 },
  { id: 4, nombre: "Vestidos", padre_id: 1, cantidad_productos: 0 },
  { id: 5, nombre: "Hombre", padre_id: null, cantidad_productos: 0 },
  { id: 6, nombre: "Jeans", padre_id: 5, cantidad_productos: 3 },
];

describe("Filtro por niveles · escritorio", () => {
  it("sin categoría elegida muestra solo las principales, con su cantidad", async () => {
    const onElegir = vi.fn();
    renderizar(<FiltroCategoriasNiveles lugar="lateral" categorias={ROPA} seleccionada="" onElegir={onElegir} />);

    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Mujer6 productos", "Hombre3 productos"]);
    expect(screen.queryByRole("button", { name: /^Jeans/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Mujer/ }));
    expect(onElegir).toHaveBeenCalledWith("1");
  });

  it("dentro de Mujer muestra solo sus subcategorías con productos, 'Ver todo' y 'Volver'", async () => {
    const onElegir = vi.fn();
    renderizar(<FiltroCategoriasNiveles lugar="lateral" categorias={ROPA} seleccionada="1" onElegir={onElegir} />);

    expect(screen.getByRole("heading", { name: "Mujer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver todo" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /^Jeans/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Vestidos/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Hombre/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: `Volver a ${nombreProductos}` }));
    expect(onElegir).toHaveBeenCalledWith("");
  });

  it("en una subcategoría final la marca entre sus hermanas", () => {
    renderizar(<FiltroCategoriasNiveles lugar="lateral" categorias={ROPA} seleccionada="3" onElegir={() => {}} />);
    expect(screen.getByRole("button", { name: /^Remeras/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /^Jeans/ })).not.toHaveAttribute("aria-current");
  });
});

describe("Filtro por niveles · arriba (camino de migas y chips)", () => {
  it("muestra la ruta y cada parte sube de nivel", async () => {
    const onElegir = vi.fn();
    renderizar(<FiltroCategoriasNiveles lugar="arriba" categorias={ROPA} seleccionada="6" onElegir={onElegir} />);

    const migas = within(screen.getByRole("navigation", { name: "Estás en" }));
    expect(migas.getByText("Jeans")).toHaveAttribute("aria-current", "page");
    await userEvent.click(migas.getByRole("button", { name: "Hombre" }));
    expect(onElegir).toHaveBeenCalledWith("5");
  });

  it("los chips son las opciones del nivel, con 'Todo' para la categoría actual", async () => {
    const onElegir = vi.fn();
    renderizar(<FiltroCategoriasNiveles lugar="arriba" categorias={ROPA} seleccionada="1" onElegir={onElegir} />);

    const chips = within(screen.getByRole("list", { name: "Categorías" }));
    expect(chips.getAllByRole("button").map((b) => b.textContent)).toEqual(["Todo", "Jeans", "Remeras"]);
    await userEvent.click(chips.getByRole("button", { name: "Remeras" }));
    expect(onElegir).toHaveBeenCalledWith("3");
  });

  it("sin categoría elegida no muestra camino de migas", () => {
    renderizar(<FiltroCategoriasNiveles lugar="arriba" categorias={ROPA} seleccionada="" onElegir={() => {}} />);
    expect(screen.queryByRole("navigation", { name: "Estás en" })).not.toBeInTheDocument();
  });
});

describe("Filtro con árbol completo (el de siempre)", () => {
  it("muestra todo el árbol con productos y 'Todas'", async () => {
    const onElegir = vi.fn();
    renderizar(<FiltroCategoriasArbol lugar="lateral" categorias={ROPA} seleccionada="" onElegir={onElegir} />);

    expect(screen.getAllByRole("button", { name: "Jeans" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Vestidos" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(onElegir).toHaveBeenCalledWith("");
  });
});
