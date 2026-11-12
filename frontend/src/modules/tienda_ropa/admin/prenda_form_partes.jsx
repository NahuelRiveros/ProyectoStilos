import { useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronRight, ImagePlus, X } from "lucide-react";
import ImageUploadField from "../../../core/controls/ui/image_upload_field.jsx";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { BOTON_SECUNDARIO } from "./comunes.jsx";
import { chip } from "./chip.js";
import { caminoA } from "../utils/camino_categoria.js";

// Piezas del formulario de prenda (prenda_form_page.jsx): pasos, categoría, talles y fotos.

/** Un paso numerado del formulario. `listo`: se marca con un tilde. */
export function Paso({ numero, titulo, descripcion, listo, opcional, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold", listo ? "bg-emerald-600 text-white" : "bg-slate-900 text-white")}>
          {listo ? <Check size={16} /> : numero}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-900">
            {titulo} {opcional && <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 align-middle text-xs font-semibold text-slate-500">Opcional</span>}
          </h2>
          {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Paso 1: se elige bajando por el árbol con botones (Hombre › Pantalones › Cargo). */
export function SelectorCategoria({ arbol, valor, onElegir }) {
  const camino = caminoA(arbol, valor);
  // Una fila por nivel: la raíz y, debajo, las hijas de cada una elegida que tenga.
  const niveles = [{ opciones: arbol, elegida: camino[0] }];
  camino.forEach((c, i) => { if (c.hijas?.length) niveles.push({ padre: c, opciones: c.hijas, elegida: camino[i + 1] }); });
  return (
    <div className="space-y-4">
      {niveles.map(({ padre, opciones, elegida }) => (
        <div key={padre?.id ?? "raiz"} role="group" aria-label={padre ? `Dentro de ${padre.nombre}` : "Categoría"}>
          {padre && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Dentro de {padre.nombre}</p>}
          <div className="flex flex-wrap gap-2">
            {opciones.map((c) => (
              <button key={c.id} type="button" onClick={() => onElegir(c.id)} aria-pressed={elegida?.id === c.id} className={chip(elegida?.id === c.id)}>{c.nombre}</button>
            ))}
          </div>
        </div>
      ))}
      {camino.length > 0 && (
        <p role="status" className="flex flex-wrap items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          Vas a cargar en:
          {camino.map((c, i) => <span key={c.id} className="inline-flex items-center gap-1">{i > 0 && <ChevronRight size={14} aria-hidden="true" />}{c.nombre}</span>)}
        </p>
      )}
    </div>
  );
}

const ESTADOS = {
  hay: { texto: "Hay", clase: "border-emerald-300 bg-emerald-50 text-emerald-900" },
  agotado: { texto: "Agotado", clase: "border-amber-300 bg-amber-50 text-amber-900" },
  "": { texto: "No se vende", clase: "border-dashed border-slate-300 bg-white text-slate-400" },
};
const SIGUIENTE = { hay: "agotado", agotado: "", "": "hay" };

/** Paso 3: cada talle es un botón que pasa de Hay → Agotado → No se vende. */
export function TallesDelColor({ talles, estados, onCambiar }) {
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">Tocá un talle para cambiarlo: Hay → Agotado → No se vende.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {talles.map((t) => {
          const valor = estados[t.id] ?? "";
          return (
            <button key={t.id} type="button" onClick={() => onCambiar(t.id, SIGUIENTE[valor])} aria-label={`Talle ${t.nombre}: ${ESTADOS[valor].texto.toLowerCase()}`}
              className={cn("flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-2 transition", ESTADOS[valor].clase)}>
              <span className={cn("text-lg font-extrabold", !valor && "line-through")}>{t.nombre}</span>
              <span className="text-xs font-semibold">{ESTADOS[valor].texto}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => talles.forEach((t) => onCambiar(t.id, "hay"))} className={BOTON_SECUNDARIO}>Todos: hay</button>
        <button type="button" onClick={() => talles.forEach((t) => onCambiar(t.id, ""))} className={BOTON_SECUNDARIO}>Ninguno</button>
      </div>
    </div>
  );
}

/** Paso 5: fotos del color, para ordenar o quitar, y alta por subida o enlace. */
export function FotosDelColor({ titulo, fotos, setFotos, max }) {
  const [nueva, setNueva] = useState("");
  const lleno = fotos.length >= max;

  function agregar() {
    if (!/^https:\/\//.test(nueva)) return;
    setFotos([...fotos, nueva]);
    setNueva("");
  }
  function mover(i, paso) {
    const lista = [...fotos];
    [lista[i], lista[i + paso]] = [lista[i + paso], lista[i]];
    setFotos(lista);
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {fotos.map((url, i) => (
        <div key={`${url}-${i}`}>
          <div className="relative">
            <img src={imagenCloudinary(url, 200)} alt="" className="h-36 w-27 rounded-xl border border-slate-200 object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">Portada</span>}
          </div>
          <div className="mt-1 flex justify-center gap-1">
            <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} aria-label="Mover antes" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ArrowUp size={14} aria-hidden="true" /></button>
            <button type="button" disabled={i === fotos.length - 1} onClick={() => mover(i, 1)} aria-label="Mover después" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ArrowDown size={14} aria-hidden="true" /></button>
            <button type="button" onClick={() => setFotos(fotos.filter((_, j) => j !== i))} aria-label="Quitar foto" className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600"><X size={14} aria-hidden="true" /></button>
          </div>
        </div>
      ))}
      {!lleno && (
        <div className="w-full max-w-sm rounded-xl border border-dashed border-slate-300 p-3">
          <ImageUploadField label={`Foto ${fotos.length + 1} de ${max}`} tooltip="Subila o pegá un enlace https." value={nueva} onChange={setNueva} />
          <button type="button" onClick={agregar} disabled={!/^https:\/\//.test(nueva)} className={cn(BOTON_SECUNDARIO, "mt-2 w-full")}>
            <ImagePlus size={15} aria-hidden="true" /> Sumar foto{titulo ? ` (${titulo.toLowerCase()})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
