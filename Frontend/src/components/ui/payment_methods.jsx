import { useQuery } from "@tanstack/react-query";
import { getMediosPago } from "../../api/medios_pago_api";
import { CreditCard, Smartphone, Banknote, BadgePercent } from "lucide-react";

const ICONOS_FALLBACK = {
  mercadopago:     Smartphone,
  tarjeta_credito: CreditCard,
  go_cuotas:       BadgePercent,
  efectivo:        Banknote,
};

// Ícono estilizado de tarjeta (débito o crédito genérica)
function IconoTarjeta({ size = 15, className = "" }) {
  const w = Math.round(size * 1.55);
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 31 20" fill="none" aria-hidden="true" className={className}>
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

function MetodoIcon({ metodo, size = 15, className = "" }) {
  if (metodo.logo) {
    return (
      <img
        src={metodo.logo}
        alt={metodo.nombre}
        className={["object-contain", className].join(" ")}
        style={{ width: size * 1.8, height: size, minWidth: size * 1.8 }}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  if (metodo.id === "tarjeta_debito") {
    return <IconoTarjeta size={size} className={["text-navy shrink-0", className].join(" ")} />;
  }
  const Icono = ICONOS_FALLBACK[metodo.id] ?? CreditCard;
  return <Icono size={size} className={["text-navy shrink-0", className].join(" ")} />;
}

// [3,6] → "3 y 6"  |  [3,6,12] → "3, 6 y 12"  |  [3] → "3"
function listarCuotas(cuotas) {
  const ns = cuotas.map(c => c.cantidad);
  if (ns.length === 1) return `${ns[0]}`;
  return `${ns.slice(0, -1).join(", ")} y ${ns[ns.length - 1]}`;
}

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

  // ── Modo compacto (product detail) ──────────────────────────────────────────
  if (compact) {
    const metodoTarjeta = activos.find(m => m.id === "tarjeta_credito");
    const grupos = (metodoTarjeta?.grupos ?? []).filter(
      g => g.tarjetas?.length > 0 && g.cuotas?.length > 0
    );
    const otrosActivos = activos.filter(m => m.id !== "tarjeta_credito");

    return (
      <div className="space-y-2.5">
        <p className="text-[9px] font-black uppercase tracking-[0.22em]"
          style={{ color: "var(--color-muted)" }}>
          Medios de pago
        </p>

        {/* ── Tarjeta de crédito ── */}
        {metodoTarjeta && (
          <div
            className="overflow-hidden"
            style={{
              border: "1px solid var(--color-line)",
              background: "var(--color-card)",
            }}
          >
            {grupos.length > 0 ? grupos.map((g, i) => {
              const si = g.cuotas.filter(c => c.sinInteres).sort((a, b) => a.cantidad - b.cantidad);
              const ci = g.cuotas.filter(c => !c.sinInteres && c.cantidad > 1).sort((a, b) => a.cantidad - b.cantidad);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                  style={i > 0 ? { borderTop: "1px solid var(--color-line)" } : {}}
                >
                  {/* Logos */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {g.tarjetas.map((nombre, j) =>
                      logoMap[nombre] ? (
                        <img key={j} src={logoMap[nombre]} alt={nombre} title={nombre}
                          className="object-contain shrink-0"
                          style={{ height: 22, width: "auto", maxWidth: 48 }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span key={j}
                          className="text-[9px] font-black uppercase tracking-wide border px-1.5 py-px"
                          style={{ color: "var(--color-muted)", borderColor: "var(--color-line)" }}>
                          {nombre}
                        </span>
                      )
                    )}
                  </div>

                  {/* Cuotas sin interés */}
                  <div className="flex flex-wrap items-center gap-1 justify-end">
                    {si.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: "#059669" }}>
                        <BadgePercent size={10} className="shrink-0" />
                        {listarCuotas(si)} sin interés
                      </span>
                    )}
                    {ci.length > 0 && si.length === 0 && (
                      <span className="text-[10px] font-semibold"
                        style={{ color: "var(--color-muted)" }}>
                        {listarCuotas(ci)} cuotas
                      </span>
                    )}
                  </div>
                </div>
              );
            }) : (
              /* Fallback sin grupos configurados */
              <div className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  {(config.tarjetasConfig ?? []).map((t, j) =>
                    t.logo ? (
                      <img key={j} src={t.logo} alt={t.nombre} title={t.nombre}
                        className="object-contain shrink-0"
                        style={{ height: 22, width: "auto", maxWidth: 48 }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : null
                  )}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: "var(--color-muted)" }}>
                  pago en cuotas
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Otros métodos ── */}
        {otrosActivos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {otrosActivos.map(m => (
              <div
                key={m.id}
                title={m.descripcion || m.nombre}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold"
                style={{
                  border: "1px solid var(--color-line)",
                  background: "var(--color-card)",
                  color: "var(--color-ink)",
                }}
              >
                <MetodoIcon metodo={m} size={13} />
                {m.nombre}
              </div>
            ))}
          </div>
        )}

        {config.nota && (
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{config.nota}</p>
        )}
      </div>
    );
  }

  // ── Modo completo ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted">
        Medios de pago
      </p>

      <div className="space-y-3">
        {activos.map(m => {
          const grupos = m.id === "tarjeta_credito" ? (m.grupos ?? []) : null;
          const cuotasSI = m.cuotas?.filter(c => c.sinInteres) ?? [];
          const cuotasCI = m.cuotas?.filter(c => !c.sinInteres && c.cantidad > 1) ?? [];

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
