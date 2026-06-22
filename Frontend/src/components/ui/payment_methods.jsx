import { useQuery } from "@tanstack/react-query";
import { getMediosPago } from "../../api/medios_pago_api";
import { CreditCard, Smartphone, Banknote, WalletCards, BadgePercent } from "lucide-react";

const ICONOS_FALLBACK = {
  mercadopago:     Smartphone,
  tarjeta_credito: CreditCard,
  go_cuotas:       BadgePercent,
  tarjeta_debito:  WalletCards,
  efectivo:        Banknote,
};

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
  const Icono = ICONOS_FALLBACK[metodo.id] ?? CreditCard;
  return <Icono size={size} className={["text-navy shrink-0", className].join(" ")} />;
}

function TarjetaChip({ nombre, logo }) {
  if (logo) {
    return (
      <span className="inline-flex items-center gap-1" title={nombre}>
        <img
          src={logo}
          alt={nombre}
          className="h-3.5 w-auto object-contain"
          onError={e => { e.target.style.display = "none"; e.target.nextSibling && (e.target.nextSibling.style.display = "inline"); }}
        />
        <span className="sr-only">{nombre}</span>
      </span>
    );
  }
  return <span>{nombre}</span>;
}

export default function PaymentMethods({ compact = false }) {
  const { data: config, isLoading } = useQuery({
    queryKey: ["medios-pago"],
    queryFn:  getMediosPago,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading || !config?.habilitado) return null;

  const activos = config.metodos?.filter(m => m.habilitado) ?? [];
  if (activos.length === 0) return null;

  // Lookup rápido: nombre de tarjeta → logo
  const logoMap = Object.fromEntries(
    (config.tarjetasConfig ?? []).map(t => [t.nombre, t.logo]).filter(([, v]) => v)
  );

  // ── Modo compacto ─────────────────────────────────────────────────────────
  if (compact) {
    const mejorCuota = activos
      .flatMap(m => m.cuotas?.filter(c => c.sinInteres) ?? [])
      .sort((a, b) => b.cantidad - a.cantidad)[0];

    return (
      <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted">
          Medios de pago
        </p>

        {mejorCuota && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
            <BadgePercent size={14} className="text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-700">
              Hasta {mejorCuota.cantidad} cuotas sin interés
              {mejorCuota.tarjetas?.length > 0 && (
                <span className="font-normal"> · {mejorCuota.tarjetas.join(", ")}</span>
              )}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {activos.map(m => (
            <div
              key={m.id}
              title={m.descripcion || m.nombre}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-semibold text-ink"
            >
              <MetodoIcon metodo={m} size={13} />
              {m.nombre}
            </div>
          ))}
        </div>

        {config.nota && (
          <p className="text-[11px] text-muted">{config.nota}</p>
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
          const cuotasSinInteres = m.cuotas?.filter(c => c.sinInteres) ?? [];
          const cuotasConInteres = m.cuotas?.filter(c => !c.sinInteres && c.cantidad > 1) ?? [];

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

                {cuotasSinInteres.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {cuotasSinInteres.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
                      >
                        {c.cantidad}x sin interés
                        {c.tarjetas?.length > 0 && (
                          <span className="flex items-center gap-1 font-normal opacity-80">
                            ·
                            {c.tarjetas.map((nombre, j) => (
                              <TarjetaChip key={j} nombre={nombre} logo={logoMap[nombre]} />
                            ))}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {cuotasConInteres.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {cuotasConInteres.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-surface border border-line px-2 py-0.5 text-[11px] text-muted"
                      >
                        hasta {c.cantidad}x
                        {c.tarjetas?.length > 0 && (
                          <span className="flex items-center gap-1">
                            ·
                            {c.tarjetas.map((nombre, j) => (
                              <TarjetaChip key={j} nombre={nombre} logo={logoMap[nombre]} />
                            ))}
                          </span>
                        )}
                      </span>
                    ))}
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
