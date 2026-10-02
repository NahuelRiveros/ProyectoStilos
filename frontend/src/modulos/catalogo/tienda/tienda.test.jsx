import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { proyecto } from "compartido/proyecto.js";
import { conDescuento, mejorDescuento } from "compartido/reglas/pagos.js";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import { categoriasEjemplo, paginacionDe, productoEjemplo } from "@/test/datos_catalogo.js";
import CatalogoPage from "./catalogo_page.jsx";
import ProductoDetallePage from "./producto_detalle_page.jsx";

const sinEspacios = (t) => t.replace(/\s/g, " ");

// El catálogo pide también qué marcas, colores y talles hay (para los filtros): por defecto, ninguno.
beforeEach(() => servidorMock.use(mock.get(`${API}/catalogo/productos/filtros`, () => HttpResponse.json({ ok: true, data: { marcas: [], colores: [], talles: [] } }))));

describe("Tienda · Catálogo", () => {
  it("muestra las tarjetas con precio 'desde' con IVA y la oferta", async () => {
    const producto = productoEjemplo();
    servidorMock.use(
      mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: categoriasEjemplo })),
      mock.get(`${API}/catalogo/productos`, () => HttpResponse.json({ ok: true, data: [producto], paginacion: paginacionDe([producto]) })),
    );
    renderizar(<CatalogoPage />, { ruta: "/catalogo" });

    const tarjeta = await screen.findByRole("link", { name: /Galletitas Oreo/ });
    expect(tarjeta).toHaveAttribute("href", "/catalogo/galletitas-oreo");
    expect(within(tarjeta).getByText("Desde")).toBeInTheDocument();
    expect(within(tarjeta).getByText("$ 1.210,00", { normalizer: sinEspacios, exact: false })).toBeInTheDocument();
    expect(within(tarjeta).getByText("IVA incluido")).toBeInTheDocument();

    // Solo se listan categorías con productos (Almacén aparece porque su subcategoría tiene)
    const categorias = screen.getByRole("complementary", { name: "Filtros" });
    expect(within(categorias).getByRole("button", { name: /^Almacén/ })).toBeInTheDocument();
  });

  it("una prenda muestra sus colores en la tarjeta y, con un solo precio, sin 'Desde'", async () => {
    const color = (id, nombre) => ({ id, nombre, hex: "#000000", orden: id });
    const remera = productoEjemplo({
      variantes: [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, nombre: `C${id} · M`, color_id: id, color: color(id, `Color ${id}`), precio: "1000.00", iva_porcentaje: "21.00", activo: true })),
    });
    servidorMock.use(
      mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: categoriasEjemplo })),
      mock.get(`${API}/catalogo/productos`, () => HttpResponse.json({ ok: true, data: [remera], paginacion: paginacionDe([remera]) })),
    );
    renderizar(<CatalogoPage />, { ruta: "/catalogo" });

    const tarjeta = await screen.findByRole("link", { name: /Galletitas Oreo/ });
    expect(within(tarjeta).getByText(/^Colores: Color 1, Color 2/)).toBeInTheDocument();
    expect(within(tarjeta).getByText("+2")).toBeInTheDocument();
    expect(within(tarjeta).queryByText("Desde")).not.toBeInTheDocument();
  });
});

describe("Tienda · Catálogo filtrado por color", () => {
  it("la tarjeta muestra la foto del color filtrado y abre la ficha en ese color", async () => {
    const color = (id, nombre) => ({ id, nombre, hex: "#000000", orden: id });
    const remera = productoEjemplo({
      variantes: [
        { id: 1, nombre: "Negro", color_id: 1, color: color(1, "Negro"), precio: "1000.00", iva_porcentaje: "21.00", activo: true },
        { id: 2, nombre: "Rojo", color_id: 2, color: color(2, "Rojo"), precio: "1000.00", iva_porcentaje: "21.00", activo: true },
      ],
      imagenes: [
        { id: 1, url: "https://cdn.test/negro.webp", alt: "", color_id: 1, orden: 0 },
        { id: 2, url: "https://cdn.test/rojo.webp", alt: "", color_id: 2, orden: 1 },
      ],
    });
    servidorMock.use(
      mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: categoriasEjemplo })),
      mock.get(`${API}/catalogo/productos`, () => HttpResponse.json({ ok: true, data: [remera], paginacion: paginacionDe([remera]) })),
    );
    renderizar(<CatalogoPage />, { ruta: "/catalogo?color=2" });

    const tarjeta = await screen.findByRole("link", { name: /Galletitas Oreo/ });
    expect(tarjeta).toHaveAttribute("href", "/catalogo/galletitas-oreo?color=2");
    expect(within(tarjeta).getByRole("img").getAttribute("src")).toContain("rojo");
  });
});

