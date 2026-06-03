import { http } from "./http";
import type { ApiResponse } from "./http";

export interface NavSubcategoria {
  id:     number;
  nombre: string;
  slug:   string;
}

export interface NavCategoria {
  id:            number;
  nombre:        string;
  slug:          string;
  subcategorias: NavSubcategoria[];
}

export interface NavGenero {
  id:         number;
  nombre:     string;
  slug:       string;
  categorias: NavCategoria[];
}

export async function fetchNavMenu(): Promise<NavGenero[]> {
  const res = await http.get<ApiResponse<NavGenero[]>>("/nav/menu");
  return res.data.data;
}
