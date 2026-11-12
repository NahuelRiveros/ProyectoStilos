import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Op, fn, col, where as donde } from "sequelize";
import { env } from "../../core/configuracion_servidor/env.js";
import { conectarDB, sequelize, DB_SCHEMA } from "../../core/database/sequelize.js";
import { Caracteristica, CategoriaRopa, ColorRopa, GrupoCaracteristica, GrupoTalle, MarcaRopa, Prenda, Talle } from "./models/index.js";
import { esquemaPrenda, slug } from "./reglas.js";
import * as listas from "./services/listas_service.js";
import { crearPrenda } from "./services/prendas_service.js";

// Catálogo de ejemplo para probar la tienda en tu PC (spec docs/specs/cambios/2026-11-catalogo-ejemplo.md).
// Uso, desde servidor/: node src/modulos/tienda_ropa/seed_catalogo_ejemplo.js
// Pasa por los mismos servicios y reglas que el panel. Las prendas quedan ocultas, y las fotos se
// bajan a frontend/public/catalogo-inicial/, que no va a git (son de otras tiendas: solo para probar).

const EJEMPLOS = [
  {
    marca: "Taverniti", categoria: "Calzado", subcategoria: "Zapatillas", grupo: "Calzado",
    caracteristicas: { Material: "Cuero", Calzado: "Con cordones" },
    nombre: "Zapatilla Jagger Taverniti", color: "Negro", talles: ["40", "41", "42", "43"], precio: 117399,
    fuente: "https://www.triax.com.ar/collections/hombre/products/29750602-zapatilla-jagger",
    foto: { json: "https://www.triax.com.ar/products/29750602-zapatilla-jagger.js" },
  },
  {
    marca: "Taverniti", categoria: "Hombre", subcategoria: "Remeras", grupo: "Ropa",
    caracteristicas: { Estampa: "Liso", Material: "Algodón", Manga: "Corta", Cuello: "Redondo" },
    nombre: "Remera Lisa Taverniti Fortaleza", color: "Blanco", talles: ["S", "M", "L", "XL", "XXL", "XXXL"], precio: 30399,
    fuente: "https://www.wokerbysporting.com.ar/remera-taverniti-fortaleza-de-hombre-tv09234-601/p",
    foto: { url: "https://woker.vtexassets.com/arquivos/ids/604418-800-800?aspect=true&height=800&width=800" },
  },
  {
    marca: "Taverniti", categoria: "Hombre", subcategoria: "Jeans", grupo: "Jeans",
    caracteristicas: { Material: "Denim", Calce: "Regular" },
    nombre: "Jean Howie Taverniti", color: "Azul", talles: ["36", "38", "40", "42"], precio: 76830, precio_anterior: 118200,
    fuente: "https://taverniti.com.ar/productos/jean-howie-de-denim-regular-fit-azul-15tpb/",
    foto: { url: "https://acdn-us.mitiendanube.com/stores/007/090/253/products/13878_245x1-327d69a091870ba5e617851825845935-100-0.jpg" },
  },
];

const CARPETA_FOTOS = fileURLToPath(new URL("../../../../frontend/public/catalogo-inicial/", import.meta.url));
const EXTENSION = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const NAVEGADOR = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" };

/** Nunca contra producción: ni con NODE_ENV=production ni con una BD_URL (la base remota). */
function soloEnTuPc() {
  if (env.NODE_ENV === "production" || env.BD_URL) {
    throw new Error("El catálogo de ejemplo es solo para tu PC (PostgreSQL local, sin BD_URL).");
  }
}

/** Busca por nombre sin importar mayúsculas (así "Maycla" no duplica "MAYCLA"). */
const porNombre = (Modelo, nombre, extra = {}) =>
  Modelo.findOne({ where: { [Op.and]: [donde(fn("lower", col("nombre")), nombre.toLowerCase()), extra] } });

async function bajarFoto({ json, url }, nombre) {
  let origen = url;
  if (json) {
    const ficha = await fetch(json, { headers: NAVEGADOR });
    if (!ficha.ok) throw new Error(`No se pudo leer ${json} (${ficha.status})`);
    const datos = await ficha.json();
    origen = datos.featured_image ?? datos.images?.[0];
  }
  if (!origen) throw new Error(`Sin foto para ${nombre}`);
  const respuesta = await fetch(origen.startsWith("//") ? `https:${origen}` : origen, { headers: NAVEGADOR });
  if (!respuesta.ok) throw new Error(`No se pudo bajar la foto (${respuesta.status}): ${origen}`);
  const extension = EXTENSION[(respuesta.headers.get("content-type") ?? "").split(";")[0].trim()];
  const contenido = Buffer.from(await respuesta.arrayBuffer());
  if (!extension || !contenido.length || contenido.length > 5 * 1024 * 1024) throw new Error(`Foto no válida: ${origen}`);
  await mkdir(CARPETA_FOTOS, { recursive: true });
  await writeFile(join(CARPETA_FOTOS, `${nombre}.${extension}`), contenido);
  return `/catalogo-inicial/${nombre}.${extension}`;
}

