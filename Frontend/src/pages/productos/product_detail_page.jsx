import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { ChevronLeft, ShoppingBag, ChevronRight as Chevron, Tag, ArrowLeft } from "lucide-react";
import { getProducto } from "../../api/producto_api";
import { useWhatsAppCart } from "../../context/whatsapp_cart_context";
import { useCart } from "../../cart/cart_context";
import { useAuth } from "../../auth/auth_context";
import { abrirWhatsApp, buildWhatsAppMessage } from "../../config/whatsapp_config";
import { isWhatsAppMode, isEcommerceMode, storeConfig, cartConfig } from "../../config/app_config";
import { useWhatsappConfig } from "../../api/whatsapp_config_api";
import PaymentMethods from "../../components/ui/payment_methods";
import ProductGallery  from "./components/product/product_gallery";
import ProductVariants from "./components/product/product_variants";
import ProductActions  from "./components/product/product_actions";

const fmt = (n) => `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

export default function ProductDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addItem: addWhatsAppItem } = useWhatsAppCart();
  const { addItem: addCartItem }     = useCart();
  const { isAuth }                   = useAuth();
  const whatsappCfg                  = useWhatsappConfig();

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

  if (loading) return <DetailSkeleton />;

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
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          <ChevronLeft size={15} /> Volver al catálogo
        </button>
      </div>
    );
  }

  const images = producto.imagenes
    .slice(0, 3)
    .map((img) => typeof img === "string" ? { src: img, alt: producto.nombre } : img);

  const hasTalles = producto.talles_disponibles.length > 0;
  const isSoldOut = producto.badge === "agotado" || producto.stock === 0;

  const discountLabel = producto.descuento ??
    (producto.precio_anterior
      ? `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`
      : null);

  const ahorro = producto.precio_anterior ? producto.precio_anterior - producto.precio : null;
  const catalogoBase = producto.genero_slug ? `/${producto.genero_slug}` : "/catalogo";

  function handleAgregarConsulta() {
    addWhatsAppItem(producto, talle?.talle ?? null);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  function handleAgregarCarrito() {
    if (!isAuth) { navigate("/login"); return; }
    addCartItem({ producto_id: producto.id, talle_id: talle?.id ?? null, cantidad: 1 });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  function handleConsultarAhora() {
    const mensaje = buildWhatsAppMessage([{
      nombre: producto.nombre, talle: talle?.talle ?? null,
      precio: producto.precio, cantidad: 1,
    }], whatsappCfg);
    abrirWhatsApp(mensaje, whatsappCfg.phone);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
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

        <ProductGallery
          images={images}
          imgIdx={imgIdx}
          onPrev={() => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
          onNext={() => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
          onGoTo={setImgIdx}
          badge={producto.badge}
          discountLabel={discountLabel}
          isSoldOut={isSoldOut}
        />

        <div className="flex flex-col gap-5">

          {/* Categoría + Marca */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted">
              <Tag size={10} className="opacity-60" />
              {producto.categoria}
            </span>
            {producto.marca && (
              <span className="badge-ui badge-brand uppercase tracking-widest">{producto.marca}</span>
            )}
          </div>

          <h1 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
            {producto.nombre}
          </h1>

          {storeConfig.enablePrices && (
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black tracking-tight text-ink">{fmt(producto.precio)}</span>
                {producto.precio_anterior && (
                  <span className="text-base text-muted line-through">{fmt(producto.precio_anterior)}</span>
                )}
                {discountLabel && (
                  <span className="badge-ui bg-rose-100 text-rose-600">{discountLabel}</span>
                )}
              </div>
              {ahorro > 0 && (
                <p className="mt-1 text-xs font-semibold text-emerald-600">Ahorrás {fmt(ahorro)}</p>
              )}
            </div>
          )}

          <div className="border-t border-line" />

          <ProductVariants
            talles={producto.talles_disponibles}
            colores={producto.colores ?? []}
            talle={talle}
            onSelectTalle={setTalle}
            stockProducto={producto.stock}
          />

          {producto.descripcion && (
            <div className="rounded-2xl border border-line bg-surface/60 px-5 py-4 border-l-2 border-l-champagne/40">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted">Descripción</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{producto.descripcion}</p>
            </div>
          )}

          <ProductActions
            isWhatsApp={isWhatsAppMode()}
            isEcommerce={isEcommerceMode()}
            isSoldOut={isSoldOut}
            agregado={agregado}
            hasTalles={hasTalles}
            talle={talle}
            ctaType={cartConfig.productDetailCta}
            deliveryNote={whatsappCfg.deliveryNote}
            onConsultarAhora={handleConsultarAhora}
            onAgregarConsulta={handleAgregarConsulta}
            onAgregarCarrito={handleAgregarCarrito}
          />

          <PaymentMethods compact />

          <button onClick={() => navigate(-1)} className="btn btn-primary self-start">
            <ArrowLeft size={13} /> Seguir viendo productos
          </button>

        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
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
