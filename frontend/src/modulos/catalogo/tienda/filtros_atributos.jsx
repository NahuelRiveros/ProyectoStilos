import { cn } from "@/utils/cn.js";
import { leerIds } from "../utils/filtros_url.js";

const claseTitulo = "mb-2 text-sm font-semibold uppercase tracking-wide text-texto-suave";

/** Talles agrupados por grupo ("Ropa", "Jeans"): el "40" de jeans no es el "40" de calzado. */
function agruparTalles(talles) {
  const grupos = new Map();
  for (const t of talles) {
    if (!grupos.has(t.grupo_id)) grupos.set(t.grupo_id, { id: t.grupo_id, nombre: t.grupo, talles: [] });
    grupos.get(t.grupo_id).talles.push(t);
  }
  return [...grupos.values()];
}

/**
 * Filtros por marca, color y talle con lo que hay en lo que se está viendo. Solo aparecen las
 * secciones que tienen opciones (una distribuidora sin colores ni talles ve solo Marca).
 */
export default function FiltrosAtributos({ disponibles, elegidos, onAlternar }) {
  if (!disponibles) return null;
  const { marcas, colores, talles } = disponibles;
  if (marcas.length + colores.length + talles.length === 0) return null;
  const marcasElegidas = leerIds(elegidos.marca);
  const coloresElegidos = leerIds(elegidos.color);
  const tallesElegidos = leerIds(elegidos.talle);
  const varios = (grupos) => grupos.length > 1;

  return (
    <div className="space-y-6">
      {colores.length > 0 && (
        <section aria-label="Filtrar por color">
          <h2 className={claseTitulo}>Color</h2>
          <div className="flex flex-wrap gap-2">
            {colores.map((c) => {
              const activo = coloresElegidos.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => onAlternar("color", c.id)}
                  title={`${c.nombre} (${c.cantidad})`}
                  className={cn("rounded-full p-0.5", activo ? "ring-2 ring-primario" : "ring-1 ring-borde hover:ring-texto-suave")}
                >
                  <span className="block h-7 w-7 rounded-full border border-borde" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                  <span className="sr-only">{c.nombre}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {talles.length > 0 && (
        <section aria-label="Filtrar por talle">
          <h2 className={claseTitulo}>Talle</h2>
          <div className="space-y-3">
            {agruparTalles(talles).map((g, _i, grupos) => (
              <div key={g.id}>
                {varios(grupos) && <p className="mb-1 text-xs text-texto-suave">{g.nombre}</p>}
                <div className="flex flex-wrap gap-2">
                  {g.talles.map((t) => {
                    const activo = tallesElegidos.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={activo}
                        aria-label={varios(grupos) ? `${t.nombre} (${g.nombre})` : t.nombre}
                        onClick={() => onAlternar("talle", t.id)}
                        className={cn("min-w-10 rounded-lg border px-2.5 py-1.5 text-sm font-semibold", activo ? "border-primario bg-primario text-primario-texto" : "border-borde hover:border-texto-suave")}
                      >
                        {t.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {marcas.length > 0 && (
        <section aria-label="Filtrar por marca">
          <h2 className={claseTitulo}>Marca</h2>
          <ul className="space-y-1">
            {marcas.map((m) => (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-fondo">
                  <input type="checkbox" checked={marcasElegidas.includes(m.id)} onChange={() => onAlternar("marca", m.id)} className="h-4 w-4 accent-[var(--primario)]" />
                  <span className="flex-1">{m.nombre}</span>
                  <span className="text-xs text-texto-suave">
                    {m.cantidad}
                    <span className="sr-only"> productos</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
