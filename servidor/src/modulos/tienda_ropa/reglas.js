import { z } from "zod";

// Reglas del rubro sin acceso a la base, para probarlas solas (tests/ropa_reglas.test.mjs).
// Spec: docs/specs/cambios/2026-11-catalogo-ropa.md.

export const MAX_FOTOS_POR_COLOR = 3; // ROP-06
export const MAX_FOTOS_GENERALES = 10;
export const MAX_LINEAS_PEDIDO = 50;
export const MAX_CANTIDAD_LINEA = 99;
export const ESTADOS_PEDIDO = ["nuevo", "atendido", "cancelado"]; // ROP-15

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

/** ROP-06: qué falla en las fotos, o null. `coloresPrenda`: ids de color que tiene la prenda. */
export function problemaFotos(imagenes, coloresPrenda) {
  const porColor = new Map();
  for (const { color_id } of imagenes) porColor.set(color_id ?? null, (porColor.get(color_id ?? null) ?? 0) + 1);
  if ((porColor.get(null) ?? 0) > MAX_FOTOS_GENERALES) return `Hasta ${MAX_FOTOS_GENERALES} fotos generales.`;
  for (const [color, cantidad] of porColor) {
    if (color === null) continue;
    if (!coloresPrenda.includes(color)) return "Hay fotos de un color que la prenda no tiene.";
    if (cantidad > MAX_FOTOS_POR_COLOR) return `Hasta ${MAX_FOTOS_POR_COLOR} fotos por color.`;
  }
  return null;
}

// ── Esquemas de entrada (los usa el router con `validar`) ───────────────────────
const nombre = (max = 80) => z.string({ error: "Escribí el nombre." }).trim().min(1, "Escribí el nombre.").max(max, `Máximo ${max} caracteres.`);
const idOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.number().int().positive().nullable());
const orden = z.coerce.number().int().min(0).max(9999).default(0);

export const esquemaId = z.object({ id: z.coerce.number().int().positive("Id no válido.") });

export const esquemaCategoria = z.object({ nombre: nombre(), padre_id: idOpcional, orden, activo: z.boolean().default(true) });
export const esquemaMarca = z.object({ nombre: nombre(), activo: z.boolean().default(true) });
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
  url: z.string().trim().max(500).regex(/^https:\/\//, "La foto tiene que ser una dirección https."),
  color_id: idOpcional,
});

export const esquemaPrenda = z.object({
  nombre: nombre(120),
  descripcion: z.string().trim().max(2000).default(""),
  categoria_id: z.coerce.number({ error: "Elegí una categoría." }).int().positive("Elegí una categoría."),
  marca_id: idOpcional,
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
  const claves = prenda.variantes.map((v) => `${v.color_id}-${v.talle_id}`);
  if (new Set(claves).size !== claves.length) ctx.addIssue({ code: "custom", path: ["variantes"], message: "Hay talles y colores repetidos." });
  const problema = problemaFotos(prenda.imagenes, [...new Set(prenda.variantes.map((v) => v.color_id))]);
  if (problema) ctx.addIssue({ code: "custom", path: ["imagenes"], message: problema });
});

export const esquemaEstado = z.object({ activo: z.boolean({ error: "Indicá si queda activa o no." }) });

const filtroId = z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.coerce.number().int().positive().optional());
const filtrosPrendas = z.object({
  q: z.string().trim().max(80).optional(),
  categoria: filtroId, marca: filtroId, color: filtroId, talle: filtroId,
  pagina: z.coerce.number().int().min(1).max(10000).default(1),
});
export const ORDENES_CATALOGO = ["novedades", "menor_precio", "mayor_precio"]; // ROP-11
export const esquemaFiltrosCatalogo = filtrosPrendas.extend({
  orden: z.enum(ORDENES_CATALOGO, { error: "Orden no válido." }).default("novedades"),
  // Llega de la URL como texto: solo "1" o "true" lo prenden.
  ofertas: z.preprocess((v) => v === "1" || v === "true" || v === true, z.boolean()),
});
export const esquemaFiltrosPanel = filtrosPrendas.extend({
  estado: z.enum(["activas", "inactivas", "todas"]).default("todas"),
});
export const esquemaSlug = z.object({ slug: z.string().trim().regex(/^[a-z0-9-]{1,90}$/, "Prenda no válida.") });

// ROP-14 y ROP-16: el visitante manda solo qué variante y cuántas; precio y nombres los pone el servidor.
export const esquemaPedido = z.object({
  nombre: z.string({ error: "Escribí tu nombre." }).trim().min(2, "Escribí tu nombre.").max(80),
  celular: z.string({ error: "Escribí tu celular." }).trim()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .refine((v) => /^\+?\d{8,15}$/.test(v), "Escribí tu celular con código de área, solo números (ej. 3704123456)."),
  items: z.array(z.object({
    variante_id: z.coerce.number().int().positive(),
    cantidad: z.coerce.number().int().min(1).max(MAX_CANTIDAD_LINEA, `Hasta ${MAX_CANTIDAD_LINEA} unidades por prenda.`),
  })).min(1, "Tu pedido está vacío.").max(MAX_LINEAS_PEDIDO, `Hasta ${MAX_LINEAS_PEDIDO} prendas distintas por pedido.`)
    .refine((items) => new Set(items.map((i) => i.variante_id)).size === items.length, "Hay prendas repetidas en el pedido."),
});
export const esquemaEstadoPedido = z.object({ estado: z.enum(ESTADOS_PEDIDO, { error: "Estado no válido." }) });
export const esquemaFiltrosPedidos = z.object({
  estado: z.enum([...ESTADOS_PEDIDO, "todos"]).default("todos"),
  pagina: z.coerce.number().int().min(1).max(10000).default(1),
});
