import { Check } from "lucide-react";
function ColoresSection({
  catalogo,
  selected,
  onToggle
}) {
  if (catalogo.length === 0) {
    return <p className="py-3 text-xs text-muted">
        No hay colores configurados.{" "}
        <a href="/admin/catalogos" target="_blank" className="text-navy underline underline-offset-2">
          Agregalos en Catálogos →
        </a>
      </p>;
  }
  return <div className="flex flex-wrap gap-2">
      {catalogo.map((c) => {
    const isOn = selected.some((s) => s.id === c.id);
    return <button
      key={c.id}
      type="button"
      onClick={() => onToggle(c)}
      title={c.nombre}
      className={[
        "group relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
        isOn ? "border-navy shadow-md scale-110" : "border-transparent hover:border-navy/30 hover:scale-105"
      ].join(" ")}
    >
            <div
      className="h-7 w-7 rounded-full shadow-inner"
      style={{ backgroundColor: c.hex ?? "#e5e7eb" }}
    />
            {isOn && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/20">
                <Check size={12} className="text-white drop-shadow" />
              </span>}
            <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {c.nombre}
            </span>
          </button>;
  })}
    </div>;
}
export {
  ColoresSection
};
