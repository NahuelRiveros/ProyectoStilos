import { describe, expect, it } from "vitest";
import { aplanarConNivel, armarArbol, idsDelSubarbol, nivelDeCategoria, rutaCategoria, totalConSubcategorias } from "./arbol.js";
import { alternarId, filtrosActivos, leerIds } from "./filtros_url.js";
import { coloresDelProducto, fotosDelColor } from "./galeria.js";
import { colorAgotado, tallesDelColor, usaTalleColor, varianteAlCambiarColor } from "./talle_color.js";
import { precioVisible, presentacionMasBarata } from "./precios.js";

const categorias = [
  { id: 1, nombre: "Almacén", padre_id: null, cantidad_productos: 1 },
  { id: 2, nombre: "Galletitas", padre_id: 1, cantidad_productos: 3 },
  { id: 3, nombre: "Dulces", padre_id: 2, cantidad_productos: 2 },
  { id: 4, nombre: "Bebidas", padre_id: null, cantidad_productos: 5 },
];

describe("árbol de categorías", () => {
  it("arma el árbol y lo aplana con niveles", () => {
    const arbol = armarArbol(categorias);
    expect(arbol.map((n) => n.nombre)).toEqual(["Almacén", "Bebidas"]);
    expect(aplanarConNivel(categorias).map((c) => [c.nombre, c.nivel])).toEqual([
      ["Almacén", 0],
      ["Galletitas", 1],
      ["Dulces", 2],
      ["Bebidas", 0],
    ]);
    expect(totalConSubcategorias(arbol[0])).toBe(6);
  });

  it("calcula subárbol y ruta", () => {
    expect([...idsDelSubarbol(categorias, 1)].sort()).toEqual([1, 2, 3]);
    expect(rutaCategoria(categorias, 3)).toBe("Almacén › Galletitas › Dulces");
  });
});

describe("filtro por niveles", () => {
  const ropa = [
    { id: 1, nombre: "Mujer", padre_id: null, cantidad_productos: 0 },
    { id: 2, nombre: "Jeans", padre_id: 1, cantidad_productos: 4 },
    { id: 3, nombre: "Vestidos", padre_id: 1, cantidad_productos: 0 },
    { id: 4, nombre: "Remeras", padre_id: 1, cantidad_productos: 2 },
    { id: 5, nombre: "Hombre", padre_id: null, cantidad_productos: 0 },
    { id: 6, nombre: "Jeans", padre_id: 5, cantidad_productos: 3 },
    { id: 7, nombre: "Liquidación", padre_id: null, cantidad_productos: 0 },
  ];
  const nombres = (nodos) => nodos.map((n) => n.nombre);

  it("sin categoría elegida lista las principales con productos", () => {
    const { ruta, padre, opciones } = nivelDeCategoria(ropa, "");
    expect(ruta).toEqual([]);
    expect(padre).toBeNull();
    expect(nombres(opciones)).toEqual(["Mujer", "Hombre"]);
  });

  it("al entrar en una principal lista sus subcategorías con productos", () => {
    const { ruta, padre, opciones } = nivelDeCategoria(ropa, "1");
    expect(nombres(ruta)).toEqual(["Mujer"]);
    expect(padre.nombre).toBe("Mujer");
    expect(nombres(opciones)).toEqual(["Jeans", "Remeras"]);
  });

  it("una subcategoría sin hijas muestra sus hermanas y la ruta completa", () => {
    const { ruta, padre, opciones } = nivelDeCategoria(ropa, "6");
    expect(nombres(ruta)).toEqual(["Hombre", "Jeans"]);
    expect(padre.id).toBe(5);
    expect(nombres(opciones)).toEqual(["Jeans"]);
  });

  it("un id que no existe se trata como sin elegir", () => {
    expect(nivelDeCategoria(ropa, "99").padre).toBeNull();
  });
});

