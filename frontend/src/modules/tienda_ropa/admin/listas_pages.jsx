import { Palette, Ruler, Tag } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import ListaSimplePage from "./lista_simple_page.jsx";

// Marcas (ROP-02), colores (ROP-03) y grupos de talles (ROP-04) sobre el mismo molde.

const MARCAS = {
  lista: "marcas", titulo: "Marcas", nuevo: "Nueva marca", icono: Tag,
  descripcion: "Opcional en cada prenda. Una marca desactivada no aparece en los filtros de la tienda.",
  vacio: "Todavía no hay marcas.",
  valores: (item) => ({ nombre: item?.nombre ?? "", activo: item?.activo ?? true }),
  armar: (v) => ({ nombre: v.nombre, activo: v.activo }),
  campos: ({ register, errors }) => (
    <>
      <InputField name="nombre" label="Nombre" register={register} required requiredMessage="Escribí el nombre." maxLength={80} error={errors.nombre?.message} />
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" {...register("activo")} className="h-5 w-5" /> Activa</label>
    </>
  ),
  fila: (m) => <p className="font-semibold text-slate-900">{m.nombre} {!m.activo && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Inactiva</span>}</p>,
};

const COLORES = {
  lista: "colores", titulo: "Colores", nuevo: "Nuevo color", icono: Palette, sugeridos: "Cargar colores sugeridos",
  descripcion: "Los que se pueden elegir al cargar una prenda. Los sugeridos son la paleta habitual de Stilos.",
  vacio: "Todavía no hay colores.", vacioDetalle: "Empezá con la paleta sugerida y después editala.",
  valores: (item) => ({ nombre: item?.nombre ?? "", hex: item?.hex ?? "#1E2D3D", orden: item?.orden ?? 0 }),
  armar: (v) => ({ nombre: v.nombre, hex: v.hex, orden: Number(v.orden) || 0 }),
  campos: ({ register, errors, watch }) => (
    <>
      <InputField name="nombre" label="Nombre" register={register} required requiredMessage="Escribí el nombre." maxLength={40} error={errors.nombre?.message} />
      <div className="flex items-end gap-3">
        <label className="text-sm font-semibold text-gray-700">Muestra
          <input type="color" {...register("hex")} className="mt-1 block h-11 w-16 cursor-pointer rounded-xl border border-gray-300" />
        </label>
        <p className="pb-3 font-mono text-sm text-slate-500">{watch("hex")}</p>
      </div>
      {errors.hex && <p className="text-sm text-red-600">{errors.hex.message}</p>}
      <InputField name="orden" type="number" min={0} label="Orden" helperText="Menor número, aparece antes." register={register} error={errors.orden?.message} />
    </>
  ),
  fila: (c) => (
    <p className="flex items-center gap-3 font-semibold text-slate-900">
      <span className="h-7 w-7 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: c.hex }} aria-hidden="true" />
      {c.nombre} <span className="font-mono text-xs font-normal text-slate-400">{c.hex}</span>
    </p>
  ),
};

const TALLES = {
  lista: "talles", titulo: "Grupos de talles", nuevo: "Nuevo grupo", icono: Ruler, sugeridos: "Cargar grupos sugeridos",
  descripcion: "Cada prenda usa los talles de un grupo (ej. Ropa: S a XXXL; Jeans: 36 a 56).",
  vacio: "Todavía no hay grupos de talles.", vacioDetalle: "Cargá los sugeridos (Ropa, Jeans y Calzado) y ajustalos.",
  valores: (item) => ({ nombre: item?.nombre ?? "", orden: item?.orden ?? 0, talles: (item?.talles ?? []).map((t) => t.nombre).join(", ") }),
  armar: (v) => ({ nombre: v.nombre, orden: Number(v.orden) || 0, talles: v.talles.split(",").map((t) => t.trim()).filter(Boolean) }),
  campos: ({ register, errors }) => (
    <>
      <InputField name="nombre" label="Nombre del grupo" register={register} required requiredMessage="Escribí el nombre." maxLength={40} error={errors.nombre?.message} />
      <InputField name="talles" label="Talles, en orden y separados por coma" placeholder="S, M, L, XL" register={register} required requiredMessage="Agregá al menos un talle." error={errors.talles?.message} />
      <InputField name="orden" type="number" min={0} label="Orden" register={register} error={errors.orden?.message} />
    </>
  ),
  fila: (g) => (
    <div>
      <p className="font-semibold text-slate-900">{g.nombre}</p>
      <p className="mt-1 flex flex-wrap gap-1">{g.talles.map((t) => <span key={t.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{t.nombre}</span>)}</p>
    </div>
  ),
};

export const MarcasPage = () => <ListaSimplePage config={MARCAS} />;
export const ColoresPage = () => <ListaSimplePage config={COLORES} />;
export const TallesPage = () => <ListaSimplePage config={TALLES} />;
