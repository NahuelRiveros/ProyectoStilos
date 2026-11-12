import { z } from "zod";

// Reglas del rubro sin acceso a la base, para probarlas solas (tests/ropa_reglas.test.mjs).
// Spec: docs/specs/cambios/2026-11-catalogo-ropa.md.

export const MAX_FOTOS = 3; // ROP-29 (reemplaza ROP-06): fotos por prenda
export const MAX_LINEAS_PEDIDO = 50;
export const MAX_CANTIDAD_LINEA = 99;
// ── Pedidos: estados, pago y comprobantes (spec 2026-11-cuentas-y-transferencias.md) ──
export const ESTADOS_PEDIDO = ["recibido", "confirmado", "listo_retirar", "enviado", "entregado", "cancelado"];
export const ESTADOS_PAGO = ["pendiente", "en_revision", "pagado"];
export const ESTADOS_COMPROBANTE = ["en_revision", "aceptado", "rechazado"];
export const FORMAS_PAGO = ["transferencia", "efectivo", "coordinar"]; // ROP-44
export const MAX_COMPROBANTES = 3; // ROP-48
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;

/** A dónde puede pasar cada estado. "Listo para retirar" es solo para retiro y "Enviado" solo para envío. */
const TRANSICIONES = {
  recibido: ["confirmado", "cancelado"],
  confirmado: ["listo_retirar", "enviado", "recibido", "cancelado"],
  listo_retirar: ["entregado", "confirmado", "cancelado"],
  enviado: ["entregado", "confirmado", "cancelado"],
  entregado: ["confirmado"],
  cancelado: ["recibido"],
};
const ORDEN_ESTADOS = { recibido: 0, confirmado: 1, listo_retirar: 2, enviado: 2, entregado: 3 };

/** Por qué no se puede pasar de `desde` a `hacia`, o null si se puede. */
export function problemaTransicion(desde, hacia, entrega) {
  if (!TRANSICIONES[desde]?.includes(hacia)) return "Ese cambio de estado no es posible desde el estado actual.";
  if (hacia === "listo_retirar" && entrega !== "retiro") return "\"Listo para retirar\" es para pedidos que se retiran en el local.";
  if (hacia === "enviado" && entrega !== "envio") return "\"Enviado\" es para pedidos con envío a domicilio.";
  return null;
}

/** ROP-54: cancelar, volver atrás o reabrir pide un motivo. */
export const pideMotivo = (desde, hacia) =>
  hacia === "cancelado" || desde === "cancelado" || desde === "entregado" || ORDEN_ESTADOS[hacia] < ORDEN_ESTADOS[desde];

/** El próximo paso natural (el botón principal del panel). */
export function proximoPaso({ estado, entrega }) {
  if (estado === "recibido") return "confirmado";
  if (estado === "confirmado") return entrega === "envio" ? "enviado" : "listo_retirar";
  if (estado === "listo_retirar" || estado === "enviado") return "entregado";
  return null;
}

