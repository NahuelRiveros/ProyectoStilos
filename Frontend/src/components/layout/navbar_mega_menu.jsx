import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function NavbarMegaMenu({ dropdown, onMouseEnter, onMouseLeave }) {
  const Icon = dropdown.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="nav-mega"
    >
      <div className="nav-mega-inner">

        {/* Section label */}
        <div className="mb-4 flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-shell-text/10 text-shell-text">
              <Icon size={11} />
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-shell-text">
            {dropdown.label}
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-shell-text/20 to-transparent" />
        </div>

        {dropdown.wide ? (
          <div className="grid grid-cols-3 gap-8">
            {dropdown.items?.map((group) => {
              if (!group.children?.length) return null;
              const GroupIcon = group.icon;
              return (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-1.5">
                    {GroupIcon && <GroupIcon size={11} className="text-shell-text-dim" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-shell-text-dim">
                      {group.label}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {group.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            [
                              "nav-mega-item",
                              isActive
                                ? "nav-mega-item-active"
                                : "",
                            ].join(" ")
                          }
                        >
                          {ChildIcon && <ChildIcon size={13} className="shrink-0 opacity-50" />}
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {dropdown.items?.map((item) => {
              const ItemIcon = item.icon;

              if (item.children?.length) {
                const GroupIcon = item.icon;
                return (
                  <div key={item.label} className="min-w-[160px]">
                    <NavLink
                      to={item.to}
                      className="mb-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 transition nav-mega-item"
                    >
                      {GroupIcon && <GroupIcon size={11} className="text-shell-text-dim" />}
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
                            className={({ isActive }) =>
                              [
                                "nav-mega-item",
                                isActive
                                  ? "nav-mega-item-active"
                                  : "",
                              ].join(" ")
                            }
                          >
                            {ChildIcon && <ChildIcon size={13} className="shrink-0 opacity-50" />}
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "nav-mega-item",
                      isActive
                        ? "nav-mega-item-active"
                        : "",
                    ].join(" ")
                  }
                >
                  {ItemIcon && <ItemIcon size={14} className="shrink-0 opacity-50" />}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
