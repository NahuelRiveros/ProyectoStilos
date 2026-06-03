export const UI_CARD = {
  base: "rounded-2xl border border-line bg-card",

  variants: {
    default: "shadow-sm",
    elevated: "shadow-md shadow-navy/5",
    flat: "shadow-none",
    outline: "border-2 border-navy/10 shadow-none",
  },

  header: "border-b border-line px-5 py-4",
  headerRow: "flex items-center justify-between",
  headerTitle: "font-semibold text-ink",
  headerSubtitle: "mt-0.5 text-xs text-muted",
  headerActions: "flex items-center gap-2",

  body: "px-5 py-5",

  footer: "border-t border-line bg-surface/50 px-5 py-4",
  footerRow: "flex items-center justify-between",

  divider: "my-4 border-t border-line",

  // Stat card — para métricas de dashboard
  stat: "rounded-2xl border border-line bg-card p-5 shadow-sm",
  statLabel: "text-xs font-semibold uppercase tracking-widest text-muted",
  statValue: "mt-2 text-2xl font-bold tracking-tight text-ink",
  statDelta: "mt-1 flex items-center gap-1 text-xs font-medium",
  statDeltaUp: "text-emerald-600",
  statDeltaDown: "text-rose-600",
  statIcon:
    "flex h-10 w-10 items-center justify-center rounded-xl bg-navy/8 text-navy",
} as const;

export type CardVariant = keyof typeof UI_CARD.variants;
