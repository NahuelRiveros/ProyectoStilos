import { Buffer } from "node:buffer";
import { expect } from "@playwright/test";

// API simulada para las pruebas de navegador de la tienda de ropa: datos sintéticos, sin servidor ni
// base. Cada prueba arranca con estos datos y puede cambiar respuestas con `responder`.

const negro = { id: 1, nombre: "Negro", hex: "#111111", orden: 0 };
const rojo = { id: 22, nombre: "Rojo", hex: "#C62828", orden: 21 };
const azul = { id: 8, nombre: "Azul", hex: "#1D4ED8", orden: 7 };
const talle = (id, nombre, orden) => ({ id, nombre, orden });
const ROPA = { id: 1, nombre: "Ropa", orden: 0, talles: [talle(1, "S", 0), talle(2, "M", 1), talle(3, "L", 2)] };
const NINOS = { id: 4, nombre: "Niños", orden: 3, talles: [talle(31, "8", 0), talle(32, "10", 1)] };
const tarjeta = (id, slug, nombre, precio, precio_anterior, colores) => ({ id, slug, nombre, precio, precio_anterior, foto: null, colores, agotada: false });

export const PRENDAS = [
  tarjeta(1, "remera-taverniti-negro", "Remera Taverniti", 18500, 26000, [negro]),
  tarjeta(2, "remera-taverniti-rojo", "Remera Taverniti", 18500, 26000, [rojo]),
  tarjeta(3, "jean-bando-azul", "Jean Bando", 41000, null, [azul]),
];

export const FICHA = {
  id: 1, slug: "remera-taverniti-negro", nombre: "Remera Taverniti", descripcion: "Algodón peinado.",
  precio: 18500, precio_anterior: 26000, marca: { id: 1, nombre: "Taverniti" }, diseno: { id: 1, nombre: "Lisa" },
  migas: [{ id: 1, nombre: "Mujer" }], colores: [negro], talles: ROPA.talles,
  variantes: [{ id: 11, color_id: 1, talle_id: 1, disponible: true }, { id: 12, color_id: 1, talle_id: 2, disponible: true }, { id: 13, color_id: 1, talle_id: 3, disponible: false }],
  imagenes: [], otros_colores: [{ slug: "remera-taverniti-rojo", color: rojo }], relacionadas: [PRENDAS[2]],
};

const fecha = "2026-11-11T14:30:00.000Z";
export const PEDIDO_CUENTA = {
  id: 13, numero: "#00013", nombre: "Ana Gómez", celular: "3704123456", total: "37000.00", estado: "recibido", estado_pago: "pendiente",
  forma_pago: "transferencia", origen: "cuenta", entrega: "retiro", direccion: null, localidad: null, envio_gratis: false,
  version: 2, proximo: "confirmado", creado_en: fecha,
  items: [{ id: 1, nombre_prenda: "Remera Taverniti", color: "Negro", talle: "M", cantidad: 2, precio_unitario: "18500.00", subtotal: "37000.00" }],
  historial: [{ id: 1, estado_anterior: null, estado_nuevo: "recibido", motivo: null, creado_en: fecha }],
  comprobantes: [],
};

export const USUARIOS = {
  cliente: { id: 5, nombre: "Ana", apellido: "Gómez", email: "ana@ejemplo.test", roles: ["cliente"], permisos: [] },
  encargado: { id: 1, nombre: "Eva", apellido: "Prueba", email: "eva@ejemplo.test", roles: ["supervisor"], permisos: ["productos.editar", "pedidos.ver", "pedidos.gestionar", "pagos.registrar"] },
  vendedor: { id: 2, nombre: "Vera", apellido: "Prueba", email: "vera@ejemplo.test", roles: ["vendedor"], permisos: ["pedidos.ver", "pedidos.gestionar"] },
};

/**
 * Simula la API. `rol` deja la sesión iniciada (token en el navegador). Devuelve `pedidos`: cada
 * llamada recibida ({ metodo, ruta, query, cuerpo }), y `responder(metodo, ruta, fn)` para cambiar una.
 */