async function categoria(nombre, padre) {
  const existente = await porNombre(CategoriaRopa, nombre, { padre_id: padre?.id ?? null });
  return existente ?? listas.crearCategoria({ nombre, padre_id: padre?.id ?? null, orden: 0, activo: true });
}

/** { Material: "Cuero" } → ids; lo que no esté en el panel se saltea. */
async function idsDeCaracteristicas(porGrupo) {
  const ids = [];
  for (const [grupo, valor] of Object.entries(porGrupo)) {
    const delGrupo = await porNombre(GrupoCaracteristica, grupo);
    const caracteristica = delGrupo && await porNombre(Caracteristica, valor, { grupo_caracteristica_id: delGrupo.id });
    if (caracteristica) ids.push(caracteristica.id);
  }
  return ids;
}

async function cargarEjemplo(ejemplo) {
  const marca = await porNombre(MarcaRopa, ejemplo.marca);
  const color = await porNombre(ColorRopa, ejemplo.color);
  const grupo = await GrupoTalle.findOne({ where: { nombre: ejemplo.grupo }, include: [{ model: Talle, as: "talles" }] });
  if (!marca || !color || !grupo) throw new Error(`Falta la marca, el color o el grupo de talles de "${ejemplo.nombre}"`);
  // Idempotente: el mismo modelo y color no se carga dos veces.
  const yaEsta = await Prenda.findOne({ where: { nombre: ejemplo.nombre, marca_id: marca.id }, attributes: ["id"] });
  if (yaEsta) return console.log(`Ya estaba: ${ejemplo.nombre}`);

  const raiz = await categoria(ejemplo.categoria, null);
  const destino = ejemplo.subcategoria ? await categoria(ejemplo.subcategoria, raiz) : raiz;
  // Solo los talles que existen en el grupo: no se tocan los grupos sugeridos (ni su orden).
  const talles = grupo.talles.filter((t) => ejemplo.talles.includes(t.nombre));
  const caracteristicas = await idsDeCaracteristicas(ejemplo.caracteristicas);
  const archivo = slug(`ejemplo ${ejemplo.nombre} ${ejemplo.color}`);
  const foto = await bajarFoto(ejemplo.foto, archivo);

  await crearPrenda(esquemaPrenda.parse({
    nombre: ejemplo.nombre, categoria_id: destino.id, marca_id: marca.id, caracteristicas, grupo_talle_id: grupo.id,
    precio: ejemplo.precio, precio_anterior: ejemplo.precio_anterior ?? null, activo: false,
    descripcion: `Prenda de ejemplo (referencia: ${ejemplo.fuente}). Confirmá precio, talles y stock del local antes de mostrarla.`,
    variantes: talles.map((t) => ({ color_id: color.id, talle_id: t.id, disponible: true })),
    imagenes: [{ url: foto, color_id: color.id }],
  }));
  console.log(`Ejemplo listo (oculto): ${ejemplo.nombre} · ${ejemplo.color}`);
}

async function cargarCatalogoEjemplo() {
  soloEnTuPc();
  await conectarDB();
  console.log(`Base local, schema "${DB_SCHEMA}"`);
  // Lo mismo que los botones "Cargar sugeridos" del panel: sin duplicados.
  await listas.cargarMarcasSugeridas();
  await listas.cargarCategoriasSugeridas();
  await listas.cargarColoresSugeridos();
  await listas.cargarGruposSugeridos();
  await listas.cargarCaracteristicasSugeridas();
  for (const ejemplo of EJEMPLOS) {
    try { await cargarEjemplo(ejemplo); } catch (error) { console.warn(`Omitido "${ejemplo.nombre}": ${error.message}`); }
  }
}

cargarCatalogoEjemplo()
  .catch((error) => { console.error("No se pudo cargar el catálogo de ejemplo:", error.message); process.exitCode = 1; })
  .finally(() => sequelize.close());
