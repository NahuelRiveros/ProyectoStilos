import { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/auth_context";
import { filtrarNavbarPorRol } from "./navbar_permissions";
import { navbar_config } from "./navbar_config";
import { useNavMenu } from "../../hooks/use_nav_menu";
import NavbarDesktop from "./navbar_desktop";
import NavbarMobile from "./navbar_mobile";
import NavbarUserBox from "./navbar_userbox";
import Button from "../ui/button";
import CartIcon from "../ui/cart_icon";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { usuario } = useAuth();
  const { data: dynamicDropdowns } = useNavMenu();

  const configConMenu = useMemo(() => ({
    ...navbar_config,
    dropdowns: dynamicDropdowns ?? navbar_config.dropdowns,
  }), [dynamicDropdowns]);

  const navbarFiltrado = filtrarNavbarPorRol(configConMenu, usuario);
  const theme = navbarFiltrado.theme;

  function cerrarMobile() {
    setMobileOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 6);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarMobile();
    }
    if (mobileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 border-b transition-all duration-300",
          theme.bar,
          scrolled ? theme.barShadow : "shadow-none",
        ].join(" ")}
      >
        {/* Línea de acento superior (configurable por tema) */}
        {theme.accentLine && (
          <div className={`absolute inset-x-0 top-0 h-0.5 ${theme.accentLine}`} />
        )}

        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* ── BRAND ──────────────────────────────────────────────────── */}
          <NavLink
            to={navbar_config.brand.linkTo}
            onClick={cerrarMobile}
            className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {navbar_config.brand.logoUrl ? (
              <img
                src={navbar_config.brand.logoUrl}
                alt={navbar_config.brand.titulo}
                className="h-9 w-9 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div
                className={[
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white transition-transform duration-200 group-hover:scale-105",
                  theme.brandLogo,
                ].join(" ")}
              >
                {navbar_config.brand.fallbackLetter}
                {/* Brillo interno (solo para logos con gradiente) */}
                {theme.brandLogo.includes("from-") && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-b from-white/20 to-transparent" />
                )}
              </div>
            )}

            <div className="hidden leading-tight sm:block">
              <p className={["text-sm font-black tracking-tight", theme.brandTitle].join(" ")}>
                {navbar_config.brand.titulo}
              </p>
              <p className={["text-[11px] font-medium", theme.brandSubtitle].join(" ")}>
                {navbar_config.brand.subtitulo}
              </p>
            </div>
          </NavLink>

          {/* ── NAV DESKTOP ────────────────────────────────────────────── */}
          <NavbarDesktop config={navbarFiltrado} theme={theme} />

          {/* ── CARRITO ────────────────────────────────────────────────── */}
          <CartIcon />

          {/* ── USUARIO / LOGIN — DESKTOP ──────────────────────────────── */}
          <div className="hidden shrink-0 lg:block">
            {usuario ? (
              <NavbarUserBox theme={theme} />
            ) : (
              <NavLink to="/login">
                <Button label="Iniciar sesión" variant="primary" size="sm" />
              </NavLink>
            )}
          </div>

          {/* ── HAMBURGUESA — MOBILE ───────────────────────────────────── */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={mobileOpen ? X : Menu}
              onClick={() => setMobileOpen((prev) => !prev)}
              ariaLabel={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            />
          </div>
        </nav>

        {/* ── MENÚ MOBILE ────────────────────────────────────────────────── */}
        <NavbarMobile
          config={navbarFiltrado}
          open={mobileOpen}
          onNavigate={cerrarMobile}
          theme={theme}
        />
      </header>

      {/* ── BACKDROP MOBILE ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className={["fixed inset-0 z-40 lg:hidden", theme.backdrop].join(" ")}
          onClick={cerrarMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
}
