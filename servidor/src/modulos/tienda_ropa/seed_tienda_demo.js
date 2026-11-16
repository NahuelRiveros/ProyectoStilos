import { mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Op, fn, col, where as donde } from "sequelize";
import { env } from "../../core/configuracion_servidor/env.js";
import { conectarDB, sequelize, DB_SCHEMA } from "../../core/database/sequelize.js";
import { CategoriaRopa, ColorRopa, GrupoTalle, MarcaRopa, Prenda, PrendaImagen, Talle } from "./models/index.js";
import { esquemaPrenda, slug } from "./reglas.js";
import { COLORES_SUGERIDOS } from "./sugeridos.js";
import * as listas from "./services/listas_service.js";
import { crearPrenda } from "./services/prendas_service.js";

// Tienda de demostración para la base LOCAL (spec docs/specs/cambios/2026-11-tienda-demo.md).
// Uso: npm --prefix servidor run demo:tienda            → carga (no duplica)
//      npm --prefix servidor run demo:tienda -- --borrar → saca lo que cargó
// Todo es ficticio: nombres, precios y fotos (siluetas dibujadas acá, sin internet).

const DESCRIPCION_DEMO = "Prenda de demostración (datos ficticios)";
const CARPETA = fileURLToPath(new URL("../../../../frontend/public/catalogo-inicial/", import.meta.url));
const PREFIJO = "demo-";

// [marca, categoría › subcategoría…, nombre, color, forma de la foto, precio, precio anterior (oferta)]
const PRENDAS = [
  ["Taverniti", "Hombre/Remeras", "Remera Oversize Taverniti", "Negro", "remera", 32999],
  ["Taverniti", "Hombre/Jeans", "Jean Slim Taverniti", "Jean oscuro", "pantalon", 79999, 99999],
  ["Taverniti", "Calzado/Zapatillas", "Zapatilla Urbana Taverniti", "Blanco", "zapatilla", 119999],
  ["Bando", "Hombre/Camisas", "Camisa de Lino Bando", "Celeste", "camisa", 54999],
  ["Bando", "Hombre/Pantalones/Cargo", "Cargo Bando", "Verde militar", "pantalon", 69999, 84999],
  ["Bando", "Hombre/Bermudas", "Bermuda de Gabardina Bando", "Beige", "short", 39999],
  ["Raiders", "Hombre/Jeans", "Jean Recto Raiders", "Jean claro", "pantalon", 74999],
  ["Raiders", "Hombre/Buzos", "Buzo Canguro Raiders", "Gris melange", "buzo", 59999, 72999],
  ["Raiders", "Hombre/Camperas", "Campera Puffer Raiders", "Negro", "campera", 129999],
  ["Bravo", "Hombre/Chombas", "Chomba Piqué Bravo", "Azul marino", "remera", 44999],
  ["Bravo", "Hombre/Remeras", "Remera Estampada Bravo", "Blanco", "remera", 27999],
  ["Bravo", "Calzado/Botas y borcegos", "Borcego Bravo", "Marrón", "bota", 139999, 159999],
  ["BBN", "Hombre/Musculosas", "Musculosa Deportiva BBN", "Negro", "musculosa", 21999],
  ["BBN", "Hombre/Pantalones/Jogging", "Jogging BBN", "Gris oscuro", "pantalon", 45999],
  ["BBN", "Accesorios/Gorras", "Gorra BBN", "Negro", "gorra", 17999],
  ["Panther", "Calzado/Zapatillas", "Zapatilla Running Panther", "Azul", "zapatilla", 99999, 124999],
  ["Panther", "Hombre/Shorts", "Short Deportivo Panther", "Negro", "short", 24999],
  ["Panther", "Accesorios/Bolsos y mochilas", "Mochila Panther", "Gris oscuro", "mochila", 49999],
  ["AFF", "Mujer/Remeras", "Remera Básica AFF", "Rosa", "remera", 22999],
  ["AFF", "Mujer/Calzas", "Calza Deportiva AFF", "Negro", "pantalon", 34999, 41999],
  ["AFF", "Mujer/Buzos", "Buzo Oversize AFF", "Lila", "buzo", 52999],
  ["MAYCLA", "Mujer/Vestidos", "Vestido Floreado MAYCLA", "Terracota", "vestido", 64999],
  ["MAYCLA", "Mujer/Blusas", "Blusa de Satén MAYCLA", "Crudo", "camisa", 47999, 56999],
  ["MAYCLA", "Mujer/Polleras", "Pollera Midi MAYCLA", "Negro", "pollera", 42999],
  ["Isostasia", "Mujer/Jeans", "Jean Mom Isostasia", "Jean claro", "pantalon", 72999],
  ["Isostasia", "Mujer/Tops", "Top Isostasia", "Blanco", "musculosa", 25999],
  ["Isostasia", "Mujer/Camperas", "Campera de Jean Isostasia", "Jean oscuro", "campera", 89999, 105999],
  ["Cataleia", "Mujer/Pantalones/Palazzo", "Palazzo Cataleia", "Beige", "pantalon", 54999],
  ["Cataleia", "Mujer/Sweaters", "Sweater Tejido Cataleia", "Mostaza", "buzo", 58999],
  ["Cataleia", "Calzado/Sandalias", "Sandalia Plataforma Cataleia", "Negro", "zapatilla", 69999],
  ["Mistral", "Niños/Remeras", "Remera Niños Mistral", "Amarillo", "remera", 18999],
  ["Mistral", "Niños/Jeans", "Jean Niños Mistral", "Azul", "pantalon", 36999, 42999],
  ["Mistral", "Niños/Buzos", "Buzo Niños Mistral", "Rojo", "buzo", 32999],
  ["US Amerika", "Hombre/Camperas", "Campera Bomber US Amerika", "Verde oliva", "campera", 109999],
  ["US Amerika", "Hombre/Remeras", "Remera US Amerika", "Gris claro", "remera", 25999],
  ["US Amerika", "Accesorios/Cinturones", "Cinturón de Cuero US Amerika", "Marrón", "cinturon", 22999],
];

