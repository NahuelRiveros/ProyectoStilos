import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Boton from "@/componentes/ui/boton.jsx";
import Insignia from "@/componentes/ui/insignia.jsx";
import { ANCHOS, urlImagen } from "@/utils/imagenes.js";

/** Una foto de la galería del panel: mover, quitar y (en indumentaria) de qué color es. */
export default function ImagenTarjeta({ imagen, numero, principal = false, colores = [], puedeAntes, puedeDespues, ocupado = false, onMover, onQuitar, onCambiarColor }) {
  const color = colores.find((c) => c.id === imagen.color_id);
  return (
    <li className="overflow-hidden rounded-xl border border-borde">
      <div className="relative">
        <img src={urlImagen(imagen.url, ANCHOS.tarjeta)} alt={imagen.alt ?? ""} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
        {principal && (
          <span className="absolute left-2 top-2">
            <Insignia tono="info">Principal</Insignia>
          </span>
        )}
        {color && (
          <span className="absolute bottom-2 left-2 h-5 w-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: color.hex }} title={color.nombre} aria-hidden="true" />
        )}
      </div>
      {colores.length > 0 && (
        <select
          aria-label={`Color de la imagen ${numero}`}
          value={imagen.color_id ?? ""}
          onChange={(e) => onCambiarColor(e.target.value ? Number(e.target.value) : null)}
          disabled={ocupado}
          className="w-full border-t border-borde bg-superficie px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primario/20"
        >
          <option value="">General (todos los colores)</option>
          {colores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}
      <div className="flex justify-between p-1">
        <Boton variante="fantasma" tamano="icono" onClick={() => onMover(-1)} disabled={!puedeAntes || ocupado} aria-label={`Mover imagen ${numero} antes`}>
          <ArrowLeft className="h-4 w-4" />
        </Boton>
        <Boton variante="fantasma" tamano="icono" onClick={onQuitar} aria-label={`Quitar imagen ${numero}`}>
          <Trash2 className="h-4 w-4 text-peligro" />
        </Boton>
        <Boton variante="fantasma" tamano="icono" onClick={() => onMover(1)} disabled={!puedeDespues || ocupado} aria-label={`Mover imagen ${numero} después`}>
          <ArrowRight className="h-4 w-4" />
        </Boton>
      </div>
    </li>
  );
}
