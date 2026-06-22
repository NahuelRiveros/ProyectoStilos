import { useLayoutEffect } from "react";
import { themeConfig as t } from "../config/theme_config";

// Mapeo completo de theme_config → CSS custom properties de index.css
function buildVars() {
  return {
    // Fuentes
    "--font-sans":    t.fontSans,
    "--font-display": t.fontDisplay,
    "--font-promo":   t.fontPromo,

    // Acento de marca
    "--color-accent":          t.accent,
    "--color-accent-on":       t.accentOn,
    "--color-champagne":       t.accent,       // alias para retrocompatibilidad
    "--color-champagne-light": t.accentLight,
    "--color-champagne-dark":  t.accentDark,

    // Acento secundario
    "--color-accent-secondary":    t.accentSecondary,
    "--color-accent-secondary-on": t.accentSecondaryOn,

    // Contenido (página, formularios, cards)
    "--color-navy":    t.content.navy,
    "--color-ink":     t.content.ink,
    "--color-muted":   t.content.muted,
    "--color-surface": t.content.surface,
    "--color-card":    t.content.card,
    "--color-line":    t.content.line,

    // Navbar
    "--color-shell":          t.navbar.bg,
    "--color-shell-raised":   t.navbar.bgRaised,
    "--color-shell-float":    t.navbar.bgFloat,
    "--color-shell-text":     t.navbar.text,
    "--color-shell-text-dim": t.navbar.textDim,

    // Footer
    "--color-footer":          t.footer.bg,
    "--color-footer-text":     t.footer.text,
    "--color-footer-text-dim": t.footer.textDim,

    // Admin panel
    "--color-admin":          t.admin.bg,
    "--color-admin-raised":   t.admin.bgRaised,
    "--color-admin-text":     t.admin.text,
    "--color-admin-text-dim": t.admin.textDim,

    // Sellos de confianza
    "--color-trust-secure": t.trust.secure,
    "--color-mp":           "#009EE3",   // MercadoPago brand — no se expone en theme_config
  };
}

// useLayoutEffect evita el flash de colores incorrectos antes del primer render
export default function ThemeProvider({ children }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    Object.entries(buildVars()).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }, []);

  return children;
}