/** ROP-48: se reconoce el archivo por sus primeros bytes, no por el nombre: un .exe renombrado no pasa. */
const FIRMAS = [
  { formato: "pdf", es: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { formato: "jpg", es: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { formato: "png", es: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { formato: "webp", es: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP" },
];
export function formatoComprobante(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  return FIRMAS.find((f) => f.es(buffer))?.formato ?? null;
}

/** ROP-47: transferencia solo si están todos los datos bancarios (no se ofrece con datos a medias). */
export const transferenciaDisponible = (datos) =>
  ["titular", "banco", "cbu", "alias", "cuit"].every((campo) => String(datos?.[campo] ?? "").trim() !== "");

export const ETIQUETA_ESTADO = {
  recibido: "Recibido", confirmado: "Confirmado", listo_retirar: "Listo para retirar",
  enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
};

/** ROP-48: por qué el pedido no admite otro comprobante, o null. */
export function problemaComprobante(pedido, cantidadPrevia) {
  if (pedido.forma_pago !== "transferencia") return "Este pedido no se paga por transferencia.";
  if (pedido.estado === "cancelado") return "El pedido está cancelado.";
  if (pedido.estado_pago === "pagado") return "El pedido ya figura como pagado.";
  if (cantidadPrevia >= MAX_COMPROBANTES) return `Ya subiste ${MAX_COMPROBANTES} comprobantes. Si hace falta otro, escribinos por WhatsApp.`;
  return null;
}
export const ENTREGAS = ["retiro", "envio"]; // ROP-18

/** ROP-18: el envío es gratis si llega al mínimo. `desde` null = nunca. Montos en centavos. */
export const esEnvioGratis = (entrega, totalCentavos, desdePesos) =>
  entrega === "envio" && desdePesos !== null && desdePesos !== undefined && totalCentavos >= Math.round(desdePesos * 100);

/** "Remeras de Algodón" → "remeras-de-algodon": para URLs legibles. */
export function slug(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
}

/** Lista plana [{ id, padre_id }] → árbol con `hijas`, ordenado como vino. */
export function armarArbol(categorias) {
  const porId = new Map(categorias.map((c) => [c.id, { ...c, hijas: [] }]));
  const raices = [];
  for (const nodo of porId.values()) {
    const padre = nodo.padre_id ? porId.get(nodo.padre_id) : null;
    (padre ? padre.hijas : raices).push(nodo);
  }
  return raices;
}

/** Ids de una categoría y todas sus descendientes (filtrar "Mujer" incluye "Mujer › Remeras"). */
export function conDescendientes(categorias, id) {
  const ids = new Set([id]);
  let crecio = true;
  while (crecio) {
    crecio = false;
    for (const c of categorias) if (c.padre_id && ids.has(c.padre_id) && !ids.has(c.id)) { ids.add(c.id); crecio = true; }
  }
  return [...ids];
}

/** ROP-01: mover una categoría adentro de sí misma o de una hija dejaría un ciclo. */
export const creaCiclo = (categorias, id, nuevoPadreId) =>
  nuevoPadreId != null && conDescendientes(categorias, id).includes(nuevoPadreId);

/** ROP-29: qué falla en las fotos, o null. `coloresPrenda`: ids de color que tiene la prenda. */
export function problemaFotos(imagenes, coloresPrenda) {
  if (imagenes.length > MAX_FOTOS) return `Hasta ${MAX_FOTOS} fotos por prenda.`;
  if (imagenes.some((i) => i.color_id != null && !coloresPrenda.includes(i.color_id))) return "Hay fotos de un color que la prenda no tiene.";
  return null;
}

/** ROP-30: mismo modelo = mismo nombre sin importar mayúsculas ni espacios de más. */
export const claveModelo = (nombre) => String(nombre ?? "").trim().replace(/\s+/g, " ").toLowerCase();

// ── Esquemas de entrada (los usa el router con `validar`) ───────────────────────
const nombre = (max = 80) => z.string({ error: "Escribí el nombre." }).trim().min(1, "Escribí el nombre.").max(max, `Máximo ${max} caracteres.`);
const idOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.number().int().positive().nullable());
const orden = z.coerce.number().int().min(0).max(9999).default(0);

export const esquemaId = z.object({ id: z.coerce.number().int().positive("Id no válido.") });

export const esquemaCategoria = z.object({ nombre: nombre(), padre_id: idOpcional, grupo_talle_id: idOpcional, orden, activo: z.boolean().default(true) });
const urlImagen = (mensaje) => z.string().trim().max(500).refine(
  // ROP-34: o https, o una foto del catálogo de ejemplo (solo en tu PC; esa carpeta no va a git).
  (v) => /^https:\/\//.test(v) || /^\/catalogo-inicial\/[a-z0-9][a-z0-9_-]*\.(jpg|jpeg|png|webp)$/i.test(v),
  mensaje,
);
const urlOpcional = (mensaje) => z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  urlImagen(mensaje).nullable(),
).default(null);
export const esquemaMarca = z.object({ nombre: nombre(), activo: z.boolean().default(true), logo_url: urlOpcional("El logo tiene que ser una URL https o una imagen local del catálogo inicial.") });
export const esquemaDiseno = z.object({ nombre: nombre(40), orden }); // ROP-23
export const esquemaColor = z.object({
  nombre: nombre(40),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "El color tiene que ser como #1E2D3D.").transform((v) => v.toUpperCase()),
  orden,
});
export const esquemaGrupoTalle = z.object({
  nombre: nombre(40),
  orden,
  talles: z.array(z.string().trim().min(1).max(10)).min(1, "Agregá al menos un talle.").max(40)
    .refine((t) => new Set(t.map((x) => x.toUpperCase())).size === t.length, "Hay talles repetidos."),
});

const variante = z.object({ color_id: z.coerce.number().int().positive(), talle_id: z.coerce.number().int().positive(), disponible: z.boolean().default(true) });
const imagen = z.object({
  url: urlImagen("La foto tiene que ser una URL https o una imagen local del catálogo inicial."),
  color_id: idOpcional,
});

export const esquemaPrenda = z.object({
  nombre: nombre(120),
  descripcion: z.string().trim().max(2000).default(""),
  categoria_id: z.coerce.number({ error: "Elegí una categoría." }).int().positive("Elegí una categoría."),
  marca_id: idOpcional,
  diseno_id: idOpcional, // ROP-23
  grupo_talle_id: z.coerce.number({ error: "Elegí el grupo de talles." }).int().positive("Elegí el grupo de talles."),
  // ROP-07: un precio por prenda.
  precio: z.coerce.number({ error: "Escribí el precio." }).positive("El precio tiene que ser mayor a 0.").max(99999999),
  // ROP-17: vacío = sin oferta.
  precio_anterior: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number({ error: "El precio anterior tiene que ser un número." }).positive().max(99999999).nullable(),
  ).default(null),
  activo: z.boolean().default(true),
  variantes: z.array(variante).min(1, "Tildá al menos un talle y un color.").max(400),
  imagenes: z.array(imagen).max(200).default([]),
}).superRefine((prenda, ctx) => {
  if (prenda.precio_anterior !== null && prenda.precio_anterior <= prenda.precio) {
    ctx.addIssue({ code: "custom", path: ["precio_anterior"], message: "El precio anterior tiene que ser mayor que el precio actual." });
  }
  // ROP-29: cada color se carga como una prenda aparte.
  if (new Set(prenda.variantes.map((v) => v.color_id)).size > 1) {
    ctx.addIssue({ code: "custom", path: ["variantes"], message: "Cada prenda es de un solo color. Cargá los otros colores como prendas nuevas." });
  }
  const claves = prenda.variantes.map((v) => `${v.color_id}-${v.talle_id}`);
  if (new Set(claves).size !== claves.length) ctx.addIssue({ code: "custom", path: ["variantes"], message: "Hay talles y colores repetidos." });
  const problema = problemaFotos(prenda.imagenes, [...new Set(prenda.variantes.map((v) => v.color_id))]);
  if (problema) ctx.addIssue({ code: "custom", path: ["imagenes"], message: problema });
});

