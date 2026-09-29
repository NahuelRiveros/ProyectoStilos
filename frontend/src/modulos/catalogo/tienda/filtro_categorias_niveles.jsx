import { ChevronLeft, ChevronRight } from "lucide-react";
import { nombreProductos } from "@/clientes/index.js";
import { cn } from "@/utils/cn.js";
import { nivelDeCategoria, totalConSubcategorias } from "../utils/arbol.js";

const claseOpcion = (activa) =>
  cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-fondo", activa && "bg-primario/10 font-semibold text-primario");

/** Tienda › Mujer › Jeans: cada parte sube a ese nivel; la última es donde se está. */
function CaminoMigas({ ruta, onElegir }) {
  if (ruta.length === 0) return null;
  const pasos = [{ id: "", nombre: nombreProductos }, ...ruta];
  return (
    <nav aria-label="Estás en" className="mt-3 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-texto-suave">
        {pasos.map((paso, i) => (
          <li key={paso.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {i === pasos.length - 1 ? (
              <span aria-current="page" className="font-semibold text-texto">
                {paso.nombre}
              </span>
            ) : (
              <button type="button" onClick={() => onElegir(String(paso.id))} className="hover:text-primario hover:underline">
                {paso.nombre}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Celular: las opciones del nivel como chips con scroll lateral (se tocan fácil y nunca muestran todo el árbol). */
function Chips({ padre, opciones, seleccionada, onElegir }) {
  const chips = [...(padre ? [{ id: padre.id, nombre: "Todo" }] : []), ...opciones];
  if (chips.length === 0) return null;
  return (
    <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden" aria-label="Categorías">
      {chips.map((c) => {
        const activa = seleccionada === String(c.id);
        return (
          <li key={c.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onElegir(String(c.id))}
              aria-current={activa ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm whitespace-nowrap",
                activa ? "border-primario bg-primario text-primario-texto" : "border-borde bg-superficie hover:border-primario",
              )}
            >
              {c.nombre}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Filtro por niveles (proyecto.config.js → tienda.filtro_categorias: "niveles"): muestra solo las
 * categorías del nivel donde se está, con su cantidad de productos. Pensado para tiendas con muchas
 * subcategorías repetidas por sección (el "Jeans" de Mujer y el de Hombre).
 * lugar "lateral" = columna de escritorio; "arriba" = camino de migas + chips en el celular.
 */
export default function FiltroCategoriasNiveles({ lugar, categorias = [], seleccionada, onElegir }) {
  const { ruta, padre, opciones } = nivelDeCategoria(categorias, seleccionada);

  if (lugar === "arriba") {
    return (
      <>
        <CaminoMigas ruta={ruta} onElegir={onElegir} />
        <Chips padre={padre} opciones={opciones} seleccionada={seleccionada} onElegir={onElegir} />
      </>
    );
  }

  const volverA = padre ? ruta.find((n) => n.id === padre.padre_id) : null;
  return (
    <>
      {padre ? (
        <>
          <button
            type="button"
            onClick={() => onElegir(padre.padre_id ? String(padre.padre_id) : "")}
            className="mb-2 flex items-center gap-1 text-sm text-texto-suave hover:text-primario"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Volver a {volverA?.nombre ?? nombreProductos}
          </button>
          <h2 className="mb-2 font-titulos text-lg font-bold">{padre.nombre}</h2>
          <button type="button" onClick={() => onElegir(String(padre.id))} aria-current={seleccionada === String(padre.id) ? "true" : undefined} className={claseOpcion(seleccionada === String(padre.id))}>
            Ver todo
          </button>
        </>
      ) : (
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-texto-suave">Categorías</h2>
      )}
      <ul>
        {opciones.map((o) => {
          const activa = seleccionada === String(o.id);
          return (
            <li key={o.id}>
              <button type="button" onClick={() => onElegir(String(o.id))} aria-current={activa ? "true" : undefined} className={claseOpcion(activa)}>
                {o.nombre}
                <span className="text-xs font-normal text-texto-suave">{totalConSubcategorias(o)}<span className="sr-only"> productos</span></span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
