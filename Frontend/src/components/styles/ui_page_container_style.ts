export const UI_CONTAINER = {
  screen: "relative min-h-[calc(100vh-4rem)] overflow-hidden bg-surface",
  glow: "pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl",
  grid: "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(44,55,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,55,80,0.03)_1px,transparent_1px)] bg-[size:32px_32px]",
  inner: "relative z-10 mx-auto w-full px-4 py-8 sm:px-6 lg:px-8",

  widths: {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  },

  header: {
    base: "mb-6",
    left: "text-left",
    center: "text-center",
    between:
      "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
  },

  badge:
    "mb-3 inline-flex rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted shadow-sm",
  title:
    "font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl",
  accent: "text-champagne",
  subtitle:
    "mt-3 max-w-3xl text-sm font-medium leading-6 text-muted sm:text-base",
  actions: "flex flex-wrap items-center gap-2",

  layouts: {
    single: "grid grid-cols-1 gap-6",
    split:
      "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
    reverse:
      "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
    stack: "grid grid-cols-1 gap-6",
  },

  panel: {
    card: "",
    glass:
      "rounded-3xl border border-card/70 bg-card/80 p-5 shadow-xl shadow-navy/5 backdrop-blur-xl sm:p-6",
    plain: "w-full",
  },

  aside: "rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-6",
  asideTitle: "text-lg font-semibold text-ink",
  asideText: "mt-2 text-sm leading-6 text-muted",
  features: "mt-5 grid gap-3 sm:grid-cols-2",
  feature: "rounded-2xl border border-line bg-surface/60 p-4",
  featureTitle: "text-sm font-semibold text-ink",
  featureText: "mt-1 text-xs leading-5 text-muted",
} as const;

export type ContainerMaxWidth = keyof typeof UI_CONTAINER.widths;
export type ContainerLayout = keyof typeof UI_CONTAINER.layouts;
export type ContainerPanel = keyof typeof UI_CONTAINER.panel;
export type ContainerHeaderAlign = "left" | "center" | "between";
