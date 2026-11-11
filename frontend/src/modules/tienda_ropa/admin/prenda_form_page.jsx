import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import TextareaField from "../../../core/controls/ui/textarea_field.jsx";
import ImageUploadField from "../../../core/controls/ui/image_upload_field.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { useGestionPrendas, useLista, usePrendaPanel, mensajeError } from "../hooks/use_ropa.js";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, Pantalla, SegunConsulta } from "./comunes.jsx";

// Mismo límite que el servidor (servidor/src/modulos/tienda_ropa/reglas.js, ROP-29).
const MAX_FOTOS = 3;
const aplanar = (nodos, nivel = 0) => nodos.flatMap((n) => [{ ...n, nivel }, ...aplanar(n.hijas, nivel + 1)]);
const clave = (colorId, talleId) => `${colorId}-${talleId}`;

/** Alta y edición de una prenda (ROP-05 a ROP-08, ROP-29: un color por prenda). */
export default function PrendaFormPage() {
  const { id } = useParams();
  const prenda = usePrendaPanel(id);
  const listas = { categorias: useLista("categorias"), marcas: useLista("marcas"), disenos: useLista("disenos"), colores: useLista("colores"), talles: useLista("talles") };
  const consultas = [...Object.values(listas), ...(id ? [prenda] : [])];
  const cargando = consultas.find((c) => c.isPending || c.isError) ?? consultas[0];
  const faltaBase = !listas.categorias.data?.length || !listas.colores.data?.length || !listas.talles.data?.length;

  return (
    <Pantalla>
      <Link to="/admin/ropa/prendas" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} aria-hidden="true" /> Prendas</Link>
      <SegunConsulta consulta={cargando} vacia={!consultas.some((c) => c.isPending || c.isError) && faltaBase}
        tituloVacio="Primero cargá las listas"
        descripcionVacio="Para cargar una prenda hace falta al menos una categoría, un color y un grupo de talles."
        accionVacio={<div className="flex flex-wrap justify-center gap-2"><Link to="/admin/ropa/categorias" className={BOTON_SECUNDARIO}>Categorías</Link><Link to="/admin/ropa/colores" className={BOTON_SECUNDARIO}>Colores</Link><Link to="/admin/ropa/talles" className={BOTON_SECUNDARIO}>Talles</Link></div>}>
        {consultas.every((c) => c.isSuccess) && <Formulario key={id ?? "nueva"} prenda={id ? prenda.data : null} listas={listas} />}
      </SegunConsulta>
    </Pantalla>
  );
}

