import { Link } from "react-router-dom";
import { nombreProductos } from "@/clientes/index.js";
import { aCategoria, useItemsMenu } from "../hooks/use_items_menu.js";
import DesplegableMenu from "./desplegable_menu.jsx";
import GrupoCategoriaCelular from "./grupo_categoria_celular.jsx";

// En la barra entran unas 6 categorías; las demás van en "Más".
const MAX_VISIBLES = 6;
const claseItemPanel = "block rounded-lg px-3 py-2 text-sm hover:bg-fondo";

function ItemEscritorio({ item }) {
  if (item.hijos.length === 0) {
    return (
      <Link to={aCategoria(item.id)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-fondo">
        {item.nombre}
      </Link>
    );
  }
  return (
    <DesplegableMenu etiqueta={item.nombre}>
      {item.hijos.map((h) => (
        <li key={h.id}>
          <Link to={aCategoria(h.id)} className={claseItemPanel}>
            {h.nombre}
          </Link>
        </li>
      ))}
      <li className="mt-1 border-t border-borde pt-1">
        <Link to={aCategoria(item.id)} className={`${claseItemPanel} font-semibold text-primario`}>
          Ver todo {item.nombre}
        </Link>
      </li>
    </DesplegableMenu>
  );
}

/**
 * Menú de productos por categorías (clientes/<id>/navbar.js → menu_productos: "categorias").
 * Sin categorías marcadas todavía, muestra el link de siempre: el menú nunca queda sin productos.
 */
export default function MenuCategorias({ variante = "escritorio", onNavegar, modo }) {
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

  if (variante === "celular") {
    return items.map((item) => <GrupoCategoriaCelular key={item.id} item={item} onNavegar={onNavegar} />);
  }

  const visibles = items.slice(0, MAX_VISIBLES);
  const resto = items.slice(MAX_VISIBLES);
  return (
    <>
      {visibles.map((item) => (
        <ItemEscritorio key={item.id} item={item} />
      ))}
      {resto.length > 0 && (
        <DesplegableMenu etiqueta="Más">
          {resto.map((item) => (
            <li key={item.id}>
              <Link to={aCategoria(item.id)} className={claseItemPanel}>
                {item.nombre}
              </Link>
            </li>
          ))}
        </DesplegableMenu>
      )}
    </>
  );
}
