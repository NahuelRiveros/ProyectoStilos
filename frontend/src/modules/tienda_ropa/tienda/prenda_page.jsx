import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Minus, Plus, Share2, Shirt, ShoppingBag } from "lucide-react";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { usePrendaTienda } from "../hooks/use_ropa.js";
import { usePedido } from "../pedido/pedido_context.js";
import { ErrorReintentar } from "./estados.jsx";
import Precio, { EtiquetaOferta } from "./precio.jsx";
import PrendaCard from "./prenda_card.jsx";
import { compartir } from "./compartir.js";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import { enOferta } from "../utils/dinero.js";

/** Ficha (ROP-12, ROP-19, ROP-22, ROP-58): fotos, color, talle (agotados tachados), "Agregar al pedido", compartir y relacionadas. */
export default function PrendaPage() {
  const { slug } = useParams();
  const consulta = usePrendaTienda(slug);

  if (consulta.isPending) return <div role="status" aria-label="Cargando prenda" className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2"><div className="aspect-3/4 animate-pulse rounded-2xl bg-(--kt-bg-soft)" /><div className="h-64 animate-pulse rounded-2xl bg-(--kt-bg-soft)" /></div>;
  if (consulta.isError) {
    const noExiste = consulta.error?.response?.status === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        {noExiste
          ? <><p className="kt-display text-3xl font-semibold">Esta prenda ya no está disponible</p><Link to="/catalogo" className="mt-4 inline-flex min-h-11 items-center font-semibold text-(--kt-petrol) underline">Ver la colección</Link></>
          : <ErrorReintentar consulta={consulta} mensaje="No pudimos cargar la prenda." />}
      </div>
    );
  }
  // key: al navegar a otra prenda se reinician color, talle y cantidad.
  return <Ficha key={consulta.data.id} prenda={consulta.data} />;
}

