import { Check } from "lucide-react";
import { storeConfig } from "../../../../config/app_config";

const LABEL_STYLE = {
  fontSize: "9px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  color: "var(--color-muted)",
};

// ── Color swatch — clickable con ring de selección ──────────────────────────

function ColorSwatch({ c, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(selected ? null : c)}
      title={c.nombre}
      className="group/color relative flex items-center justify-center shrink-0 focus:outline-none"
      style={{ width: "2.25rem", height: "2.25rem" }}
    >
      {/* Ring de selección */}
      <span
        className={[
          "absolute inset-0 rounded-full transition-all duration-150",
          selected
            ? "ring-2 ring-navy ring-offset-[3px] ring-offset-surface"
            : "ring-0 group-hover/color:ring-[1.5px] group-hover/color:ring-navy/30 group-hover/color:ring-offset-2 group-hover/color:ring-offset-surface",
        ].join(" ")}
      />

      {/* Círculo de color */}
      <span
        className={[
          "relative flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-transform duration-150",
          selected ? "scale-90" : "group-hover/color:scale-105",
        ].join(" ")}
        style={{
          backgroundColor: c.hex ?? "#e5e7eb",
          border: "2px solid rgba(255,255,255,0.85)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.13)",
        }}
      >
        {selected && (
          <Check
            size={11}
            strokeWidth={3}
            style={{
              color: isLight(c.hex) ? "#283149" : "#fff",
              filter: "drop-shadow(0 0 1px rgba(0,0,0,0.2))",
            }}
          />
        )}
      </span>

      {/* Tooltip */}
      <span
        className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/color:opacity-100"
        style={{
          background: "var(--color-navy)",
          color: "var(--color-surface)",
          fontSize: "8px",
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          padding: "3px 7px",
        }}
      >
        {c.nombre}
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "6px solid var(--color-navy)",
            width: 0, height: 0, display: "block",
          }}
        />
      </span>
    </button>
  );
}

// Detecta si un color hex es claro para elegir ícono negro o blanco
function isLight(hex) {
  if (!hex) return true;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// ── Size button — bordes angulares, editorial ────────────────────────────────

function SizeButton({ t, selected, onSelect }) {
  const sinStock = t.stock === 0;
  return (
    <button
      onClick={() => { if (!sinStock) onSelect(selected ? null : t); }}
      disabled={sinStock}
      title={sinStock ? "Sin stock" : `Talle ${t.talle}`}
      className="relative overflow-hidden"
      style={{
        minWidth: "2.875rem",
        height: "2.75rem",
        padding: "0 0.625rem",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        borderRadius: 0,
        cursor: sinStock ? "not-allowed" : "pointer",
        transition: "border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease",
        border: selected
          ? "1.5px solid var(--color-navy)"
          : sinStock
            ? "1px solid color-mix(in srgb, var(--color-line) 55%, transparent)"
            : "1px solid var(--color-line)",
        background: selected ? "var(--color-navy)" : "transparent",
        color: selected
          ? "var(--color-surface)"
          : sinStock
            ? "color-mix(in srgb, var(--color-muted) 35%, transparent)"
            : "var(--color-ink)",
      }}
      onMouseEnter={(e) => { if (!sinStock && !selected) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
      onMouseLeave={(e) => { if (!sinStock && !selected) e.currentTarget.style.borderColor = "var(--color-line)"; }}
    >
      {t.talle}
      {sinStock && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
          background: "linear-gradient(to bottom right, transparent calc(50% - 0.5px), color-mix(in srgb, var(--color-muted) 22%, transparent) calc(50% - 0.5px), color-mix(in srgb, var(--color-muted) 22%, transparent) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
        }} />
      )}
    </button>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ProductVariants({
  talles,
  colores,
  talle,
  onSelectTalle,
  colorSeleccionado,
  onSelectColor,
  stockProducto,
}) {
  const hasTalles  = talles.length > 0;
  const hasColores = colores && colores.length > 0;

  const stockTalleSeleccionado = talle?.stock ?? (hasTalles ? null : stockProducto);
  const stockBajo =
    storeConfig.enableStockVisibility &&
    stockTalleSeleccionado !== null &&
    stockTalleSeleccionado > 0 &&
    stockTalleSeleccionado <= 5;

  if (!hasTalles && !hasColores) return null;

  return (
    <div className="space-y-4">

      {/* ── Colores ───────────────────────────────────────────── */}
      {hasColores && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <p style={LABEL_STYLE}>Color</p>
            {colorSeleccionado ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: colorSeleccionado.hex ?? "#e5e7eb" }}
                />
                <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-navy)" }}>
                  {colorSeleccionado.nombre}
                </span>
              </span>
            ) : (
              <span style={{ fontSize: "9px", fontWeight: 500, color: "var(--color-muted)", fontStyle: "italic" }}>
                Seleccioná uno
              </span>
            )}
            <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
          </div>
          <div className="flex flex-wrap gap-2 pl-px">
            {colores.map((c) => (
              <ColorSwatch
                key={c.id}
                c={c}
                selected={colorSeleccionado?.id === c.id}
                onSelect={onSelectColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Talles ─────────────────────────────────────────────── */}
      {hasTalles && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <p style={LABEL_STYLE}>
              Talle
              {talle && (
                <span style={{ color: "var(--color-navy)", marginLeft: "0.5rem" }}>— {talle.talle}</span>
              )}
            </p>
            <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
            {!talle && (
              <p style={{ fontSize: "9px", color: "var(--color-muted)", fontStyle: "italic", whiteSpace: "nowrap" }}>
                Seleccioná uno
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {talles.map((t) => (
              <SizeButton
                key={t.talle}
                t={t}
                selected={talle?.talle === t.talle}
                onSelect={onSelectTalle}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Stock bajo ─────────────────────────────────────────── */}
      {stockBajo && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)",
            background: "color-mix(in srgb, var(--color-accent) 7%, white)",
          }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full animate-pulse" style={{ background: "var(--color-accent)" }} />
          <p style={{ fontSize: "11px", fontWeight: 700, color: "color-mix(in srgb, var(--color-accent) 70%, #5a3e00)" }}>
            ¡Solo quedan {stockTalleSeleccionado} unidad{stockTalleSeleccionado !== 1 ? "es" : ""}!
          </p>
        </div>
      )}
    </div>
  );
}
