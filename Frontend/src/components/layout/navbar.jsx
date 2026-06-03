import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "../../auth/auth_context";
import { filtrarNavbarPorRol } from "./navbar_permissions";
import { navbar_config } from "./navbar_config";
import NavbarDesktop from "./navbar_desktop";
import NavbarMegaMenu from "./navbar_mega_menu";
import NavbarMobile from "./navbar_mobile";
import NavbarUserBox from "./navbar_userbox";

export default function Navbar() {
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [scrolled, setScrolled]                 = useState(false);
  const closeTimer                              = useRef(null);
  const { usuario }                             = useAuth();

  const config         = filtrarNavbarPorRol(navbar_config, usuario);
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
        className={[
          "fixed inset-x-0 top-0 z-50 bg-[#060d1f] transition-all duration-300",
          scrolled
            ? "border-b border-white/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_40px_-4px_rgba(0,0,0,0.7)]"
            : "border-b border-white/[0.07]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between px-6 lg:px-10">

          {/* Brand */}
          <NavLink
            to={navbar_config.brand.linkTo}
            onClick={() => setMobileOpen(false)}
            className="flex shrink-0 items-center gap-2.5 outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-[11px] font-black text-slate-950 shadow-sm shadow-amber-400/30">
              {navbar_config.brand.fallbackLetter}
            </div>
            {navbar_config.brand.logoUrl ? (
              <img src={navbar_config.brand.logoUrl} alt={navbar_config.brand.titulo} className="h-7 w-auto" />
            ) : (
              <span className="select-none text-[15px] font-bold tracking-tight text-white/90">
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
                  className="inline-flex h-8 items-center rounded-full bg-amber-400 px-4 text-[13px] font-semibold text-slate-950 transition-all hover:bg-amber-300 active:scale-95"
                >
                  Iniciar sesión
                </NavLink>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(prev => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 lg:hidden"
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
            className="fixed inset-0 top-[60px] z-40 bg-black/50 backdrop-blur-[2px]"
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
            className="fixed inset-0 top-[60px] z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
