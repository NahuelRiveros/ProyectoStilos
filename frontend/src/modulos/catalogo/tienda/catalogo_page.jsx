import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { proyecto } from "compartido/proyecto.js";
import { nombreProductos } from "@/clientes/index.js";
import Paginacion from "@/componentes/ui/paginacion.jsx";
import SearchField from "@/componentes/ui/search_field.jsx";
import SelectField from "@/componentes/ui/select_field.jsx";
import { Cargando, ErrorCarga, Vacio } from "@/componentes/ui/estado_carga.jsx";
import { useCategorias, useFiltrosDisponibles, useProductos } from "../hooks/use_catalogo.js";
import { CLAVES_ATRIBUTOS, alternarId, filtrosActivos } from "../utils/filtros_url.js";
import FiltroCategoriasArbol from "./filtro_categorias_arbol.jsx";
import FiltroCategoriasNiveles from "./filtro_categorias_niveles.jsx";
import FiltrosActivos from "./filtros_activos.jsx";
import FiltrosAtributos from "./filtros_atributos.jsx";
import FiltrosCelular from "./filtros_celular.jsx";
import ProductoCard from "./producto_card.jsx";

const SIN_ATRIBUTOS = { marca: "", color: "", talle: "" };

const ORDENES = [
  { valor: "nombre", etiqueta: "Nombre (A-Z)" },
  { valor: "-nombre", etiqueta: "Nombre (Z-A)" },
  { valor: "reciente", etiqueta: "Más nuevos" },
];

// "arbol" (el de siempre, para distribuidoras) o "niveles" (tiendas con muchas subcategorías por sección).
const FiltroCategorias = proyecto.tienda.filtro_categorias === "niveles" ? FiltroCategoriasNiveles : FiltroCategoriasArbol;

export default function CatalogoPage() {
  const [params, setParams] = useSearchParams();
  const filtros = {
    q: params.get("q") ?? "",
    categoria: params.get("categoria") ?? "",
    orden: params.get("orden") ?? "nombre",
    oferta: params.get("oferta") ?? "",
    marca: params.get("marca") ?? "",
    color: params.get("color") ?? "",
    talle: params.get("talle") ?? "",
    pagina: Number(params.get("pagina") ?? 1),
    limite: proyecto.catalogo.productos_por_pagina,
  };
  const categorias = useCategorias();
  const productos = useProductos(filtros);
  // Las opciones de marca/color/talle salen de lo que se está viendo (sin contar esos mismos filtros).
  const disponibles = useFiltrosDisponibles({ q: filtros.q, categoria: filtros.categoria, oferta: filtros.oferta }).data;

  // cambios: { clave: valor } ("" = quitar). Cualquier cambio vuelve a la página 1.
  const actualizar = useCallback(
    (cambios) =>
      setParams((actuales) => {
        const nuevos = new URLSearchParams(actuales);
        for (const [clave, valor] of Object.entries(cambios)) {
          if (valor) nuevos.set(clave, valor);
          else nuevos.delete(clave);
        }
        if (!("pagina" in cambios)) nuevos.delete("pagina");
        return nuevos;
      }),
    [setParams],
  );
  const buscar = useCallback((texto) => actualizar({ q: texto }), [actualizar]);
  // En otra categoría las marcas, colores y talles son otros: se empieza sin esos filtros.
  const elegirCategoria = useCallback((id) => actualizar({ categoria: id, ...SIN_ATRIBUTOS }), [actualizar]);
  const alternar = (clave, id) => actualizar({ [clave]: alternarId(filtros[clave], id) });
  const activos = filtrosActivos(filtros, disponibles);
  const hayAtributos = CLAVES_ATRIBUTOS.some((clave) => filtros[clave]);
  // El título acompaña lo que se está viendo (clave en una tienda de ropa: "Mujer", "Calzado"…).
  const categoriaActual = categorias.data?.find((c) => String(c.id) === filtros.categoria);
  const titulo = filtros.oferta ? "Ofertas" : (categoriaActual?.nombre ?? nombreProductos);
  const hayFiltros = Boolean(filtros.q || filtros.categoria || filtros.oferta || hayAtributos);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-titulos text-3xl font-bold">{titulo}</h1>
      {filtros.oferta && (
        <p className="mt-1 text-sm text-texto-suave">
          Productos con precio rebajado.{" "}
          <button type="button" onClick={() => actualizar({ oferta: "" })} className="font-semibold text-primario hover:underline">
            Ver todos
          </button>
        </p>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden space-y-8 md:block" aria-label="Filtros">
          <div>
            <FiltroCategorias lugar="lateral" categorias={categorias.data} seleccionada={filtros.categoria} onElegir={elegirCategoria} />
          </div>
          <FiltrosAtributos disponibles={disponibles} elegidos={filtros} onAlternar={alternar} />
        </aside>

        {/* min-w-0: sin esto, los chips con scroll lateral ensanchan la columna y la página se desborda en el celular */}
        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <SearchField valor={filtros.q} onBuscar={buscar} etiqueta="Buscar productos" placeholder="Buscar por producto, marca o código" />
            <SelectField name="orden" aria-label="Ordenar" opciones={ORDENES} value={filtros.orden} onChange={(e) => actualizar({ orden: e.target.value })} className="mt-1" />
          </div>
          <FiltroCategorias lugar="arriba" categorias={categorias.data} seleccionada={filtros.categoria} onElegir={elegirCategoria} />
          <FiltrosCelular disponibles={disponibles} elegidos={filtros} onAlternar={alternar} cantidadActivos={activos.length} total={productos.data?.paginacion.total} />
          <FiltrosActivos activos={activos} onQuitar={alternar} onLimpiar={() => actualizar(SIN_ATRIBUTOS)} />

          <div className="mt-6">
            {productos.isPending ? (
              <Cargando texto="Cargando productos..." />
            ) : productos.isError ? (
              <ErrorCarga error={productos.error} onReintentar={productos.refetch} />
            ) : productos.data.productos.length === 0 ? (
              <Vacio
                titulo="No encontramos productos"
                texto={
                  hayAtributos
                    ? "No hay productos con esa combinación de filtros. Probá sacando alguno."
                    : filtros.q
                      ? `No hay resultados para “${filtros.q}”.`
                      : filtros.oferta
                        ? "No hay ofertas en este momento."
                        : "Todavía no hay productos en esta categoría."
                }
                accion={hayFiltros && <Link to="/catalogo" className="font-semibold text-primario hover:underline">Quitar filtros</Link>}
              />
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {productos.data.productos.map((p) => (
                    <li key={p.id} className="flex">
                      <ProductoCard producto={p} />
                    </li>
                  ))}
                </ul>
                <Paginacion paginacion={productos.data.paginacion} onCambiar={(p) => actualizar({ pagina: String(p) })} deshabilitado={productos.isFetching} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
