import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn.js";
import { aCategoria } from "../hooks/use_items_menu.js";

/** Una categoría del menú en el celular: se abre y muestra "Ver todo" + sus subcategorías. */
export default function GrupoCategoriaCelular({ item, onNavegar }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const clase = "flex w-full items-center justify-between rounded-xl px-3 py-3 font-medium hover:bg-fondo";
  if (item.hijos.length === 0) {
    return (
      <Link to={aCategoria(item.id)} onClick={onNavegar} className={clase}>
        {item.nombre}
      </Link>
    );
  }
  return (
    <div>
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-controls={id} className={clase}>
        {item.nombre}
        <ChevronDown className={cn("h-5 w-5 transition-transform", abierto && "rotate-180")} aria-hidden="true" />
      </button>
      {abierto && (
        <ul id={id} className="mb-2 ml-3 space-y-0.5 border-l border-borde pl-3">
          <li>
            <Link to={aCategoria(item.id)} onClick={onNavegar} className="block rounded-lg px-3 py-2 text-sm font-semibold text-primario">
              Ver todo {item.nombre}
            </Link>
          </li>
          {item.hijos.map((h) => (
            <li key={h.id}>
              <Link to={aCategoria(h.id)} onClick={onNavegar} className="block rounded-lg px-3 py-2 text-sm hover:bg-fondo">
                {h.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
