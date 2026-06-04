const UI_PRODUCT_CARD = {
  // ── Vertical card (grilla de productos) ───────────────────────
  wrap: "card-ui card-hover group relative flex flex-col overflow-hidden",
  imageWrap: "relative aspect-[3/4] overflow-hidden bg-surface",
  image: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  imagePlaceholder: "flex h-full items-center justify-center text-muted",
  imageOverlay: "absolute inset-0 bg-navy/0 transition-colors duration-300 group-hover:bg-navy/4",
  imageBadges: "absolute left-3 top-3 flex flex-col gap-1.5",
  quickActions: "absolute bottom-3 right-3 flex flex-col gap-2 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100",
  quickBtn: "icon-btn bg-card/90 backdrop-blur-sm",
  body: "flex flex-1 flex-col p-4",
  category: "text-[10px] font-bold uppercase tracking-widest text-muted",
  name: "mt-1 text-sm font-semibold leading-snug text-ink",
  priceRow: "mt-auto flex items-baseline justify-between pt-3",
  price: "text-base font-bold text-ink",
  priceOld: "ml-1.5 text-xs text-muted line-through",
  discount: "text-xs font-bold text-champagne",
  addToCart: "btn btn-secondary mt-3 w-full",
  // ── Horizontal card (listado / carrito) ───────────────────────
  horizontal: "card-ui flex overflow-hidden",
  horizontalImage: "relative w-28 shrink-0 overflow-hidden bg-surface sm:w-36",
  horizontalBody: "flex flex-1 flex-col p-4",
  horizontalCategory: "text-[10px] font-bold uppercase tracking-widest text-muted",
  horizontalName: "mt-0.5 text-sm font-semibold text-ink",
  horizontalPrice: "mt-auto text-sm font-bold text-ink",
  // ── Grilla ────────────────────────────────────────────────────
  grid: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
};
export {
  UI_PRODUCT_CARD
};
