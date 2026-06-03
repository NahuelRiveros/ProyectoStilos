import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import type { Producto } from "../../api/producto_api";

interface PromoProductsSectionProps {
  productos: Producto[];
  loading:   boolean;
  eyebrow?:  string;
  title?:    string;
  linkText?: string;
}

export default function PromoProductsSection({
  productos,
  loading,
  eyebrow  = "Oferta especial",
  title    = "Hasta 40% OFF",
  linkText = "Ver todas",
}: PromoProductsSectionProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (loading) {
    return (
      <section className="border-t border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-10 h-8 w-48 rounded bg-navy/10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-navy/10" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!productos || productos.length === 0) return null;

  return (
    <section className="border-t border-line bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne">
              {eyebrow}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {title}
            </h2>
          </div>
          <NavLink
            to="/catalogo?solo_ofertas=true"
            className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-navy underline-offset-2 transition-colors hover:underline sm:flex"
          >
            {linkText} <ArrowRight size={13} />
          </NavLink>
        </div>

        {/* Productos grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => {
            const isHovered = hoveredId === producto.id;
            const descuento = producto.descuento ||
              (producto.precio_anterior
                ? `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`
                : "Oferta");
            const precioAhorrado = producto.precio_anterior
              ? (producto.precio_anterior - producto.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })
              : null;

            return (
              <NavLink
                key={producto.id}
                to={`/producto/${producto.id}`}
                onMouseEnter={() => setHoveredId(producto.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-navy/15"
              >
                {/* Image container */}
                <div className="relative aspect-square overflow-hidden bg-navy/5">
                  {producto.imagenes?.[0] && (
                    <img
                      src={typeof producto.imagenes[0] === "string"
                        ? producto.imagenes[0]
                        : producto.imagenes[0].src}
                      alt={producto.nombre}
                      className={[
                        "h-full w-full object-cover transition-all duration-300",
                        isHovered ? "scale-105 brightness-95" : "scale-100",
                      ].join(" ")}
                    />
                  )}

                  {/* Diagonal overlay con descuento */}
                  <div className="absolute inset-0 bg-linear-to-br from-champagne/85 to-champagne/70 opacity-0 transition-all duration-300 group-hover:opacity-100"
                    style={{ transform: "skewY(-3deg)" }}
                  />

                  {/* Discount badge */}
                  <div className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy/90 shadow-md">
                    <span className="text-center">
                      <div className="text-[10px] font-bold text-champagne">{descuento}</div>
                    </span>
                  </div>

                  {/* Badge "nuevo" si aplica */}
                  {producto.badge === "nuevo" && (
                    <div className="absolute left-3 top-3 bg-navy px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                      Nuevo
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-card p-4">
                  {/* Marca */}
                  {producto.marca && (
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-champagne mb-1.5">
                      {producto.marca}
                    </p>
                  )}

                  {/* Nombre */}
                  <h3 className="mb-2 line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-navy">
                    {producto.nombre}
                  </h3>

                  {/* Precios */}
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-lg font-black text-navy">
                      ${producto.precio.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                    </span>
                    {producto.precio_anterior && (
                      <span className="text-xs text-muted line-through">
                        ${producto.precio_anterior.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>

                  {precioAhorrado && (
                    <p className="text-[10px] font-bold text-champagne mb-3">
                      Ahorrás ${precioAhorrado}
                    </p>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Placeholder para agregar al carrito
                    }}
                    className={[
                      "w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200",
                      isHovered
                        ? "bg-navy text-white shadow-md"
                        : "border border-navy text-navy hover:bg-navy/5",
                    ].join(" ")}
                  >
                    <ShoppingBag size={13} />
                    Agregar
                  </button>
                </div>
              </NavLink>
            );
          })}
        </div>

      </div>
    </section>
  );
}
