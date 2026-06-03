export const UI_CONTAINER = {
  screen: "relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50",
  glow:   "pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl",
  grid:   "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px]",
  inner:  "relative z-10 mx-auto w-full px-4 py-8 sm:px-6 lg:px-8",

  widths: {
    sm:   "max-w-2xl",
    md:   "max-w-4xl",
    lg:   "max-w-6xl",
    xl:   "max-w-7xl",
    full: "max-w-none",
  },

  header: {
    base:    "mb-6",
    left:    "text-left",
    center:  "text-center",
    between: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
  },

  badge:
    "mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500 shadow-sm",
  title:
    "text-3xl font-black tracking-tight text-slate-950 sm:text-4xl",
  accent:
    "block bg-gradient-to-r from-red-600 to-blue-200 bg-clip-text text-transparent",
  subtitle:
    "mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base",
  actions: "flex flex-wrap items-center gap-2",

  layouts: {
    single:  "grid grid-cols-1 gap-6",
    split:   "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
    reverse: "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
    stack:   "grid grid-cols-1 gap-6",
  },

  panel: {
    card:  "",
    glass: "rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-6",
    plain: "w-full",
  },

  aside:        "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
  asideTitle:   "text-lg font-black text-slate-900",
  asideText:    "mt-2 text-sm leading-6 text-slate-600",
  features:     "mt-5 grid gap-3 sm:grid-cols-2",
  feature:      "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  featureTitle: "text-sm font-black text-slate-900",
  featureText:  "mt-1 text-xs leading-5 text-slate-500",
};
