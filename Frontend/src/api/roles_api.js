import { http } from "./http";

export const getRoles     = (params)     => http.get("/catalogos/roles", { params });
export const createRol    = (data)       => http.post("/catalogos/roles", data);
export const updateRol    = (id, data)   => http.put(`/catalogos/roles/${id}`, data);
export const deleteRol    = (id)         => http.delete(`/catalogos/roles/${id}`);
export const reactivarRol = (id)         => http.put(`/catalogos/roles/${id}/reactivar`);
