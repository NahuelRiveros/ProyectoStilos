export const UI_DASHBOARD = {
  // ── Layout ────────────────────────────────────────────────────
  page: "min-h-screen bg-surface",
  layout: "flex h-screen overflow-hidden",
  main: "flex flex-1 flex-col overflow-hidden",
  scroll: "flex-1 overflow-y-auto",
  content:
    "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",

  // ── Page header ───────────────────────────────────────────────
  pageHeader: "mb-8",
  pageTitle: "font-display text-2xl font-bold text-ink sm:text-3xl",
  pageSubtitle: "mt-1 text-sm text-muted",
  pageTitleRow: "flex items-end justify-between",

  // ── Grids ─────────────────────────────────────────────────────
  statsGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
  contentGrid: "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3",
  contentMain: "space-y-6 lg:col-span-2",
  contentSide: "space-y-6 lg:col-span-1",
  twoCol: "grid grid-cols-1 gap-6 lg:grid-cols-2",

  // ── Section ───────────────────────────────────────────────────
  section: "mb-6",
  sectionHeader: "mb-4 flex items-center justify-between",
  sectionTitle: "font-semibold text-ink",
  sectionAction:
    "text-xs font-medium text-navy underline-offset-2 transition hover:text-navy-dark hover:underline",

  // ── Empty state ───────────────────────────────────────────────
  empty:
    "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card py-16 text-center",
  emptyIcon:
    "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-muted",
  emptyTitle: "font-semibold text-ink",
  emptyText: "mt-1 text-sm text-muted",

  // ── Misc ──────────────────────────────────────────────────────
  divider: "my-6 border-t border-line",
} as const;