// Características que se tildan según la forma (grupo → valor de la lista sugerida).
const CARACTERISTICAS = {
  remera: { Estampa: "Liso", Tela: "Algodón", Manga: "Corta", Cuello: "Redondo" },
  musculosa: { Estampa: "Liso", Tela: "Algodón", Manga: "Sin mangas" },
  camisa: { Estampa: "Liso", Tela: "Lino", Manga: "Larga", Cuello: "Camisero" },
  buzo: { Material: "Frisa", Cuello: "Con capucha" },
  campera: { Material: "Sintético", Detalles: "Con cierre" },
  pantalon: { Calce: "Regular", Tiro: "Medio", Detalles: "Con bolsillos" },
  short: { Calce: "Regular", Detalles: "Con bolsillos" },
  vestido: { Estampa: "Floreado", Tela: "Viscosa", Manga: "Corta" },
  pollera: { Estampa: "Liso", Tela: "Satén" },
  zapatilla: { "Material del calzado": "Cuero", Calzado: "Con cordones" },
  bota: { "Material del calzado": "Cuero", Calzado: "Caña alta" },
  gorra: { "Material del accesorio": "Algodón" },
  mochila: { "Material del accesorio": "Lona" },
  cinturon: { "Material del accesorio": "Cuero" },
};