function Ficha({ prenda }) {
  const pedido = usePedido();
  const toast = useToast();
  const hayEn = (colorId) => prenda.variantes.some((v) => v.color_id === colorId && v.disponible);
  const [colorId, setColorId] = useState(() => (prenda.colores.find((c) => hayEn(c.id)) ?? prenda.colores[0])?.id ?? null);
  const [talleId, setTalleId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [fotoIdx, setFotoIdx] = useState(0);

  const color = prenda.colores.find((c) => c.id === colorId);
  // Primero las fotos del color; las generales se ven con todos.
  const fotos = [...prenda.imagenes.filter((i) => i.color_id === colorId), ...prenda.imagenes.filter((i) => i.color_id === null)];
  const foto = fotos[Math.min(fotoIdx, fotos.length - 1)];
  const variante = (tId) => prenda.variantes.find((v) => v.color_id === colorId && v.talle_id === tId);
  const elegida = talleId ? variante(talleId) : null;
  const talle = prenda.talles.find((t) => t.id === talleId);

  function elegirColor(id) {
    setColorId(id);
    setFotoIdx(0);
    if (talleId && !prenda.variantes.some((v) => v.color_id === id && v.talle_id === talleId && v.disponible)) setTalleId(null);
  }

  async function compartirPrenda() {
    const resultado = await compartir({ titulo: prenda.nombre, texto: `${prenda.nombre} en ${brandConfig.nombre}`, url: window.location.href }, navigator);
    if (resultado === "copiado") toast.success("Copiamos el link de la prenda.");
    if (resultado === "error") toast.error("No pudimos compartir. Copiá el link de la barra del navegador.");
  }

  function agregar() {
    try {
      pedido.agregar({
        variante_id: elegida.id, prenda_id: prenda.id, slug: prenda.slug, nombre: prenda.nombre,
        color: color.nombre, talle: talle.nombre, precio: prenda.precio, foto: fotos[0]?.url ?? null, cantidad,
      });
      toast.success(`Agregaste ${cantidad} × ${prenda.nombre} (${color.nombre}, ${talle.nombre}) a tu pedido.`);
      setCantidad(1);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Ubicación" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-(--kt-ink-soft)">
        <Link to="/catalogo" className="inline-flex min-h-11 items-center hover:text-(--kt-ink)">Colección</Link>
        {prenda.migas.map((m) => (
          <span key={m.id} className="flex items-center gap-1"><ChevronRight size={14} aria-hidden="true" /><Link to={`/catalogo?categoria=${m.id}`} className="inline-flex min-h-11 items-center hover:text-(--kt-ink)">{m.nombre}</Link></span>
        ))}
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <div className="aspect-3/4 overflow-hidden rounded-2xl bg-(--kt-bg-soft)">
            {foto
              ? <img src={imagenCloudinary(foto.url, 900)} alt={`${prenda.nombre}${color ? ` en ${color.nombre}` : ""}`} className="h-full w-full object-cover" />
              : <div className="flex h-full items-center justify-center text-(--kt-turquoise)"><Shirt size={96} strokeWidth={1} aria-hidden="true" /></div>}
          </div>
          {fotos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {fotos.map((f, i) => (
                <button key={f.id} type="button" onClick={() => setFotoIdx(i)} aria-label={`Ver foto ${i + 1}`} aria-pressed={i === fotoIdx}
                  className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2", i === fotoIdx ? "border-(--kt-petrol)" : "border-transparent")}>
                  <img src={imagenCloudinary(f.url, 160)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {prenda.marca && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--kt-ink-soft)">{prenda.marca.nombre}</p>}
          <h1 className="kt-display mt-1 text-4xl font-semibold leading-tight sm:text-5xl">{prenda.nombre}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Precio prenda={prenda} grande />
            {enOferta(prenda) && <EtiquetaOferta />}
          </div>

          <fieldset className="mt-8">
            <legend className="mb-3 text-sm font-semibold">Color: <span className="font-normal text-(--kt-ink-soft)">{color?.nombre}</span></legend>
            <div className="flex flex-wrap gap-2">
              {prenda.colores.map((c) => (
                <button key={c.id} type="button" onClick={() => elegirColor(c.id)} aria-pressed={c.id === colorId} aria-label={`${c.nombre}${hayEn(c.id) ? "" : " (agotado)"}`} title={c.nombre}
                  className={cn("relative h-11 w-11 rounded-full border-2 p-1", c.id === colorId ? "border-(--kt-petrol)" : "border-transparent hover:border-(--kt-border)", !hayEn(c.id) && "opacity-40")}>
                  <span className="block h-full w-full rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
                </button>
              ))}
            </div>
            {prenda.otros_colores.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold">También en:</p>
                <div className="flex flex-wrap gap-2">
                  {prenda.otros_colores.map((o) => (
                    <Link key={o.slug} to={`/catalogo/${o.slug}`} aria-label={`Ver en ${o.color.nombre}`} title={o.color.nombre}
                      className="h-11 w-11 rounded-full border-2 border-transparent p-1 hover:border-(--kt-border)">
                      <span className="block h-full w-full rounded-full border border-black/15" style={{ backgroundColor: o.color.hex }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold">Talle</legend>
            <div className="flex flex-wrap gap-2">
              {prenda.talles.map((t) => {
                const v = variante(t.id);
                const hay = Boolean(v?.disponible);
                return (
                  <button key={t.id} type="button" disabled={!hay} onClick={() => setTalleId(t.id)} aria-pressed={t.id === talleId}
                    aria-label={`Talle ${t.nombre}${hay ? "" : ", agotado"}`}
                    className={cn("min-h-11 min-w-12 rounded-xl border px-3 text-sm font-semibold transition",
                      t.id === talleId ? "border-(--kt-petrol) bg-(--kt-petrol) text-(--kt-accent-on-dark)" : "border-(--kt-border) hover:border-(--kt-petrol)",
                      !hay && "cursor-not-allowed text-(--kt-ink-soft) line-through opacity-50 hover:border-(--kt-border)")}>
                    {t.nombre}
                  </button>
                );
              })}
            </div>
            {!hayEn(colorId) && <p className="mt-2 text-sm text-(--kt-ink-soft)">Este color está agotado. Probá con otro.</p>}
          </fieldset>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 items-center rounded-xl border border-(--kt-border)" aria-label="Cantidad">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Una menos" className="flex h-12 w-12 items-center justify-center"><Minus size={16} aria-hidden="true" /></button>
              <span aria-live="polite" className="w-8 text-center font-semibold">{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(pedido.maxCantidad, c + 1))} aria-label="Una más" className="flex h-12 w-12 items-center justify-center"><Plus size={16} aria-hidden="true" /></button>
            </div>
            <button type="button" onClick={agregar} disabled={!elegida?.disponible}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-(--kt-accent-comercial) px-6 font-bold text-white transition hover:bg-(--kt-accent-comercial-hover) disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingBag size={18} aria-hidden="true" /> {elegida ? "Agregar al pedido" : "Elegí un talle"}
            </button>
          </div>
          {pedido.unidades > 0 && <Link to="/pedido" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-(--kt-petrol) underline-offset-4 hover:underline">Ver mi pedido ({pedido.unidades})</Link>}

          <button type="button" onClick={compartirPrenda} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-(--kt-ink-soft) hover:text-(--kt-ink)">
            <Share2 size={16} aria-hidden="true" /> Compartir
          </button>

          {prenda.caracteristicas.length > 0 && (
            <dl aria-label="Características" className="mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-(--kt-border) pt-6 text-sm">
              {prenda.caracteristicas.map((g) => (
                <div key={g.id} className="contents">
                  <dt className="font-semibold">{g.nombre}</dt>
                  <dd className="text-(--kt-ink-soft)">{g.caracteristicas.map((c) => c.nombre).join(" · ")}</dd>
                </div>
              ))}
            </dl>
          )}
          {prenda.descripcion && <p className="mt-8 whitespace-pre-line [overflow-wrap:anywhere] border-t border-(--kt-border) pt-6 text-sm leading-relaxed text-(--kt-ink-soft)">{prenda.descripcion}</p>}
        </div>
      </div>

      {prenda.relacionadas.length > 0 && (
        <section aria-labelledby="relacionadas" className="mt-16 border-t border-(--kt-border) pt-10">
          <h2 id="relacionadas" className="kt-display text-3xl font-semibold">También te puede gustar</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {prenda.relacionadas.map((p) => <PrendaCard key={p.id} prenda={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
