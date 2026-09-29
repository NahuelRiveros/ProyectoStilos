import { cn } from "@/utils/cn.js";
import CategoriaSelect from "../componentes/categoria_select.jsx";
import { armarArbol, totalConSubcategorias } from "../utils/arbol.js";

function ArbolFiltro({ nodos, seleccionada, onElegir, nivel = 0 }) {
  return (
    <ul className={cn(nivel > 0 && "ml-3 border-l border-borde pl-2")}>
      {nodos
        .filter((n) => totalConSubcategorias(n) > 0)
        .map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onElegir(String(n.id))}
              aria-current={seleccionada === String(n.id) ? "true" : undefined}
              className={cn(
                "w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-fondo",
                seleccionada === String(n.id) && "bg-primario/10 font-semibold text-primario",
              )}
            >
              {n.nombre}
            </button>
            {n.hijos.length > 0 && <ArbolFiltro nodos={n.hijos} seleccionada={seleccionada} onElegir={onElegir} nivel={nivel + 1} />}
          </li>
        ))}
    </ul>
  );
}

/**
 * Filtro con el árbol completo (proyecto.config.js → tienda.filtro_categorias: "arbol", el de siempre).
 * lugar "lateral" = columna de escritorio; "arriba" = select del celular.
 */
export default function FiltroCategoriasArbol({ lugar, categorias = [], seleccionada, onElegir }) {
  if (lugar === "arriba") {
    return (
      <div className="mt-3 md:hidden">
        <CategoriaSelect
          name="categoria_movil"
          aria-label="Categoría"
          categorias={categorias}
          placeholder="Todas las categorías"
          value={seleccionada}
          onChange={(e) => onElegir(e.target.value)}
        />
      </div>
    );
  }
  return (
    <>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-texto-suave">Categorías</h2>
      <button
        type="button"
        onClick={() => onElegir("")}
        className={cn("mb-1 w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-fondo", !seleccionada && "bg-primario/10 font-semibold text-primario")}
      >
        Todas
      </button>
      <ArbolFiltro nodos={armarArbol(categorias)} seleccionada={seleccionada} onElegir={onElegir} />
    </>
  );
}
