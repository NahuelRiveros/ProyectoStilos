import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { NavDropdown, NavbarTheme } from "./navbar_config";

interface NavbarDropdownProps {
  dropdown: NavDropdown;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  theme: NavbarTheme;
}

export default function NavbarDropdown({
  dropdown,
  open = false,
  onToggle,
  onClose,
  theme,
}: NavbarDropdownProps) {
  const Icon = dropdown.icon;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  return (
    <div ref={wrapperRef} className="relative">

      {/* ── TRIGGER ────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Abrir menú ${dropdown.label}`}
        className={[
          "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none",
          open ? theme.dropdownTriggerOpen : theme.dropdownTrigger,
        ].join(" ")}
      >
        {Icon && <Icon size={16} className="shrink-0" />}
        <span className="truncate">{dropdown.label}</span>
        <ChevronDown
          size={14}
          className={["shrink-0 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {/* ── PANEL ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className={[
            "absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border",
            theme.panelWrap,
            dropdown.wide ? "right-0 min-w-150" : "left-0 w-72",
          ].join(" ")}
        >
          {/* Cabecera del panel */}
          <div className={["flex items-center gap-2.5 px-4 py-2.5", theme.panelHeader].join(" ")}>
            {Icon && (
              <span className={["flex h-6 w-6 items-center justify-center rounded-lg", theme.groupIcon].join(" ")}>
                <Icon size={13} />
              </span>
            )}
            <span className={["text-[11px] font-black uppercase tracking-widest", theme.groupLabel].join(" ")}>
              {dropdown.label}
            </span>
          </div>

          {/* ── MODO WIDE: columnas por grupo ──────────────────────────── */}
          {dropdown.wide ? (
            <div className="grid grid-cols-3 divide-x divide-current/5">
              {dropdown.items?.map((item) => {
                if (!("children" in item) || !item.children?.length) return null;
                const GroupIcon = item.icon;
                return (
                  <div key={item.label} className="p-3">
                    {/* Cabecera de columna */}
                    <div className="mb-2 flex items-center gap-1.5 px-1 py-0.5">
                      {GroupIcon && (
                        <span className={["flex h-5 w-5 shrink-0 items-center justify-center rounded-md", theme.groupIcon].join(" ")}>
                          <GroupIcon size={11} />
                        </span>
                      )}
                      <span className={["text-[10px] font-black uppercase tracking-widest", theme.groupLabel].join(" ")}>
                        {item.label}
                      </span>
                    </div>
                    {/* Ítems de la columna */}
                    <div className="space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                              [
                                "group flex items-start gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-150",
                                isActive ? theme.itemActive : theme.itemDefault,
                              ].join(" ")
                            }
                          >
                            {ChildIcon && (
                              <span className={["mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors", theme.itemIconDefault].join(" ")}>
                                <ChildIcon size={11} />
                              </span>
                            )}
                            <span className="leading-tight">{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── MODO NORMAL: lista vertical ─────────────────────────── */
            <div className="p-2">
              {dropdown.items?.map((item) => {
                const ItemIcon = item.icon;

                if ("children" in item && item.children?.length) {
                  return (
                    <div key={item.label} className="mb-1 last:mb-0">
                      {/* Cabecera de grupo */}
                      <div className="mx-1 mb-0.5 mt-2 flex items-center gap-2 px-2 py-1 first:mt-0">
                        {ItemIcon && (
                          <span className={["flex h-5 w-5 items-center justify-center rounded-md", theme.itemIconDefault].join(" ")}>
                            <ItemIcon size={11} />
                          </span>
                        )}
                        <span className={["text-[10px] font-black uppercase tracking-widest", theme.groupLabel].join(" ")}>
                          {item.label}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              end
                              onClick={onClose}
                              className={({ isActive }) =>
                                [
                                  "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                                  isActive ? theme.itemActive : theme.itemDefault,
                                ].join(" ")
                              }
                            >
                              {ChildIcon && (
                                <span className={["flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors", theme.itemIconDefault].join(" ")}>
                                  <ChildIcon size={13} />
                                </span>
                              )}
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                      <div className="mx-3 mt-1.5 border-b border-current/8 last:hidden" />
                    </div>
                  );
                }

                if (!("children" in item)) {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                          isActive ? theme.itemActive : theme.itemDefault,
                        ].join(" ")
                      }
                    >
                      {ItemIcon && (
                        <span className={["flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", theme.itemIconDefault].join(" ")}>
                          <ItemIcon size={13} />
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
