import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

import { useAuth } from "../../auth/auth_context";
import { useCart } from "../../context/cart_context";
import {
  getCarrito,
  updateCarritoItem,
  removeCarritoItem,
  clearCarrito,
} from "../../api/carrito_api";

const fmt = (n) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

function getImgSrc(img) {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.src;
}

export default function CartPage() {
  const { isAuth } = useAuth();
  const local = useCart();
  const navigate = useNavigate();

  const [serverItems, setServerItems] = useState(null);
  const [loading, setLoading] = useState(false);

  const items = isAuth ? (serverItems ?? local.items) : local.items;
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const loadServer = useCallback(() => {
    if (!isAuth) return;
    setLoading(true);
    getCarrito()
      .then(setServerItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuth]);

  useEffect(() => {
    loadServer();
  }, [loadServer]);

  async function handleCantidad(item, delta) {
    const nueva = item.cantidad + delta;
    if (isAuth && item.item_id) {
      const updated = await (nueva <= 0
        ? removeCarritoItem(item.item_id)
        : updateCarritoItem(item.item_id, nueva));
      setServerItems(updated);
    } else {
      nueva <= 0 ? local.removeItem(item.key) : local.setCantidad(item.key, nueva);
    }
  }

  async function handleRemove(item) {
    if (isAuth && item.item_id) {
      const updated = await removeCarritoItem(item.item_id);
      setServerItems(updated);
    } else {
      local.removeItem(item.key);
    }
  }

  async function handleClear() {
    if (isAuth) {
      await clearCarrito();
      setServerItems([]);
    }
    local.clearCart();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-24 text-center">
        <ShoppingBag size={56} className="text-muted/30" />
        <div>
          <p className="text-xl font-black text-ink">Tu carrito está vacío</p>
          <p className="mt-1 text-sm text-muted">Explorá el catálogo y agregá tus favoritos.</p>
        </div>
        <Link
          to="/catalogo"
          className="btn btn-primary"
        >
          Ver catálogo <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-black text-ink">Tu carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── ITEMS ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="card-ui flex gap-4 p-4"
            >
              {/* imagen */}
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                {getImgSrc(item.imagen) ? (
                  <img
                    src={getImgSrc(item.imagen)}
                    alt={item.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag size={20} className="text-muted/30" />
                  </div>
                )}
              </div>

              {/* info */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {item.categoria}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                  {item.nombre}
                </p>
                {item.talle && (
                  <p className="mt-0.5 text-xs text-muted">Talle: {item.talle}</p>
                )}
                <p className="mt-1 text-sm font-bold text-ink">{fmt(item.precio)}</p>
              </div>

              {/* controles */}
              <div className="flex shrink-0 flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item)}
                  className="text-muted transition-colors hover:text-rose-500"
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCantidad(item, -1)}
                    className="icon-btn h-7 w-7 rounded-lg shadow-none"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-ink">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => handleCantidad(item, +1)}
                    className="icon-btn h-7 w-7 rounded-lg shadow-none"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <p className="text-xs font-bold text-ink">
                  {fmt(item.precio * item.cantidad)}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={handleClear}
            className="text-xs text-muted underline hover:text-rose-500"
          >
            Vaciar carrito
          </button>
        </div>

        {/* ── RESUMEN ───────────────────────────────────────────────── */}
        <div className="card-ui h-fit p-6">
          <p className="text-sm font-black uppercase tracking-widest text-muted">
            Resumen
          </p>

          <div className="mt-4 space-y-2">
            {items.map((i) => (
              <div key={i.key} className="flex justify-between text-xs text-muted">
                <span className="truncate pr-2">
                  {i.nombre} {i.talle ? `(${i.talle})` : ""} ×{i.cantidad}
                </span>
                <span className="shrink-0">{fmt(i.precio * i.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-4 flex justify-between text-sm font-bold text-ink">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>

          {isAuth ? (
            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-primary mt-6 w-full"
            >
              Ir al checkout <ArrowRight size={16} />
            </button>
          ) : (
            <div className="mt-6 space-y-2">
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Iniciar sesión para comprar
              </Link>
              <p className="text-center text-[11px] text-muted">
                ¿No tenés cuenta?{" "}
                <Link to="/register" className="underline hover:text-navy">
                  Registrate
                </Link>
              </p>
            </div>
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
