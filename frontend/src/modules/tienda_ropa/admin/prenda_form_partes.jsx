import { useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronRight, ImagePlus, X } from "lucide-react";
import ImageUploadField from "../../../core/controls/ui/image_upload_field.jsx";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { BOTON_SECUNDARIO } from "./comunes.jsx";
import { chip } from "./chip.js";
import { caminoA } from "../utils/camino_categoria.js";
import { agruparColores } from "../utils/muestra_color.js";
import MuestraColor from "../tienda/muestra_color.jsx";

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

/** Paso 4 (ROP-86): colores en Básicos, Bitonos y Estampados. */
export function ColoresDeLaPrenda({ colores, valor, onElegir }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-gray-700">Color</legend>
      <div className="space-y-3">
        {agruparColores(colores).map((seccion) => (
          <div key={seccion.tipo} role="group" aria-label={seccion.titulo}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{seccion.titulo}</p>
            <div className="grid grid-cols-4 gap-1 sm:grid-cols-8 lg:grid-cols-10">
              {seccion.colores.map((c) => (
                <button key={c.id} type="button" onClick={() => onElegir(c.id)} aria-pressed={valor === c.id}
                  className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-1.5 text-center text-[11px] font-semibold leading-tight", valor === c.id ? "border-slate-900 bg-slate-50 text-slate-900" : "border-transparent text-slate-600 hover:border-slate-200")}>
                  <MuestraColor color={c} className="h-7 w-7" />{c.nombre}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

/** Paso 4 (ROP-83): el grupo de la categoría y "Talle único" a la vista; los demás, en "Usar otro grupo". */
export function GrupoDeTalles({ grupos, aMano, valor, onElegir }) {
  const [verOtros, setVerOtros] = useState(false);
  const conOtros = verOtros || !aMano.includes(valor);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">Talles</p>
      <div role="group" aria-label="Grupo de talles" className="flex flex-wrap gap-2">
        {aMano.map((id) => {
          const g = grupos.find((x) => x.id === id);
          return (
            <button key={id} type="button" onClick={() => onElegir(id)} aria-pressed={valor === id} className={chip(valor === id)}>
              {g.nombre} <span className="font-normal opacity-70">{g.talles.length > 1 ? `${g.talles[0].nombre} a ${g.talles.at(-1).nombre}` : g.talles[0]?.nombre}</span>
            </button>
          );
        })}
        {!conOtros && (
          <button type="button" onClick={() => setVerOtros(true)} className="min-h-11 px-2 text-sm font-semibold text-slate-600 underline">Usar otro grupo</button>
        )}
      </div>
      {conOtros && (
        <label className="mt-2 block text-xs font-semibold text-slate-500">Otro grupo de talles
          <select value={valor} onChange={(e) => onElegir(Number(e.target.value))} className="ml-2 min-h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm text-slate-700">
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

/** Paso 4 (ROP-84): cada talle se toca para pasar de Hay a No hay. "No hay" se ve tachado en la tienda. */
export function TallesDelColor({ talles, hay, onCambiar }) {
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">Tocá un talle para marcar si hay o no hay. Los que no hay se ven tachados en la tienda.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {talles.map((t) => {
          const siHay = hay.has(t.id);
          return (
            <button key={t.id} type="button" onClick={() => onCambiar([t.id], !siHay)} aria-pressed={siHay} aria-label={`Talle ${t.nombre}: ${siHay ? "hay" : "no hay"}`}
              className={cn("flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-2 transition", siHay ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-dashed border-slate-300 bg-white text-slate-400")}>
              <span className={cn("text-lg font-extrabold", !siHay && "line-through")}>{t.nombre}</span>
              <span className="text-xs font-semibold">{siHay ? "Hay" : "No hay"}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onCambiar(talles.map((t) => t.id), true)} className={BOTON_SECUNDARIO}>Todos: hay</button>
        <button type="button" onClick={() => onCambiar(talles.map((t) => t.id), false)} className={BOTON_SECUNDARIO}>Todos: no hay</button>
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
