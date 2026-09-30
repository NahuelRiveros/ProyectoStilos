import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Boton from "@/componentes/ui/boton.jsx";
import Modal from "@/componentes/ui/modal.jsx";
import FiltrosAtributos from "./filtros_atributos.jsx";

/** Celular: un botón "Filtrar" que abre los filtros de marca, color y talle en un panel. */
export default function FiltrosCelular({ disponibles, elegidos, onAlternar, cantidadActivos = 0, total = null }) {
  const [abierto, setAbierto] = useState(false);
  const { marcas = [], colores = [], talles = [] } = disponibles ?? {};
  if (marcas.length + colores.length + talles.length === 0) return null;

  return (
    <div className="mt-3 md:hidden">
      <Boton variante="secundario" tamano="chico" onClick={() => setAbierto(true)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtrar{cantidadActivos > 0 && ` (${cantidadActivos})`}
      </Boton>
      {abierto && (
        <Modal onCerrar={() => setAbierto(false)} titulo="Filtrar">
          <FiltrosAtributos disponibles={disponibles} elegidos={elegidos} onAlternar={onAlternar} />
          <Boton className="mt-6 w-full" onClick={() => setAbierto(false)}>
            {total == null ? "Ver resultados" : `Ver ${total} resultado${total === 1 ? "" : "s"}`}
          </Boton>
        </Modal>
      )}
    </div>
  );
}
