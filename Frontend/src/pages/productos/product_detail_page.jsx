import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, ShoppingBag,
  ChevronRight as Chevron, MessageCircle, Check,
} from "lucide-react";
import { getProducto } from "../../api/producto_api";
import { useWhatsAppCart } from "../../context/whatsapp_cart_context";
import { abrirWhatsApp, buildWhatsAppMessage } from "../../config/whatsapp_config";

const fmt = (n) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addItem } = useWhatsAppCart();

  const [producto, setProducto] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [talle,    setTalle]    = useState(null);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgIdx(0);
    setTalle(null);
    setAgregado(false);
    getProducto(id)
      .then(setProducto)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-16 animate-pulse rounded bg-surface" />
          <div className="h-3 w-3 animate-pulse rounded bg-surface" />
          <div className="h-3 w-32 animate-pulse rounded bg-surface" />
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-3/4 animate-pulse rounded-2xl bg-surface" />
          <div className="space-y-4 pt-2">
            <div className="h-3 w-20 animate-pulse rounded bg-surface" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-6 w-24 animate-pulse rounded bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ShoppingBag size={48} className="text-muted/20" />
        <p className="text-muted">Producto no encontrado</p>
        <button onClick={() => navigate(-1)} className="text-sm text-navy underline underline-offset-2">
          Volver
        </button>
      </div>
    );
  }

  // Máximo 3 imágenes en el detalle
  const images = producto.imagenes
    .slice(0, 3)
    .map((img) => typeof img === "string" ? { src: img, alt: producto.nombre } : img);

  const hasTalles   = producto.talles_disponibles.length > 0;
  const hasColores  = producto.colores && producto.colores.length > 0;
  const isSoldOut   = producto.badge === "agotado" || producto.stock === 0;
  const discountLabel = producto.descuento ??
    (producto.precio_anterior
      ? `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`
      : null);

  const stockTalleSeleccionado = talle?.stock ?? (hasTalles ? null : producto.stock);
  const stockBajo = stockTalleSeleccionado !== null && stockTalleSeleccionado > 0 && stockTalleSeleccionado <= 5;

  function prev() { setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function next() { setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1)); }

  const catalogoBase = producto.genero_slug ? `/${producto.genero_slug}` : "/catalogo";

  function handleAgregarConsulta() {
    addItem(producto, talle?.talle ?? null);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  function handleConsultarAhora() {
    const mensaje = buildWhatsAppMessage([{
      nombre:   producto.nombre,
      talle:    talle?.talle ?? null,
      precio:   producto.precio,
      cantidad: 1,
    }]);
    abrirWhatsApp(mensaje);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <NavLink to="/catalogo" className="transition hover:text-navy">Catálogo</NavLink>
        <Chevron size={11} className="shrink-0 opacity-40" />
        <NavLink to={catalogoBase} className="capitalize transition hover:text-navy">
          {producto.genero ?? producto.categoria}
        </NavLink>
        <Chevron size={11} className="shrink-0 opacity-40" />
        <span className="max-w-50 truncate font-semibold text-ink">{producto.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">

        {/* ── GALERÍA (máx 3 fotos) ──────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-surface">
            {images.length > 0 ? (
              <>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.src}
                    alt={img.alt ?? producto.nombre}
                    className={[
                      "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                      i === imgIdx ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                ))}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm transition hover:bg-white"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm transition hover:bg-white"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                  {producto.badge === "nuevo"   && <span className="bg-navy px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">Nuevo</span>}
                  {producto.badge === "vuelve"  && <span className="bg-ink px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">Vuelve</span>}
                  {producto.badge === "agotado" && <span className="bg-line px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted">Agotado</span>}
                  {discountLabel && !isSoldOut  && <span className="bg-rose-500 px-2.5 py-1 text-[9px] font-black text-white">{discountLabel}</span>}
                </div>

                {/* Contador fotos */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={[
                          "h-1.5 rounded-full transition-all",
                          i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/50",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag size={64} className="text-champagne/20" />
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={[
                    "h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition",
                    i === imgIdx ? "border-navy" : "border-transparent opacity-60 hover:opacity-100",
                  ].join(" ")}
                >
                  <img src={img.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Categoría + Marca */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              {producto.categoria}
            </p>
            {producto.marca && (
              <span className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                {producto.marca}
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            {producto.nombre}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-ink">{fmt(producto.precio)}</span>
            {producto.precio_anterior && (
              <span className="text-sm text-muted line-through">{fmt(producto.precio_anterior)}</span>
            )}
            {discountLabel && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                {discountLabel}
              </span>
            )}
          </div>

          <div className="border-t border-line" />

          {/* Colores */}
          {hasColores && (
            <div>
              <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-muted">
                Colores disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.colores.map((c) => (
                  <div
                    key={c.id}
                    title={c.nombre}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-line transition hover:ring-navy/40"
                  >
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: c.hex ?? "#e5e7eb" }} />
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {c.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Talles */}
          {hasTalles && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                Talle{talle ? ` — ${talle.talle}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.talles_disponibles.map((t) => {
                  const sinStock = t.stock === 0;
                  const selected = talle?.talle === t.talle;
                  return (
                    <button
                      key={t.talle}
                      onClick={() => { if (!sinStock) setTalle(t); }}
                      disabled={sinStock}
                      title={sinStock ? "Sin stock" : t.talle}
                      className={[
                        "min-w-11 border px-3 py-2 text-xs font-bold uppercase tracking-wider transition",
                        sinStock
                          ? "cursor-not-allowed border-line text-muted/40 line-through"
                          : selected
                            ? "border-navy bg-navy text-white"
                            : "border-line text-ink hover:border-navy",
                      ].join(" ")}
                    >
                      {t.talle}
                    </button>
                  );
                })}
              </div>
              {hasTalles && !talle && (
                <p className="mt-1.5 text-[11px] text-muted">Seleccioná un talle para consultar</p>
              )}
            </div>
          )}

          {stockBajo && (
            <p className="text-center text-xs font-semibold text-amber-600">
              ¡Últimas {stockTalleSeleccionado} unidad{stockTalleSeleccionado !== 1 ? "es" : ""}!
            </p>
          )}

          {/* Descripción */}
          {producto.descripcion && (
            <div className="rounded-2xl border border-line bg-surface/60 px-5 py-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">Descripción</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">
                {producto.descripcion}
              </p>
            </div>
          )}

          {/* ── BOTONES WHATSAPP ─────────────────────────────────────────── */}
          {!isSoldOut && (
            <div className="space-y-2.5 pt-1">
              {/* Agregar a la lista de consulta */}
              <button
                onClick={handleAgregarConsulta}
                className={[
                  "flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-black transition-all active:scale-[0.98]",
                  agregado
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-emerald-500 bg-white text-emerald-600 hover:bg-emerald-50",
                ].join(" ")}
              >
                {agregado ? <Check size={16} /> : <MessageCircle size={16} />}
                {agregado ? "¡Agregado a la consulta!" : "Agregar a consulta"}
              </button>

              {/* Consultar solo este producto ahora */}
              <button
                onClick={handleConsultarAhora}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </button>

              <p className="text-center text-[10px] text-muted">
                Los pedidos se coordinan por WhatsApp · Envío o retiro en tienda
              </p>
            </div>
          )}

          {isSoldOut && (
            <div className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-muted">Este producto está agotado por el momento.</p>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 self-start text-xs text-muted transition hover:text-navy"
          >
            <ChevronLeft size={13} /> Volver
          </button>

        </div>
      </div>
    </div>
  );
}
