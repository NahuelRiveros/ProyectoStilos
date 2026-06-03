import { http } from "./http.js";
export async function getEstadosCiviles() {
  const { data } = await http.get("/catalogos/estados-civiles");
  return data;
}