describe("Tienda · Ficha de una prenda (color y talle)", () => {
  const NEGRO = { id: 1, nombre: "Negro", hex: "#111111", orden: 0 };
  const BLANCO = { id: 2, nombre: "Blanco", hex: "#FFFFFF", orden: 1 };
  const S = { id: 51, nombre: "S", orden: 0 };
  const M = { id: 52, nombre: "M", orden: 1 };
  const v = (id, color, talle, disponibilidad = "disponible") => ({
    id, nombre: `${color.nombre} · ${talle.nombre}`, color_id: color.id, color, talle_id: talle.id, talle, precio: "1000.00", iva_porcentaje: "21.00", activo: true, disponibilidad,
  });
  const remera = productoEjemplo({
    variantes: [v(100, NEGRO, S), v(101, NEGRO, M), v(102, BLANCO, S, "sin_stock"), v(103, BLANCO, M)],
    imagenes: [
      { id: 1, url: "https://cdn.test/negro.webp", color_id: 1, orden: 0 },
      { id: 2, url: "https://cdn.test/blanco.webp", color_id: 2, orden: 1 },
    ],
  });

  function abrir(ruta = "/catalogo/galletitas-oreo") {
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: remera })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta },
    );
  }

  it("con ?color= en el link abre en ese color, en un talle con stock", async () => {
    abrir("/catalogo/galletitas-oreo?color=2");
    const colores = within(await screen.findByRole("group", { name: /^Color/ }));
    expect(colores.getByRole("radio", { name: "Blanco" })).toBeChecked();
    expect(within(screen.getByRole("group", { name: "Talle" })).getByRole("radio", { name: "M" })).toBeChecked();
    expect(screen.getAllByRole("img")[0].getAttribute("src")).toContain("blanco");
  });

  it("se elige el color y después el talle; al cambiar de color se conserva el talle", async () => {
    abrir();
    const colores = within(await screen.findByRole("group", { name: /^Color/ }));
    expect(colores.getByRole("radio", { name: "Negro" })).toBeChecked();
    const talles = () => within(screen.getByRole("group", { name: "Talle" }));
    expect(talles().getAllByRole("radio").map((r) => r.parentElement.textContent)).toEqual(["S", "M"]);

    await userEvent.click(talles().getByRole("radio", { name: "M" }));
    await userEvent.click(colores.getByRole("radio", { name: "Blanco" }));
    expect(talles().getByRole("radio", { name: "M" })).toBeChecked();
    expect(screen.getAllByRole("img")[0].getAttribute("src")).toContain("blanco");
  });

  it("al cambiar a un color donde ese talle no tiene stock, lo muestra elegido, tachado y con el aviso", async () => {
    abrir();
    await userEvent.click(within(await screen.findByRole("group", { name: /^Color/ })).getByRole("radio", { name: "Blanco" }));
    // Estaba en Negro · S (el primero con stock); Blanco · S no tiene stock, pero se conserva el talle para que se vea.
    const talleS = within(screen.getByRole("group", { name: "Talle" })).getByRole("radio", { name: /^S/ });
    expect(talleS).toBeChecked();
    expect(talleS.parentElement).toHaveClass("line-through");
    expect(talleS.parentElement).toHaveTextContent("S (sin stock)");
    expect(screen.getAllByText("Sin stock").length).toBeGreaterThan(0);
  });
});

