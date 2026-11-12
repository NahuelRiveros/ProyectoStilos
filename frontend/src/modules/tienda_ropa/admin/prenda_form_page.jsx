import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Shirt } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import TextareaField from "../../../core/controls/ui/textarea_field.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { cn } from "../../../core/utils/cn.js";
import { useGestionPrendas, useLista, usePrendaPanel, mensajeError } from "../hooks/use_ropa.js";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, Pantalla, SegunConsulta } from "./comunes.jsx";
import { chip } from "./chip.js";
import { FotosDelColor, Paso, SelectorCategoria, TallesDelColor } from "./prenda_form_partes.jsx";
import { grupoSugerido } from "../utils/grupo_sugerido.js";
import { gruposDeCategoria } from "../utils/grupos_de_categoria.js";
import { caminoA } from "../utils/camino_categoria.js";

// Mismo límite que el servidor (servidor/src/modulos/tienda_ropa/reglas.js, ROP-29).
const MAX_FOTOS = 3;
const SELECT = "mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3";
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Alta y edición de una prenda (ROP-05 a ROP-08, ROP-29, ROP-38, ROP-60). Primero la categoría: de ella
 * salen los talles y las características que se ofrecen.
 */
export default function PrendaFormPage() {
  const { id } = useParams();
  const prenda = usePrendaPanel(id);
  const listas = { categorias: useLista("categorias"), marcas: useLista("marcas"), caracteristicas: useLista("caracteristicas"), colores: useLista("colores"), talles: useLista("talles") };
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
  const arbol = listas.categorias.data;

  const { register, handleSubmit, setError, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      categoria_id: String(prenda?.categoria_id ?? ""), nombre: prenda?.nombre ?? "", descripcion: prenda?.descripcion ?? "",
      marca_id: String(prenda?.marca_id ?? ""), precio: prenda ? Number(prenda.precio) : "", activo: prenda?.activo ?? true,
      precio_anterior: prenda?.precio_anterior ? Number(prenda.precio_anterior) : "",
    },
  });
  const [categoriaTexto, nombre, precio] = useWatch({ control, name: ["categoria_id", "nombre", "precio"] });
  const categoriaId = categoriaTexto ? Number(categoriaTexto) : null;

  const [grupoId, setGrupoId] = useState(prenda?.grupo_talle_id ?? grupos[0]?.id);
  // ROP-29: un solo color. Una prenda vieja con varios se queda con el primero (los otros, como prendas nuevas).
  const coloresAntes = [...new Set((prenda?.variantes ?? []).map((v) => v.color_id))];
  const [colorId, setColorId] = useState(coloresAntes[0] ?? null);
  // talle → "hay" | "agotado"; sin clave = no se vende.
  const [estados, setEstados] = useState(() => Object.fromEntries((prenda?.variantes ?? []).filter((v) => v.color_id === coloresAntes[0]).map((v) => [v.talle_id, v.disponible ? "hay" : "agotado"])));
  // Las fotos son de la prenda (de su color): las generales de antes pasan a su color.
  const [fotos, setFotos] = useState(() => (prenda?.imagenes ?? []).filter((i) => i.color_id === null || i.color_id === coloresAntes[0]).map((i) => i.url));
  const [caracteristicas, setCaracteristicas] = useState(() => new Set(prenda?.caracteristicas ?? []));
  const [verTodas, setVerTodas] = useState(false);
  const [errorTalles, setErrorTalles] = useState("");
  const [errorCaracteristicas, setErrorCaracteristicas] = useState("");

  const grupo = grupos.find((g) => g.id === grupoId);
  const talles = grupo?.talles ?? [];
  const todosHay = (lista) => Object.fromEntries(lista.map((t) => [t.id, "hay"]));
  const variantes = colorId ? talles.filter((t) => estados[t.id]).map((t) => ({ color_id: colorId, talle_id: t.id, disponible: estados[t.id] === "hay" })) : [];
  const camino = caminoA(arbol, categoriaId);
  // ROP-60: solo los grupos de la categoría elegida (y los que ya tienen algo tildado).
  const { visibles, otros } = gruposDeCategoria(listas.caracteristicas.data, arbol, categoriaId, caracteristicas);
  const gruposAVer = verTodas ? [...visibles, ...otros] : visibles;
  const color = colores.find((c) => c.id === colorId);

  function cambiarGrupo(nuevo) {
    setGrupoId(nuevo);
    setEstados(colorId ? todosHay(grupos.find((g) => g.id === nuevo)?.talles ?? []) : {});
  }

  function elegirCategoria(id) {
    setValue("categoria_id", String(id), { shouldValidate: true, shouldDirty: true });
    // ROP-36: en una prenda nueva, la categoría propone sus talles (al editar no se cambian solos).
    if (prenda) return;
    const sugerido = grupoSugerido(arbol, id);
    if (sugerido && sugerido !== grupoId && grupos.some((g) => g.id === sugerido)) cambiarGrupo(sugerido);
  }

  function elegirColor(id) {
    if (colorId === null) setEstados(todosHay(talles));
    setColorId(id);
  }

  function alternarCaracteristica(id) {
    setCaracteristicas((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
      return nuevo;
    });
  }

  async function enviar(valores) {
    if (!variantes.length) { setErrorTalles("Elegí el color y al menos un talle que se venda."); return; }
    setErrorTalles("");
    try {
      const r = await guardar.mutateAsync({
        id: prenda?.id, nombre: valores.nombre, descripcion: valores.descripcion,
        categoria_id: Number(valores.categoria_id), marca_id: valores.marca_id ? Number(valores.marca_id) : null,
        grupo_talle_id: grupoId, precio: Number(valores.precio), activo: valores.activo,
        precio_anterior: valores.precio_anterior === "" ? null : Number(valores.precio_anterior),
        variantes, imagenes: fotos.map((url) => ({ url, color_id: colorId })), caracteristicas: [...caracteristicas],
      });
      toast.success(r.mensaje);
      navigate("/admin/ropa/prendas");
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      for (const e of porCampo) {
        if (["variantes", "imagenes"].includes(e.campo.split(".")[0])) setErrorTalles(e.mensaje);
        else if (e.campo.startsWith("caracteristicas")) setErrorCaracteristicas(e.mensaje);
        else setError(e.campo, { message: e.mensaje });
      }
      if (!porCampo.length) setError("root", { message: mensajeError(error, "No se pudo guardar la prenda.") });
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">{prenda ? `Editar ${prenda.nombre}` : "Nueva prenda"}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Primero elegí qué vas a cargar: de eso salen los talles y las características.</p>
      </header>

      <Paso numero={1} titulo="¿Qué vas a cargar?" descripcion="Bajá hasta el tipo de prenda (ej. Hombre › Remeras)." listo={Boolean(categoriaId)}>
        <input type="hidden" {...register("categoria_id", { required: "Elegí la categoría." })} />
        <SelectorCategoria arbol={arbol} valor={categoriaId} onElegir={elegirCategoria} />
        {errors.categoria_id && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{errors.categoria_id.message}</p>}
      </Paso>

      {!categoriaId ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <Shirt size={28} className="text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">Elegí la categoría para seguir con los datos, talles, características y fotos.</p>
        </div>
      ) : (
        <>
          <Paso numero={2} titulo="Datos" listo={Boolean(nombre && precio)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><InputField name="nombre" label="Nombre" placeholder={`Ej. ${camino.at(-1)?.nombre ?? "Remera"} Taverniti`} register={register} required requiredMessage="Escribí el nombre." maxLength={120} error={errors.nombre?.message} /></div>
              <label className="block text-sm font-semibold text-gray-700">Marca
                <select {...register("marca_id")} className={SELECT}>
                  <option value="">Sin marca</option>
                  {listas.marcas.data.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </label>
              <InputField name="precio" type="number" min={1} step="0.01" inputMode="decimal" label="Precio ($)" helperText="El mismo para todos los talles." register={register} required requiredMessage="Escribí el precio." error={errors.precio?.message} />
              <InputField name="precio_anterior" type="number" min={1} step="0.01" inputMode="decimal" label="Precio anterior ($)" helperText="Solo si está en oferta: se ve tachado." register={register} error={errors.precio_anterior?.message} />
              <label className="flex min-h-11 items-center gap-2 self-center text-sm font-semibold text-gray-700"><input type="checkbox" {...register("activo")} className="h-5 w-5" /> Se ve en la tienda</label>
              <div className="sm:col-span-2"><TextareaField name="descripcion" label="Descripción (opcional)" rows={3} placeholder="Tela, calce, cuidados…" register={register} error={errors.descripcion?.message} /></div>
            </div>
          </Paso>

          <Paso numero={3} titulo="Color y talles" descripcion="Una prenda es de un solo color: los otros colores del mismo modelo se cargan aparte, con el mismo nombre y marca." listo={variantes.length > 0}>
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
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-700">Color</legend>
              <div className="grid grid-cols-4 gap-1 sm:grid-cols-8 lg:grid-cols-10">
                {colores.map((c) => (
                  <button key={c.id} type="button" onClick={() => elegirColor(c.id)} aria-pressed={colorId === c.id}
                    className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-1.5 text-center text-[11px] font-semibold leading-tight", colorId === c.id ? "border-slate-900 bg-slate-50 text-slate-900" : "border-transparent text-slate-600 hover:border-slate-200")}>
                    <span className="h-7 w-7 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} aria-hidden="true" />{c.nombre}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">Talles {grupo && <span className="font-normal text-slate-500">· {grupo.nombre}</span>}</p>
              <label className="text-xs font-semibold text-slate-500">Grupo de talles
                <select value={grupoId} onChange={(e) => cambiarGrupo(Number(e.target.value))} className="ml-2 min-h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm text-slate-700">
                  {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-2">
              {colorId
                ? <TallesDelColor talles={talles} estados={estados} onCambiar={(talleId, valor) => setEstados((actual) => { const nuevo = { ...actual }; if (valor) nuevo[talleId] = valor; else delete nuevo[talleId]; return nuevo; })} />
                : <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">Elegí el color para marcar qué talles hay.</p>}
            </div>
            {errorTalles && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{errorTalles}</p>}
          </Paso>

          <Paso numero={4} titulo="Características" opcional descripcion="Tildá las que tiene: se muestran en la ficha y sirven para filtrar en la tienda." listo={caracteristicas.size > 0}>
            {listas.caracteristicas.data.length === 0
              ? <p className="text-sm text-slate-500">Todavía no hay características. <Link to="/admin/ropa/caracteristicas" className="font-semibold text-slate-900 underline">Cargalas acá</Link>.</p>
              : (
                <div className="space-y-5">
                  {gruposAVer.length === 0 && <p className="text-sm text-slate-500">Esta categoría no tiene características propias.</p>}
                  {gruposAVer.map((g) => (
                    <fieldset key={g.id}>
                      <legend className="mb-2 text-sm font-semibold text-gray-700">{g.nombre}</legend>
                      <div className="flex flex-wrap gap-2">
                        {g.caracteristicas.map((c) => (
                          <button key={c.id} type="button" onClick={() => alternarCaracteristica(c.id)} aria-pressed={caracteristicas.has(c.id)} className={chip(caracteristicas.has(c.id))}>{c.nombre}</button>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  {otros.length > 0 && (
                    <button type="button" onClick={() => setVerTodas((v) => !v)} aria-expanded={verTodas} className="min-h-11 text-sm font-semibold text-slate-700 underline">
                      {verTodas ? "Ver solo las de la categoría" : `Ver todas las características (${plural(otros.length, "grupo más", "grupos más")})`}
                    </button>
                  )}
                </div>
              )}
            {errorCaracteristicas && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{errorCaracteristicas}</p>}
          </Paso>

          <Paso numero={5} titulo="Fotos" descripcion={`Hasta ${MAX_FOTOS}. La primera es la portada de la tarjeta.`} listo={fotos.length > 0}>
            {colorId
              ? <FotosDelColor titulo={color?.nombre} fotos={fotos} setFotos={setFotos} max={MAX_FOTOS} />
              : <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">Elegí el color en el paso 3 para cargar las fotos.</p>}
          </Paso>
        </>
      )}

      <FormError message={errors.root?.message} />
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:shadow-lg">
        <p className="min-w-0 truncate text-sm text-slate-600">
          {camino.length
            ? <><span className="font-semibold text-slate-900">{camino.map((c) => c.nombre).join(" › ")}</span> · {plural(variantes.length, "talle", "talles")} · {plural(caracteristicas.size, "característica", "características")} · {fotos.length}/{MAX_FOTOS} fotos</>
            : "Elegí qué vas a cargar."}
        </p>
        <div className="flex shrink-0 gap-2">
          <Link to="/admin/ropa/prendas" className={`${BOTON_SECUNDARIO} flex-1 sm:flex-none`}>Cancelar</Link>
          <button type="submit" disabled={guardar.isPending} className={`${BOTON_PRIMARIO} flex-1 sm:flex-none`}>{guardar.isPending ? "Guardando…" : "Guardar prenda"}</button>
        </div>
      </div>
    </form>
  );
}
