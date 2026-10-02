import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import { categoriasEjemplo, productoEjemplo } from "@/test/datos_catalogo.js";
import ProductoFormPage from "./producto_form_page.jsx";

// Este archivo prueba el modo indumentaria ("talle_color") con stock, sea cual sea el cliente activo.
vi.mock("compartido/proyecto.js", async (original) => {
  const { proyecto: real } = await original();
  return { proyecto: { ...real, modulos: { ...real.modulos, stock: true }, catalogo: { ...real.catalogo, variantes: "talle_color" } } };
});

const COLORES = [
  { id: 1, nombre: "Negro", hex: "#111111", orden: 0 },
  { id: 2, nombre: "Blanco", hex: "#FFFFFF", orden: 1 },
];
const GRUPOS = [
  { id: 5, nombre: "Ropa", orden: 0, talles: [{ id: 51, nombre: "S", orden: 0 }, { id: 52, nombre: "M", orden: 1 }, { id: 53, nombre: "L", orden: 2 }] },
  { id: 6, nombre: "Jeans", orden: 1, talles: [{ id: 61, nombre: "40", orden: 0 }] },
];

const lista = (ruta, data) => mock.get(`${API}/catalogo/${ruta}`, () => HttpResponse.json({ ok: true, data }));

function renderizarFormulario(ruta) {
  return renderizar(
    <Routes>
      <Route path="/admin/catalogo/productos" element={<p>Listado de productos</p>} />
      <Route path="/admin/catalogo/productos/nuevo" element={<ProductoFormPage />} />
      <Route path="/admin/catalogo/productos/:id" element={<ProductoFormPage />} />
    </Routes>,
    { ruta },
  );
}

async function completarDatos() {
  const datos = (await screen.findByRole("heading", { name: "Datos del producto" })).closest("section");
  await userEvent.type(within(datos).getByLabelText(/^Nombre/), "Remera Taverniti lisa");
  await userEvent.selectOptions(within(datos).getByLabelText(/^Categoría/), "3");
}

