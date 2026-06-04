export const ORDEN_ESTADO_COLORS = {
  pendiente:      "bg-amber-100 text-amber-700",
  pagado:         "bg-blue-100 text-blue-700",
  en_preparacion: "bg-indigo-100 text-indigo-700",
  enviado:        "bg-sky-100 text-sky-700",
  entregado:      "bg-emerald-100 text-emerald-700",
  cancelado:      "bg-line text-muted",
};

export function StatusBadge({
  status,
  label,
  colorsMap = ORDEN_ESTADO_COLORS,
}) {
  const cls = colorsMap[status] ?? "bg-surface text-muted";
  return (
    <span className={["rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", cls].join(" ")}>
      {label ?? status}
    </span>
  );
}