// Siluetas (viewBox 0 0 200 260). Dibujos simples propios: no son fotos de nadie.
const SILUETAS = {
  remera: "M60 32 L86 20 Q100 36 114 20 L140 32 L178 66 L157 88 L140 74 L140 236 L60 236 L60 74 L43 88 L22 66 Z",
  musculosa: "M72 22 Q100 60 128 22 L142 74 L142 236 L58 236 L58 74 Z",
  camisa: "M60 32 L86 18 L100 44 L114 18 L140 32 L186 186 L164 194 L140 96 L140 236 L60 236 L60 96 L36 194 L14 186 Z",
  buzo: "M60 40 Q70 8 100 8 Q130 8 140 40 L186 190 L164 198 L142 100 L142 236 L58 236 L58 100 L36 198 L14 190 Z",
  campera: "M58 34 L84 20 L100 34 L116 20 L142 34 L188 192 L166 200 L144 102 L144 238 L56 238 L56 102 L34 200 L12 192 Z",
  pantalon: "M60 18 L140 18 L152 244 L112 244 L100 92 L88 244 L48 244 Z",
  short: "M54 50 L146 50 L158 168 L110 168 L100 104 L90 168 L42 168 Z",
  vestido: "M78 18 L122 18 L132 72 L172 238 L28 238 L68 72 Z",
  pollera: "M66 52 L134 52 L172 224 L28 224 Z",
  zapatilla: "M18 176 L18 134 Q42 122 72 118 L112 92 Q126 86 138 102 L152 128 Q178 132 188 154 L188 178 Z",
  bota: "M64 34 L112 34 L114 150 Q152 156 178 178 L178 204 L56 204 Z",
  gorra: "M40 156 Q44 82 112 82 Q166 88 166 156 Z M150 150 L198 164 L150 170 Z",
  mochila: "M56 64 Q56 40 100 40 Q144 40 144 64 L150 234 L50 234 Z",
  cinturon: "M10 112 L190 112 L190 148 L10 148 Z M118 104 L156 104 L156 156 L118 156 Z",
};
const FONDOS = ["#F3EDE6", "#E9EEF2", "#EEF0E8", "#F2E9EC", "#ECEBF3", "#F4EFE3"];

/** Nunca contra producción: ni con NODE_ENV=production ni con una base remota configurada. */
function soloEnTuPc() {
  if (env.NODE_ENV === "production" || env.BD_URL) {
    throw new Error("La tienda de demostración es solo para tu PC (PostgreSQL local, sin BD_URL_SUPABASE).");
  }
}

const porNombre = (Modelo, nombre, extra = {}) =>
  Modelo.findOne({ where: { [Op.and]: [donde(fn("lower", col("nombre")), nombre.toLowerCase()), extra] } });

const archivoDe = (nombre, color) => `${PREFIJO}${slug(`${nombre} ${color}`)}.png`;

/** Dibuja las fotos con el Chromium de Playwright (dependencia del frontend). */
async function dibujarFotos() {
  const requerir = createRequire(fileURLToPath(new URL("../../../../frontend/package.json", import.meta.url)));
  const { chromium } = requerir("@playwright/test");
  const hex = new Map(COLORES_SUGERIDOS.map((c) => [c.nombre, c.hex]));
  await mkdir(CARPETA, { recursive: true });
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 600, height: 800 } });
  for (const [i, [marca, , nombre, color, forma]] of PRENDAS.entries()) {
    const relleno = hex.get(color) ?? "#888888";
    await pagina.setContent(`<!doctype html><html><body style="margin:0">
      <div style="width:600px;height:800px;background:${FONDOS[i % FONDOS.length]};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,Helvetica,sans-serif;position:relative">
        <svg viewBox="0 0 200 260" width="440" height="560"><path d="${SILUETAS[forma]}" fill="${relleno}" stroke="rgba(0,0,0,.25)" stroke-width="2" stroke-linejoin="round" fill-rule="evenodd"/></svg>
        <div style="position:absolute;top:28px;left:32px;font-size:30px;font-weight:900;letter-spacing:.08em;color:#1E2D3D;text-transform:uppercase">${marca}</div>
        <div style="position:absolute;bottom:26px;left:0;right:0;text-align:center;font-size:18px;font-weight:700;letter-spacing:.3em;color:rgba(30,45,61,.45);text-transform:uppercase">Foto de muestra</div>
      </div></body></html>`);
    await pagina.screenshot({ path: join(CARPETA, archivoDe(nombre, color)) });
  }
  await navegador.close();
}

/** Categoría por ruta ("Hombre/Pantalones/Cargo"): las sugeridas ya existen; si falta alguna, se crea. */
async function categoriaPorRuta(ruta) {
  let padre = null;
  for (const nombre of ruta.split("/")) {
    const existente = await porNombre(CategoriaRopa, nombre, { padre_id: padre?.id ?? null });
    padre = existente ?? await listas.crearCategoria({ nombre, padre_id: padre?.id ?? null, orden: 0, activo: true });
  }
  return padre;
}

