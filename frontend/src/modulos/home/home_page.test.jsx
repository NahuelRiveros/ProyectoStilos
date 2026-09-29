import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cliente } from "@/clientes/index.js";
import { renderizar } from "@/test/renderizar.jsx";
import HomePage from "./home_page.jsx";

// Los textos salen de la config del cliente activo: el test sirve para cualquier cliente.
const seccion = (tipo) => cliente.home.secciones.find((s) => s.tipo === tipo);

describe("HomePage", () => {
  it("arma las secciones desde la configuración del cliente activo", () => {
    renderizar(<HomePage />);

    const pilares = seccion("pilares");
    expect(screen.getByRole("heading", { level: 1, name: seccion("hero").titulo })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: pilares.titulo })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: pilares.items[0].titulo })).toBeInTheDocument();
  });

  it("muestra los pasos numerados y links de contacto seguros", () => {
    renderizar(<HomePage />);

    const pasos = seccion("pasos");
    const bloque = within(document.getElementById(pasos.id));
    expect(bloque.getByText("01")).toBeInTheDocument();
    expect(bloque.getByText(String(pasos.items.length).padStart(2, "0"))).toBeInTheDocument();

    const externo = seccion("contacto").items.find((item) => item.href?.startsWith("https://"));
    const link = screen.getByRole("link", { name: externo.valor });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