function Formulario({ prenda, listas }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { guardar } = useGestionPrendas();
  const grupos = listas.talles.data;
  const colores = listas.colores.data;

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      nombre: prenda?.nombre ?? "", descripcion: prenda?.descripcion ?? "",
      categoria_id: String(prenda?.categoria_id ?? ""), marca_id: String(prenda?.marca_id ?? ""), diseno_id: String(prenda?.diseno_id ?? ""),
      precio: prenda ? Number(prenda.precio) : "", activo: prenda?.activo ?? true,
      precio_anterior: prenda?.precio_anterior ? Number(prenda.precio_anterior) : "",
    },
  });
  const [grupoId, setGrupoId] = useState(prenda?.grupo_talle_id ?? grupos[0]?.id);
  // ROP-29: un solo color. Una prenda vieja con varios se queda con el primero (los otros, como prendas nuevas).
  const coloresAntes = [...new Set((prenda?.variantes ?? []).map((v) => v.color_id))];
  const [elegidos, setElegidos] = useState(() => coloresAntes.slice(0, 1));
  // clave color-talle → "hay" | "agotado"; sin clave = no se vende.
  const [celdas, setCeldas] = useState(() => Object.fromEntries((prenda?.variantes ?? []).filter((v) => v.color_id === coloresAntes[0]).map((v) => [clave(v.color_id, v.talle_id), v.disponible ? "hay" : "agotado"])));
  // Las fotos son de la prenda: las generales de antes pasan a su color.
  const [fotos, setFotos] = useState(() => (prenda?.imagenes ?? [])
    .filter((i) => i.color_id === null || i.color_id === coloresAntes[0])
    .map(({ url }) => ({ url, color_id: coloresAntes[0] ?? null })));
  const [errorVariantes, setErrorVariantes] = useState("");

  const talles = grupos.find((g) => g.id === grupoId)?.talles ?? [];
  const todasHay = (colorId) => Object.fromEntries(talles.map((t) => [clave(colorId, t.id), "hay"]));

  function cambiarGrupo(nuevo) {
    // Otro grupo = otros talles: los colores siguen elegidos, con todos los talles nuevos en "Hay".
    const tallesNuevos = grupos.find((g) => g.id === nuevo)?.talles ?? [];
    setGrupoId(nuevo);
    setCeldas(Object.fromEntries(elegidos.flatMap((c) => tallesNuevos.map((t) => [clave(c, t.id), "hay"]))));
  }

  // Cambiar el color conserva qué hay en cada talle y las fotos (pasan al color nuevo).
  function elegirColor(colorId) {
    const anterior = elegidos[0];
    if (anterior === colorId) return;
    setElegidos([colorId]);
    setCeldas((actual) => (anterior === undefined ? todasHay(colorId)
      : Object.fromEntries(Object.entries(actual).map(([k, v]) => [clave(colorId, k.split("-")[1]), v]))));
    setFotos((actual) => actual.map((foto) => ({ ...foto, color_id: colorId })));
  }

  function cambiarCelda(colorId, talleId, valor) {
    setCeldas((actual) => {
      const nuevo = { ...actual };
      if (valor) nuevo[clave(colorId, talleId)] = valor; else delete nuevo[clave(colorId, talleId)];
      return nuevo;
    });
  }

  async function enviar(valores) {
    const variantes = elegidos.flatMap((c) => talles.filter((t) => celdas[clave(c, t.id)]).map((t) => ({ color_id: c, talle_id: t.id, disponible: celdas[clave(c, t.id)] === "hay" })));
    if (!variantes.length) { setErrorVariantes("Elegí el color y al menos un talle que se venda."); return; }
    setErrorVariantes("");
    try {
      const r = await guardar.mutateAsync({
        id: prenda?.id, nombre: valores.nombre, descripcion: valores.descripcion,
        categoria_id: Number(valores.categoria_id), marca_id: valores.marca_id ? Number(valores.marca_id) : null,
        diseno_id: valores.diseno_id ? Number(valores.diseno_id) : null,
        grupo_talle_id: grupoId, precio: Number(valores.precio), activo: valores.activo,
        precio_anterior: valores.precio_anterior === "" ? null : Number(valores.precio_anterior),
        variantes, imagenes: fotos,
      });
      toast.success(r.mensaje);
      navigate("/admin/ropa/prendas");
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      for (const e of porCampo) {
        if (["variantes", "imagenes"].includes(e.campo.split(".")[0])) setErrorVariantes(e.mensaje);
        else setError(e.campo, { message: e.mensaje });
      }
      if (!porCampo.length) setError("root", { message: mensajeError(error, "No se pudo guardar la prenda.") });
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      <Seccion titulo={prenda ? `Editar ${prenda.nombre}` : "Nueva prenda"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><InputField name="nombre" label="Nombre" placeholder="Remera lisa de algodón" register={register} required requiredMessage="Escribí el nombre." maxLength={120} error={errors.nombre?.message} /></div>
          <label className="block text-sm font-semibold text-gray-700">Categoría
            <select {...register("categoria_id", { required: "Elegí una categoría." })} className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3">
              <option value="">Elegí…</option>
              {aplanar(listas.categorias.data).map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.nivel)}{c.nombre}</option>)}
            </select>
            {errors.categoria_id && <span className="mt-1 block text-sm font-normal text-red-600">{errors.categoria_id.message}</span>}
          </label>
          <label className="block text-sm font-semibold text-gray-700">Marca (opcional)
            <select {...register("marca_id")} className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3">
              <option value="">Sin marca</option>
              {listas.marcas.data.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">Diseño (opcional)
            <select {...register("diseno_id")} className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3">
              <option value="">Sin diseño</option>
              {listas.disenos.data.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </label>
          <InputField name="precio" type="number" min={1} step="0.01" inputMode="decimal" label="Precio ($)" helperText="El mismo para todos los talles." register={register} required requiredMessage="Escribí el precio." error={errors.precio?.message} />
          <InputField name="precio_anterior" type="number" min={1} step="0.01" inputMode="decimal" label="Precio anterior ($, opcional)" helperText="Para marcarla en oferta: se ve tachado. Vacío = sin oferta." register={register} error={errors.precio_anterior?.message} />
          <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold text-gray-700"><input type="checkbox" {...register("activo")} className="h-5 w-5" /> Se ve en la tienda</label>
          <div className="sm:col-span-2"><TextareaField name="descripcion" label="Descripción (opcional)" rows={4} placeholder="Tela, calce, cuidados…" register={register} error={errors.descripcion?.message} /></div>
        </div>
      </Seccion>

      <Seccion titulo="Color y talles" descripcion="Una prenda es de un solo color: los otros colores del mismo modelo se cargan como prendas aparte, con el mismo nombre y marca.">
        {coloresAntes.length > 1 && (
          <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Esta prenda tenía varios colores. Al guardarla queda solo {colores.find((c) => c.id === coloresAntes[0])?.nombre}: cargá los otros como prendas nuevas.
          </p>
        )}
        {prenda?.otros_colores?.length > 0 && (
          <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            También está en:
            {prenda.otros_colores.map((o) => (
              <Link key={o.id} to={`/admin/ropa/prendas/${o.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-2.5 font-semibold text-slate-800 hover:border-slate-400">
                <span className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: o.color.hex }} aria-hidden="true" />
                {o.color.nombre}{!o.activo && <span className="font-normal text-slate-400">(oculta)</span>}
              </Link>
            ))}
          </p>
        )}
        <label className="block max-w-xs text-sm font-semibold text-gray-700">Grupo de talles
          <select value={grupoId} onChange={(e) => cambiarGrupo(Number(e.target.value))} className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3">
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre} ({g.talles.map((t) => t.nombre).join(", ")})</option>)}
          </select>
        </label>
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-semibold text-gray-700">Color</legend>
          <div className="flex flex-wrap gap-2">
            {colores.map((c) => (
              <button key={c.id} type="button" onClick={() => elegirColor(c.id)} aria-pressed={elegidos.includes(c.id)}
                className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold", elegidos.includes(c.id) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700")}>
                <span className="h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} aria-hidden="true" />{c.nombre}
              </button>
            ))}
          </div>
        </fieldset>
        {elegidos.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th className="py-2 pr-3 text-left font-semibold text-slate-500">Color</th>{talles.map((t) => <th key={t.id} className="px-1 py-2 font-semibold text-slate-500">{t.nombre}</th>)}</tr></thead>
              <tbody>
                {elegidos.map((colorId) => {
                  const color = colores.find((c) => c.id === colorId);
                  return (
                    <tr key={colorId} className="border-t border-slate-100">
                      <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-slate-800">{color?.nombre}</th>
                      {talles.map((t) => {
                        const valor = celdas[clave(colorId, t.id)] ?? "";
                        return (
                          <td key={t.id} className="px-1 py-1">
                            <select aria-label={`${color?.nombre}, talle ${t.nombre}`} value={valor} onChange={(e) => cambiarCelda(colorId, t.id, e.target.value)}
                              className={cn("min-h-11 w-24 rounded-lg border px-1 text-xs font-semibold", valor === "hay" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : valor === "agotado" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-400")}>
                              <option value="hay">Hay</option>
                              <option value="agotado">Agotado</option>
                              <option value="">No se vende</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {errorVariantes && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{errorVariantes}</p>}
      </Seccion>

      <Seccion titulo="Fotos" descripcion={`Hasta ${MAX_FOTOS}. La primera es la de la tarjeta.`}>
        {elegidos.length
          ? elegidos.map((colorId) => {
            const color = colores.find((c) => c.id === colorId);
            return <GrupoFotos key={colorId} titulo={color?.nombre} hex={color?.hex} colorId={colorId} fotos={fotos} setFotos={setFotos} max={MAX_FOTOS} />;
          })
          : <p className="text-sm text-slate-500">Elegí el color para cargar las fotos.</p>}
      </Seccion>

      <FormError message={errors.root?.message} />
      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border">
        <Link to="/admin/ropa/prendas" className={BOTON_SECUNDARIO}>Cancelar</Link>
        <button type="submit" disabled={guardar.isPending} className={BOTON_PRIMARIO}>{guardar.isPending ? "Guardando…" : "Guardar prenda"}</button>
      </div>
    </form>
  );
}

function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-900">{titulo}</h2>
      {descripcion && <p className="mb-4 mt-0.5 text-sm text-slate-500">{descripcion}</p>}
      <div className={descripcion ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

/** Fotos de un color (o generales): miniaturas para ordenar o quitar, y alta por subida o enlace. */
function GrupoFotos({ titulo, hex, colorId, fotos, setFotos, max }) {
  const [nueva, setNueva] = useState("");
  const propias = fotos.filter((f) => f.color_id === colorId);
  const lleno = propias.length >= max;

  function agregar() {
    if (!/^https:\/\//.test(nueva)) return;
    setFotos([...fotos, { url: nueva, color_id: colorId }]);
    setNueva("");
  }
  function mover(foto, paso) {
    const lista = [...propias];
    const i = lista.indexOf(foto);
    [lista[i], lista[i + paso]] = [lista[i + paso], lista[i]];
    setFotos([...fotos.filter((f) => f.color_id !== colorId), ...lista]);
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {hex && <span className="h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: hex }} aria-hidden="true" />}
        {titulo} <span className="font-normal text-slate-400">{propias.length}/{max}</span>
      </p>
      <div className="flex flex-wrap items-start gap-3">
        {propias.map((f, i) => (
          <div key={`${f.url}-${i}`} className="relative">
            <img src={imagenCloudinary(f.url, 200)} alt="" className="h-28 w-21 rounded-xl border border-slate-200 object-cover" />
            <div className="mt-1 flex justify-center gap-1">
              <button type="button" disabled={i === 0} onClick={() => mover(f, -1)} aria-label="Mover antes" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ArrowUp size={14} aria-hidden="true" /></button>
              <button type="button" disabled={i === propias.length - 1} onClick={() => mover(f, 1)} aria-label="Mover después" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ArrowDown size={14} aria-hidden="true" /></button>
              <button type="button" onClick={() => setFotos(fotos.filter((x) => x !== f))} aria-label="Quitar foto" className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600"><X size={14} aria-hidden="true" /></button>
            </div>
          </div>
        ))}
        {!lleno && (
          <div className="w-full max-w-sm rounded-xl border border-dashed border-slate-300 p-3">
            <ImageUploadField label="Agregar foto" tooltip="Subila o pegá un enlace https." value={nueva} onChange={setNueva} />
            <button type="button" onClick={agregar} disabled={!/^https:\/\//.test(nueva)} className={cn(BOTON_SECUNDARIO, "mt-2 w-full")}>
              <ImagePlus size={15} aria-hidden="true" /> Sumar a {titulo?.toLowerCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
