export const ORDEN_ESTADO_COLORS = {
  pendiente:      "bg-status-pending-surface text-status-pending-text",
  pagado:         "bg-status-paid-surface    text-status-paid-text",
  en_preparacion: "bg-status-prep-surface    text-status-prep-text",
  enviado:        "bg-status-shipped-surface text-status-shipped-text",
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