describe("Admin · Producto con talles y colores", () => {
  beforeEach(() => servidorMock.use(lista("categorias", categoriasEjemplo), lista("marcas", []), lista("colores", COLORES), lista("grupos-talle", GRUPOS)));

  it("guía al que carga: pasos abiertos al crear y ayuda debajo de cada campo", async () => {
    renderizarFormulario("/admin/catalogo/productos/nuevo");
    const guia = (await screen.findByText("Cómo cargar un producto, paso a paso")).closest("details");
    expect(guia).toHaveAttribute("open");
    expect(within(guia).getByText(/hasta 4 fotos de cada color/)).toBeInTheDocument();

    expect(screen.getByLabelText(/^Nombre/)).toHaveAccessibleDescription(/Sin color ni talle/);
    expect(screen.getByLabelText(/^Categoría/)).toHaveAccessibleDescription(/Dónde aparece en la tienda/);
    expect(screen.getByLabelText("Marca")).toHaveAccessibleDescription(/tocá «Nueva»/);
    expect(screen.getByLabelText(/^Grupo de talles/)).toHaveAccessibleDescription(/Ropa \(S a XXXL\)/);
  });

  it("al editar, la guía queda cerrada para no ocupar lugar", async () => {
    servidorMock.use(lista("productos/10", productoEjemplo()));
    renderizarFormulario("/admin/catalogo/productos/10");
    const guia = (await screen.findByText("Cómo cargar un producto, paso a paso")).closest("details");
    expect(guia).not.toHaveAttribute("open");
  });

  it("arma una variante por color y talle, con el mismo precio y el stock inicial de cada una", async () => {
    let enviado;
    servidorMock.use(
      mock.post(`${API}/catalogo/productos`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ok: true, data: productoEjemplo() }, { status: 201 });
      }),
      lista("productos/10", productoEjemplo()),
    );
    renderizarFormulario("/admin/catalogo/productos/nuevo");
    await completarDatos();

    await userEvent.type(screen.getByLabelText(/^Precio neto/), "15000");
    await userEvent.click(await screen.findByRole("button", { name: "Blanco" }));
    await userEvent.click(screen.getByRole("button", { name: "Negro" }));
    await userEvent.selectOptions(screen.getByLabelText(/^Grupo de talles/), "Ropa");
    await userEvent.click(screen.getByRole("button", { name: "M" }));
    await userEvent.click(screen.getByRole("button", { name: "S" }));

    // En el orden de las listas del panel: Negro antes que Blanco, S antes que M.
    const negro = screen.getByRole("region", { name: "Color Negro" });
    expect(within(negro).getAllByRole("listitem").map((li) => li.getAttribute("aria-label"))).toEqual(["Negro · S", "Negro · M"]);
    await userEvent.type(within(negro).getByLabelText("Stock inicial de Negro · S"), "4");
    await userEvent.type(within(negro).getByLabelText("Código de Negro · S"), "TAV-N-S");
    await userEvent.click(within(screen.getByRole("region", { name: "Color Blanco" })).getAllByLabelText("A la venta")[1]);

    await userEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(await screen.findByRole("heading", { name: "Editar Galletitas Oreo" })).toBeInTheDocument();

    expect(enviado).toMatchObject({ nombre: "Remera Taverniti lisa", grupo_talle_id: 5 });
    expect(enviado.variantes).toEqual([
      expect.objectContaining({ color_id: 1, talle_id: 51, sku: "TAV-N-S", stock_inicial: 4, precio: 15000, activo: true }),
      expect.objectContaining({ color_id: 1, talle_id: 52, sku: null, precio: 15000 }),
      expect.objectContaining({ color_id: 2, talle_id: 51, precio: 15000, activo: true }),
      expect.objectContaining({ color_id: 2, talle_id: 52, precio: 15000, activo: false }),
    ]);
    expect(enviado.variantes[1].stock_inicial).toBeUndefined();
  });

  it("sin colores ni talles avisa que falta armar las combinaciones", async () => {
    renderizarFormulario("/admin/catalogo/productos/nuevo");
    await completarDatos();
    await userEvent.type(screen.getByLabelText(/^Precio neto/), "15000");
    await userEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(await screen.findByText(/El producto necesita al menos 1/)).toBeInTheDocument();
  });

  it("al cambiar de grupo se borran los talles elegidos del grupo anterior", async () => {
    renderizarFormulario("/admin/catalogo/productos/nuevo");
    await completarDatos();
    await userEvent.click(await screen.findByRole("button", { name: "Negro" }));
    await userEvent.selectOptions(screen.getByLabelText(/^Grupo de talles/), "Ropa");
    await userEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(within(screen.getByRole("region", { name: "Color Negro" })).getAllByRole("listitem")).toHaveLength(3);

    await userEvent.selectOptions(screen.getByLabelText(/^Grupo de talles/), "Jeans");
    expect(within(screen.getByRole("region", { name: "Color Negro" })).getAllByRole("listitem").map((li) => li.getAttribute("aria-label"))).toEqual(["Negro"]);
  });

  it("al editar muestra el stock de lo que ya existe y lo manda con su id", async () => {
    let enviado;
    const remera = productoEjemplo({
      nombre: "Remera",
      grupo_talle_id: 5,
      variantes: [
        { id: 200, nombre: "Negro · S", color_id: 1, talle_id: 51, color: COLORES[0], talle: GRUPOS[0].talles[0], sku: "R-N-S", precio: "15000.00", precio_anterior: null, iva_porcentaje: "21.00", activo: true, controla_stock: true, cantidad_disponible: 7 },
      ],
    });
    servidorMock.use(
      lista("productos/10", remera),
      mock.put(`${API}/catalogo/productos/10`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ok: true, data: remera });
      }),
    );
    renderizarFormulario("/admin/catalogo/productos/10");

    const negro = await screen.findByRole("region", { name: "Color Negro" });
    expect(within(negro).getByText("Stock: 7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negro" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(await screen.findByRole("button", { name: "M" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await vi.waitFor(() => expect(enviado).toBeDefined());
    expect(enviado.variantes).toEqual([
      expect.objectContaining({ id: 200, color_id: 1, talle_id: 51, sku: "R-N-S", controla_stock: true, precio: 15000 }),
      expect.objectContaining({ color_id: 1, talle_id: 52, precio: 15000 }),
    ]);
    expect(enviado.variantes[0]).not.toHaveProperty("stock_inicial");
  });
});
