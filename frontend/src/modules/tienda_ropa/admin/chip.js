import { cn } from "../../../core/utils/cn.js";

/** Botón redondeado para elegir (categoría, color, característica) en el panel. */
export const chip = (activo) => cn(
  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
  activo ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
);
