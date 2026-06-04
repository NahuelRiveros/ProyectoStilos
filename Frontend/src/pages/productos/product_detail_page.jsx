import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, ShoppingBag,
  ChevronRight as Chevron, MessageCircle, Check, ArrowLeft, Tag,
} from "lucide-react";
import { getProducto } from "../../api/producto_api";
import { useWhatsAppCart } from "../../context/whatsapp_cart_context";
import { abrirWhatsApp, buildWhatsAppMessage } from "../../config/whatsapp_config";

const fmt = (n) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

export default function ProductDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
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

  /* ── Skeleton ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-3 w-14 animate-pulse rounded-full bg-line" />
          <div className="h-3 w-3 rounded-full bg-line" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-line" />
          <div className="h-3 w-3 rounded-full bg-line" />
          <div className="h-3 w-36 animate-pulse rounded-full bg-line" />
        </div>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="aspect-3/4 animate-pulse rounded-2xl bg-line/60" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-20 w-14 animate-pulse rounded-xl bg-line/60" />)}
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-line" />
            <div className="h-9 w-4/5 animate-pulse rounded-xl bg-line/60" />
            <div className="h-8 w-32 animate-pulse rounded-xl bg-line/60" />
            <div className="h-px w-full bg-line" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 w-14 animate-pulse rounded-xl bg-line/60" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !producto) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface ring-1 ring-line">
          <ShoppingBag size={36} className="text-muted/40" />
        </div>
        <div>
          <p className="text-lg font-bold text-ink">Producto no encontrado</p>
          <p className="mt-1 text-sm text-muted">Es posible que haya sido eliminado o que el link sea incorrecto.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          <ChevronLeft size={15} /> Volver al catálogo
        </button>
      </div>
    );
  }

  const images = producto.imagenes
    .slice(0, 3)
    .map((img) => typeof img === "string" ? { src: img, alt: producto.nombre } : img);

  const hasTalles  = producto.talles_disponibles.length > 0;
  const hasColores = producto.colores && producto.colores.length > 0;
  const isSoldOut  = producto.badge === "agotado" || producto.stock === 0;

  const discountLabel = producto.descuento ??
    (producto.precio_anterior
      ? `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`
      : null);

  const ahorro = producto.precio_anterior
    ? producto.precio_anterior - producto.precio
    : null;

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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted">
        <NavLink to="/catalogo" className="transition-colors hover:text-ink">Catálogo</NavLink>
        <Chevron size={11} className="shrink-0 opacity-30" />
        <NavLink to={catalogoBase} className="capitalize transition-colors hover:text-ink">
          {producto.genero ?? producto.categoria}
        </NavLink>
        <Chevron size={11} className="shrink-0 opacity-30" />
        <span className="max-w-52 truncate font-semibold text-ink">{producto.nombre}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">

        {/* ── GALERÍA ──────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="product-gallery">
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
                      className="icon-btn absolute left-3 top-1/2 z-10 -translate-y-1/2"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={18} className="text-ink" />
                    </button>
                    <button
                      onClick={next}
                      className="icon-btn absolute right-3 top-1/2 z-10 -translate-y-1/2"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={18} className="text-ink" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                  {producto.badge === "nuevo"   && <span className="badge-ui badge-primary uppercase tracking-widest">Nuevo</span>}
                  {producto.badge === "vuelve"  && <span className="badge-ui badge-primary uppercase tracking-widest">Vuelve</span>}
                  {producto.badge === "agotado" && <span className="badge-ui bg-line text-muted uppercase tracking-widest">Agotado</span>}
                  {discountLabel && !isSoldOut  && <span className="badge-ui badge-danger">{discountLabel}</span>}
                </div>

                {/* Dots nav */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={[
                          "h-1.5 rounded-full transition-all duration-200",
                          i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
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
                    "h-20 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                    i === imgIdx
                      ? "border-navy shadow-sm"
                      : "border-transparent opacity-55 hover:opacity-90 hover:border-line",
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
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted">
              <Tag size={10} className="opacity-60" />
              {producto.categoria}
            </span>
            {producto.marca && (
                <span className="badge-ui badge-brand uppercase tracking-widest">
                {producto.marca}
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
            {producto.nombre}
          </h1>

          {/* Precio */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-tight text-ink">{fmt(producto.precio)}</span>
              {producto.precio_anterior && (
                <span className="text-base text-muted line-through">{fmt(producto.precio_anterior)}</span>
              )}
              {discountLabel && (
                <span className="badge-ui bg-rose-100 text-rose-600">
                  {discountLabel}
                </span>
              )}
            </div>
            {ahorro && ahorro > 0 && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                Ahorrás {fmt(ahorro)}
              </p>
            )}
          </div>

          <div className="border-t border-line" />

          {/* Colores */}
          {hasColores && (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted">
                Colores disponibles
              </p>
              <div className="flex flex-wrap gap-2.5">
                {producto.colores.map((c) => (
                  <div
                    key={c.id}
                    title={c.nombre}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow ring-1 ring-line transition-all hover:ring-navy/40 hover:scale-110"
                  >
                    <div className="h-7 w-7 rounded-full" style={{ backgroundColor: c.hex ?? "#e5e7eb" }} />
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
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
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
                  Talle{talle ? ` — ${talle.talle}` : ""}
                </p>
              </div>
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
                        "product-option",
                        sinStock
                          ? "product-option-disabled"
                          : selected
                            ? "product-option-active"
                            : "",
                      ].join(" ")}
                    >
                      {t.talle}
                    </button>
                  );
                })}
              </div>
              {!talle && (
                <p className="mt-2 text-[11px] text-muted/70">Seleccioná un talle para continuar</p>
              )}
            </div>
          )}

          {/* Stock bajo */}
          {stockBajo && (
            <div className="alert-warning flex items-center gap-2 px-3.5 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="text-xs font-semibold">
                ¡Solo quedan {stockTalleSeleccionado} unidad{stockTalleSeleccionado !== 1 ? "es" : ""}!
              </p>
            </div>
          )}

          {/* Descripción */}
          {producto.descripcion && (
            <div className="rounded-2xl border border-line bg-surface/60 px-5 py-4 border-l-2 border-l-champagne/40">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted">Descripción</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">
                {producto.descripcion}
              </p>
            </div>
          )}

          {/* ── BOTONES WHATSAPP ─────────────────────────────────────────── */}
          {!isSoldOut ? (
            <div className="space-y-3 pt-1">
              <button
                onClick={handleConsultarAhora}
                className="btn btn-whatsapp btn-lg group relative w-full overflow-hidden"
              >
                <MessageCircle size={18} className="shrink-0" />
                Consultar por WhatsApp
                <span aria-hidden="true" className="absolute right-5 opacity-10 transition-all duration-300 group-hover:opacity-20 group-hover:translate-x-1">
                  <MessageCircle size={32} />
                </span>
              </button>

              <button
                onClick={handleAgregarConsulta}
                className={[
                  "btn w-full",
                  agregado
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "btn-secondary hover:border-emerald-400/60 hover:bg-emerald-50/60 hover:text-emerald-700",
                ].join(" ")}
              >
                {agregado
                  ? <Check size={15} className="text-emerald-600" />
                  : <MessageCircle size={15} className="text-muted" />}
                {agregado ? "¡Listo! Producto en la lista" : "Agregar a lista de consulta"}
              </button>

              <p className="text-center text-[10px] text-muted">
                Los pedidos se coordinan por WhatsApp · Envío o retiro en tienda
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-center">
              <ShoppingBag size={22} className="mx-auto mb-2 text-muted/30" />
              <p className="text-sm font-bold text-ink">Producto agotado</p>
              <p className="mt-0.5 text-xs text-muted">Por el momento no tenemos stock disponible.</p>
            </div>
          )}

          {/* Volver */}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary self-start"
          >
            <ArrowLeft size={13} /> Seguir viendo productos
          </button>

        </div>
      </div>
    </div>
  );
}
