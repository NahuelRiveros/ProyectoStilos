import test from "node:test";
import assert from "node:assert/strict";
import {
  armarArbol, conDescendientes, creaCiclo, claveModelo, esEnvioGratis, esquemaColor, esquemaEstadoPedido, esquemaGrupoCaracteristica, esquemaMarca, esquemaMisDatos, esquemaPedidoCuenta, formatoComprobante, pideMotivo, problemaComprobante, problemaTransicion, proximoPaso, transferenciaDisponible, esquemaFiltrosCatalogo, esquemaFiltrosPanel, esquemaGrupoTalle, esquemaPedido, esquemaPrenda, problemaFotos, slug,
} from "../src/modulos/tienda_ropa/reglas.js";

const CATEGORIAS = [
  { id: 1, padre_id: null, nombre: "Mujer" },
  { id: 2, padre_id: 1, nombre: "Remeras" },
  { id: 3, padre_id: 2, nombre: "Básicas" },
  { id: 4, padre_id: null, nombre: "Hombre" },
];
const prenda = (datos = {}) => ({
  nombre: "Remera lisa", categoria_id: 2, grupo_talle_id: 1, precio: "15000",
  variantes: [{ color_id: 1, talle_id: 1 }, { color_id: 1, talle_id: 2 }],
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

test("ROP-29: un solo color por prenda y hasta 3 fotos, solo de su color", () => {
  const fotos = (color_id, n) => Array.from({ length: n }, () => ({ url: "https://x.test/f.jpg", color_id }));
  assert.equal(problemaFotos(fotos(1, 3), [1]), null);
  assert.equal(problemaFotos([...fotos(1, 2), ...fotos(null, 1)], [1]), null, "una general cuenta dentro de las 3");
  assert.equal(problemaFotos([...fotos(1, 3), ...fotos(null, 1)], [1]), "Hasta 3 fotos por prenda.");
  assert.equal(problemaFotos(fotos(9, 1), [1]), "Hay fotos de un color que la prenda no tiene.");
  const dosColores = esquemaPrenda.safeParse(prenda({ variantes: [{ color_id: 1, talle_id: 1 }, { color_id: 2, talle_id: 1 }] }));
  assert.equal(dosColores.error.issues[0].message, "Cada prenda es de un solo color. Cargá los otros colores como prendas nuevas.");
  assert.equal(claveModelo("  Remera   TAVERNITI "), "remera taverniti", "ROP-30: mismo modelo sin importar mayúsculas ni espacios");
  assert.equal(esquemaPrenda.safeParse(prenda({ imagenes: fotos(1, 4) })).error.issues[0].path[0], "imagenes");
  assert.equal(esquemaPrenda.safeParse(prenda({ imagenes: [{ url: "http://inseguro.test/a.jpg", color_id: null }] })).success, false);
});

test("ROP-14 y ROP-16: el pedido pide nombre y celular, y solo variante y cantidad", () => {
  const ok = esquemaPedido.safeParse({ nombre: " Ana ", celular: "(370) 412-3456", entrega: "retiro", items: [{ variante_id: 3, cantidad: 2, precio: 1 }] });
  assert.equal(ok.success, true);
  assert.equal(ok.data.celular, "3704123456");
  assert.deepEqual(ok.data.items, [{ variante_id: 3, cantidad: 2 }], "el precio del navegador se descarta");
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "123", items: [{ variante_id: 1, cantidad: 1 }] }).success, false);
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [] }).error.issues[0].message, "Tu pedido está vacío.");
  assert.equal(esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: 1, cantidad: 100 }] }).success, false);
  const repetida = esquemaPedido.safeParse({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: 1, cantidad: 1 }, { variante_id: 1, cantidad: 2 }] });
  assert.equal(repetida.error.issues[0].message, "Hay prendas repetidas en el pedido.");
});

