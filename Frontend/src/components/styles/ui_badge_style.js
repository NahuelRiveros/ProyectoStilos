const UI_BADGE = {
  base: "inline-flex items-center gap-1.5 rounded-full font-semibold",
  sizes: {
    sm: "px-2 py-px text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  },
  variants: {
    default: "border border-line bg-surface text-muted",
    primary: "bg-navy text-white",
    accent: "border border-champagne/40 bg-champagne/15 text-navy",
    success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border border-rose-200 bg-rose-50 text-rose-700",
    warning: "border border-amber-200 bg-amber-50 text-amber-700",
    info: "border border-sky-200 bg-sky-50 text-sky-700"
  },
  dot: "h-1.5 w-1.5 rounded-full bg-current",
  removable: "cursor-pointer transition hover:opacity-70"
};
export {
  UI_BADGE
};
