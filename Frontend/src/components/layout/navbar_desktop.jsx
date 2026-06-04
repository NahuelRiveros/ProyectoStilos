import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function NavbarDesktop({ config, activeId, onOpen, onScheduleClose, onCancelClose }) {
  const navigate = useNavigate();

  return (
    <div className="nav-list">
      {config.links?.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onMouseEnter={onScheduleClose}
            className={({ isActive }) =>
              [
                "nav-link",
                isActive ? "nav-link-active" : "",
              ].join(" ")
            }
          >
            {Icon && <Icon size={14} className="shrink-0 opacity-70" />}
            <span>{link.label}</span>
          </NavLink>
        );
      })}

      {config.dropdowns?.map((dropdown) => {
        const Icon = dropdown.icon;
        const isOpen = activeId === dropdown.id;
        return (
          <button
            key={dropdown.id}
            type="button"
            onClick={() => { if (dropdown.to) navigate(dropdown.to); }}
            onMouseEnter={() => { onCancelClose(); onOpen(dropdown.id); }}
            onMouseLeave={onScheduleClose}
            aria-expanded={isOpen}
            className={[
              "nav-trigger",
              isOpen ? "nav-trigger-active" : "",
            ].join(" ")}
          >
            {Icon && <Icon size={14} className="shrink-0 opacity-70" />}
            <span>{dropdown.label}</span>
            <ChevronDown
              size={12}
              className={["shrink-0 opacity-50 transition-transform duration-200", isOpen ? "rotate-180" : ""].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
