function puedeVerItem(item, usuario) {
  const estaAutenticado = Boolean(usuario);

  if (item.ocultarSiAuth && estaAutenticado) return false;
  if (item.requiereAuth && !estaAutenticado) return false;
  if (!item.roles || item.roles.length === 0) return true;

  // Acepta tanto nombres completos ("Administrador") como abreviaturas ("ADM")
  const userRoles = usuario?.roles     ?? [];
  const userAbrs  = usuario?.roles_abr ?? [];

  return item.roles.some((r) => userRoles.includes(r) || userAbrs.includes(r));
}

function filtrarItems(items) {
  return items.map((item) => {
    if ("children" in item && item.children?.length) {
      return { ...item, children: item.children };
    }
    return item;
  });
}

export function filtrarNavbarPorRol(config, usuario) {
  const links = (config.links ?? []).filter((link) =>
    puedeVerItem(link, usuario)
  );

  const dropdowns = (config.dropdowns ?? [])
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