export async function simularApi(page, { rol = null, datosCompletos = true } = {}) {
  const pedidos = [];
  const especiales = new Map();
  const base = {
    "GET /banners": () => ({ carrusel: [], cinta: [] }),
    "GET /ropa/catalogo/categorias": () => [{ id: 1, nombre: "Mujer", slug: "mujer", padre_id: null, hijas: [] }, { id: 4, nombre: "Niños", slug: "ninos", padre_id: null, hijas: [] }],
    "GET /ropa/catalogo/filtros": () => ({ marcas: [{ id: 1, nombre: "Taverniti" }], colores: [negro, rojo, azul], grupos_talle: [ROPA, NINOS], disenos: [{ id: 1, nombre: "Lisa" }] }),
    "GET /ropa/catalogo/prendas": () => ({ items: PRENDAS, paginacion: { page: 1, limit: 24, total: PRENDAS.length, totalPages: 1 } }),
    "GET /ropa/catalogo/marcas": () => [],
    [`GET /ropa/catalogo/prendas/${FICHA.slug}`]: () => FICHA,
    "GET /ropa/catalogo/prendas/remera-taverniti-rojo": () => ({ ...FICHA, id: 2, slug: "remera-taverniti-rojo", colores: [rojo], otros_colores: [{ slug: FICHA.slug, color: negro }],
      variantes: [{ id: 21, color_id: 22, talle_id: 1, disponible: true }] }),
    "POST /ropa/catalogo/pedidos": ({ cuerpo }) => ({ id: 7, numero: "#00007", nombre: cuerpo.nombre, celular: cuerpo.celular, total: "37000.00",
      entrega: cuerpo.entrega, direccion: cuerpo.direccion ?? null, localidad: cuerpo.localidad ?? null, envio_gratis: false,
      items: [{ cantidad: 2, nombre_prenda: "Remera Taverniti", color: "Negro", talle: "M", subtotal: "37000.00" }] }),
    "GET /ropa/mi-cuenta/datos": () => ({ nombre: "Ana", apellido: "Gómez", email: "ana@ejemplo.test", celular: datosCompletos ? "3704123456" : "",
      direccion: "Belgrano 50", localidad: "Formosa", codigo_postal: "3600", completos: datosCompletos }),
    "PUT /ropa/mi-cuenta/datos": ({ cuerpo }) => ({ __mensaje: "Guardamos tus datos.", ...cuerpo, email: "ana@ejemplo.test", completos: true }),
    "GET /ropa/mi-cuenta/pedidos": () => [PEDIDO_CUENTA],
    "POST /ropa/mi-cuenta/pedidos": () => ({ __mensaje: "Pedido #00013 recibido.", ...PEDIDO_CUENTA }),
    "GET /ropa/mi-cuenta/pedidos/13": () => PEDIDO_CUENTA,
    "POST /ropa/mi-cuenta/pedidos/13/comprobantes": () => ({ __mensaje: "Recibimos tu comprobante. Lo revisamos y te avisamos.", ...PEDIDO_CUENTA, estado_pago: "en_revision" }),
    "POST /ropa/mi-cuenta/pedidos/13/cancelar": () => ({ __mensaje: "Cancelaste el pedido.", ...PEDIDO_CUENTA, estado: "cancelado" }),
    "GET /ropa/pedidos": () => ({ items: [{ ...PEDIDO_CUENTA, unidades: 2 }], paginacion: { page: 1, limit: 20, total: 1, totalPages: 1 } }),
    "GET /ropa/pedidos/resumen": () => ({ nuevos: 1 }),
    "GET /ropa/pedidos/13": () => ({ ...PEDIDO_CUENTA, estado_pago: "en_revision",
      comprobantes: [{ id: 4, formato: "pdf", estado: "en_revision", motivo_rechazo: null, creado_en: fecha }] }),
    "PATCH /ropa/pedidos/13/estado": ({ cuerpo }) => ({ __mensaje: "Pedido #00013: Confirmado.", ...PEDIDO_CUENTA, estado: cuerpo.estado, version: 3 }),
    "POST /ropa/pedidos/13/comprobantes/4/aceptar": () => ({ __mensaje: "Pago aceptado: el pedido quedó Confirmado.", ...PEDIDO_CUENTA, estado: "confirmado", estado_pago: "pagado" }),
    "POST /ropa/pedidos/13/comprobantes/4/rechazar": () => ({ __mensaje: "Comprobante rechazado. Le avisamos al cliente.", ...PEDIDO_CUENTA }),
  };

  if (rol) await page.addInitScript(() => localStorage.setItem("token", "sesion-de-prueba"));
  // La API está en otro puerto (localhost:3001): las respuestas llevan CORS como el servidor real.
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE" };
  await page.route((url) => url.pathname.startsWith("/api/"), async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const url = new URL(request.url());
    const ruta = url.pathname.replace(/^\/api/, "");
    const clave = `${request.method()} ${ruta}`;
    const multipart = (request.headers()["content-type"] ?? "").startsWith("multipart/");
    const cuerpo = multipart ? { archivo: Buffer.from(request.postDataBuffer() ?? []).toString("latin1") } : request.postDataJSON?.() ?? null;
    pedidos.push({ metodo: request.method(), ruta, query: Object.fromEntries(url.searchParams), cuerpo });

    if (ruta === "/auth/me") {
      return route.fulfill({ headers: cors, json: rol ? { ok: true, usuario: USUARIOS[rol] } : { ok: false } , status: rol ? 200 : 401 });
    }
    const especial = especiales.get(clave);
    if (especial) {
      const { status = 200, json } = await especial({ cuerpo, query: url.searchParams });
      return route.fulfill({ status, headers: cors, json });
    }
    // `__mensaje` es el texto que el servidor manda junto a los datos (lo muestran los avisos).
    const valor = base[clave] ? base[clave]({ cuerpo }) : [];
    const esObjeto = valor !== null && typeof valor === "object" && !Array.isArray(valor);
    const { __mensaje: mensaje, ...datos } = esObjeto ? valor : {};
    return route.fulfill({ headers: cors, json: { ok: true, mensaje, data: esObjeto ? datos : valor } });
  });

  return {
    pedidos,
    responder: (metodo, ruta, fn) => especiales.set(`${metodo} ${ruta}`, fn),
    ultimo: (metodo, ruta) => pedidos.filter((p) => p.metodo === metodo && p.ruta === ruta).at(-1),
  };
}

/** Pedido guardado en el navegador (ROP-13), como lo deja "Agregar al pedido". */
export async function conPedidoLocal(page) {
  await page.addInitScript(() => localStorage.setItem("stilos_pedido", JSON.stringify({ actualizado: Date.now(), items: [
    { variante_id: 12, prenda_id: 1, slug: "remera-taverniti-negro", nombre: "Remera Taverniti", color: "Negro", talle: "M", precio: 18500, foto: null, cantidad: 2 },
  ] })));
}

/** Nada se sale del ancho de la pantalla (celulares de 320 px incluidos). */
export async function sinDesborde(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
}

/** En celular los filtros del catálogo están plegados detrás de "Filtrar". */
export async function abrirFiltros(page, info) {
  if (info.project.name !== "desktop") await page.getByRole("button", { name: "Filtrar" }).click();
}
