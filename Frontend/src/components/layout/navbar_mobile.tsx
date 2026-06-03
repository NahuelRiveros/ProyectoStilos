import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../auth/auth_context";
import type { NavbarConfig, NavbarTheme } from "./navbar_config";
import NavbarUserBox from "./navbar_userbox";

interface NavbarMobileProps {
  config: NavbarConfig;
  open: boolean;
  onNavigate: () => void;
  theme: NavbarTheme;
}

export default function NavbarMobile({
  config,
  open,
  onNavigate,
  theme,
}: NavbarMobileProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { usuario } = useAuth();

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNavigate() {
    setOpenGroups({});
    onNavigate();
  }

  return (
    <div
      className={[
        "overflow-hidden border-t transition-all duration-300 ease-in-out lg:hidden",
        theme.mobileWrap,
        open ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}
    >
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-4 pb-6 pt-3">

        {/* ── LINKS SIMPLES ─────────────────────────────────────────── */}
        {(config.links?.length ?? 0) > 0 && (
          <div className="mb-3 space-y-0.5">
            {config.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150",
                      isActive ? theme.itemActive : theme.itemDefault,
                    ].join(" ")
                  }
                >
                  {Icon && (
                    <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", theme.itemIconDefault].join(" ")}>
                      <Icon size={15} />
                    </span>
                  )}
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* ── DROPDOWNS ─────────────────────────────────────────────── */}
        {(config.dropdowns?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            {config.dropdowns.map((dropdown) => {
              const Icon = dropdown.icon;
              const isOpen = Boolean(openGroups[dropdown.id]);

              return (
                <div
                  key={dropdown.id}
                  className={[
                    "overflow-hidden rounded-2xl border transition-all duration-200",
                    isOpen ? theme.mobileCardOpen : theme.mobileCardDefault,
                  ].join(" ")}
                >
                  {/* Trigger del grupo */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(dropdown.id)}
                    className={[
                      "flex w-full items-center justify-between px-3 py-3 text-left transition-colors duration-150",
                      isOpen ? theme.mobileTriggerOpen : "hover:opacity-80",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                          isOpen ? theme.itemActive : theme.itemIconDefault,
                        ].join(" ")}
                      >
                        {Icon && <Icon size={16} />}
                      </span>
                      <span
                        className={[
                          "text-sm font-bold transition-colors duration-150",
                          isOpen ? "text-current" : "",
                        ].join(" ")}
                      >
                        {dropdown.label}
                      </span>
                    </span>

                    <ChevronDown
                      size={16}
                      className={[
                        "shrink-0 transition-all duration-200",
                        isOpen ? theme.mobileChevronOpen : theme.mobileChevron,
                      ].join(" ")}
                    />
                  </button>

                  {/* Contenido del grupo */}
                  {isOpen && (
                    <div className="border-t border-current/8 px-2 pb-2 pt-1.5">
                      {dropdown.items?.map((item) => {
                        const ItemIcon = item.icon;

                        if ("children" in item && item.children?.length) {
                          return (
                            <div key={item.label} className="mb-2 last:mb-0">
                              {/* Cabecera de sub-grupo */}
                              <div className="flex items-center gap-2 px-2 py-1">
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
                                      onClick={handleNavigate}
                                      className={({ isActive }) =>
                                        [
                                          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-150",
                                          isActive ? theme.itemActive : theme.itemDefault,
                                        ].join(" ")
                                      }
                                    >
                                      {ChildIcon && (
                                        <span className={["flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", theme.itemIconDefault].join(" ")}>
                                          <ChildIcon size={13} />
                                        </span>
                                      )}
                                      <span className="truncate">{child.label}</span>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        if (!("children" in item)) {
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              end
                              onClick={handleNavigate}
                              className={({ isActive }) =>
                                [
                                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-150",
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
              );
            })}
          </div>
        )}

        {/* ── USUARIO / LOGIN ───────────────────────────────────────── */}
        <div className={["mt-4 border-t pt-4", theme.mobileSeparator].join(" ")}>
          {usuario ? (
            <NavbarUserBox mobile onLogout={handleNavigate} theme={theme} />
          ) : (
            <NavLink
              to="/login"
              onClick={handleNavigate}
              className={[
                "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-opacity hover:opacity-90",
                theme.mobileLoginBtn,
              ].join(" ")}
            >
              Iniciar sesión
            </NavLink>
          )}
        </div>

      </div>
    </div>
  );
}
