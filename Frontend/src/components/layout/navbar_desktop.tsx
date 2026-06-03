import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import type { NavbarConfig, NavbarTheme } from "./navbar_config";
import NavbarDropdown from "./navbar_dropdown";

interface NavbarDesktopProps {
  config: NavbarConfig;
  theme: NavbarTheme;
}

export default function NavbarDesktop({ config, theme }: NavbarDesktopProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  function toggleDropdown(id: string) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    if (openDropdownId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDropdown();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={navRef}
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
    >
      {/* Links simples */}
      {config.links?.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeDropdown}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                isActive ? theme.linkActive : theme.linkDefault,
              ].join(" ")
            }
          >
            {Icon && <Icon size={16} className="shrink-0" />}
            <span className="truncate">{link.label}</span>
          </NavLink>
        );
      })}

      {/* Dropdowns */}
      {config.dropdowns?.map((dropdown) => (
        <NavbarDropdown
          key={dropdown.id}
          dropdown={dropdown}
          open={openDropdownId === dropdown.id}
          onToggle={() => toggleDropdown(dropdown.id)}
          onClose={closeDropdown}
          theme={theme}
        />
      ))}
    </div>
  );
}
