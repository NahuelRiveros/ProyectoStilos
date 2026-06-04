import { useState, useEffect, useMemo, useRef } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { getCatalogoNavegacion } from "../../api/catalogo_api";
import { useAuth } from "../../auth/auth_context";
import { filtrarNavbarPorRol } from "./navbar_permissions";
import { navbar_config } from "./navbar_config";
import NavbarDesktop from "./navbar_desktop";
import NavbarMegaMenu from "./navbar_mega_menu";
import NavbarMobile from "./navbar_mobile";
import NavbarUserBox from "./navbar_userbox";

function mapNavItem(item) {
  return {
    label:    item.label,
    to:       item.to,
    children: item.children?.length ? item.children.map(mapNavItem) : undefined,
  };
}

function buildNavbarConfig(catalogos) {
  // Excluir el ítem "catalogo" (agrupador de todo) — solo usar los géneros reales.
  // "Productos" queda como link simple en navbar_config.links apuntando a /catalogo.
  const generoItems = catalogos.filter((item) => item.slug !== "catalogo");

  const publicLinks  = navbar_config.links.filter((link) => !link.requiereAuth);
  const privateLinks = navbar_config.links.filter((link) =>  link.requiereAuth);

  // Géneros sin categorías asignadas → link simple
  const genreLinks = generoItems
    .filter((genero) => (genero.items?.length ?? 0) === 0)
    .map((genero) => ({
      label: genero.label,
      to:    genero.to,
      icon:  ShoppingBag,
    }));

  // Géneros con categorías → dropdown automático
  const dropdowns = generoItems
    .filter((genero) => (genero.items?.length ?? 0) > 0)
    .map((genero) => ({
      id:    `genero-${genero.id}`,
      label: genero.label,
      to:    genero.to,
      icon:  ShoppingBag,
      items: genero.items.map(mapNavItem),
    }));

  return {
    ...navbar_config,
    links: [...publicLinks, ...genreLinks, ...privateLinks],
    dropdowns,
  };
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [scrolled, setScrolled]                 = useState(false);
  const [catalogos, setCatalogos]               = useState([]);
  const closeTimer                              = useRef(null);
  const { usuario }                             = useAuth();

  const dynamicConfig  = useMemo(() => buildNavbarConfig(catalogos), [catalogos]);
  const config         = filtrarNavbarPorRol(dynamicConfig, usuario);
  const activeDropdown = config.dropdowns?.find(d => d.id === activeDropdownId) ?? null;

  function openDropdown(id) {
    clearTimeout(closeTimer.current);
    setActiveDropdownId(id);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveDropdownId(null), 180);
  }

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCatalogoNavegacion()
      .then((data) => {
        if (!cancelled) setCatalogos(data);
      })
      .catch(() => {
        if (!cancelled) setCatalogos([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        onMouseLeave={scheduleClose}
        className={["nav-header", scrolled ? "nav-header-scrolled" : "nav-header-idle"].join(" ")}
      >
        <div className="nav-inner">

          {/* Brand */}
          <NavLink
            to={navbar_config.brand.linkTo}
            onClick={() => setMobileOpen(false)}
            className="nav-brand"
          >
            <div className="nav-brand-mark">
              {navbar_config.brand.fallbackLetter}
            </div>
            {navbar_config.brand.logoUrl ? (
              <img src={navbar_config.brand.logoUrl} alt={navbar_config.brand.titulo} className="h-7 w-auto" />
            ) : (
              <span className="nav-brand-text">
                {navbar_config.brand.titulo}
              </span>
            )}
          </NavLink>

          {/* Desktop nav */}
          <NavbarDesktop
            config={config}
            activeId={activeDropdownId}
            onOpen={openDropdown}
            onScheduleClose={scheduleClose}
            onCancelClose={cancelClose}
          />

          {/* Right section */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              {usuario ? (
                <NavbarUserBox />
              ) : (
                <NavLink
                  to="/login"
                  className="btn btn-accent btn-sm"
                >
                  Iniciar sesión
                </NavLink>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(prev => !prev)}
              className="nav-mobile-toggle"
              aria-label="Menú"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.14 }}>
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.14 }}>
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeDropdown && (
            <NavbarMegaMenu
              dropdown={activeDropdown}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            />
          )}
        </AnimatePresence>
      </header>

      <div className="h-[60px]" />

      {/* Mega menu backdrop */}
      <AnimatePresence>
        {activeDropdownId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="nav-backdrop"
            onClick={() => setActiveDropdownId(null)}
          />
        )}
      </AnimatePresence>

      <NavbarMobile
        config={config}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="nav-backdrop lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
