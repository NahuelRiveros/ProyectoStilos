import { Router } from "express";
import { idParams } from "compartido/schemas/comunes.js";
import {
  ajustePreciosSchema,
  categoriaSchema,
  claveProductoParams,
  colorImagenSchema,
  duplicarCategoriaSchema,
  estadoProductoSchema,
  filtrosDisponiblesQuery,
  imagenArchivoSchema,
  imagenParams,
  imagenUrlSchema,
  listarProductosQuery,
  ordenImagenesSchema,
  productoSchema,
} from "compartido/schemas/catalogo.js";
import { colorSchema, grupoTalleSchema, logoMarcaUrlSchema, marcaSchema } from "compartido/schemas/atributos.js";
import { authOpcional, requerirAuth, requerirModulo, requerirRol } from "../../nucleo/auth/middlewares.js";
import { recibirArchivo } from "../../nucleo/archivos.js";
import { validar } from "../../nucleo/validar.js";
import { cachePublico } from "../../nucleo/cache.js";
import { GESTORES_CATALOGO } from "./permisos.js";
import * as atributos from "./atributos_controlador.js";
import * as categorias from "./categoria_controlador.js";
import * as productos from "./producto_controlador.js";
import * as imagenes from "./imagen_controlador.js";
import * as precios from "./precios_controlador.js";
import { importacionRutas } from "./importacion/importacion_rutas.js";

const gestor = [requerirAuth, requerirRol(...GESTORES_CATALOGO)];

export const catalogoRutas = Router();
catalogoRutas.use(requerirModulo("catalogo"));

// ── Categorías ──
catalogoRutas.get("/categorias", cachePublico(), authOpcional, categorias.listar);
catalogoRutas.post("/categorias", ...gestor, validar({ body: categoriaSchema }), categorias.crear);
catalogoRutas.put("/categorias/:id", ...gestor, validar({ params: idParams, body: categoriaSchema }), categorias.actualizar);
catalogoRutas.post("/categorias/:id/duplicar", ...gestor, validar({ params: idParams, body: duplicarCategoriaSchema }), categorias.duplicar);
catalogoRutas.delete("/categorias/:id", ...gestor, validar({ params: idParams }), categorias.eliminar);

// ── Marcas, colores y grupos de talles (listas del panel; la tienda las lee para filtrar) ──
catalogoRutas.get("/marcas", cachePublico(), atributos.listarMarcas);
catalogoRutas.post("/marcas", ...gestor, validar({ body: marcaSchema }), atributos.crearMarca);
catalogoRutas.put("/marcas/:id", ...gestor, validar({ params: idParams, body: marcaSchema }), atributos.actualizarMarca);
catalogoRutas.delete("/marcas/:id", ...gestor, validar({ params: idParams }), atributos.eliminarMarca);
// Logo de la marca: archivo (almacén de imágenes) o dirección https.
const archivoLogo = recibirArchivo({
  campo: "logo",
  maxMb: 2,
  extensiones: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  mensajeTipo: "El logo tiene que ser una imagen JPG, PNG, WEBP o AVIF.",
});
catalogoRutas.post("/marcas/:id/logo", ...gestor, validar({ params: idParams }), archivoLogo, atributos.subirLogoMarca);
catalogoRutas.put("/marcas/:id/logo", ...gestor, validar({ params: idParams, body: logoMarcaUrlSchema }), atributos.logoMarcaPorUrl);
catalogoRutas.delete("/marcas/:id/logo", ...gestor, validar({ params: idParams }), atributos.quitarLogoMarca);

catalogoRutas.get("/colores", cachePublico(), atributos.listarColores);
catalogoRutas.post("/colores/sugeridos", ...gestor, atributos.cargarColoresSugeridos);
catalogoRutas.post("/colores", ...gestor, validar({ body: colorSchema }), atributos.crearColor);
catalogoRutas.put("/colores/:id", ...gestor, validar({ params: idParams, body: colorSchema }), atributos.actualizarColor);
catalogoRutas.delete("/colores/:id", ...gestor, validar({ params: idParams }), atributos.eliminarColor);

catalogoRutas.get("/grupos-talle", cachePublico(), atributos.listarGruposTalle);
catalogoRutas.post("/grupos-talle/sugeridos", ...gestor, atributos.cargarGruposSugeridos);
catalogoRutas.post("/grupos-talle", ...gestor, validar({ body: grupoTalleSchema }), atributos.crearGrupoTalle);
catalogoRutas.put("/grupos-talle/:id", ...gestor, validar({ params: idParams, body: grupoTalleSchema }), atributos.actualizarGrupoTalle);
catalogoRutas.delete("/grupos-talle/:id", ...gestor, validar({ params: idParams }), atributos.eliminarGrupoTalle);

// ── Productos ──
catalogoRutas.get("/productos", cachePublico(), authOpcional, validar({ query: listarProductosQuery }), productos.listar);
// Antes de /productos/:clave: si no, "filtros" se tomaría como el slug de un producto.
catalogoRutas.get("/productos/filtros", cachePublico(), authOpcional, validar({ query: filtrosDisponiblesQuery }), productos.filtros);
catalogoRutas.get("/productos/:clave", cachePublico(), authOpcional, validar({ params: claveProductoParams }), productos.obtener);
catalogoRutas.post("/productos", ...gestor, validar({ body: productoSchema }), productos.crear);
catalogoRutas.put("/productos/:id", ...gestor, validar({ params: idParams, body: productoSchema }), productos.actualizar);
catalogoRutas.patch("/productos/:id/estado", ...gestor, validar({ params: idParams, body: estadoProductoSchema }), productos.cambiarEstado);
catalogoRutas.delete("/productos/:id", requerirAuth, requerirRol("admin"), validar({ params: idParams }), productos.eliminar);

// ── Imágenes de producto ──
const archivoImagen = recibirArchivo({
  campo: "imagen",
  maxMb: 5,
  extensiones: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"],
  mensajeTipo: "Solo se aceptan imágenes JPG, PNG, WEBP, AVIF o GIF.",
});
// El body (multipart) recién existe después de recibir el archivo: params y body se validan juntos ahí.
catalogoRutas.post("/productos/:id/imagenes", ...gestor, archivoImagen, validar({ params: idParams, body: imagenArchivoSchema }), imagenes.subir);
catalogoRutas.patch("/productos/:id/imagenes/:imagenId", ...gestor, validar({ params: imagenParams, body: colorImagenSchema }), imagenes.cambiarColor);
catalogoRutas.post("/productos/:id/imagenes/url", ...gestor, validar({ params: idParams, body: imagenUrlSchema }), imagenes.agregarPorUrl);
catalogoRutas.put("/productos/:id/imagenes/orden", ...gestor, validar({ params: idParams, body: ordenImagenesSchema }), imagenes.ordenar);
catalogoRutas.delete("/productos/:id/imagenes/:imagenId", ...gestor, validar({ params: imagenParams }), imagenes.eliminar);

// ── Precios ──
catalogoRutas.post("/precios/ajuste", ...gestor, validar({ body: ajustePreciosSchema }), precios.ajustar);

// ── Importación desde Excel/CSV ──
catalogoRutas.use("/importacion", ...gestor, importacionRutas);