describe("fotos por color", () => {
  const imagenes = [
    { id: 1, color_id: 1 },
    { id: 2, color_id: null },
    { id: 3, color_id: 2 },
    { id: 4, color_id: 1 },
  ];
  const ids = (lista) => lista.map((i) => i.id);

  it("con un color: primero sus fotos y después las generales", () => {
    expect(ids(fotosDelColor(imagenes, 1))).toEqual([1, 4, 2]);
  });

  it("sin color elegido, todas; con un color sin fotos, las generales; y nunca queda vacía", () => {
    expect(ids(fotosDelColor(imagenes, null))).toEqual([1, 2, 3, 4]);
    expect(ids(fotosDelColor(imagenes, 9))).toEqual([2]);
    expect(ids(fotosDelColor([{ id: 5, color_id: 1 }], 9))).toEqual([5]);
  });

  it("los colores de la prenda salen sin repetir y en el orden del panel", () => {
    const negro = { id: 1, nombre: "Negro", orden: 2 };
    const blanco = { id: 2, nombre: "Blanco", orden: 1 };
    const producto = { variantes: [{ color: negro }, { color: blanco }, { color: negro }, { color: null }] };
    expect(coloresDelProducto(producto).map((c) => c.nombre)).toEqual(["Blanco", "Negro"]);
  });
});

describe("talle y color en la ficha", () => {
  const variantes = [
    { id: 1, color_id: 1, talle_id: 10, talle: { orden: 1 }, disponibilidad: "disponible" },
    { id: 2, color_id: 1, talle_id: 9, talle: { orden: 0 }, disponibilidad: "disponible" },
    { id: 3, color_id: 2, talle_id: 9, talle: { orden: 0 }, disponibilidad: "sin_stock" },
    { id: 4, color_id: 2, talle_id: 11, talle: { orden: 2 }, disponibilidad: "disponible" },
  ];

  it("detecta si el producto usa talle/color y lista los talles de un color en orden", () => {
    expect(usaTalleColor({ variantes })).toBe(true);
    expect(usaTalleColor({ variantes: [{ id: 1, nombre: "500 g" }] })).toBe(false);
    expect(tallesDelColor(variantes, 1).map((v) => v.id)).toEqual([2, 1]);
  });

  it("al cambiar de color conserva el talle si existe; si no, el primero con stock", () => {
    expect(varianteAlCambiarColor(variantes, variantes[1], 2).id).toBe(3); // mismo talle (aunque sin stock)
    expect(varianteAlCambiarColor(variantes, variantes[0], 2).id).toBe(4); // talle 10 no existe en el color 2
    expect(colorAgotado(variantes, 2)).toBe(false);
    expect(colorAgotado([variantes[2]], 2)).toBe(true);
  });
});

describe("filtros en la URL", () => {
  it("lee listas de ids ignorando basura y alterna uno", () => {
    expect(leerIds("1,3,x,,0")).toEqual([1, 3]);
    expect(alternarId("1,3", 3)).toBe("1");
    expect(alternarId("", 5)).toBe("5");
  });

  it("arma los chips con el nombre de cada filtro elegido (y omite los que ya no existen)", () => {
    const disponibles = { marcas: [{ id: 1, nombre: "Levis" }], colores: [{ id: 10, nombre: "Negro", hex: "#111" }], talles: [{ id: 51, nombre: "M" }] };
    expect(filtrosActivos({ marca: "1", color: "10,99", talle: "51" }, disponibles)).toEqual([
      { clave: "marca", id: 1, nombre: "Levis", hex: undefined },
      { clave: "color", id: 10, nombre: "Negro", hex: "#111" },
      { clave: "talle", id: 51, nombre: "Talle M", hex: undefined },
    ]);
    expect(filtrosActivos({ color: "10" }, undefined)).toEqual([]);
  });
});

describe("precios", () => {
  it("muestra el precio con IVA según la configuración", () => {
    expect(precioVisible("1000.00", "21.00")).toBe(1210);
    expect(precioVisible("999", 10.5)).toBe(1103.9);
  });

  it("elige la presentación activa más barata", () => {
    const producto = { variantes: [{ id: 1, precio: "50", activo: false }, { id: 2, precio: "80" }, { id: 3, precio: "120" }] };
    expect(presentacionMasBarata(producto).id).toBe(2);
  });
});
