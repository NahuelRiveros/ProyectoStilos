import { storeConfig } from "../../../../config/app_config";

// ── Size button — sharp corners, fashion editorial ──────────────────────────

function SizeButton({ t, selected, onSelect }) {
  const sinStock = t.stock === 0;

  return (
    <button
      onClick={() => { if (!sinStock) onSelect(t); }}
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
        background: selected
          ? "var(--color-navy)"
          : sinStock
            ? "transparent"
            : "transparent",
        color: selected
          ? "var(--color-surface)"
          : sinStock
            ? "color-mix(in srgb, var(--color-muted) 35%, transparent)"
            : "var(--color-ink)",
      }}
      // Brass-gold border on hover (non-disabled only)
      onMouseEnter={(e) => {
        if (!sinStock && !selected) e.currentTarget.style.borderColor = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        if (!sinStock && !selected) e.currentTarget.style.borderColor = "var(--color-line)";
      }}
    >
      {t.talle}

      {/* Diagonal slash for unavailable sizes */}
      {sinStock && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "linear-gradient(",
              "to bottom right,",
              "transparent calc(50% - 0.5px),",
              "color-mix(in srgb, var(--color-muted) 22%, transparent) calc(50% - 0.5px),",
              "color-mix(in srgb, var(--color-muted) 22%, transparent) calc(50% + 0.5px),",
              "transparent calc(50% + 0.5px)",
              ")",
            ].join(" "),
          }}
        />
      )}
    </button>
  );
}

// ── Color swatch — premium circles with selection ring ──────────────────────

function ColorSwatch({ c }) {
  return (
    <div
      className="group/color relative flex items-center justify-center"
      title={c.nombre}
      style={{ width: "2.25rem", height: "2.25rem" }}
    >
      {/* Outer ring (hover: accent, always: transparent offset) */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-200 group-hover/color:scale-105"
        style={{
          background: "transparent",
          border: "1.5px solid transparent",
          outline: "1.5px solid transparent",
          outlineOffset: "2px",
        }}
      />

      {/* Color circle */}
      <div
        className="h-7 w-7 rounded-full shadow-sm transition-transform duration-200 group-hover/color:scale-110"
        style={{
          backgroundColor: c.hex ?? "#e5e7eb",
          border: "2px solid rgba(255,255,255,0.8)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      />

      {/* Tooltip — square, fashion */}
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
        {/* Tooltip arrow */}
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "6px solid var(--color-navy)",
            width: 0,
            height: 0,
            display: "block",
          }}
        />
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ProductVariants({ talles, colores, talle, onSelectTalle, stockProducto }) {
  const hasTalles  = talles.length > 0;
  const hasColores = colores && colores.length > 0;

  const stockTalleSeleccionado = talle?.stock ?? (hasTalles ? null : stockProducto);
  const stockBajo =
    storeConfig.enableStockVisibility &&
    stockTalleSeleccionado !== null &&
    stockTalleSeleccionado > 0 &&
    stockTalleSeleccionado <= 5;

  if (!hasTalles && !hasColores) return null;

  const labelStyle = {
    fontSize: "9px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    color: "var(--color-muted)",
  };

  return (
    <>
      {/* ── Colores ────────────────────────────────────────── */}
      {hasColores && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p style={labelStyle}>Colores disponibles</p>
            <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {colores.map((c) => (
              <ColorSwatch key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* ── Talles ─────────────────────────────────────────── */}
      {hasTalles && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p style={labelStyle}>
              Talle
              {talle && (
                <span style={{ color: "var(--color-navy)", marginLeft: "0.5rem", fontStyle: "normal" }}>
                  — {talle.talle}
                </span>
              )}
            </p>
            <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
            {!talle && (
              <p style={{ fontSize: "10px", color: "var(--color-muted)", fontStyle: "italic", whiteSpace: "nowrap" }}>
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

      {/* ── Stock bajo — brass-gold pill ───────────────────── */}
      {stockBajo && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)",
            background: "color-mix(in srgb, var(--color-accent) 7%, white)",
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          <p style={{ fontSize: "11px", fontWeight: 700, color: "color-mix(in srgb, var(--color-accent) 70%, #5a3e00)" }}>
            ¡Solo quedan {stockTalleSeleccionado} unidad{stockTalleSeleccionado !== 1 ? "es" : ""}!
          </p>
        </div>
      )}
    </>
  );
}
