import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { nombreProductos, verProductos } from "@/clientes/index.js";
import { cn } from "@/utils/cn.js";
import { aCategoria, useItemsMenu } from "../hooks/use_items_menu.js";
import DesplegableMenu from "./desplegable_menu.jsx";
import GrupoCategoriaCelular from "./grupo_categoria_celular.jsx";

/** Panel del escritorio: una columna por categoría del menú (Mujer, Hombre...) con sus subcategorías. */
function PanelColumnas({ items }) {
  return (
    <>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <section key={item.id} aria-label={item.nombre}>
            <Link to={aCategoria(item.id)} className="font-titulos text-lg font-bold text-primario hover:underline">
              {item.nombre}
            </Link>
            {item.hijos.length > 0 && (
              <ul className="mt-2 space-y-1">
                {item.hijos.map((h) => (
                  <li key={h.id}>
                    <Link to={aCategoria(h.id)} className="text-sm text-texto-suave hover:text-texto hover:underline">
                      {h.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <div className="mt-6 border-t border-borde pt-4">
        <Link to="/catalogo" className="text-sm font-semibold text-primario hover:underline">
          {verProductos}
        </Link>
      </div>
    </>
  );
}

/** Celular: "Tienda" se abre y adentro cada categoría es un grupo con sus subcategorías. */
function MenuCelular({ items, onNavegar }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        className="flex w-full items-center justify-between rounded-xl px-3 py-3 font-medium hover:bg-fondo"
      >
        {nombreProductos}
        <ChevronDown className={cn("h-5 w-5 transition-transform", abierto && "rotate-180")} aria-hidden="true" />
      </button>
      {abierto && (
        <div id={id} className="mb-2 ml-3 border-l border-borde pl-3">
          <Link to="/catalogo" onClick={onNavegar} className="block rounded-lg px-3 py-2 text-sm font-semibold text-primario">
            {verProductos}
          </Link>
          {items.map((item) => (
            <GrupoCategoriaCelular key={item.id} item={item} onNavegar={onNavegar} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Un solo botón (ej. "Tienda ▾") con las categorías del menú en columnas
 * (clientes/<id>/navbar.js → menu_productos: "desplegable"). Ideal para indumentaria:
 * Mujer y Hombre con sus propias subcategorías. Sin categorías marcadas, muestra el link de siempre.
 */
export default function MenuTienda({ variante = "escritorio", onNavegar, modo }) {
  const { items, isPending } = useItemsMenu(modo);
  if (isPending) return null;

  if (items.length === 0) {
    return variante === "escritorio" ? (
      <Link to="/catalogo" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-fondo">
        {nombreProductos}
      </Link>
    ) : (
      <Link to="/catalogo" onClick={onNavegar} className="flex rounded-xl px-3 py-3 font-medium hover:bg-fondo">
        {nombreProductos}
      </Link>
    );
  }

  if (variante === "celular") return <MenuCelular items={items} onNavegar={onNavegar} />;

  return (
    <DesplegableMenu etiqueta={nombreProductos} ancho>
      <PanelColumnas items={items} />
    </DesplegableMenu>
  );
}
