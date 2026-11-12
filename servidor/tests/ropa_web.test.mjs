import test from "node:test";
import assert from "node:assert/strict";
import {
  agregarLinea, cambiarCantidad, CLAVE_PEDIDO, guardarPedido, leerPedido, quitarLinea, totalEstimado, unidades,
} from "../../frontend/src/modules/tienda_ropa/pedido/pedido_local.js";
import { linkWhatsapp, mensajePedido } from "../../frontend/src/modules/tienda_ropa/pedido/mensaje_whatsapp.js";
import { mensajeEstadoCliente, queSigue, urlSeguimiento } from "../../frontend/src/modules/tienda_ropa/pedido/mensajes_estado.js";
import { textoEntrega } from "../../frontend/src/modules/tienda_ropa/pedido/entrega.js";
import { avisoEnvioGratis } from "../../frontend/src/modules/tienda_ropa/pedido/entrega.js";
import { compartir } from "../../frontend/src/modules/tienda_ropa/tienda/compartir.js";
import { logoDeMarca } from "../../frontend/src/modules/tienda_ropa/utils/logo_marca.js";
import { grupoSugerido } from "../../frontend/src/modules/tienda_ropa/utils/grupo_sugerido.js";
import { gruposDeCategoria } from "../../frontend/src/modules/tienda_ropa/utils/grupos_de_categoria.js";
import { cambiosPosibles, formasDePago, pasosDelPedido, pideMotivo as pideMotivoWeb, puedeSubirComprobante } from "../../frontend/src/modules/tienda_ropa/pedido/pago.js";
import { ESTADOS_PEDIDO, pideMotivo, problemaTransicion } from "../src/modulos/tienda_ropa/reglas.js";
import { formatearPrecio } from "../../frontend/src/modules/tienda_ropa/utils/dinero.js";
import { datosVistaPrevia, esBotDeVistaPrevia, htmlVistaPrevia, imagenParaCompartir, slugDeRuta } from "../../frontend/src/modules/tienda_ropa/tienda/vista_previa.js";

const memoria = () => { const datos = new Map(); return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) }; };
const linea = (variante_id, cantidad = 1) => ({ variante_id, cantidad, nombre: "Remera", color: "Negro", talle: "M", precio: 15000.5 });
const LIMITES = { maxLineas: 2, maxCantidad: 5 };

test("ROP-13: el pedido se guarda en el navegador y vence a los 15 días", () => {
  const storage = memoria();
  guardarPedido(storage, [linea(1, 2)], 0);
  assert.deepEqual(leerPedido(storage, { dias: 15, ahora: 14 * 86400000 }).map((l) => l.cantidad), [2]);
  assert.deepEqual(leerPedido(storage, { dias: 15, ahora: 16 * 86400000 }), []);
  storage.setItem(CLAVE_PEDIDO, "{roto");
  assert.deepEqual(leerPedido(storage, { dias: 15 }), []);
  guardarPedido(storage, [], 0);
  assert.equal(storage.getItem(CLAVE_PEDIDO), null, "vacío no deja nada guardado");
});

test("ROP-13: sumar la misma variante suma cantidad, con límites claros", () => {
  let items = agregarLinea([], linea(1, 2), LIMITES);
  items = agregarLinea(items, linea(1, 3), LIMITES);
  assert.deepEqual(items.map((l) => [l.variante_id, l.cantidad]), [[1, 5]]);
  assert.throws(() => agregarLinea(items, linea(1), LIMITES), /hasta 5 unidades/);
  items = agregarLinea(items, linea(2), LIMITES);
  assert.throws(() => agregarLinea(items, linea(3), LIMITES), /hasta 2 prendas distintas/);
  assert.deepEqual(cambiarCantidad(items, 2, 99, 5).find((l) => l.variante_id === 2).cantidad, 5);
  assert.deepEqual(cambiarCantidad(items, 2, 0, 5).find((l) => l.variante_id === 2).cantidad, 1);
  assert.deepEqual(quitarLinea(items, 1).map((l) => l.variante_id), [2]);
  assert.equal(unidades(items), 6);
  assert.equal(totalEstimado(items), 90003, "en centavos, sin errores de coma flotante");
});

