import { proyecto } from "compartido/proyecto.js";

// Formulario de producto en modo indumentaria (catalogo.variantes: "talle_color"). En pantalla se
// eligen colores y talles y el precio se carga una sola vez; al guardar se arma una variante por
// combinación, que es lo que espera el servidor (productoSchema).

/** Clave de una combinación dentro del formulario (no numérica: React Hook Form la tomaría como índice de lista). */
export const claveCombinacion = (color_id, talle_id) => `c${color_id ?? 0}t${talle_id ?? 0}`;

/** Combinaciones en el orden en que se muestran y se guardan: por color y, dentro de cada color, por talle. */
export function listarCombinaciones({ colores = [], talles = [] }) {
  const porColor = colores.length ? colores : [null];
  const porTalle = talles.length ? talles : [null];
  const salida = [];
  for (const color_id of porColor) {
    for (const talle_id of porTalle) {
      if (color_id != null || talle_id != null) salida.push({ clave: claveCombinacion(color_id, talle_id), color_id, talle_id });
    }
  }
  return salida;
}

const unicos = (lista) => [...new Set(lista)];

export function valoresTalleColor(producto) {
  const vacio = {
    categoria_id: "",
    nombre: "",
    marca_id: "",
    descripcion: "",
    activo: true,
    publicado: true,
    grupo_talle_id: "",
    precio: "",
    precio_anterior: "",
    iva_porcentaje: proyecto.catalogo.iva_por_defecto,
    colores: [],
    talles: [],
    combinaciones: {},
  };
  if (!producto) return vacio;

  const variantes = producto.variantes;
  const ordenar = (clave) => (a, b) => (a[clave]?.orden ?? 0) - (b[clave]?.orden ?? 0) || a.id - b.id;
  const primera = variantes[0];
  return {
    ...vacio,
    categoria_id: String(producto.categoria_id),
    nombre: producto.nombre,
    marca_id: producto.marca_id ? String(producto.marca_id) : "",
    descripcion: producto.descripcion ?? "",
    activo: producto.activo,
    publicado: producto.publicado,
    grupo_talle_id: producto.grupo_talle_id ? String(producto.grupo_talle_id) : "",
    // El precio es el mismo para todas las combinaciones: se toma el de la primera.
    precio: primera?.precio ?? "",
    precio_anterior: primera?.precio_anterior ?? "",
    iva_porcentaje: primera ? Number(primera.iva_porcentaje) : vacio.iva_porcentaje,
    colores: unicos([...variantes].sort(ordenar("color")).map((v) => v.color_id).filter(Boolean)),
    talles: unicos([...variantes].sort(ordenar("talle")).map((v) => v.talle_id).filter(Boolean)),
    combinaciones: Object.fromEntries(
      variantes.map((v) => [claveCombinacion(v.color_id, v.talle_id), { id: v.id, sku: v.sku ?? "", activo: v.activo, controla_stock: v.controla_stock }]),
    ),
  };
}

/** Lo que se manda al servidor: una variante por combinación, todas con el mismo precio. */
export function armarProducto(valores) {
  const { precio, precio_anterior, iva_porcentaje, colores, talles, combinaciones, ...producto } = valores;
  return {
    ...producto,
    grupo_talle_id: talles.length ? producto.grupo_talle_id : "",
    variantes: listarCombinaciones({ colores, talles }).map(({ clave, color_id, talle_id }) => {
      const datos = combinaciones?.[clave] ?? {};
      return {
        ...(datos.id ? { id: datos.id, controla_stock: datos.controla_stock } : { stock_inicial: datos.stock_inicial }),
        color_id,
        talle_id,
        sku: datos.sku ?? "",
        activo: datos.activo ?? true,
        precio,
        precio_anterior,
        iva_porcentaje,
      };
    }),
  };
}
