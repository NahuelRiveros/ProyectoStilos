import { useQuery } from "@tanstack/react-query";
import { fetchNavMenu } from "../api/nav_api";
import type { NavGenero } from "../api/nav_api";
import type { NavDropdown } from "../components/layout/navbar_config";

function buildDropdowns(menu: NavGenero[]): NavDropdown[] {
  return menu.map((genero) => ({
    id:    genero.slug,
    label: genero.nombre,
    items: [
      { label: `Ver todo ${genero.nombre}`, to: `/${genero.slug}` },
      ...genero.categorias.map((cat) => ({
        label: cat.nombre,
        to:    `/${genero.slug}/${cat.slug}`,
      })),
    ],
  }));
}

export function useNavMenu() {
  return useQuery({
    queryKey: ["nav-menu"],
    queryFn:  fetchNavMenu,
    staleTime: 5 * 60 * 1000,
    select:   buildDropdowns,
  });
}
