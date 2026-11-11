import test from "node:test";
import assert from "node:assert/strict";
import {
  armarArbol, conDescendientes, creaCiclo, esquemaColor, esquemaFiltrosCatalogo, esquemaFiltrosPanel, esquemaGrupoTalle, esquemaPedido, esquemaPrenda, problemaFotos, slug,
} from "../src/modulos/tienda_ropa/reglas.js";

const CATEGORIAS = [
  { id: 1, padre_id: null, nombre: "Mujer" },
  { id: 2, padre_id: 1, nombre: "Remeras" },
  { id: 3, padre_id: 2, nombre: "Básicas" },
  { id: 4, padre_id: null, nombre: "Hombre" },
];
const prenda = (datos = {}) => ({
  nombre: "Remera lisa", categoria_id: 2, grupo_talle_id: 1, precio: "15000",
  variantes: [{ color_id: 1, talle_id: 1 }, { color_id: 1, talle_id: 2 }, { color_id: 2, talle_id: 1 }],
  ...datos,
});

test("ROP-01: árbol de categorías, descendientes y ciclos", () => {
  const arbol = armarArbol(CATEGORIAS);
  assert.deepEqual(arbol.map((c) => c.nombre), ["Mujer", "Hombre"]);
  assert.equal(arbol[0].hijas[0].hijas[0].nombre, "Básicas");
  assert.deepEqual(conDescendientes(CATEGORIAS, 1).sort(), [1, 2, 3]);
  assert.equal(creaCiclo(CATEGORIAS, 1, 3), true, "Mujer adentro de Básicas");
  assert.equal(creaCiclo(CATEGORIAS, 1, 1), true, "adentro de sí misma");
  assert.equal(creaCiclo(CATEGORIAS, 3, 4), false);
  assert.equal(creaCiclo(CATEGORIAS, 3, null), false);
});

test("ROP-01: la URL de una categoría o prenda es legible", () => {
  assert.equal(slug("Remeras de Algodón Ñandú!"), "remeras-de-algodon-nandu");
  assert.equal(slug("   "), "item");
});

test("ROP-03 y ROP-04: color en formato #RRGGBB y talles sin repetir", () => {
  assert.equal(esquemaColor.safeParse({ nombre: "Rojo", hex: "#c62828" }).data.hex, "#C62828");
  assert.equal(esquemaColor.safeParse({ nombre: "Rojo", hex: "rojo" }).success, false);
  assert.equal(esquemaGrupoTalle.safeParse({ nombre: "Ropa", talles: ["S", "s"] }).error.issues[0].message, "Hay talles repetidos.");
  assert.equal(esquemaGrupoTalle.safeParse({ nombre: "Ropa", talles: [] }).success, false);
});

test("ROP-05 y ROP-07: prenda con un precio y al menos un talle × color, sin repetidos", () => {
  const ok = esquemaPrenda.safeParse(prenda());
  assert.equal(ok.success, true);
  assert.equal(ok.data.precio, 15000);
  assert.equal(ok.data.variantes[0].disponible, true, "hay, por defecto");
  assert.equal(esquemaPrenda.safeParse(prenda({ variantes: [] })).error.issues[0].message, "Tildá al menos un talle y un color.");
  assert.equal(esquemaPrenda.safeParse(prenda({ precio: 0 })).success, false);
  const repetida = esquemaPrenda.safeParse(prenda({ variantes: [{ color_id: 1, talle_id: 1 }, { color_id: 1, talle_id: 1 }] }));
  assert.equal(repetida.error.issues[0].message, "Hay talles y colores repetidos.");
});

test("ROP-17: el precio anterior es opcional y tiene que ser mayor que el precio", () => {
  assert.equal(esquemaPrenda.parse(prenda()).precio_anterior, null, "sin oferta por defecto");
  assert.equal(esquemaPrenda.parse(prenda({ precio_anterior: "" })).precio_anterior, null, "el campo vacío del formulario");
  assert.equal(esquemaPrenda.parse(prenda({ precio_anterior: "20000" })).precio_anterior, 20000);
  for (const precio_anterior of [15000, 9000]) {
    const r = esquemaPrenda.safeParse(prenda({ precio_anterior }));
    assert.equal(r.success, false, `${precio_anterior} no es mayor que 15000`);
    assert.deepEqual(r.error.issues[0].path, ["precio_anterior"]);
    assert.equal(r.error.issues[0].message, "El precio anterior tiene que ser mayor que el precio actual.");
  }
});

test("ROP-11: el catálogo se ordena por novedades por defecto y 'Solo ofertas' llega de la URL", () => {
  assert.deepEqual(esquemaFiltrosCatalogo.parse({}), { pagina: 1, orden: "novedades", ofertas: false });
  const r = esquemaFiltrosCatalogo.parse({ orden: "menor_precio", ofertas: "1" });
  assert.equal(r.orden, "menor_precio");
  assert.equal(r.ofertas, true);
  assert.equal(esquemaFiltrosCatalogo.parse({ ofertas: "no" }).ofertas, false);
  assert.equal(esquemaFiltrosCatalogo.safeParse({ orden: "precio; DROP TABLE" }).error.issues[0].message, "Orden no válido.");
  assert.equal("orden" in esquemaFiltrosPanel.parse({}), false, "el panel no usa el orden de la tienda");
});

test("ROP-06: hasta 3 fotos por color y 10 generales, solo de colores que tiene la prenda", () => {
  const fotos = (color_id, n) => Array.from({ length: n }, () => ({ url: "https://x.test/f.jpg", color_id }));
  assert.equal(problemaFotos([...fotos(1, 3), ...fotos(null, 10)], [1]), null);
  assert.equal(problemaFotos(fotos(1, 4), [1]), "Hasta 3 fotos por color.");
  assert.equal(problemaFotos(fotos(null, 11), [1]), "Hasta 10 fotos generales.");
  assert.equal(problemaFotos(fotos(9, 1), [1]), "Hay fotos de un color que la prenda no tiene.");
  assert.equal(esquemaPrenda.safeParse(prenda({ imagenes: fotos(1, 4) })).error.issues[0].path[0], "imagenes");
  assert.equal(esquemaPrenda.safeParse(prenda({ imagenes: [{ url: "http://inseguro.test/a.jpg", color_id: null }] })).success, false);
});

test("ROP-14 y ROP-16: el pedido pide nombre y celular, y solo variante y cantidad", () => {
  const ok = esquemaPedido.safeParse({ nombre: " Ana ", celular: "(370) 412-3456", items: [{ variante_id: 3, cantidad: 2, precio: 1 }] });
  assert.equal(ok.success, true);
  assert.equal(ok.data.celular, "3704123456");
  assert.deepEqual(ok.data.items, [{ variante_id: 3, cantidad: 2 }], "el precio del navegador se descarta");
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "123", items: [{ variante_id: 1, cantidad: 1 }] }).success, false);
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [] }).error.issues[0].message, "Tu pedido está vacío.");
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: 1, cantidad: 100 }] }).success, false);
  const repetida = esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: 1, cantidad: 1 }, { variante_id: 1, cantidad: 2 }] });
  assert.equal(repetida.error.issues[0].message, "Hay prendas repetidas en el pedido.");
});
