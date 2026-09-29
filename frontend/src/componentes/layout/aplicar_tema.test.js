import { afterEach, describe, expect, it } from "vitest";
import { aplicarTema } from "./aplicar_tema.js";

const URL_FUENTES = "https://fonts.googleapis.com/css2?family=DM+Sans&display=swap";
const hojasDeFuentes = () => [...document.querySelectorAll("link")].filter((l) => l.getAttribute("href") === URL_FUENTES);

describe("aplicarTema", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("style");
  });

  it("pisa los tokens de color y fuente y pone el título de la marca", () => {
    aplicarTema({
      tema: { colores: { primario: "#2E394B" }, fuentes: { titulos: "Georgia, serif" } },
      marca: { nombre: "Mi tienda" },
    });

    const estilo = document.documentElement.style;
    expect(estilo.getPropertyValue("--primario")).toBe("#2E394B");
    expect(estilo.getPropertyValue("--fuente-titulos")).toBe("Georgia, serif");
    expect(document.title).toBe("Mi tienda");
  });

  it("carga la hoja de fuentes web una sola vez", () => {
    aplicarTema({ tema: { fuentes_url: URL_FUENTES } });
    aplicarTema({ tema: { fuentes_url: URL_FUENTES } });

    expect(hojasDeFuentes()).toHaveLength(1);
    expect(hojasDeFuentes()[0].rel).toBe("stylesheet");
  });

  it("sin fuentes_url no agrega ninguna hoja", () => {
    aplicarTema({ tema: {} });

    expect(document.querySelectorAll("link[rel='stylesheet']")).toHaveLength(0);
  });
});
