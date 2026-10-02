import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import { categoriasEjemplo, productoEjemplo } from "@/test/datos_catalogo.js";
import AjustePreciosModal from "./ajuste_precios_modal.jsx";
import GaleriaFotos from "./galeria_fotos.jsx";
import ImagenesProducto from "./imagenes_producto.jsx";

const sinEspacios = (t) => t.replace(/\s/g, " ");

describe("Admin · Ajuste masivo de precios", () => {
  function simular() {
    const cuerpos = [];
    servidorMock.use(
      mock.post(`${API}/catalogo/precios/ajuste`, async ({ request }) => {
        const cuerpo = await request.json();
        cuerpos.push(cuerpo);
        return HttpResponse.json({
          ok: true,
          data: cuerpo.simular
            ? { cantidad: 2, aplicado: false, ejemplos: [{ producto: "Oreo", presentacion: "118 g", antes: "1000.00", despues: "1100.00", iva_porcentaje: "21.00" }] }
            : { cantidad: 2, aplicado: true, ejemplos: [] },
        });
      }),
    );
    return cuerpos;
  }

  it("muestra la vista previa con precios en tienda y después aplica", async () => {
    const cuerpos = simular();
    const onCerrar = vi.fn();
    renderizar(<AjustePreciosModal categorias={categoriasEjemplo} onCerrar={onCerrar} />);

    await userEvent.selectOptions(screen.getByLabelText("Categoría"), "1");
    await userEvent.type(screen.getByLabelText("Porcentaje"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Ver vista previa" }));

    expect(await screen.findByText("Se van a actualizar 2 presentación(es).")).toBeInTheDocument();
    expect(screen.getByText("$ 1.331,00", { normalizer: sinEspacios })).toBeInTheDocument(); // 1100 + IVA
    expect(cuerpos[0]).toMatchObject({ porcentaje: 10, categoria_id: 1, simular: true });

    await userEvent.click(screen.getByRole("button", { name: "Aplicar a 2" }));
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
    expect(cuerpos[1]).toMatchObject({ simular: false, categoria_id: 1 });
  });

  it("si cambia el porcentaje hay que volver a ver la vista previa", async () => {
    simular();
    renderizar(<AjustePreciosModal categorias={categoriasEjemplo} onCerrar={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText("Categoría"), "1");
    await userEvent.type(screen.getByLabelText("Porcentaje"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Ver vista previa" }));
    await screen.findByRole("button", { name: "Aplicar a 2" });

    await userEvent.type(screen.getByLabelText("Porcentaje"), "0");
    expect(screen.queryByRole("button", { name: "Aplicar a 2" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver vista previa" })).toBeInTheDocument();
  });

  it("todo el catálogo pide confirmación explícita", async () => {
    const cuerpos = simular();
    renderizar(<AjustePreciosModal categorias={categoriasEjemplo} onCerrar={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Todo el catálogo" }));
    await userEvent.type(screen.getByLabelText("Porcentaje"), "-5");
    await userEvent.click(screen.getByRole("button", { name: "Ver vista previa" }));
    await userEvent.click(await screen.findByRole("button", { name: "Aplicar a 2" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Tildá la confirmación");
    expect(cuerpos).toHaveLength(1); // no se aplicó
  });

  it("valida antes de llamar al servidor", async () => {
    const cuerpos = simular();
    renderizar(<AjustePreciosModal categorias={categoriasEjemplo} onCerrar={() => {}} />);
    await userEvent.type(screen.getByLabelText("Porcentaje"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Ver vista previa" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Elegí una categoría o confirmá aplicar a todo el catálogo");
    expect(cuerpos).toHaveLength(0);
  });
});

describe("Admin · Imágenes del producto", () => {
  const conImagenes = productoEjemplo({
    imagenes: [
      { id: 1, url: "https://cdn.test/a.webp", alt: "A", orden: 0 },
      { id: 2, url: "https://cdn.test/b.webp", alt: "B", orden: 1 },
    ],
  });

  it("marca la principal y reordena", async () => {
    let orden;
    servidorMock.use(
      mock.put(`${API}/catalogo/productos/10/imagenes/orden`, async ({ request }) => {
        orden = (await request.json()).ids;
        return HttpResponse.json({ ok: true, data: [] });
      }),
    );
    renderizar(<ImagenesProducto producto={conImagenes} />);

    const lista = screen.getByRole("list", { name: "Imágenes del producto" });
    expect(within(lista).getByText("Principal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mover imagen 1 antes" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Mover imagen 2 antes" }));
    await waitFor(() => expect(orden).toEqual([2, 1]));
  });

  it("sube archivos elegidos y explica si el servicio no está configurado", async () => {
    const subidas = [];
    servidorMock.use(
      // El multipart real se prueba en el servidor (supertest); jsdom no lo arma igual que un navegador.
      mock.post(`${API}/catalogo/productos/10/imagenes`, () => {
        subidas.push("llamada");
        return HttpResponse.json(
          { ok: false, codigo: "IMAGENES_NO_CONFIGURADAS", mensaje: "La subida de imágenes todavía no está configurada.", detalles: [] },
          { status: 503 },
        );
      }),
    );
    renderizar(<ImagenesProducto producto={conImagenes} />);

    await userEvent.upload(screen.getByLabelText("Elegir imágenes"), new File(["x"], "foto.png", { type: "image/png" }));
    expect(await screen.findByText("La subida de imágenes todavía no está configurada.")).toBeInTheDocument();
    expect(subidas).toEqual(["llamada"]);
  });

  it("agrega una imagen pegando su dirección", async () => {
    let cuerpo;
    servidorMock.use(
      mock.post(`${API}/catalogo/productos/10/imagenes/url`, async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({ ok: true, data: { id: 3 } }, { status: 201 });
      }),
    );
    renderizar(<ImagenesProducto producto={conImagenes} />);

    await userEvent.type(screen.getByLabelText("O pegá la dirección de una imagen"), "https://web.com/c.jpg");
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    await waitFor(() => expect(cuerpo).toEqual({ url: "https://web.com/c.jpg", color_id: null }));
  });
});

describe("Admin · Fotos por color", () => {
  const NEGRO = { id: 1, nombre: "Negro", hex: "#111111", orden: 0 };
  const BLANCO = { id: 2, nombre: "Blanco", hex: "#FFFFFF", orden: 1 };
  const remera = (imagenes) =>
    productoEjemplo({
      variantes: [
        { id: 100, nombre: "Negro · S", color_id: 1, color: NEGRO, precio: "1000.00", iva_porcentaje: "21.00", activo: true },
        { id: 101, nombre: "Blanco · S", color_id: 2, color: BLANCO, precio: "1000.00", iva_porcentaje: "21.00", activo: true },
      ],
      imagenes,
    });
  const conFotos = remera([
    { id: 1, url: "https://cdn.test/negro.webp", alt: "N", color_id: 1, orden: 0 },
    { id: 2, url: "https://cdn.test/general.webp", alt: "G", color_id: null, orden: 1 },
    { id: 3, url: "https://cdn.test/negro2.webp", alt: "N2", color_id: 1, orden: 2 },
  ]);
  const altDe = (lista) => within(lista).getAllByRole("img").map((i) => i.getAttribute("alt"));

  it("arriba quedan solo las generales y explica que las de cada color van en su tarjeta", () => {
    renderizar(<ImagenesProducto producto={conFotos} />);
    expect(screen.getByRole("heading", { name: "Fotos generales" })).toBeInTheDocument();
    expect(screen.getByText(/Las fotos de cada color se suben más abajo, en la tarjeta de ese color/)).toBeInTheDocument();
    expect(altDe(screen.getByRole("list", { name: "Fotos: fotos generales" }))).toEqual(["G"]);
    expect(screen.getByText(/Ahora la principal es una foto de Negro/)).toBeInTheDocument();
  });

  it("la galería de un color muestra solo sus fotos y lo que se agrega queda con ese color", async () => {
    let cuerpo;
    servidorMock.use(
      mock.post(`${API}/catalogo/productos/10/imagenes/url`, async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({ ok: true, data: { id: 4 } }, { status: 201 });
      }),
    );
    renderizar(<GaleriaFotos producto={conFotos} fotosDe={1} />);

    expect(altDe(screen.getByRole("list", { name: "Fotos: fotos de Negro" }))).toEqual(["N", "N2"]);
    expect(screen.getByRole("button", { name: /^Subir fotos de Negro/ })).toBeInTheDocument();

    // Enter en la dirección agrega la foto (no envía el formulario del producto que la contiene).
    await userEvent.type(screen.getByLabelText("O pegá la dirección de una foto (Negro)"), "https://web.com/n3.jpg{Enter}");
    await waitFor(() => expect(cuerpo).toEqual({ url: "https://web.com/n3.jpg", color_id: 1 }));
  });

  it("cambia el color de una foto, reordena entre las de ese color y elige la principal", async () => {
    let color;
    const ordenes = [];
    servidorMock.use(
      mock.patch(`${API}/catalogo/productos/10/imagenes/3`, async ({ request }) => {
        color = (await request.json()).color_id;
        return HttpResponse.json({ ok: true, data: {} });
      }),
      mock.put(`${API}/catalogo/productos/10/imagenes/orden`, async ({ request }) => {
        ordenes.push((await request.json()).ids);
        return HttpResponse.json({ ok: true, data: [] });
      }),
    );
    renderizar(<GaleriaFotos producto={conFotos} fotosDe={1} />);

    await userEvent.selectOptions(screen.getByLabelText("Color de la imagen 3"), "Blanco");
    await waitFor(() => expect(color).toBe(2));

    // La 3 (negra) pasa antes que la 1 (negra); la general queda en su lugar.
    await userEvent.click(screen.getByRole("button", { name: "Mover imagen 3 antes" }));
    await waitFor(() => expect(ordenes[0]).toEqual([3, 2, 1]));

    expect(screen.getByRole("button", { name: "La imagen 1 es la principal" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Usar la imagen 3 como principal" }));
    await waitFor(() => expect(ordenes[1]).toEqual([3, 1, 2]));
  });

  it("un color completo no deja subir más y no se le pueden pasar fotos", async () => {
    const negras = [1, 2, 3, 4].map((n) => ({ id: n, url: `https://cdn.test/n${n}.webp`, alt: `N${n}`, color_id: 1, orden: n }));
    const llena = remera([...negras, { id: 5, url: "https://cdn.test/g.webp", alt: "G", color_id: null, orden: 5 }]);
    renderizar(<GaleriaFotos producto={llena} fotosDe={1} />);

    expect(screen.getByRole("status")).toHaveTextContent("Ya están las 4 fotos de Negro (el máximo). Quitá una para subir otra.");
    expect(screen.queryByLabelText("Elegir fotos de Negro")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/O pegá la dirección/)).not.toBeInTheDocument();
  });

  it("en la galería general, Negro completo aparece deshabilitado y Blanco no", () => {
    const negras = [1, 2, 3, 4].map((n) => ({ id: n, url: `https://cdn.test/n${n}.webp`, alt: `N${n}`, color_id: 1, orden: n }));
    renderizar(<GaleriaFotos producto={remera([...negras, { id: 5, url: "https://cdn.test/g.webp", alt: "G", color_id: null, orden: 5 }])} fotosDe={null} />);
    const selector = screen.getByLabelText("Color de la imagen 5");
    expect(within(selector).getByRole("option", { name: "Negro · completo" })).toBeDisabled();
    expect(within(selector).getByRole("option", { name: "Blanco" })).toBeEnabled();
  });
});