test("ROP-14: el mensaje de WhatsApp lleva número, talle, color, subtotales y total", () => {
  const pedido = { numero: "#00012", nombre: "Ana", total: "31000.00", entrega: "retiro", items: [{ cantidad: 2, nombre_prenda: "Remera lisa", color: "Negro", talle: "M", subtotal: "31000.00" }] };
  const texto = mensajePedido(pedido, "Stilos");
  assert.equal(texto, "¡Hola Stilos! Te envío mi pedido #00012:\n• 2 × Remera lisa (Negro, talle M): $ 31.000\nTotal: $ 31.000\nEntrega: Retiro en el local\nA nombre de: Ana\n¿Me confirmás si hay disponibilidad? Gracias.");
  assert.equal(linkWhatsapp("5493704784641", "Hola & chau"), "https://wa.me/5493704784641?text=Hola%20%26%20chau");
  assert.equal(formatearPrecio(1500.5), "$ 1.500,5");
});

test("ROP-18: el mensaje lleva la entrega y si el envío es gratis", () => {
  const envio = { numero: "#00013", nombre: "Ana", total: "160000.00", entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", items: [] };
  assert.match(mensajePedido({ ...envio, envio_gratis: true }, "Stilos"), /Entrega: Envío a San Martín 123, Formosa\nEnvío gratis\./);
  assert.match(mensajePedido({ ...envio, envio_gratis: false }, "Stilos"), /Formosa\n¿Cuánto sale el envío\?/);
});

test("ROP-62, ROP-64 y ROP-67: link de seguimiento, mensaje del local según el estado y qué sigue", () => {
  const url = urlSeguimiento("https://stilos.test", "k7Qx2abcdefghijklmnopq");
  assert.equal(url, "https://stilos.test/seguimiento/k7Qx2abcdefghijklmnopq");
  assert.equal(urlSeguimiento("https://stilos.test", null), null, "pedidos viejos, sin link");
  const pedido = { numero: "#00012", nombre: "Ana Gómez", estado: "listo_retirar", entrega: "retiro", items: [], total: "1000.00" };
  assert.equal(mensajeEstadoCliente(pedido, "Stilos", url), "¡Hola Ana! Te escribimos de Stilos por tu pedido #00012: ya está listo para retirar.\nPodés seguirlo acá: " + url);
  assert.doesNotMatch(mensajeEstadoCliente(pedido, "Stilos", null), /seguirlo/);
  assert.match(mensajePedido({ ...pedido, items: [] }, "Stilos", url), /Sigo mi pedido acá: https:\/\/stilos\.test\/seguimiento\//);
  assert.equal(queSigue({ estado: "confirmado", entrega: "retiro" }), "Está confirmado. Te avisamos cuando esté listo para retirar.");
  assert.match(queSigue({ estado: "confirmado", entrega: "envio" }), /enviarlo/);
  assert.equal(textoEntrega({ entrega: "envio" }), "Envío a domicilio", "el seguimiento no trae la dirección");
});

test("ROP-18: aviso de cuánto falta para el envío gratis", () => {
  assert.deepEqual(avisoEnvioGratis(100000, 150000), { gratis: false, falta: 50000 });
  assert.deepEqual(avisoEnvioGratis(150000, 150000), { gratis: true, falta: 0 });
  assert.deepEqual(avisoEnvioGratis(149999.99, 150000), { gratis: false, falta: 0.01 }, "sin errores de coma flotante");
  assert.equal(avisoEnvioGratis(100000, null), null);
});

test("ROP-22: compartir usa el menú del teléfono y, si no hay, copia el link", async () => {
  const prenda = { titulo: "Remera", texto: "Remera en Stilos", url: "https://stilos.test/catalogo/remera" };
  let copiado = null;
  const portapapeles = { writeText: async (t) => { copiado = t; } };
  assert.equal(await compartir(prenda, { share: async () => {}, clipboard: portapapeles }), "compartido");
  const cancelar = async () => { throw Object.assign(new Error("x"), { name: "AbortError" }); };
  assert.equal(await compartir(prenda, { share: cancelar, clipboard: portapapeles }), "cancelado");
  assert.equal(copiado, null, "cancelar no copia");
  assert.equal(await compartir(prenda, { clipboard: portapapeles }), "copiado");
  assert.equal(copiado, prenda.url);
  const falla = async () => { throw new Error("no"); };
  assert.equal(await compartir(prenda, { share: falla, clipboard: { writeText: falla } }), "error");
});

test("ROP-44 a ROP-48: formas de pago, comprobante y estados en la web, iguales al servidor", () => {
  const banco = { titular: "EJEMPLO", banco: "EJEMPLO", cbu: "0000000000000000000000", alias: "EJEMPLO", cuit: "20-00000000-0" };
  assert.deepEqual(formasDePago({ entrega: "retiro", datosBancarios: banco }), ["transferencia", "efectivo", "coordinar"]);
  assert.deepEqual(formasDePago({ entrega: "envio", datosBancarios: banco }), ["transferencia", "coordinar"], "efectivo solo al retirar");
  assert.deepEqual(formasDePago({ entrega: "retiro", datosBancarios: { ...banco, cbu: null } }), ["efectivo", "coordinar"], "sin datos bancarios no hay transferencia");
  const pedido = { forma_pago: "transferencia", estado: "recibido", estado_pago: "pendiente", comprobantes: [] };
  assert.equal(puedeSubirComprobante(pedido), true);
  assert.equal(puedeSubirComprobante({ ...pedido, comprobantes: [{}, {}, {}] }), false);
  assert.equal(puedeSubirComprobante({ ...pedido, estado_pago: "pagado" }), false);
  assert.deepEqual(pasosDelPedido("envio"), ["recibido", "confirmado", "enviado", "entregado"]);
  for (const entrega of ["retiro", "envio"]) {
    for (const desde of ESTADOS_PEDIDO) {
      const validos = ESTADOS_PEDIDO.filter((hacia) => problemaTransicion(desde, hacia, entrega) === null);
      assert.deepEqual(cambiosPosibles({ estado: desde, entrega }).sort(), validos.sort(), `${desde} (${entrega})`);
      for (const hacia of validos) assert.equal(pideMotivoWeb(desde, hacia), pideMotivo(desde, hacia), `${desde} → ${hacia}`);
    }
  }
});

test("ROP-31: vista previa al compartir: solo para bots, con datos de la prenda y escapada", () => {
  assert.equal(esBotDeVistaPrevia("WhatsApp/2.23.20.0 A"), true);
  assert.equal(esBotDeVistaPrevia("facebookexternalhit/1.1"), true);
  assert.equal(esBotDeVistaPrevia("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1"), false, "una persona ve la tienda de siempre");
  assert.equal(slugDeRuta("/catalogo/remera-taverniti-negro"), "remera-taverniti-negro");
  assert.equal(slugDeRuta("/catalogo"), null);
  assert.equal(slugDeRuta("/catalogo/../admin"), null);
  assert.equal(imagenParaCompartir("https://res.cloudinary.com/x/image/upload/v1/stilos/a.jpg"), "https://res.cloudinary.com/x/image/upload/w_1200,h_630,c_pad,b_white,f_jpg,q_auto/v1/stilos/a.jpg");
  const prenda = {
    nombre: "Remera <b>Taverniti</b>", marca: { nombre: "Taverniti" }, precio: 18500, precio_anterior: 26000,
    colores: [{ nombre: "Negro" }], descripcion: "Algodón\n peinado", imagenes: [{ url: "https://res.cloudinary.com/x/image/upload/a.jpg" }],
  };
  const datos = datosVistaPrevia(prenda, "Stilos");
  assert.equal(datos.titulo, "Remera <b>Taverniti</b> · Taverniti | Stilos");
  assert.equal(datos.descripcion, "$ 18.500 (antes $ 26.000) · Negro · Algodón peinado");
  const html = htmlVistaPrevia({ prenda, url: "https://stilos.test/catalogo/remera", sitio: "Stilos" });
  assert.match(html, /<meta property="og:title" content="Remera &lt;b&gt;Taverniti&lt;\/b&gt; · Taverniti \| Stilos">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/res\.cloudinary\.com\/x\/image\/upload\/w_1200/);
  assert.doesNotMatch(html, /<b>/, "el nombre no puede meter HTML");
  const generica = htmlVistaPrevia({ prenda: null, url: "https://stilos.test/catalogo/x", sitio: "Stilos" });
  assert.match(generica, /og:title" content="Stilos"/);
  assert.doesNotMatch(generica, /og:image/, "si la API no respondió, la de la tienda, sin foto");
});

test("ROP-31: el middleware de Vercel responde la vista previa solo a los bots", async () => {
  const { default: middleware, config } = await import("../../frontend/middleware.js");
  assert.equal(config.matcher, "/catalogo/:slug");
  const fetchOriginal = globalThis.fetch;
  const pedidas = [];
  globalThis.fetch = async (url) => {
    pedidas.push(String(url));
    if (String(url).endsWith("/no-existe")) return new Response("{}", { status: 404 });
    return Response.json({ ok: true, data: { nombre: "Jean Bando", precio: 41000, precio_anterior: null, imagenes: [] } });
  };
  try {
    const pedir = (ruta, userAgent) => middleware(new Request(`https://stilos.test${ruta}`, { headers: { "user-agent": userAgent } }));
    assert.equal(await pedir("/catalogo/jean-bando-azul", "Mozilla/5.0 Chrome/120"), undefined, "a las personas les sigue la tienda");
    const respuesta = await pedir("/catalogo/jean-bando-azul", "WhatsApp/2.24");
    assert.match(await respuesta.text(), /og:title" content="Jean Bando \| Stilos"/);
    assert.match(respuesta.headers.get("cache-control"), /s-maxage=3600/);
    assert.match(pedidas[0], /\/api\/ropa\/catalogo\/prendas\/jean-bando-azul$/);
    const sinPrenda = await pedir("/catalogo/no-existe", "WhatsApp/2.24");
    assert.match(await sinPrenda.text(), /og:title" content="Stilos"/);
    assert.match(sinPrenda.headers.get("cache-control"), /s-maxage=60/, "caché corta para reintentar cuando Render despierte");
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("ROP-35: logo de la marca: el del panel, si no el de la configuración, si no ninguno", () => {
  const logos = { MAYCLA: { logo: "/assets/maycla.webp", fondo: "#1E2D3D" }, Taverniti: { logo: "/assets/taverniti.webp" } };
  assert.deepEqual(logoDeMarca({ nombre: "taverniti ", logo_url: null }, logos), { url: "/assets/taverniti.webp", fondo: null }, "sin importar mayúsculas ni espacios");
  assert.deepEqual(logoDeMarca({ nombre: "Maycla", logo_url: "https://res.cloudinary.com/x/maycla.png" }, logos),
    { url: "https://res.cloudinary.com/x/maycla.png", fondo: "#1E2D3D" }, "el subido en el panel gana, con el fondo de la configuración");
  assert.equal(logoDeMarca({ nombre: "Raiders", logo_url: null }, logos), null, "sin logo: se muestra el nombre");
  assert.equal(logoDeMarca({ nombre: "Raiders" }), null);
});

test("ROP-59 y ROP-60: al cargar una prenda se ofrecen los grupos de su categoría (o de las de arriba) y los ya tildados", () => {
  const arbol = [
    { id: 1, nombre: "Hombre", padre_id: null, hijas: [
      { id: 2, nombre: "Remeras", padre_id: 1, hijas: [{ id: 3, nombre: "Oversize", padre_id: 2, hijas: [] }] },
      { id: 4, nombre: "Jeans", padre_id: 1, hijas: [] },
    ] },
    { id: 5, nombre: "Calzado", padre_id: null, hijas: [] },
  ];
  const g = (id, categorias, ...valores) => ({ id, nombre: `g${id}`, categorias, caracteristicas: valores.map((v) => ({ id: v })) });
  const grupos = [g(10, [], 100), g(20, [2], 200), g(30, [4], 300), g(40, [5], 400), g(50, [1], 500)];
  const nombres = ({ visibles, otros }) => [visibles.map((x) => x.id), otros.map((x) => x.id)];
  assert.deepEqual(nombres(gruposDeCategoria(grupos, arbol, "3")), [[10, 20, 50], [30, 40]], "Oversize: los de todas, los de Remeras y los de Hombre");
  assert.deepEqual(nombres(gruposDeCategoria(grupos, arbol, 5)), [[10, 40], [20, 30, 50]]);
  assert.deepEqual(nombres(gruposDeCategoria(grupos, arbol, 5, new Set([300]))), [[10, 30, 40], [20, 50]], "lo ya tildado no se esconde");
  assert.deepEqual(nombres(gruposDeCategoria(grupos, arbol, "")), [[], [10, 20, 30, 40, 50]], "sin categoría, nada hasta elegirla");
  assert.deepEqual(nombres(gruposDeCategoria(undefined, arbol, 1)), [[], []]);
});

test("ROP-36: el grupo de talles sugerido es el de la categoría o, si no tiene, el de la de arriba", () => {
  const arbol = [
    { id: 1, padre_id: null, grupo_talle_id: 10, hijas: [
      { id: 2, padre_id: 1, grupo_talle_id: null, hijas: [] },
      { id: 3, padre_id: 1, grupo_talle_id: 20, hijas: [{ id: 4, padre_id: 3, grupo_talle_id: null, hijas: [] }] },
    ] },
    { id: 5, padre_id: null, grupo_talle_id: null, hijas: [] },
  ];
  assert.equal(grupoSugerido(arbol, 2), 10, "Hombre › Remeras usa el de Hombre");
  assert.equal(grupoSugerido(arbol, "4"), 20, "Hombre › Pantalones › Cargo usa el de Pantalones (aunque llegue como texto del select)");
  assert.equal(grupoSugerido(arbol, 5), null, "sin sugerencia");
  assert.equal(grupoSugerido(arbol, 99), null);
  assert.equal(grupoSugerido(undefined, 1), null);
});
