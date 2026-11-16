import { ListChecks, Palette, Ruler, Tag } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import TextareaField from "../../../core/controls/ui/textarea_field.jsx";
import ImageUploadField from "../../../core/controls/ui/image_upload_field.jsx";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { LOGOS_MARCAS } from "../../../proyecto/config/marcas_config.js";
import { logoDeMarca } from "../utils/logo_marca.js";
import ListaSimplePage from "./lista_simple_page.jsx";
import CategoriasDelGrupo from "./categorias_del_grupo.jsx";
import MuestraColor from "../tienda/muestra_color.jsx";
import { PATRONES, tipoDeColor } from "../utils/muestra_color.js";

// Marcas (ROP-02, ROP-24, ROP-25), características (ROP-37), colores (ROP-03) y grupos de talles (ROP-04) sobre el mismo molde.

const MARCAS = {
  lista: "marcas", titulo: "Marcas", nuevo: "Nueva marca", icono: Tag, sugeridos: "Cargar marcas sugeridas",
  descripcion: "Opcional en cada prenda. Las que tienen prendas se ven en el inicio, con su logo (el que subas acá o el de la configuración del proyecto). Una marca desactivada no aparece en la tienda.",
  vacio: "Todavía no hay marcas.", vacioDetalle: "Cargá las marcas que vende Stilo's y después sumales el logo.",
  valores: (item) => ({ nombre: item?.nombre ?? "", activo: item?.activo ?? true, logo_url: item?.logo_url ?? "" }),
  armar: (v) => ({ nombre: v.nombre, activo: v.activo, logo_url: v.logo_url || null }),
  campos: ({ register, errors, watch, setValue }) => (
    <>
      <InputField name="nombre" label="Nombre" register={register} required requiredMessage="Escribí el nombre." maxLength={80} error={errors.nombre?.message} />
      <ImageUploadField label="Logo (opcional)" tooltip="PNG con fondo transparente o blanco. Subilo o pegá un enlace https." value={watch("logo_url")} onChange={(url) => setValue("logo_url", url, { shouldDirty: true })} />
      {errors.logo_url && <p className="text-sm text-red-600">{errors.logo_url.message}</p>}
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" {...register("activo")} className="h-5 w-5" /> Activa</label>
    </>
  ),
  // ROP-35: el subido acá, o el de proyecto/config/marcas_config.js, o ninguno.
  fila: (m) => {
    const logo = logoDeMarca(m, LOGOS_MARCAS);
    return (
    <p className="flex items-center gap-3 font-semibold text-slate-900">
      <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1" style={logo?.fondo ? { backgroundColor: logo.fondo } : undefined}>
        {logo ? <img src={imagenCloudinary(logo.url, 128)} alt="" className="max-h-full max-w-full object-contain" /> : <Tag size={16} className="text-slate-300" aria-hidden="true" />}
      </span>
      {m.nombre} {!m.activo && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Inactiva</span>}
    </p>
    );
  },
};

