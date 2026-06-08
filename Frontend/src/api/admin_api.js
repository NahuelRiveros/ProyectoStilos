import { http } from "./http";

export const getSuscripcion     = ()     => http.get("/admin/suscripcion");
export const activarSuscripcion = (data) => http.post("/admin/suscripcion/activar", data);
export const updateGracia       = (data) => http.put("/admin/suscripcion/gracia", data);
export const deleteSuscripcion  = ()     => http.delete("/admin/suscripcion");
export const getHistorial       = ()     => http.get("/admin/suscripcion/historial");
