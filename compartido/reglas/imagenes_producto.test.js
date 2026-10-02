import { describe, expect, it } from "vitest";
import { contarImagenes, lugarImagenes, maximoImagenes } from "./imagenes_producto.js";

const limites = { por_color: 4, generales: 10 };
const imagenes = [{ color_id: 1 }, { color_id: 1 }, { color_id: 1 }, { color_id: 1 }, { color_id: 2 }, { color_id: null }];

describe("límite de fotos por color", () => {
  it("cuenta por separado cada color y las generales", () => {
    expect(contarImagenes(imagenes, 1)).toBe(4);
    expect(contarImagenes(imagenes, 2)).toBe(1);
    expect(contarImagenes(imagenes, null)).toBe(1);
    expect(maximoImagenes(1, limites)).toBe(4);
    expect(maximoImagenes(null, limites)).toBe(10);
  });

  it("un color completo no tiene lugar, pero los otros colores y las generales sí", () => {
    expect(lugarImagenes(imagenes, 1, limites)).toBe(0);
    expect(lugarImagenes(imagenes, 2, limites)).toBe(3);
    expect(lugarImagenes(imagenes, 3, limites)).toBe(4);
    expect(lugarImagenes(imagenes, null, limites)).toBe(9);
  });

  it("nunca devuelve lugar negativo (si se bajó el límite con fotos ya cargadas)", () => {
    expect(lugarImagenes(imagenes, 1, { por_color: 2, generales: 10 })).toBe(0);
  });
});
