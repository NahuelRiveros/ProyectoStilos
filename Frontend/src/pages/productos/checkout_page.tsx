import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Truck, FileText, ShoppingBag } from "lucide-react";

import { useAuth } from "../../auth/auth_context";
import { useCart } from "../../context/cart_context";
import { getCarrito, type CarritoItem } from "../../api/carrito_api";
import { getOpcionesEnvio, type OpcionEnvio } from "../../api/catalogo_api";
import { getCondicionesIva, type CondicionIva } from "../../api/catalogo_api";
import { crearOrden, type CrearOrdenPayload } from "../../api/orden_api";

const fmt = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

interface CheckoutForm {
  calle:          string;
  numero:         string;
  piso?:          string;
  depto?:         string;
  localidad:      string;
  provincia:      string;
  codigo_postal:  string;
  envio_opcion_id: string;
  factura:        boolean;
  condicion_iva?: string;
  cuit?:          string;
  razon_social?:  string;
  notas?:         string;
}

export default function CheckoutPage() {
  const { isAuth } = useAuth();
  const local = useCart();
  const navigate = useNavigate();

  const [cartItems, setCartItems]   = useState<CarritoItem[]>([]);
  const [opciones,  setOpciones]    = useState<OpcionEnvio[]>([]);
  const [condiciones, setCondiciones] = useState<CondicionIva[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: { factura: false },
  });

  const factura         = watch("factura");
  const envioOpcionId   = watch("envio_opcion_id");
  const opcionSeleccion = opciones.find((o) => String(o.id) === envioOpcionId);

  const subtotal    = cartItems.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const costoEnvio  = opcionSeleccion
    ? opcionSeleccion.gratis_desde != null && subtotal >= opcionSeleccion.gratis_desde
      ? 0
      : opcionSeleccion.precio
    : 0;
  const total = subtotal + costoEnvio;

  useEffect(() => {
    if (!isAuth) return;
    Promise.all([getCarrito(), getOpcionesEnvio(), getCondicionesIva()])
      .then(([cart, env, cond]) => {
        setCartItems(cart);
        setOpciones(env);
        setCondiciones(cond);
      })
      .catch(() => setError("No se pudo cargar el checkout"))
      .finally(() => setLoading(false));
  }, [isAuth]);

  if (!isAuth) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ShoppingBag size={48} className="text-muted/30" />
        <p className="text-lg font-bold text-ink">Tu carrito está vacío</p>
        <button onClick={() => navigate("/carrito")} className="text-sm underline text-navy">
          Volver al carrito
        </button>
      </div>
    );
  }

  async function onSubmit(data: CheckoutForm) {
    setSubmitting(true);
    setError(null);
    try {
      const payload: CrearOrdenPayload = {
        envio_opcion_id: parseInt(data.envio_opcion_id),
        codigo_postal:   data.codigo_postal,
        direccion: {
          calle:     data.calle,
          numero:    data.numero,
          piso:      data.piso || undefined,
          depto:     data.depto || undefined,
          localidad: data.localidad,
          provincia: data.provincia,
        },
        facturacion: data.factura && data.condicion_iva
          ? {
              condicion_iva: data.condicion_iva as "RI" | "CF" | "MT" | "EX" | "SS",
              cuit:          data.cuit || undefined,
              razon_social:  data.razon_social || undefined,
            }
          : undefined,
        notas: data.notas || undefined,
      };

      const result = await crearOrden(payload);
      local.clearCart();

      if (result.mp_init_point) {
        window.location.href = result.mp_init_point;
      } else {
        navigate(`/mis-ordenes/${result.orden_id}`, { replace: true });
      }
    } catch {
      setError("No se pudo procesar la orden. Intentá nuevamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-black text-ink">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        {/* ── FORMULARIO ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dirección */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted">
              <Truck size={16} /> Dirección de entrega
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-form">Calle</label>
                <input {...register("calle", { required: "Requerido" })}
                  className="input-form" placeholder="Ej: San Martín" />
                {errors.calle && <p className="error-form">{errors.calle.message}</p>}
              </div>

              <div>
                <label className="label-form">Número</label>
                <input {...register("numero", { required: "Requerido" })}
                  className="input-form" placeholder="123" />
                {errors.numero && <p className="error-form">{errors.numero.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label-form">Piso</label>
                  <input {...register("piso")} className="input-form" placeholder="2" />
                </div>
                <div>
                  <label className="label-form">Depto</label>
                  <input {...register("depto")} className="input-form" placeholder="B" />
                </div>
              </div>

              <div>
                <label className="label-form">Localidad</label>
                <input {...register("localidad", { required: "Requerido" })}
                  className="input-form" placeholder="Córdoba" />
                {errors.localidad && <p className="error-form">{errors.localidad.message}</p>}
              </div>

              <div>
                <label className="label-form">Provincia</label>
                <input {...register("provincia", { required: "Requerido" })}
                  className="input-form" placeholder="Córdoba" />
                {errors.provincia && <p className="error-form">{errors.provincia.message}</p>}
              </div>

              <div>
                <label className="label-form">Código postal</label>
                <input {...register("codigo_postal", { required: "Requerido" })}
                  className="input-form" placeholder="5000" />
                {errors.codigo_postal && <p className="error-form">{errors.codigo_postal.message}</p>}
              </div>
            </div>
          </section>

          {/* Envío */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted">
              <Truck size={16} /> Método de envío
            </h2>

            {opciones.length === 0 ? (
              <p className="text-sm text-muted">No hay opciones de envío disponibles.</p>
            ) : (
              <div className="space-y-3">
                {opciones.map((op) => {
                  const gratis = op.gratis_desde != null && subtotal >= op.gratis_desde;
                  const costo  = gratis ? 0 : op.precio;
                  return (
                    <label
                      key={op.id}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                        envioOpcionId === String(op.id)
                          ? "border-navy bg-navy/5"
                          : "border-line hover:border-navy/40",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        value={String(op.id)}
                        {...register("envio_opcion_id", { required: "Elegí una opción de envío" })}
                        className="mt-0.5 accent-navy"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink">{op.nombre}</p>
                        <p className="text-xs text-muted">{op.descripcion} · {op.tiempo_estimado}</p>
                        {op.gratis_desde != null && (
                          <p className="text-xs text-emerald-600">
                            Gratis a partir de {fmt(op.gratis_desde)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-ink">
                        {costo === 0 ? "Gratis" : fmt(costo)}
                      </p>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.envio_opcion_id && (
              <p className="mt-2 error-form">{errors.envio_opcion_id.message}</p>
            )}
          </section>

          {/* Facturación (opcional) */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" {...register("factura")} className="accent-navy" />
              <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted">
                <FileText size={16} /> Necesito factura
              </span>
            </label>

            {factura && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-form">Condición IVA</label>
                  <select {...register("condicion_iva")} className="input-form">
                    <option value="">Seleccioná...</option>
                    {condiciones.map((c) => (
                      <option key={c.id} value={c.codigo}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-form">CUIT</label>
                  <input {...register("cuit")} className="input-form" placeholder="20-12345678-9" />
                </div>
                <div>
                  <label className="label-form">Razón social</label>
                  <input {...register("razon_social")} className="input-form" />
                </div>
              </div>
            )}
          </section>

          {/* Notas */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <label className="label-form">Notas para el pedido (opcional)</label>
            <textarea {...register("notas")} rows={3}
              className="input-form resize-none" placeholder="Instrucciones de entrega..." />
          </section>
        </div>

        {/* ── RESUMEN ───────────────────────────────────────────────── */}
        <div className="h-fit rounded-2xl bg-card p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-muted">Resumen</p>

          <div className="mt-4 space-y-2">
            {cartItems.map((i) => (
              <div key={i.key} className="flex justify-between text-xs text-muted">
                <span className="truncate pr-2">
                  {i.nombre} {i.talle ? `(${i.talle})` : ""} ×{i.cantidad}
                </span>
                <span className="shrink-0">{fmt(i.precio * i.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between text-xs text-muted">
            <span>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>Envío</span>
            <span>{opcionSeleccion ? (costoEnvio === 0 ? "Gratis" : fmt(costoEnvio)) : "—"}</span>
          </div>

          <div className="mt-3 border-t border-line pt-3 flex justify-between font-bold text-ink">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-bold text-white transition hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Confirmar y pagar"
            )}
          </button>

          <p className="mt-3 text-center text-[10px] text-muted">
            Serás redirigido a MercadoPago para completar el pago.
          </p>
        </div>
      </form>
    </div>
  );
}
