import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
function PromoProductsSection({
  productos,
  loading,
  eyebrow = "Oferta especial",
  title = "Hasta 40% OFF",
  linkText = "Ver todas"
}) {
  const [hoveredId, setHoveredId] = useState(null);
  if (loading) {
    return <section className="section-muted border-t border-line">
        <div className="section-inner">
          <div className="animate-pulse">
            <div className="mb-10 h-8 w-48 rounded bg-navy/10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-xl bg-navy/10" />)}
            </div>
          </div>
        </div>
      </section>;
  }
  if (!productos || productos.length === 0) return null;
  return <section className="section-muted border-t border-line">
      <div className="section-inner">

        {
    /* Header */
  }
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">
              {eyebrow}
            </p>
            <h2 className="section-title">
              {title}
            </h2>
          </div>
          <NavLink
    to="/catalogo?solo_ofertas=true"
    className="text-link hidden sm:flex"
  >
            {linkText} <ArrowRight size={13} />
          </NavLink>
        </div>

        {
    /* Productos grid */
  }
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => {
    const isHovered = hoveredId === producto.id;
    const descuento = producto.descuento || (producto.precio_anterior ? `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%` : "Oferta");
    const precioAhorrado = producto.precio_anterior ? (producto.precio_anterior - producto.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 }) : null;
    return <NavLink
      key={producto.id}
      to={`/producto/${producto.id}`}
      onMouseEnter={() => setHoveredId(producto.id)}
      onMouseLeave={() => setHoveredId(null)}
      className="card-ui card-hover group relative overflow-hidden"
    >
                {
      /* Image container */
    }
                <div className="relative aspect-square overflow-hidden bg-navy/5">
                  {producto.imagenes?.[0] && <img
      src={typeof producto.imagenes[0] === "string" ? producto.imagenes[0] : producto.imagenes[0].src}
      alt={producto.nombre}
      className={[
        "h-full w-full object-cover transition-all duration-300",
        isHovered ? "scale-105 brightness-95" : "scale-100"
      ].join(" ")}
    />}

                  {
      /* Diagonal overlay con descuento */
    }
                  <div
      className="absolute inset-0 bg-linear-to-br from-champagne/85 to-champagne/70 opacity-0 transition-all duration-300 group-hover:opacity-100"
      style={{ transform: "skewY(-3deg)" }}
    />

                  {
      /* Discount badge */
    }
                  <div className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy/90 shadow-md">
                    <span className="text-center">
                      <div className="text-[10px] font-bold text-champagne">{descuento}</div>
                    </span>
                  </div>

                  {
      /* Badge "nuevo" si aplica */
    }
                  {producto.badge === "nuevo" && <div className="badge-ui badge-primary absolute left-3 top-3 uppercase tracking-[0.08em]">
                      Nuevo
                    </div>}
                </div>

                {
      /* Info */
    }
                <div className="bg-card p-4">
                  {
      /* Marca */
    }
                  {producto.marca && <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-champagne mb-1.5">
                      {producto.marca}
                    </p>}

                  {
      /* Nombre */
    }
                  <h3 className="mb-2 line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-navy">
                    {producto.nombre}
                  </h3>

                  {
      /* Precios */
    }
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-lg font-black text-navy">
                      ${producto.precio.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                    </span>
                    {producto.precio_anterior && <span className="text-xs text-muted line-through">
                        ${producto.precio_anterior.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                      </span>}
                  </div>

                  {precioAhorrado && <p className="text-[10px] font-bold text-champagne mb-3">
                      Ahorrás ${precioAhorrado}
                    </p>}

                  {
      /* CTA Button */
    }
                  <span
                    className={[
                      "btn w-full text-xs uppercase tracking-widest pointer-events-none",
                      isHovered ? "btn-primary" : "btn-secondary"
                    ].join(" ")}
                  >
                    <ShoppingBag size={13} />
                    Ver detalle
                  </span>
                </div>
              </NavLink>;
  })}
        </div>

      </div>
    </section>;
}
export {
  PromoProductsSection as default
};