const CARACTERISTICAS = {
  lista: "caracteristicas", titulo: "Características", nuevo: "Nuevo grupo", icono: ListChecks, sugeridos: "Cargar características sugeridas",
  descripcion: "Cómo es cada prenda, por grupo (ej. Material: Cuero, Lona; Calce: Slim, Mom). Al cargar una prenda se tildan las que tiene, y en la tienda se puede filtrar por ellas.",
  vacio: "Todavía no hay características.", vacioDetalle: "Cargá las sugeridas (Estampa, Material, Calce, Tiro, Manga, Cuello, Detalles y Calzado) y ajustalas.",
  valores: (item) => ({ nombre: item?.nombre ?? "", orden: item?.orden ?? 0, valores: (item?.caracteristicas ?? []).map((c) => c.nombre).join(", "), categorias: item?.categorias ?? [] }),
  armar: (v) => ({ nombre: v.nombre, orden: Number(v.orden) || 0, valores: v.valores.split(",").map((c) => c.trim()).filter(Boolean), categorias: v.categorias }),
  campos: ({ register, errors, watch, setValue }) => (
    <>
      <InputField name="nombre" label="Nombre del grupo" placeholder="Material" register={register} required requiredMessage="Escribí el nombre." maxLength={40} error={errors.nombre?.message} />
      <TextareaField name="valores" label="Valores, en orden y separados por coma" rows={4} placeholder="Algodón, Lino, Cuero" register={register} required requiredMessage="Agregá al menos un valor." error={errors.valores?.message} />
      <CategoriasDelGrupo watch={watch} setValue={setValue} />
      {errors.categorias && <p className="text-sm text-red-600">{errors.categorias.message}</p>}
      <InputField name="orden" type="number" min={0} label="Orden" helperText="Menor número, aparece antes." register={register} error={errors.orden?.message} />
    </>
  ),
  fila: (g) => (
    <div>
      <p className="font-semibold text-slate-900">{g.nombre} <span className="text-xs font-normal text-slate-500">· {g.categorias.length ? `en ${g.categorias.length} ${g.categorias.length === 1 ? "categoría" : "categorías"}` : "en todas las categorías"}</span></p>
      <p className="mt-1 flex flex-wrap gap-1">{g.caracteristicas.map((c) => <span key={c.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{c.nombre}</span>)}</p>
    </div>
  ),
};

const COLORES = {
  lista: "colores", titulo: "Colores", nuevo: "Nuevo color", icono: Palette, sugeridos: "Cargar colores sugeridos",
  descripcion: "Los que se pueden elegir al cargar una prenda. Los sugeridos son la paleta habitual de Stilo's.",
  vacio: "Todavía no hay colores.", vacioDetalle: "Empezá con la paleta sugerida y después editala.",
  valores: (item) => ({
    nombre: item?.nombre ?? "", tipo: tipoDeColor(item), hex: item?.hex ?? "#1E2D3D", hex2: item?.hex2 ?? "#FFFFFF",
    patron: item?.patron ?? "animal_print", orden: item?.orden ?? 0,
  }),
  // ROP-86: liso (un tono), bitono (dos) o estampado (dibujo; multicolor no usa tonos propios).
  armar: (v) => ({
    nombre: v.nombre, hex: v.hex, orden: Number(v.orden) || 0,
    hex2: v.tipo === "liso" || (v.tipo === "estampado" && v.patron === "multicolor") ? null : v.hex2,
    patron: v.tipo === "estampado" ? v.patron : null,
  }),
  campos: ({ register, errors, watch }) => {
    const [tipo, hex, hex2, patron] = watch(["tipo", "hex", "hex2", "patron"]);
    const conSegundo = tipo === "bitono" || (tipo === "estampado" && patron !== "multicolor");
    const tono = (nombre, texto) => (
      <label className="text-sm font-semibold text-gray-700">{texto}
        <input type="color" {...register(nombre)} className="mt-1 block h-11 w-16 cursor-pointer rounded-xl border border-gray-300" />
      </label>
    );
    return (
      <>
        <InputField name="nombre" label="Nombre" register={register} required requiredMessage="Escribí el nombre." maxLength={40} error={errors.nombre?.message} />
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700">Tipo</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {[["liso", "Liso (un tono)"], ["bitono", "Bitono (dos tonos)"], ["estampado", "Estampado"]].map(([valor, texto]) => (
              <label key={valor} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-semibold text-slate-700 has-checked:border-slate-900 has-checked:bg-slate-50">
                <input type="radio" value={valor} {...register("tipo")} className="h-4 w-4" />{texto}
              </label>
            ))}
          </div>
        </fieldset>
        {tipo === "estampado" && (
          <label className="block text-sm font-semibold text-gray-700">Dibujo
            <select {...register("patron")} className="mt-1 block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm">
              {PATRONES.map((p) => <option key={p.valor} value={p.valor}>{p.texto}</option>)}
            </select>
          </label>
        )}
        <div className="flex flex-wrap items-end gap-4">
          {!(tipo === "estampado" && patron === "multicolor") && tono("hex", conSegundo ? (tipo === "estampado" ? "Fondo" : "Primer tono") : "Tono")}
          {conSegundo && tono("hex2", tipo === "estampado" ? "Dibujo" : "Segundo tono")}
          <div className="text-sm font-semibold text-gray-700">Así se ve
            <MuestraColor color={{ hex, hex2: conSegundo ? hex2 : null, patron: tipo === "estampado" ? patron : null }} className="mt-1 h-11 w-11" />
          </div>
        </div>
        {(errors.hex || errors.hex2) && <p className="text-sm text-red-600">{errors.hex?.message ?? errors.hex2?.message}</p>}
        <InputField name="orden" type="number" min={0} label="Orden" helperText="Menor número, aparece antes." register={register} error={errors.orden?.message} />
      </>
    );
  },
  fila: (c) => (
    <p className="flex items-center gap-3 font-semibold text-slate-900">
      <MuestraColor color={c} className="h-7 w-7" />
      {c.nombre} <span className="text-xs font-normal text-slate-400">{tipoDeColor(c) === "estampado" ? PATRONES.find((p) => p.valor === c.patron)?.texto : tipoDeColor(c) === "bitono" ? "Bitono" : c.hex}</span>
    </p>
  ),
};

const TALLES = {
  lista: "talles", titulo: "Grupos de talles", nuevo: "Nuevo grupo", icono: Ruler, sugeridos: "Cargar grupos sugeridos",
  descripcion: "Cada prenda usa los talles de un grupo (ej. Ropa: S a XXXL; Jeans: 36 a 56).",
  vacio: "Todavía no hay grupos de talles.", vacioDetalle: "Cargá los sugeridos (Ropa, Jeans, Calzado y Niños) y ajustalos.",
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
export const CaracteristicasPage = () => <ListaSimplePage config={CARACTERISTICAS} />;
export const ColoresPage = () => <ListaSimplePage config={COLORES} />;
export const TallesPage = () => <ListaSimplePage config={TALLES} />;