export const esquemaEstado = z.object({ activo: z.boolean({ error: "Indicá si queda activa o no." }) });

const filtroId = z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.coerce.number().int().positive().optional());
const filtrosPrendas = z.object({
  q: z.string().trim().max(80).optional(),
  categoria: filtroId, marca: filtroId, color: filtroId, talle: filtroId, diseno: filtroId,
  pagina: z.coerce.number().int().min(1).max(10000).default(1),
});
export const ORDENES_CATALOGO = ["novedades", "menor_precio", "mayor_precio"]; // ROP-11
export const esquemaFiltrosCatalogo = filtrosPrendas.extend({
  orden: z.enum(ORDENES_CATALOGO, { error: "Orden no válido." }).default("novedades"),
  // Llega de la URL como texto: solo "1" o "true" lo prenden.
  ofertas: z.preprocess((v) => v === "1" || v === "true" || v === true, z.boolean()),
});
export const esquemaOpcionesFiltro = z.object({ categoria: filtroId }); // ROP-28
export const esquemaFiltrosPanel = filtrosPrendas.extend({
  estado: z.enum(["activas", "inactivas", "todas"]).default("todas"),
});
export const esquemaSlug = z.object({ slug: z.string().trim().regex(/^[a-z0-9-]{1,90}$/, "Prenda no válida.") });