/** El grupo de talles de la categoría o, si no tiene, el de la de arriba (ROP-36). */
async function grupoDe(categoria) {
  for (let c = categoria; c; c = c.padre_id ? await CategoriaRopa.findByPk(c.padre_id) : null) {
    if (c.grupo_talle_id) return GrupoTalle.findByPk(c.grupo_talle_id, { include: [{ model: Talle, as: "talles" }] });
  }
  return GrupoTalle.findOne({ where: { nombre: "Ropa" }, include: [{ model: Talle, as: "talles" }] });
}

async function cargar() {
  await listas.cargarMarcasSugeridas();
  await listas.cargarCategoriasSugeridas();
  await listas.cargarColoresSugeridos();
  await listas.cargarGruposSugeridos();
  await listas.cargarCaracteristicasSugeridas();
  const grupos = await listas.listarCaracteristicas();
  const idCaracteristica = (grupo, valor) => grupos.find((g) => g.nombre.toLowerCase() === grupo.toLowerCase())
    ?.caracteristicas.find((c) => c.nombre.toLowerCase() === valor.toLowerCase())?.id;

  console.log("Dibujando las fotos de muestra…");
  await dibujarFotos();

  let nuevas = 0;
  for (const [i, [nombreMarca, ruta, nombre, nombreColor, forma, precio, anterior = null]] of PRENDAS.entries()) {
    const marca = await porNombre(MarcaRopa, nombreMarca);
    const color = await porNombre(ColorRopa, nombreColor);
    if (!marca || !color) { console.warn(`Omitida "${nombre}": falta la marca o el color`); continue; }
    if (await Prenda.findOne({ where: { nombre, marca_id: marca.id }, attributes: ["id"] })) continue;
    const categoria = await categoriaPorRuta(ruta);
    const grupo = await grupoDe(categoria);
    const talles = [...grupo.talles].sort((a, b) => a.orden - b.orden);
    await crearPrenda(esquemaPrenda.parse({
      nombre, categoria_id: categoria.id, marca_id: marca.id, grupo_talle_id: grupo.id,
      precio, precio_anterior: anterior, activo: true,
      descripcion: `${DESCRIPCION_DEMO}. ${nombre} en ${nombreColor.toLowerCase()}. Nombre, precio y foto son de muestra.`,
      // Cada tercera prenda tiene el último talle agotado, para ver cómo se muestra.
      variantes: talles.map((t, j) => ({ color_id: color.id, talle_id: t.id, disponible: !(i % 3 === 0 && j === talles.length - 1) })),
      imagenes: [{ url: `/catalogo-inicial/${archivoDe(nombre, nombreColor)}`, color_id: color.id }],
      caracteristicas: Object.entries(CARACTERISTICAS[forma] ?? {}).map(([g, v]) => idCaracteristica(g, v)).filter(Boolean),
    }));
    nuevas++;
  }
  console.log(`Listo: ${nuevas} prendas nuevas (las que ya estaban no se tocaron). Total de la demostración: ${PRENDAS.length}.`);
}

async function borrar() {
  const prendas = await Prenda.findAll({ where: { descripcion: { [Op.startsWith]: DESCRIPCION_DEMO } }, attributes: ["id"] });
  const fotos = await PrendaImagen.findAll({ where: { prenda_id: prendas.map((p) => p.id) }, attributes: ["url"], raw: true });
  await Prenda.destroy({ where: { id: prendas.map((p) => p.id) } });
  for (const { url } of fotos) {
    const archivo = url.split("/").pop();
    if (archivo.startsWith(PREFIJO)) await rm(join(CARPETA, archivo), { force: true });
  }
  console.log(`Se borraron ${prendas.length} prendas de demostración y sus fotos.`);
}

async function main() {
  soloEnTuPc();
  await conectarDB();
  console.log(`Base local, schema "${DB_SCHEMA}"`);
  if (process.argv.includes("--borrar")) await borrar(); else await cargar();
}

main()
  .catch((error) => { console.error("No se pudo cargar la tienda de demostración:", error.message); process.exitCode = 1; })
  .finally(() => sequelize.close());
