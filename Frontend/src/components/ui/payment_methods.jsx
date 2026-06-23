import { useQuery } from "@tanstack/react-query";
import { getMediosPago } from "../../api/medios_pago_api";
import { CreditCard, Smartphone, Landmark, BadgePercent, CheckCircle2 } from "lucide-react";

// ── Íconos por método ────────────────────────────────────────────────────────

const ICONOS_FALLBACK = {
  mercadopago:     Smartphone,
  tarjeta_credito: CreditCard,
  go_cuotas:       BadgePercent,
  tarjeta_debito:  CreditCard,
  transferencia:   Landmark,
  efectivo:        Landmark,
};

// Ícono estilizado de tarjeta (SVG propio para débito/crédito sin logo)
function IconoTarjeta({ size = 15, className = "" }) {
  return (
    <svg
      width={Math.round(size * 1.55)} height={size}
      viewBox="0 0 31 20" fill="none" aria-hidden="true"
      className={className}
    >
      <rect x="0.5" y="0.5" width="30" height="19" rx="2.5"
        stroke="currentColor" strokeOpacity="0.35" />
      <rect y="5" width="31" height="5"
        fill="currentColor" fillOpacity="0.18" />
      <rect x="3" y="13" width="6" height="3.5" rx="0.5"
        fill="currentColor" fillOpacity="0.5" />
      <rect x="11" y="14" width="4" height="1.5" rx="0.5"
        fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

function MetodoIcon({ metodo, size = 14 }) {
  if (metodo.logo) {
    return (
      <img src={metodo.logo} alt={metodo.nombre}
        className="object-contain shrink-0"
        style={{ width: size * 1.8, height: size }}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  if (metodo.id === "tarjeta_debito") {
    return <IconoTarjeta size={size} className="text-navy shrink-0" />;
  }
  const Icono = ICONOS_FALLBACK[metodo.id] ?? CreditCard;
  return <Icono size={size} className="text-navy shrink-0" />;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// [3,6] → "3 y 6"  |  [3,6,12] → "3, 6 y 12"
function listarCuotas(cuotas) {
  const ns = cuotas.map(c => c.cantidad);
  if (ns.length === 1) return `${ns[0]}`;
  return `${ns.slice(0, -1).join(", ")} y ${ns[ns.length - 1]}`;
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function PaymentMethods({ compact = false }) {
  const { data: config, isLoading } = useQuery({
    queryKey:       ["medios-pago"],
    queryFn:        getMediosPago,
    staleTime:      1000 * 60 * 5,
    refetchOnMount: true,
  });

  if (isLoading || !config?.habilitado) return null;

  const activos = config.metodos?.filter(m => m.habilitado) ?? [];
  if (activos.length === 0) return null;

  const logoMap = Object.fromEntries(
    (config.tarjetasConfig ?? []).map(t => [t.nombre, t.logo]).filter(([, v]) => v)
  );

  // ── Modo compacto (product detail) ────────────────────────────────────────
  if (compact) {
    const metodoTarjeta  = activos.find(m => m.id === "tarjeta_credito");
    const gruposActivos  = (metodoTarjeta?.grupos ?? []).filter(
      g => g.tarjetas?.length > 0 && g.cuotas?.length > 0
    );
    const otrosActivos   = activos.filter(m => m.id !== "tarjeta_credito");

    // Todos los grupos que tienen al menos una cuota sin interés
    const gruposSI = gruposActivos.filter(g => g.cuotas.some(c => c.sinInteres));

    // Resumen global: máximas cuotas sin interés de cualquier grupo
    const todasSI = [...new Map(
      gruposActivos.flatMap(g => g.cuotas.filter(c => c.sinInteres))
        .map(c => [c.cantidad, c])
    ).values()].sort((a, b) => a.cantidad - b.cantidad);

    return (
      <div
        className="space-y-0 overflow-hidden"
        style={{ border: "1px solid var(--color-line)" }}
      >
        {/* ── Encabezado ── */}
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--color-line)", background: "var(--color-surface)" }}
        >
          <span
            className="text-[8.5px] font-black uppercase tracking-[0.25em]"
            style={{ color: "var(--color-muted)" }}
          >
            Medios de pago
          </span>
        </div>

        {/* ── Callout principal: cuotas sin interés ── */}
        {todasSI.length > 0 && (
          <div
            className="px-4 py-3.5"
            style={{
              borderBottom: "1px solid var(--color-line)",
              borderLeft: "3px solid #059669",
              background: "color-mix(in srgb, #ecfdf5 55%, var(--color-card))",
            }}
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="shrink-0 mt-px" style={{ color: "#059669" }} />
              <div className="space-y-2 min-w-0">
                <p
                  className="text-[11px] font-black leading-tight"
                  style={{ color: "#065f46" }}
                >
                  {listarCuotas(todasSI)} cuotas sin interés
                </p>

                {/* Logos por grupo */}
                <div className="space-y-1.5">
                  {gruposSI.map((g, i) => {
                    const si = g.cuotas.filter(c => c.sinInteres).sort((a, b) => a.cantidad - b.cantidad);
                    return (
                      <div key={i} className="flex items-center gap-2 flex-wrap">
                        {/* Logos tarjetas */}
                        <div className="flex items-center gap-2">
                          {g.tarjetas.map((nombre, j) =>
                            logoMap[nombre] ? (
                              <img key={j} src={logoMap[nombre]} alt={nombre} title={nombre}
                                className="object-contain shrink-0"
                                style={{ height: 20, width: "auto", maxWidth: 42 }}
                                onError={e => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <span key={j}
                                className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 border"
                                style={{ borderColor: "#6ee7b7", color: "#065f46", background: "transparent" }}
                              >
                                {nombre}
                              </span>
                            )
                          )}
                        </div>
                        {/* Si hay más de un grupo, mostrar sus cuotas específicas */}
                        {gruposSI.length > 1 && (
                          <span className="text-[9px] font-semibold" style={{ color: "#059669" }}>
                            {listarCuotas(si)}x
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Sin grupos SI pero con tarjeta habilitada ── */}
        {todasSI.length === 0 && metodoTarjeta && gruposActivos.length > 0 && (
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-line)", background: "var(--color-card)" }}
          >
            <div className="flex items-center gap-3">
              {gruposActivos.flatMap(g => g.tarjetas).slice(0, 4).map((nombre, j) =>
                logoMap[nombre] ? (
                  <img key={j} src={logoMap[nombre]} alt={nombre}
                    className="object-contain shrink-0"
                    style={{ height: 20, width: "auto", maxWidth: 42 }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : null
              )}
              <span className="text-[10px] font-semibold" style={{ color: "var(--color-muted)" }}>
                pago en cuotas
              </span>
            </div>
          </div>
        )}

        {/* ── Fallback: sin grupos configurados ── */}
        {!metodoTarjeta && (
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-line)", background: "var(--color-card)" }}
          >
            <div className="flex items-center gap-3">
              {(config.tarjetasConfig ?? []).map((t, j) =>
                t.logo ? (
                  <img key={j} src={t.logo} alt={t.nombre}
                    className="object-contain shrink-0"
                    style={{ height: 20, width: "auto", maxWidth: 42 }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : null
              )}
            </div>
          </div>
        )}

        {/* ── Otros métodos ── */}
        {otrosActivos.length > 0 && (
          <div
            className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2"
            style={{ background: "var(--color-surface)" }}
          >
            {otrosActivos.map(m => (
              <div key={m.id} className="flex items-center gap-1.5">
                <MetodoIcon metodo={m} size={13} />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: "var(--color-ink)", opacity: 0.75 }}
                >
                  {m.nombre}
                </span>
              </div>
            ))}
          </div>
        )}

        {config.nota && (
          <div
            className="px-4 py-2"
            style={{ borderTop: "1px solid var(--color-line)", background: "var(--color-surface)" }}
          >
            <p className="text-[9px]" style={{ color: "var(--color-muted)" }}>{config.nota}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Modo completo (página de medios de pago o checkout) ───────────────────
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted">
        Medios de pago
      </p>

      <div className="space-y-3">
        {activos.map(m => {
          const grupos    = m.id === "tarjeta_credito" ? (m.grupos ?? []) : null;
          const cuotasSI  = m.cuotas?.filter(c => c.sinInteres) ?? [];
          const cuotasCI  = m.cuotas?.filter(c => !c.sinInteres && c.cantidad > 1) ?? [];

          return (
            <div key={m.id} className="flex gap-3 pb-3 border-b border-line last:border-0 last:pb-0">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-line overflow-hidden p-1">
                <MetodoIcon metodo={m} size={15} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink">{m.nombre}</p>
                {m.descripcion && (
                  <p className="text-xs text-muted mt-0.5">{m.descripcion}</p>
                )}

                {/* Tarjeta crédito: por grupo */}
                {grupos && (
                  <div className="mt-1.5 space-y-1.5">
                    {grupos.filter(g => g.tarjetas?.length > 0 && g.cuotas?.length > 0).map((g, gi) => {
                      const si = g.cuotas.filter(c => c.sinInteres).sort((a, b) => a.cantidad - b.cantidad);
                      const ci = g.cuotas.filter(c => !c.sinInteres && c.cantidad > 1).sort((a, b) => a.cantidad - b.cantidad);
                      return (
                        <div key={gi} className="flex flex-wrap items-center gap-2">
                          {g.tarjetas.map((nombre, j) =>
                            logoMap[nombre] ? (
                              <img key={j} src={logoMap[nombre]} alt={nombre} title={nombre}
                                className="object-contain shrink-0"
                                style={{ height: 16, width: "auto", maxWidth: 34 }}
                                onError={e => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <span key={j} className="text-[10px] font-bold text-muted border border-line px-1 py-px">{nombre}</span>
                            )
                          )}
                          {si.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                              <BadgePercent size={9} />
                              {listarCuotas(si)} sin interés
                            </span>
                          )}
                          {ci.length > 0 && (
                            <span className="inline-flex items-center rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-semibold text-muted">
                              {listarCuotas(ci)} cuotas
                            </span>
                          )}
                          {g.descripcion && (
                            <span className="text-[10px] text-muted italic">{g.descripcion}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Otros métodos con cuotas */}
                {!grupos && (cuotasSI.length > 0 || cuotasCI.length > 0) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {cuotasSI.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        <BadgePercent size={9} />
                        {listarCuotas(cuotasSI)} sin interés
                      </span>
                    )}
                    {cuotasCI.length > 0 && (
                      <span className="inline-flex items-center rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-semibold text-muted">
                        {listarCuotas(cuotasCI)} cuotas
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {config.nota && (
        <p className="text-[11px] text-muted border-t border-line pt-3">{config.nota}</p>
      )}
    </div>
  );
}
