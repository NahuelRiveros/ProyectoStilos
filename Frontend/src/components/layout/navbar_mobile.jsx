import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/auth_context";
import NavbarUserBox from "./navbar_userbox";

export default function NavbarMobile({ config, open, onClose }) {
  const [openGroups, setOpenGroups] = useState({});
  const { usuario } = useAuth();

  function toggleGroup(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNavigate() {
    setOpenGroups({});
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="nav-mobile-panel lg:hidden"
        >
          <div className="px-4 pb-6 pt-3">

            {/* Links simples */}
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
                          "nav-mobile-item",
                          isActive ? "nav-mobile-item-active" : "",
                        ].join(" ")
                      }
                    >
                      {Icon && (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-shell-text/8 text-shell-text-dim">
                          <Icon size={14} />
                        </span>
                      )}
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            )}

            {/* Dropdowns */}
            {(config.dropdowns?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                {config.dropdowns.map((dropdown) => {
                  const Icon = dropdown.icon;
                  const isOpen = Boolean(openGroups[dropdown.id]);

                  return (
                    <div
                      key={dropdown.id}
                      className="nav-mobile-card"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(dropdown.id)}
                        className="flex w-full items-center justify-between px-3 py-3 transition-colors duration-150 hover:bg-shell-text/8"
                      >
                        <span className="flex items-center gap-3">
                          <span className={[
                            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                            isOpen ? "bg-accent/20 text-shell-text" : "bg-shell-text/8 text-shell-text-dim",
                          ].join(" ")}>
                            {Icon && <Icon size={15} />}
                          </span>
                          <span className={[
                            "text-sm font-semibold transition-colors duration-150",
                            isOpen ? "text-shell-text" : "text-shell-text-dim",
                          ].join(" ")}>
                            {dropdown.label}
                          </span>
                        </span>
                        <ChevronDown
                          size={15}
                          className={["shrink-0 transition-all duration-200", isOpen ? "rotate-180 text-shell-text" : "text-shell-text-dim"].join(" ")}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-shell-text/8 px-2 pb-2 pt-1.5">
                              {dropdown.to && (
                                <NavLink
                                  to={dropdown.to}
                                  onClick={handleNavigate}
                                  className={({ isActive }) =>
                                    [
                                      "nav-mobile-item mb-1",
                                      isActive ? "nav-mobile-item-active" : "",
                                    ].join(" ")
                                  }
                                >
                                  Ver todo {dropdown.label}
                                </NavLink>
                              )}
                              {dropdown.items?.map((item) => {
                                const ItemIcon = item.icon;

                                if ("children" in item && item.children?.length) {
                                  return (
                                    <div key={item.label} className="mb-2 last:mb-0">
                                      <NavLink
                                        to={item.to}
                                        onClick={handleNavigate}
                                        className="nav-mobile-item px-2 py-1"
                                      >
                                        {ItemIcon && <ItemIcon size={10} className="text-shell-text-dim" />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-shell-text-dim">
                                          {item.label}
                                        </span>
                                      </NavLink>
                                      <div className="space-y-0.5">
                                        {item.children.map((child) => {
                                          const ChildIcon = child.icon;
                                          return (
                                            <NavLink
                                              key={child.to}
                                              to={child.to}
                                              onClick={handleNavigate}
                                              className={({ isActive }) =>
                                                [
                                                  "nav-mobile-item",
                                                  isActive ? "nav-mobile-item-active" : "",
                                                ].join(" ")
                                              }
                                            >
                                              {ChildIcon && <ChildIcon size={13} className="shrink-0 opacity-50" />}
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
                                      onClick={handleNavigate}
                                      className={({ isActive }) =>
                                        [
                                          "nav-mobile-item",
                                          isActive ? "nav-mobile-item-active" : "",
                                        ].join(" ")
                                      }
                                    >
                                      {ItemIcon && <ItemIcon size={14} className="shrink-0 opacity-50" />}
                                      <span className="truncate">{item.label}</span>
                                    </NavLink>
                                  );
                                }

                                return null;
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Usuario */}
            <div className="mt-4 border-t border-shell-text/8 pt-4">
              {usuario ? (
                <NavbarUserBox mobile onLogout={handleNavigate} />
              ) : (
                <NavLink
                  to="/login"
                  onClick={handleNavigate}
                  className="btn btn-accent w-full"
                >
                  <LogIn size={15} />
                  Iniciar sesión
                </NavLink>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
