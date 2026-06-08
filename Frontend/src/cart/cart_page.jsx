import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, Info, X } from "lucide-react";

import { useCart } from "./cart_context";
import { cartConfig } from "../config/app_config";
import { tieneAlertasCriticas } from "./validations/cart_staleness";

const fmt = (n) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

function getImgSrc(img) {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.src;
}

function AlertaBanner({ tipo, children, onClose }) {
  const estilos = {
    critico:   "bg-rose-50 border-rose-200 text-rose-800",
    advertencia: "bg-amber-50 border-amber-200 text-amber-800",
    info:      "bg-blue-50 border-blue-200 text-blue-800",
  };
  const iconos = {
    critico:     <AlertTriangle size={15} className="shrink-0 text-rose-500" />,
    advertencia: <AlertTriangle size={15} className="shrink-0 text-amber-500" />,
    info:        <Info size={15} className="shrink-0 text-blue-500" />,
  };
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${estilos[tipo]}`}>
      {iconos[tipo]}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, total, loading, alertas, removeItem, setCantidad, clearCart, limpiarAlertas } = useCart();
  const navigate = useNavigate();

  const hayAlertasCriticas = tieneAlertasCriticas(alertas);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0 && alertas.removidos.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-24 text-center">
        <ShoppingBag size={56} className="text-muted/30" />
        <div>
          <p className="text-xl font-black text-ink">Tu carrito está vacío</p>
          <p className="mt-1 text-sm text-muted">Explorá el catálogo y agregá tus favoritos.</p>
        </div>
        <Link to="/catalogo" className="btn btn-primary">
          Ver catálogo <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-black text-ink">Tu carrito</h1>

      {/* ── ALERTAS ── */}
      {(alertas.removidos.length > 0 || alertas.variantesInvalidas.length > 0 ||
        alertas.preciosActualizados.length > 0 || alertas.stockInsuficiente.length > 0) && (
        <div className="mb-6 space-y-2">

          {alertas.removidos.length > 0 && (
            <AlertaBanner tipo="critico">
              <strong>Productos no disponibles eliminados del carrito:</strong>{" "}
              {alertas.removidos.map((r) => r.nombre).join(", ")}.
            </AlertaBanner>
          )}

          {alertas.variantesInvalidas.length > 0 && (
            <AlertaBanner tipo="critico">
              <strong>Combinación no disponible:</strong>{" "}
              {alertas.variantesInvalidas.map((v) =>
                `${v.nombre}${v.talle ? ` (Talle ${v.talle})` : ""}${v.color ? ` / ${v.color}` : ""}`
              ).join(", ")}.{" "}
              Eliminá estos items para continuar.
            </AlertaBanner>
          )}

          {alertas.preciosActualizados.length > 0 && (
            <AlertaBanner tipo="advertencia" onClose={limpiarAlertas}>
              <strong>El precio de algunos productos fue actualizado:</strong>{" "}
              {alertas.preciosActualizados.map((p) =>
                `${p.nombre} (${fmt(p.precioAnterior)} → ${fmt(p.precioActual)})`
              ).join(", ")}.
            </AlertaBanner>
          )}

          {alertas.stockInsuficiente.length > 0 && (
            <AlertaBanner tipo="advertencia">
              <strong>Stock insuficiente:</strong>{" "}
              {alertas.stockInsuficiente.map((s) =>
                `${s.nombre}: tenés ${s.cantidadEnCarrito} pero solo hay ${s.stockDisponible}`
              ).join(", ")}.{" "}
              Ajustá la cantidad para continuar.
            </AlertaBanner>
          )}

        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── ITEMS ── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const tieneVarianteInvalida = alertas.variantesInvalidas.some((v) => v.item_id === item.item_id);
            const tieneStockInsuf       = alertas.stockInsuficiente.find((s) => s.item_id === item.item_id);
            const maxCantidad           = item.stock_disponible ?? 99;

            return (
              <div
                key={item.item_id ?? item.key}
                className={[
                  "card-ui flex gap-4 p-4",
                  tieneVarianteInvalida ? "border-rose-200 bg-rose-50/40" : "",
                ].join(" ")}
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                  {getImgSrc(item.imagen) ? (
                    <img src={getImgSrc(item.imagen)} alt={item.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag size={20} className="text-muted/30" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{item.categoria}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink">{item.nombre}</p>
                  {item.talle && <p className="mt-0.5 text-xs text-muted">Talle: {item.talle}</p>}
                  <p className="mt-1 text-sm font-bold text-ink">{fmt(item.precio)}</p>
                  {tieneVarianteInvalida && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">Esta variante ya no está disponible</p>
                  )}
                  {tieneStockInsuf && (
                    <p className="mt-1 text-xs font-semibold text-amber-600">
                      Stock disponible: {tieneStockInsuf.stockDisponible}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.item_id)}
                    className="text-muted transition-colors hover:text-rose-500"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCantidad(item.item_id, item.cantidad - 1)}
                      className="icon-btn h-7 w-7 rounded-lg shadow-none"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-ink">{item.cantidad}</span>
                    <button
                      onClick={() => setCantidad(item.item_id, item.cantidad + 1)}
                      disabled={item.cantidad >= maxCantidad}
                      className="icon-btn h-7 w-7 rounded-lg shadow-none disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-ink">{fmt(item.precio * item.cantidad)}</p>
                </div>
              </div>
            );
          })}

          <button onClick={clearCart} className="text-xs text-muted underline hover:text-rose-500">
            Vaciar carrito
          </button>
        </div>

        {/* ── RESUMEN ── */}
        <div className="card-ui h-fit p-6">
          <p className="text-sm font-black uppercase tracking-widest text-muted">Resumen</p>

          <div className="mt-4 space-y-2">
            {items.map((i) => (
              <div key={i.item_id ?? i.key} className="flex justify-between text-xs text-muted">
                <span className="truncate pr-2">
                  {i.nombre} {i.talle ? `(${i.talle})` : ""} ×{i.cantidad}
                </span>
                <span className="shrink-0">{fmt(i.precio * i.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-4 flex justify-between text-sm font-bold text-ink">
            <span>Total estimado</span>
            <span>{fmt(total)}</span>
          </div>

          <p className="mt-1 text-[10px] text-muted text-right">El envío se calcula al finalizar</p>

          {cartConfig.enableCheckout ? (
            hayAlertasCriticas ? (
              <div className="mt-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700 text-center">
                Resolvé los problemas indicados para continuar al pago.
              </div>
            ) : (
              <button onClick={() => navigate("/checkout")} className="btn btn-primary mt-6 w-full">
                Ir al checkout <ArrowRight size={16} />
              </button>
            )
          ) : (
            <p className="mt-6 text-center text-xs text-muted">
              La compra online no está disponible aún. Consultá por WhatsApp.
            </p>
          )}

          <Link
            to="/catalogo"
            className="mt-3 flex w-full items-center justify-center text-xs text-muted underline hover:text-navy"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
