const UI_NAVBAR = {
  // ── Top bar ───────────────────────────────────────────────────
  bar: "sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur-sm",
  inner: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
  logo: "font-display text-xl font-bold tracking-wide text-navy",
  logoAccent: "text-champagne",
  navLinks: "hidden items-center gap-1 md:flex",
  navLink: "rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink",
  navLinkActive: "rounded-xl bg-surface px-3 py-2 text-sm font-medium text-ink",
  actions: "flex items-center gap-3",
  mobileToggle: "inline-flex items-center justify-center rounded-xl p-2 text-muted transition hover:bg-surface hover:text-ink md:hidden",
  mobileMenu: "border-b border-line bg-card px-4 py-3 md:hidden",
  mobileNavLink: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink",
  mobileNavLinkActive: "flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm font-medium text-ink",
  // ── Sidebar ───────────────────────────────────────────────────
  sidebar: "flex h-full w-64 flex-col border-r border-line bg-card",
  sidebarHeader: "flex h-16 shrink-0 items-center border-b border-line px-5",
  sidebarBody: "flex-1 overflow-y-auto px-3 py-4",
  sidebarSection: "mb-6",
  sidebarSectionLabel: "mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted",
  sidebarItem: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink",
  sidebarItemActive: "flex items-center gap-3 rounded-xl bg-navy/8 px-3 py-2.5 text-sm font-medium text-navy",
  sidebarIcon: "h-4 w-4 shrink-0",
  sidebarFooter: "shrink-0 border-t border-line p-3"
};
export {
  UI_NAVBAR
};
