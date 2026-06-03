import type {
  NavbarConfig,
  NavLink,
  NavDropdown,
  NavDropdownItem,
} from "./navbar_config";

import type { Usuario } from "../../auth/auth_context";

interface PermissibleItem {
  requiereAuth?: boolean;
  ocultarSiAuth?: boolean;
  roles?: string[];
}

function puedeVerItem(item: PermissibleItem, usuario: Usuario | null): boolean {
  const estaAutenticado = Boolean(usuario);

  if (item.ocultarSiAuth && estaAutenticado) return false;
  if (item.requiereAuth && !estaAutenticado) return false;
  if (!item.roles || item.roles.length === 0) return true;

  const rolUsuario = usuario?.rol ?? usuario?.rol_nombre ?? usuario?.perfil ?? "";
  return item.roles.includes(rolUsuario);
}

function filtrarItems(items: NavDropdownItem[]): NavDropdownItem[] {
  return items.map((item) => {
    if ("children" in item && item.children?.length) {
      return { ...item, children: item.children };
    }
    return item;
  });
}

export function filtrarNavbarPorRol(
  config: NavbarConfig,
  usuario: Usuario | null
): NavbarConfig {
  const links: NavLink[] = (config.links ?? []).filter((link) =>
    puedeVerItem(link, usuario)
  );

  const dropdowns: NavDropdown[] = (config.dropdowns ?? [])
    .map((dropdown) => ({
      ...dropdown,
      items: filtrarItems(dropdown.items),
    }))
    .filter(
      (dropdown) =>
        puedeVerItem(dropdown, usuario) && dropdown.items.length > 0
    );

  return { ...config, links, dropdowns };
}
