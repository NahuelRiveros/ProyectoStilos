import { sequelize } from "../../nucleo/db/sequelize.js";
import { Conflicto, DatosInvalidos, NoEncontrado } from "../../nucleo/errores.js";
import { eliminarImagenGuardada, subirImagen } from "../../nucleo/imagenes.js";
import { maximoImagenes } from "compartido/reglas/imagenes_producto.js";
import { Color, Producto, ProductoImagen, Variante } from "./modelos.js";

const ATRIBUTOS = ["id", "producto_id", "url", "alt", "color_id", "orden"];

async function buscarProducto(producto_id, transaction) {
  // Con transacción se bloquea el producto: dos subidas a la vez no pueden pasarse del límite.
  const producto = await Producto.findOne({ where: { id: producto_id, eliminado_en: null }, attributes: ["id", "nombre"], transaction, lock: transaction?.LOCK.UPDATE });
  if (!producto) throw new NoEncontrado("El producto no existe.", "PRODUCTO_NO_ENCONTRADO");
  return producto;
}

// El límite es por color (null = fotos generales), ver compartido/reglas/imagenes_producto.js.
async function verificarLugar({ producto_id, color_id, transaction }) {
  const cantidad = await ProductoImagen.count({ where: { producto_id, color_id }, transaction });
  const maximo = maximoImagenes(color_id);
  if (cantidad < maximo) return;
  if (color_id == null) throw new Conflicto(`El producto ya tiene ${maximo} fotos generales (el máximo).`, "LIMITE_IMAGENES");
  const color = await Color.findByPk(color_id, { attributes: ["nombre"], transaction });
  throw new Conflicto(`${color?.nombre ?? "Ese color"} ya tiene ${maximo} fotos (el máximo por color). Quitá una para subir otra.`, "LIMITE_IMAGENES");
}

async function productoConLugar({ producto_id, color_id, transaction }) {
  const producto = await buscarProducto(producto_id, transaction);
  await validarColor({ producto_id, color_id, transaction });
  await verificarLugar({ producto_id, color_id, transaction });
  const orden = (await ProductoImagen.max("orden", { where: { producto_id }, transaction })) ?? -1;
  return { producto, orden: orden + 1 };
}

// La foto solo puede ser de un color que la prenda tenga (así la tienda la muestra al elegirlo).
async function validarColor({ producto_id, color_id, transaction }) {
  if (color_id == null) return;
  const tiene = await Variante.findOne({ where: { producto_id, color_id, eliminado_en: null }, attributes: ["id"], transaction });
  if (!tiene) throw new DatosInvalidos("Revisá los datos ingresados.", [{ campo: "color_id", mensaje: "Ese color no está entre los de la prenda" }]);
}

function plano(imagen) {
  const { id, producto_id, url, alt, color_id, orden } = imagen.get({ plain: true });
  return { id, producto_id, url, alt, color_id, orden };
}

/** Sube el archivo al almacén y lo registra al final de la galería del producto. */
export async function agregarImagenArchivo(producto_id, archivo, { alt = null, color_id = null } = {}) {
  if (!archivo) throw new DatosInvalidos("Elegí una imagen para subir.");
  // Se revisa antes de subir (para no gastar la subida) y otra vez al registrar (por si otra subida llegó antes).
  const { producto } = await productoConLugar({ producto_id, color_id });
  const subida = await subirImagen(archivo.buffer, { carpeta: "productos" });
  try {
    return await sequelize.transaction(async (transaction) => {
      const { orden } = await productoConLugar({ producto_id, color_id, transaction });
      return plano(
        await ProductoImagen.create({ producto_id, url: subida.url, public_id: subida.public_id, alt: alt ?? producto.nombre, color_id, orden }, { transaction }),
      );
    });
  } catch (error) {
    // No dejar la imagen huérfana en el almacén si no se pudo registrar.
    await eliminarImagenGuardada(subida.public_id);
    throw error;
  }
}

/** Imagen alojada en otro lado (https). Útil si no hay almacén configurado. */
export async function agregarImagenUrl(producto_id, { url, alt, color_id = null }) {
  return sequelize.transaction(async (transaction) => {
    const { producto, orden } = await productoConLugar({ producto_id, color_id, transaction });
    return plano(await ProductoImagen.create({ producto_id, url, alt: alt ?? producto.nombre, color_id, orden }, { transaction }));
  });
}

/** Cambia de qué color es una foto ya subida (null = general). */
export async function cambiarColorImagen(producto_id, imagen_id, { color_id }) {
  return sequelize.transaction(async (transaction) => {
    await buscarProducto(producto_id, transaction);
    const imagen = await ProductoImagen.findOne({ where: { id: imagen_id, producto_id }, transaction });
    if (!imagen) throw new NoEncontrado("La imagen no existe.", "IMAGEN_NO_ENCONTRADA");
    if ((imagen.color_id ?? null) === (color_id ?? null)) return plano(imagen);
    await validarColor({ producto_id, color_id, transaction });
    await verificarLugar({ producto_id, color_id, transaction });
    await imagen.update({ color_id }, { transaction });
    return plano(imagen);
  });
}

export async function eliminarImagen(producto_id, imagen_id) {
  const imagen = await ProductoImagen.findOne({ where: { id: imagen_id, producto_id } });
  if (!imagen) throw new NoEncontrado("La imagen no existe.", "IMAGEN_NO_ENCONTRADA");
  await imagen.destroy();
  await eliminarImagenGuardada(imagen.public_id);
}

/** `ids` en el orden deseado; la primera es la imagen principal. Tienen que estar todas. */
export async function ordenarImagenes(producto_id, ids) {
  return sequelize.transaction(async (transaction) => {
    const actuales = await ProductoImagen.findAll({ where: { producto_id }, attributes: ["id"], transaction, lock: transaction.LOCK.UPDATE });
    const mismas = actuales.length === ids.length && new Set(ids).size === ids.length && actuales.every((a) => ids.includes(a.id));
    if (!mismas) throw new DatosInvalidos("El orden tiene que incluir todas las imágenes del producto, una sola vez.");
    for (const [orden, id] of ids.entries()) {
      await ProductoImagen.update({ orden }, { where: { id, producto_id }, transaction });
    }
    const ordenadas = await ProductoImagen.findAll({ where: { producto_id }, attributes: ATRIBUTOS, order: [["orden", "ASC"]], transaction });
    return ordenadas.map(plano);
  });
}
