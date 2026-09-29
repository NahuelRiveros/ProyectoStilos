import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn.js";

/**
 * Panel desplegable del escritorio: se abre con el mouse, con click o con Enter, y se cierra con Escape o click afuera.
 * ancho = panel a lo ancho de la barra (menú con columnas); si no, una lista debajo del botón.
 */
export default function DesplegableMenu({ etiqueta, children, ancho = false }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  // Si se abrió al pasar el mouse, el click que sigue no lo cierra (en tablets un toque es "pasar" + "click").
  const porHover = useRef(false);
  const id = useId();

  function entrar() {
    if (!abierto) porHover.current = true;
    setAbierto(true);
  }
  function salir() {
    porHover.current = false;
    setAbierto(false);
  }
  function alternar() {
    if (porHover.current) porHover.current = false;
    else setAbierto((v) => !v);
  }

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => !contenedor.current?.contains(e.target) && setAbierto(false);
    const escape = (e) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative" onMouseEnter={entrar} onMouseLeave={salir}>
      <button
        ref={boton}
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        aria-controls={id}
        className={cn("flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:bg-fondo", abierto && "bg-fondo")}
      >
        {etiqueta}
        <ChevronDown className={cn("h-4 w-4 transition-transform", abierto && "rotate-180")} aria-hidden="true" />
      </button>
      {abierto &&
        (ancho ? (
          // Arranca a la altura del botón (top-12) con relleno transparente: el mouse no "cae" en un hueco al bajar.
          <div id={id} className="fixed inset-x-0 top-12 z-50 pt-4">
            <div className="mx-auto max-w-6xl px-4">
              <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-borde bg-superficie p-6 shadow-xl" onClick={() => setAbierto(false)}>
                {children}
              </div>
            </div>
          </div>
        ) : (
          // pt-2 en vez de margen: el mouse no "cae" en un hueco al bajar hacia el panel
          <div id={id} className="absolute left-0 top-full z-50 pt-2">
            <ul className="min-w-52 rounded-2xl border border-borde bg-superficie p-2 shadow-xl" onClick={() => setAbierto(false)}>
              {children}
            </ul>
          </div>
        ))}
    </div>
  );
}
