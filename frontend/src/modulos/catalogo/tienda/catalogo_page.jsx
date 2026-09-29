import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { proyecto } from "compartido/proyecto.js";
import { nombreProductos } from "@/clientes/index.js";
import Paginacion from "@/componentes/ui/paginacion.jsx";
import SearchField from "@/componentes/ui/search_field.jsx";
import SelectField from "@/componentes/ui/select_field.jsx";
import { Cargando, ErrorCarga, Vacio } from "@/componentes/ui/estado_carga.jsx";
import { useCategorias, useProductos } from "../hooks/use_catalogo.js";
import FiltroCategoriasArbol from "./filtro_categorias_arbol.jsx";
import FiltroCategoriasNiveles from "./filtro_categorias_niveles.jsx";
import ProductoCard from "./producto_card.jsx";

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
    pagina: Number(params.get("pagina") ?? 1),
    limite: proyecto.catalogo.productos_por_pagina,
  };
  const categorias = useCategorias();
  const productos = useProductos(filtros);

  const actualizar = useCallback(
    (clave, valor) =>
      setParams((actuales) => {
        const nuevos = new URLSearchParams(actuales);
        if (valor) nuevos.set(clave, valor);
        else nuevos.delete(clave);
        if (clave !== "pagina") nuevos.delete("pagina");
        return nuevos;
      }),
    [setParams],
  );
  const buscar = useCallback((texto) => actualizar("q", texto), [actualizar]);
  const elegirCategoria = useCallback((id) => actualizar("categoria", id), [actualizar]);
  // El título acompaña lo que se está viendo (clave en una tienda de ropa: "Mujer", "Calzado"…).
  const categoriaActual = categorias.data?.find((c) => String(c.id) === filtros.categoria);
  const titulo = filtros.oferta ? "Ofertas" : (categoriaActual?.nombre ?? nombreProductos);
  const hayFiltros = Boolean(filtros.q || filtros.categoria || filtros.oferta);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-titulos text-3xl font-bold">{titulo}</h1>
      {filtros.oferta && (
        <p className="mt-1 text-sm text-texto-suave">
          Productos con precio rebajado.{" "}
          <button type="button" onClick={() => actualizar("oferta", "")} className="font-semibold text-primario hover:underline">
            Ver todos
          </button>
        </p>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block" aria-label="Categorías">
          <FiltroCategorias lugar="lateral" categorias={categorias.data} seleccionada={filtros.categoria} onElegir={elegirCategoria} />
        </aside>

        {/* min-w-0: sin esto, los chips con scroll lateral ensanchan la columna y la página se desborda en el celular */}
        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <SearchField valor={filtros.q} onBuscar={buscar} etiqueta="Buscar productos" placeholder="Buscar por producto, marca o código" />
            <SelectField name="orden" aria-label="Ordenar" opciones={ORDENES} value={filtros.orden} onChange={(e) => actualizar("orden", e.target.value)} className="mt-1" />
          </div>
          <FiltroCategorias lugar="arriba" categorias={categorias.data} seleccionada={filtros.categoria} onElegir={elegirCategoria} />

          <div className="mt-6">
            {productos.isPending ? (
              <Cargando texto="Cargando productos..." />
            ) : productos.isError ? (
              <ErrorCarga error={productos.error} onReintentar={productos.refetch} />
            ) : productos.data.productos.length === 0 ? (
              <Vacio
                titulo="No encontramos productos"
                texto={
                  filtros.q ? `No hay resultados para “${filtros.q}”.` : filtros.oferta ? "No hay ofertas en este momento." : "Todavía no hay productos en esta categoría."
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
                <Paginacion paginacion={productos.data.paginacion} onCambiar={(p) => actualizar("pagina", String(p))} deshabilitado={productos.isFetching} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
