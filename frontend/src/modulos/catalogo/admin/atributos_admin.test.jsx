import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mock, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { API, servidorMock } from "@/test/servidor_mock.js";
import { renderizar } from "@/test/renderizar.jsx";
import ColoresPage from "./colores_page.jsx";
import MarcasPage from "./marcas_page.jsx";
import TallesPage from "./talles_page.jsx";

const lista = (ruta, data) => mock.get(`${API}/catalogo/${ruta}`, () => HttpResponse.json({ ok: true, data }));

describe("Admin · Marcas", () => {
  it("crea una marca", async () => {
    let enviado;
    servidorMock.use(
      lista("marcas", [{ id: 1, nombre: "Adidas" }]),
      mock.post(`${API}/catalogo/marcas`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ok: true, data: { id: 2, ...enviado } }, { status: 201 });
      }),
    );
    renderizar(<MarcasPage />);

    expect(await screen.findByText("Adidas")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nueva marca" }));
    const dialogo = screen.getByRole("dialog", { name: "Nueva marca" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), "Taverniti");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Marca creada")).toBeInTheDocument();
    expect(enviado).toEqual({ nombre: "Taverniti" });
  });

  it("muestra el aviso del servidor si la marca ya existe", async () => {
    servidorMock.use(
      lista("marcas", []),
      mock.post(`${API}/catalogo/marcas`, () =>
        HttpResponse.json({ ok: false, codigo: "MARCA_DUPLICADA", mensaje: 'Ya existe la marca "Taverniti".', detalles: [] }, { status: 409 }),
      ),
    );
    renderizar(<MarcasPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Nueva marca" }));
    const dialogo = screen.getByRole("dialog", { name: "Nueva marca" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), "Taverniti");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));

    expect(await within(dialogo).findByText('Ya existe la marca "Taverniti".')).toBeInTheDocument();
  });
});

describe("Admin · Colores", () => {
  it("crea un color escribiendo el código y lo manda en mayúsculas", async () => {
    let enviado;
    servidorMock.use(
      lista("colores", []),
      mock.post(`${API}/catalogo/colores`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ok: true, data: { id: 1, ...enviado } }, { status: 201 });
      }),
    );
    renderizar(<ColoresPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Nuevo color" }));
    const dialogo = screen.getByRole("dialog", { name: "Nuevo color" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), "Azul marino");
    const codigo = within(dialogo).getByLabelText(/^Código/);
    await userEvent.clear(codigo);
    await userEvent.type(codigo, "#1f2a44");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Color creado")).toBeInTheDocument();
    expect(enviado).toEqual({ nombre: "Azul marino", hex: "#1F2A44", orden: 0 });
  });

  it("no deja guardar un código inválido", async () => {
    servidorMock.use(lista("colores", []));
    renderizar(<ColoresPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Nuevo color" }));
    const dialogo = screen.getByRole("dialog", { name: "Nuevo color" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), "Rojo");
    const codigo = within(dialogo).getByLabelText(/^Código/);
    await userEvent.clear(codigo);
    await userEvent.type(codigo, "rojo");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));

    expect(await within(dialogo).findByText("El color tiene que tener el formato #RRGGBB")).toBeInTheDocument();
  });
});

describe("Admin · Talles", () => {
  it("arma un grupo pegando varios talles, los reordena y los manda en ese orden", async () => {
    let enviado;
    servidorMock.use(
      lista("grupos-talle", []),
      mock.post(`${API}/catalogo/grupos-talle`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ok: true, data: { id: 1, ...enviado } }, { status: 201 });
      }),
    );
    renderizar(<TallesPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Nuevo grupo" }));
    const dialogo = screen.getByRole("dialog", { name: "Nuevo grupo de talles" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre del grupo/), "Ropa");
    await userEvent.type(within(dialogo).getByLabelText("Agregar talles"), "M, S L m{Enter}");

    const talles = within(within(dialogo).getByRole("list", { name: "Talles del grupo" }));
    expect(talles.getAllByRole("textbox").map((i) => i.value)).toEqual(["M", "S", "L"]); // "m" repetido no se suma
    await userEvent.click(talles.getByRole("button", { name: "Subir talle 2" }));

    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Grupo creado")).toBeInTheDocument();
    expect(enviado).toEqual({ nombre: "Ropa", orden: 0, talles: [{ nombre: "S" }, { nombre: "M" }, { nombre: "L" }] });
  });

  it("no deja guardar un grupo sin talles", async () => {
    servidorMock.use(lista("grupos-talle", []));
    renderizar(<TallesPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Nuevo grupo" }));
    const dialogo = screen.getByRole("dialog", { name: "Nuevo grupo de talles" });
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre del grupo/), "Ropa");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));

    expect(await within(dialogo).findByText("Agregá al menos un talle")).toBeInTheDocument();
  });

  it("muestra cada grupo con sus talles en orden", async () => {
    servidorMock.use(lista("grupos-talle", [{ id: 1, nombre: "Jeans", orden: 0, talles: [{ id: 1, nombre: "38", orden: 0 }, { id: 2, nombre: "40", orden: 1 }] }]));
    renderizar(<TallesPage />);

    const jeans = await screen.findByRole("list", { name: "Talles de Jeans" });
    expect(within(jeans).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["38", "40"]);
  });
});
