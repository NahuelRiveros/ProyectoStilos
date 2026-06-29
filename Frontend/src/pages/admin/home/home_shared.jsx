import { Eye, EyeOff } from "lucide-react";

export function SectionToggle({ activo, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!activo)}
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all",
        activo
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-line text-muted hover:bg-line/70",
      ].join(" ")}
    >
      {activo ? <Eye size={11} /> : <EyeOff size={11} />}
      {label ?? (activo ? "Visible" : "Oculto")}
    </button>
  );
}