/** ROP-18: si es envío, dirección y localidad son obligatorias. */
function entregaCompleta(pedido, ctx) {
  if (pedido.entrega !== "envio") return;
  if (!pedido.direccion || pedido.direccion.length < 5) ctx.addIssue({ code: "custom", path: ["direccion"], message: "Escribí la dirección de entrega (calle y número)." });
  if (!pedido.localidad || pedido.localidad.length < 2) ctx.addIssue({ code: "custom", path: ["localidad"], message: "Escribí la localidad." });
}
const sinDireccionSiRetira = (pedido) => (pedido.entrega === "retiro" ? { ...pedido, direccion: null, localidad: null } : pedido);

// ROP-14 y ROP-16: el visitante manda solo qué variante y cuántas; precio y nombres los pone el servidor.
const esquemaPedidoBase = z.object({
  nombre: z.string({ error: "Escribí tu nombre." }).trim().min(2, "Escribí tu nombre.").max(80),
  celular: z.string({ error: "Escribí tu celular." }).trim()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .refine((v) => /^\+?\d{8,15}$/.test(v), "Escribí tu celular con código de área, solo números (ej. 3704123456)."),
  items: z.array(z.object({
    variante_id: z.coerce.number().int().positive(),
    cantidad: z.coerce.number().int().min(1).max(MAX_CANTIDAD_LINEA, `Hasta ${MAX_CANTIDAD_LINEA} unidades por prenda.`),
  })).min(1, "Tu pedido está vacío.").max(MAX_LINEAS_PEDIDO, `Hasta ${MAX_LINEAS_PEDIDO} prendas distintas por pedido.`)
    .refine((items) => new Set(items.map((i) => i.variante_id)).size === items.length, "Hay prendas repetidas en el pedido."),
  entrega: z.enum(ENTREGAS, { error: "Elegí si retirás o te lo enviamos." }),
  direccion: z.string().trim().max(120, "Máximo 120 caracteres.").optional(),
  localidad: z.string().trim().max(80, "Máximo 80 caracteres.").optional(),
});
export const esquemaPedido = esquemaPedidoBase.superRefine(entregaCompleta).transform(sinDireccionSiRetira);
const motivo = z.string().trim().min(3, "Escribí el motivo (al menos 3 letras).").max(500, "Máximo 500 caracteres.");
// ROP-54: `version` es la que vio quien cambia; si otro cambió el pedido antes, se avisa.
export const esquemaEstadoPedido = z.object({
  estado: z.enum(ESTADOS_PEDIDO, { error: "Estado no válido." }),
  motivo: motivo.optional(),
  version: z.coerce.number().int().positive(),
});
export const esquemaFiltrosPedidos = z.object({
  estado: z.enum([...ESTADOS_PEDIDO, "todos"]).default("todos"),
  pago: z.enum([...ESTADOS_PAGO, "todos"]).default("todos"),
  q: z.string().trim().max(60).optional(),
  pagina: z.coerce.number().int().min(1).max(10000).default(1),
});
export const esquemaMotivo = z.object({ motivo });
export const esquemaComprobante = z.object({ id: z.coerce.number().int().positive(), comprobanteId: z.coerce.number().int().positive() });

// ── Cuenta del cliente (ROP-40 a ROP-53) ──
const texto = (max, mensaje) => z.string({ error: mensaje }).trim().min(2, mensaje).max(max, `Máximo ${max} caracteres.`);
export const esquemaMisDatos = z.object({
  nombre: texto(100, "Escribí tu nombre."),
  apellido: texto(100, "Escribí tu apellido."),
  celular: esquemaPedidoBase.shape.celular,
  direccion: z.string().trim().max(120).optional().default(""),
  localidad: z.string().trim().max(80).optional().default(""),
  codigo_postal: z.string().trim().max(10).optional().default(""),
});
export const esquemaPedidoCuenta = z.object({
  items: esquemaPedidoBase.shape.items,
  entrega: esquemaPedidoBase.shape.entrega,
  direccion: z.string().trim().max(120).optional(),
  localidad: z.string().trim().max(80).optional(),
  forma_pago: z.enum(FORMAS_PAGO, { error: "Elegí cómo vas a pagar." }),
  clave_envio: z.string().trim().min(8).max(64),
}).superRefine(entregaCompleta).superRefine((pedido, ctx) => {
  if (pedido.forma_pago === "efectivo" && pedido.entrega !== "retiro") ctx.addIssue({ code: "custom", path: ["forma_pago"], message: "En efectivo se paga al retirar en el local." });
}).transform(sinDireccionSiRetira);