test("ROP-18: retiro o envío; el envío pide dirección y localidad", () => {
  const base = { nombre: "Ana", celular: "3704123456", items: [{ variante_id: 1, cantidad: 1 }] };
  const sinElegir = esquemaPedido.safeParse(base);
  assert.equal(sinElegir.error.issues[0].message, "Elegí si retirás o te lo enviamos.");

  const envioVacio = esquemaPedido.safeParse({ ...base, entrega: "envio", direccion: " ", localidad: "" });
  assert.deepEqual(envioVacio.error.issues.map((i) => i.path[0]), ["direccion", "localidad"]);
  assert.equal(envioVacio.error.issues[0].message, "Escribí la dirección de entrega (calle y número).");

  const envio = esquemaPedido.parse({ ...base, entrega: "envio", direccion: " San Martín 123 ", localidad: "Formosa" });
  assert.equal(envio.direccion, "San Martín 123");

  const retiro = esquemaPedido.parse({ ...base, entrega: "retiro", direccion: "quedó escrita", localidad: "x" });
  assert.equal(retiro.direccion, null, "al retirar no se guarda dirección");
  assert.equal(retiro.localidad, null);
});

test("ROP-18: envío gratis desde el mínimo, solo para envíos", () => {
  assert.equal(esEnvioGratis("envio", 15000000, 150000), true, "justo el mínimo");
  assert.equal(esEnvioGratis("envio", 14999999, 150000), false, "un centavo menos");
  assert.equal(esEnvioGratis("retiro", 99999999, 150000), false);
  assert.equal(esEnvioGratis("envio", 99999999, null), false, "sin mínimo configurado");
});

test("ROP-37 a ROP-39: características por grupo, varias por prenda y filtro desde la URL", () => {
  assert.deepEqual(esquemaPrenda.parse(prenda()).caracteristicas, []);
  assert.deepEqual(esquemaPrenda.parse(prenda({ caracteristicas: ["3", 7, 3] })).caracteristicas, [3, 7], "repetidas se ignoran");
  assert.equal(esquemaPrenda.safeParse(prenda({ caracteristicas: ["x"] })).success, false);
  assert.deepEqual(esquemaGrupoCaracteristica.parse({ nombre: " Material ", valores: [" Cuero ", "Lona"] }), { nombre: "Material", orden: 0, valores: ["Cuero", "Lona"], categorias: [] });
  assert.equal(esquemaGrupoCaracteristica.safeParse({ nombre: "Material", valores: ["Cuero", "cuero"] }).error.issues[0].message, "Hay valores repetidos.");
  assert.equal(esquemaGrupoCaracteristica.safeParse({ nombre: "Material", valores: [] }).error.issues[0].message, "Agregá al menos un valor.");
  assert.deepEqual(esquemaGrupoCaracteristica.parse({ nombre: "Tiro", valores: ["Alto"], categorias: ["4", 4, 9] }).categorias, [4, 9], "ROP-59: repetidas se ignoran");
  assert.deepEqual(esquemaGrupoCaracteristica.parse({ nombre: "Tiro", valores: ["Alto"] }).categorias, [], "ROP-59: sin categorías = en todas");
  assert.deepEqual(esquemaFiltrosCatalogo.parse({ car: "1,7" }).car, [1, 7]);
  assert.equal(esquemaFiltrosCatalogo.parse({ car: "" }).car, undefined);
  assert.equal(esquemaFiltrosCatalogo.safeParse({ car: "1,x" }).success, false);
});

test("ROP-25: logo https opcional en la marca", () => {
  assert.equal(esquemaMarca.parse({ nombre: "Bando", logo_url: "" }).logo_url, null);
  assert.equal(esquemaMarca.parse({ nombre: "Bando", logo_url: " https://x.test/bando.png " }).logo_url, "https://x.test/bando.png");
  assert.equal(esquemaMarca.safeParse({ nombre: "Bando", logo_url: "http://x.test/bando.png" }).error.issues[0].message, "El logo tiene que ser una URL https o una imagen local del catálogo inicial.");
});