describe("Tienda · Detalle de producto", () => {
  it("al elegir una variante de otro color, la galería muestra las fotos de ese color", async () => {
    const remera = productoEjemplo({
      variantes: [
        { id: 100, nombre: "Negro · S", color_id: 1, color: { id: 1, nombre: "Negro", hex: "#111111" }, precio: "1000.00", iva_porcentaje: "21.00", activo: true },
        { id: 101, nombre: "Blanco · S", color_id: 2, color: { id: 2, nombre: "Blanco", hex: "#FFFFFF" }, precio: "1000.00", iva_porcentaje: "21.00", activo: true },
      ],
      imagenes: [
        { id: 1, url: "https://cdn.test/negro.webp", color_id: 1, orden: 0 },
        { id: 2, url: "https://cdn.test/blanco.webp", color_id: 2, orden: 1 },
      ],
    });
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: remera })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/galletitas-oreo" },
    );

    const principal = () => screen.getAllByRole("img")[0].getAttribute("src");
    await screen.findByRole("heading", { level: 1, name: "Galletitas Oreo" });
    expect(principal()).toContain("negro");
    expect(screen.queryByRole("button", { name: "Ver imagen 2" })).not.toBeInTheDocument(); // solo las del negro

    await userEvent.click(screen.getByRole("radio", { name: "Blanco" }));
    expect(principal()).toContain("blanco");
  });

  it("cambia el precio al elegir otra presentación", async () => {
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: productoEjemplo() })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/galletitas-oreo" },
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Galletitas Oreo" })).toBeInTheDocument();
    expect(sinEspacios(screen.getByTestId("precio").textContent)).toBe("$ 1.210,00");

    await userEvent.click(screen.getByRole("radio", { name: "Familiar 300 g" }));
    expect(sinEspacios(screen.getByTestId("precio").textContent)).toBe("$ 2.420,00");
    expect(screen.getByText("$ 3.025,00", { normalizer: sinEspacios })).toHaveClass("line-through");
    expect(screen.getByRole("link", { name: "Galletitas" })).toHaveAttribute("href", "/catalogo?categoria=2");
  });

  it("muestra medios de pago, cuotas y promociones calculados sobre el precio elegido, y el CBU al pedirlo", async () => {
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: productoEjemplo() })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/galletitas-oreo" },
    );

    const seccion = (await screen.findByRole("heading", { name: "Medios de pago y financiación" })).closest("section");
    expect(within(seccion).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Métodos de pago", "Financiación y cuotas", "Promociones bancarias"]);

    // El precio con el mejor descuento (ej. transferencia) se calcula sobre la presentación elegida y cambia con ella
    const descuento = mejorDescuento();
    if (descuento) {
      const pesos = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
      expect(sinEspacios(screen.getByTestId("precio-con-descuento").textContent)).toBe(sinEspacios(pesos(conDescuento(1210, descuento.descuento).total)));
      await userEvent.click(screen.getByRole("radio", { name: "Familiar 300 g" }));
      expect(sinEspacios(screen.getByTestId("precio-con-descuento").textContent)).toBe(sinEspacios(pesos(conDescuento(2420, descuento.descuento).total)));
    }

    // Los datos para transferir están a un click
    const datos = proyecto.pagos.datos_transferencia;
    if (datos?.cbu) {
      await userEvent.click(within(seccion).getByText("Ver CBU y alias"));
      expect(within(seccion).getByText(datos.cbu)).toBeVisible();
      expect(within(seccion).getByRole("button", { name: "Copiar CBU" })).toBeInTheDocument();
    }
  });

  it("avisa si el producto no existe", async () => {
    servidorMock.use(
      mock.get(`${API}/catalogo/productos/no-existe`, () =>
        HttpResponse.json({ ok: false, codigo: "PRODUCTO_NO_ENCONTRADO", mensaje: "El producto no existe o no está disponible.", detalles: [] }, { status: 404 }),
      ),
    );
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/no-existe" },
    );
    expect(await screen.findByText("El producto no existe o no está disponible.")).toBeInTheDocument();
  });
});

describe("Tienda · Disponibilidad", () => {
  const conStock = (disponibilidades) =>
    productoEjemplo({ variantes: productoEjemplo().variantes.map((v, i) => ({ ...v, disponibilidad: disponibilidades[i] })) });

  it("marca el producto agotado cuando ninguna presentación tiene stock", async () => {
    const agotado = conStock(["sin_stock", "sin_stock"]);
    servidorMock.use(
      mock.get(`${API}/catalogo/categorias`, () => HttpResponse.json({ ok: true, data: categoriasEjemplo })),
      mock.get(`${API}/catalogo/productos`, () => HttpResponse.json({ ok: true, data: [agotado], paginacion: paginacionDe([agotado]) })),
    );
    renderizar(<CatalogoPage />, { ruta: "/catalogo" });
    const tarjeta = await screen.findByRole("link", { name: /Galletitas Oreo/ });
    expect(within(tarjeta).getByText("Sin stock")).toBeInTheDocument();
  });

  it("elige de entrada una presentación con stock y muestra el estado de la elegida", async () => {
    // La más barata (118 g) está sin stock: arranca en la Familiar
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: conStock(["sin_stock", "ultimas"]) })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/galletitas-oreo" },
    );

    expect(await screen.findByRole("radio", { name: "Familiar 300 g" })).toBeChecked();
    expect(screen.getByText("Últimas unidades")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /118 g.*sin stock/ }));
    // La etiqueta de disponibilidad y el botón de la tienda (deshabilitado) dicen "Sin stock"
    expect(screen.getAllByText("Sin stock")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sin stock" })).toBeDisabled();
  });
});

describe("Tienda · Disponibilidad vista por un admin", () => {
  it("aunque el API mande la cantidad (panel), la tienda muestra el estado según la configuración", async () => {
    const conCantidad = productoEjemplo({
      variantes: [{ ...productoEjemplo().variantes[0], disponibilidad: "ultimas", cantidad_disponible: 5 }],
    });
    servidorMock.use(mock.get(`${API}/catalogo/productos/galletitas-oreo`, () => HttpResponse.json({ ok: true, data: conCantidad })));
    renderizar(
      <Routes>
        <Route path="/catalogo/:slug" element={<ProductoDetallePage />} />
      </Routes>,
      { ruta: "/catalogo/galletitas-oreo" },
    );
    expect(await screen.findByText("Últimas unidades")).toBeInTheDocument();
    expect(screen.queryByText("Quedan 5")).not.toBeInTheDocument();
  });
});