test("Estados del pedido: pasos válidos, motivo al volver o cancelar y próximo paso", () => {
  assert.equal(problemaTransicion("recibido", "confirmado", "retiro"), null);
  assert.equal(problemaTransicion("recibido", "entregado", "retiro"), "Ese cambio de estado no es posible desde el estado actual.");
  assert.match(problemaTransicion("confirmado", "listo_retirar", "envio"), /se retiran en el local/);
  assert.match(problemaTransicion("confirmado", "enviado", "retiro"), /envío a domicilio/);
  assert.equal(pideMotivo("recibido", "confirmado"), false);
  assert.equal(pideMotivo("confirmado", "recibido"), true, "volver atrás");
  assert.equal(pideMotivo("recibido", "cancelado"), true);
  assert.equal(pideMotivo("cancelado", "recibido"), true, "reabrir");
  assert.equal(pideMotivo("entregado", "confirmado"), true);
  assert.equal(proximoPaso({ estado: "confirmado", entrega: "envio" }), "enviado");
  assert.equal(proximoPaso({ estado: "confirmado", entrega: "retiro" }), "listo_retirar");
  assert.equal(proximoPaso({ estado: "entregado" }), null);
  assert.equal(esquemaEstadoPedido.safeParse({ estado: "confirmado" }).success, false, "sin la versión que vio no se cambia");
});

test("ROP-47 y ROP-48: transferencia con datos completos; comprobante por contenido y con límites", () => {
  const banco = { titular: "EJEMPLO", banco: "EJEMPLO", cbu: "0000000000000000000000", alias: "EJEMPLO", cuit: "20-00000000-0" };
  assert.equal(transferenciaDisponible(banco), true);
  assert.equal(transferenciaDisponible({ ...banco, cbu: " " }), false);
  assert.equal(transferenciaDisponible(null), false);
  assert.equal(formatoComprobante(Buffer.from("%PDF-1.7 contenido")), "pdf");
  assert.equal(formatoComprobante(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), "jpg");
  assert.equal(formatoComprobante(Buffer.from("MZ un exe renombrado a .pdf")), null);
  const pedido = { forma_pago: "transferencia", estado: "recibido", estado_pago: "pendiente" };
  assert.equal(problemaComprobante(pedido, 0), null);
  assert.match(problemaComprobante(pedido, 3), /Ya subiste 3/);
  assert.match(problemaComprobante({ ...pedido, estado_pago: "pagado" }, 0), /pagado/);
  assert.match(problemaComprobante({ ...pedido, forma_pago: "efectivo" }, 0), /no se paga por transferencia/);
});

test("ROP-41 a ROP-44: pedido con cuenta y mis datos", () => {
  const base = { items: [{ variante_id: 1, cantidad: 1 }], clave_envio: "clave-de-prueba-123" };
  const efectivoConEnvio = esquemaPedidoCuenta.safeParse({ ...base, entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", forma_pago: "efectivo" });
  assert.equal(efectivoConEnvio.error.issues[0].message, "En efectivo se paga al retirar en el local.");
  const ok = esquemaPedidoCuenta.parse({ ...base, entrega: "retiro", direccion: "x", forma_pago: "efectivo" });
  assert.equal(ok.direccion, null);
  assert.equal(esquemaPedidoCuenta.safeParse({ ...base, entrega: "retiro" }).error.issues[0].message, "Elegí cómo vas a pagar.");
  const datos = esquemaMisDatos.parse({ nombre: "Ana", apellido: "Gómez", celular: "(370) 412-3456" });
  assert.deepEqual([datos.celular, datos.direccion], ["3704123456", ""]);
  assert.equal(esquemaMisDatos.safeParse({ nombre: "A", apellido: "Gómez", celular: "3704123456" }).error.issues[0].message, "Escribí tu nombre.");
});

test("ROP-34: las fotos aceptan https o una imagen local del catálogo de ejemplo, nada más", () => {
  const conFoto = (url) => esquemaPrenda.safeParse(prenda({ imagenes: [{ url, color_id: 1 }] }));
  assert.equal(conFoto("https://res.cloudinary.com/x/a.jpg").success, true);
  assert.equal(conFoto("/catalogo-inicial/ejemplo-remera-blanco.jpg").success, true);
  for (const url of ["http://x.test/a.jpg", "/catalogo-inicial/..", "/catalogo-inicial/.oculto.png", "/catalogo-inicial/nota.txt", "/catalogo-inicial/../admin", "/otra-carpeta/a.jpg", "javascript:alert(1)", "/catalogo-inicial/"]) {
    assert.equal(conFoto(url).success, false, url);
  }
});
